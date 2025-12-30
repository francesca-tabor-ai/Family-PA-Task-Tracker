# Production Hardening Checklist

This checklist ensures the Family PA Task Tracker is production-ready with proper security, reliability, and observability.

## 1. Webhook Security

**Goal:** Reject forged requests and ensure only legitimate Twilio webhooks are processed.

### Verification Methods

#### Twilio Signature Verification (Recommended)
- [ ] Implement Twilio signature verification using `X-Twilio-Signature` header
- [ ] Validate signature against `TWILIO_AUTH_TOKEN` and request URL + params
- [ ] Use official Twilio SDK or implement signature algorithm correctly
- [ ] Handle signature validation errors gracefully (log, don't expose internals)

#### Shared Secret (Additional Layer)
- [ ] Implement shared secret verification (`WEBHOOK_SHARED_SECRET`)
- [ ] Include secret in webhook URL query parameter: `?secret=...`
- [ ] Validate secret before processing request
- [ ] Keep shared secret in environment variables (never in code)

### Request Validation

- [ ] **Enforce HTTP method:** Only accept `POST` requests
- [ ] **Content type validation:** Verify `application/x-www-form-urlencoded`
- [ ] **Timestamp validation:** If using timestamp-based verification, enforce tight window (e.g., 5 minutes)
- [ ] **Required fields:** Validate presence of `MessageSid`, `From`, `To`

### Security Best Practices

- [ ] Log verification failures (without leaking secrets)
- [ ] Return generic error messages to client (don't expose internal details)
- [ ] Rate limit failed verification attempts
- [ ] Monitor for suspicious patterns (many failed verifications from same IP)

### Implementation Example

```typescript
// In Edge Function
function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string
): boolean {
  // Use Twilio's signature validation
  // See: https://www.twilio.com/docs/usage/webhooks/webhooks-security
}

function assertSharedSecret(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expected = Deno.env.get("WEBHOOK_SHARED_SECRET");
  if (expected && secret !== expected) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
```

**Done When:**
- ✅ All webhook requests are verified (signature + shared secret)
- ✅ Invalid requests are rejected with 401
- ✅ Verification failures are logged
- ✅ No secrets are exposed in error messages

---

## 2. Idempotency

**Goal:** Retries don't create duplicates. Twilio may retry webhooks, and we must handle this gracefully.

### Idempotency Key Selection

- [ ] Choose stable idempotency key:
  - **Primary:** Twilio's `MessageSid` (unique per message)
  - **Alternative:** Stable hash of relevant fields if MessageSid unavailable
- [ ] Ensure key is unique and immutable per logical operation

### Database Schema

- [ ] Create `inbound_messages` table with unique constraint:
  ```sql
  CREATE TABLE inbound_messages (
    provider TEXT NOT NULL,
    message_sid TEXT NOT NULL,
    family_id UUID NOT NULL,
    from_phone TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (provider, message_sid)
  );
  ```
- [ ] Add index on `message_sid` for fast lookups

### Handler Implementation

- [ ] **Insert-or-ignore pattern:**
  ```typescript
  // Try to insert
  const { error } = await supabase
    .from("inbound_messages")
    .insert({ provider: "twilio", message_sid, ... });
  
  // If duplicate, return OK but skip processing
  if (error && error.code === "23505") { // Unique violation
    return new Response("OK", { status: 200 });
  }
  ```
- [ ] **Gate downstream tasks:** Ensure task creation, transcription, etc. are only triggered once per idempotency key
- [ ] **Return 200 OK** for duplicate requests (don't return error)

### Testing

- [ ] Test duplicate `MessageSid` handling
- [ ] Verify only one task/transcription created per message
- [ ] Verify duplicate requests return 200 OK
- [ ] Test concurrent requests with same MessageSid

**Done When:**
- ✅ Duplicate webhooks don't create duplicate tasks
- ✅ Duplicate webhooks don't create duplicate transcriptions
- ✅ System handles Twilio retries gracefully
- ✅ Idempotency key is stored with unique constraint

---

## 3. Auditability

**Goal:** You can replay and debug every run. Store enough data to reconstruct what happened.

### Data to Store

#### Minimum Required
- [ ] **Original webhook payload:** Store raw JSON/form body in `inbound_messages.raw_payload`
- [ ] **Media URLs:** Store `MediaUrl0`, `MediaUrl1`, etc. in `voice_transcriptions.media_url`
- [ ] **Transcript:** Store final transcript in `voice_transcriptions.transcript`
- [ ] **Timestamps:** Store `created_at` at each stage
- [ ] **Processing state:** Track state machine (received → downloaded → transcribed → extracted → done/failed)
- [ ] **Error fields:** Store error messages, stack traces (sanitized)
- [ ] **Retry count:** Track how many times a job was retried

### Recommended Schema

#### `webhook_events` (Immutable Raw Data)
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  message_sid TEXT NOT NULL UNIQUE,
  family_id UUID NOT NULL,
  raw_payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Indexes
  INDEX idx_webhook_events_family_id (family_id),
  INDEX idx_webhook_events_received_at (received_at)
);
```

#### `processing_jobs` (Mutable Status)
```sql
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id UUID REFERENCES webhook_events(id),
  message_sid TEXT NOT NULL UNIQUE,
  family_id UUID NOT NULL,
  status TEXT NOT NULL, -- 'received', 'downloading', 'transcribing', 'extracting', 'done', 'failed'
  current_phase TEXT,
  error_message TEXT,
  error_stack TEXT,
  retry_count INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `job_attempts` (Each Try + Error)
```sql
CREATE TABLE job_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES processing_jobs(id),
  attempt_number INT NOT NULL,
  phase TEXT NOT NULL,
  error_message TEXT,
  error_stack TEXT,
  logs_url TEXT, -- Pointer to log storage
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Implementation

- [ ] Store raw webhook payload immediately upon receipt
- [ ] Create processing job record with initial state
- [ ] Update job status at each phase transition
- [ ] Log each attempt (success or failure)
- [ ] Store errors with context (but sanitize sensitive data)

### Replay Tooling

- [ ] Create admin endpoint or tool to replay failed webhooks
- [ ] Read from `webhook_events` table
- [ ] Re-run processing with same idempotency key
- [ ] Ensure replay doesn't create duplicates (idempotency check)

**Done When:**
- ✅ All webhook payloads are stored
- ✅ Processing state is tracked
- ✅ Errors are logged with context
- ✅ Replay tooling exists
- ✅ Can reconstruct any run from stored data

---

## 4. RLS Verification

**Goal:** Browser keys can't read/write what they shouldn't. Verify Row Level Security works correctly.

### Test Matrix

Create tests for each role combination:

#### Anon Key Tests
- [ ] **Read:** Cannot read any family data
- [ ] **Write:** Cannot create tasks, transcriptions, or family members
- [ ] **Update:** Cannot update any records
- [ ] **Delete:** Cannot delete any records

#### Authenticated User A Tests
- [ ] **Read:** Can read their own family's data
- [ ] **Read:** Cannot read other families' data
- [ ] **Write:** Can create tasks for their family
- [ ] **Write:** Cannot create tasks for other families
- [ ] **Update:** Can update their family's tasks
- [ ] **Update:** Cannot update other families' tasks
- [ ] **Delete:** Can delete their family's tasks (if role allows)
- [ ] **Delete:** Cannot delete other families' tasks

#### Authenticated User B Tests
- [ ] **Read:** Can read their own family's data (different from User A)
- [ ] **Read:** Cannot read User A's family data
- [ ] **Write:** Can create tasks for their own family only

#### Service Role Tests
- [ ] **Read:** Can read all data (bypasses RLS)
- [ ] **Write:** Can create records for any family (bypasses RLS)
- [ ] **Note:** Service role should only be used in Edge Functions, never in browser

### Test Implementation

```typescript
// Example test structure
describe("RLS Verification", () => {
  it("anon key cannot read family data", async () => {
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data, error } = await anonClient
      .from("tasks")
      .select("*");
    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  it("user A cannot read user B's family data", async () => {
    const userAClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${userAToken}` } }
    });
    const { data } = await userAClient
      .from("tasks")
      .select("*")
      .eq("family_id", userBFamilyId);
    expect(data).toEqual([]);
  });
});
```

### Manual Verification Checklist

- [ ] Test with Supabase Dashboard (anon key)
- [ ] Test with authenticated user in browser
- [ ] Test with service role in Edge Function
- [ ] Verify RLS policies are enabled on all tables
- [ ] Verify `is_family_member()` helper function works correctly

**Done When:**
- ✅ All role-switch tests pass
- ✅ Anon key is properly restricted
- ✅ Users can only access their own family's data
- ✅ Service role bypasses RLS (only in Edge Functions)
- ✅ RLS policies are tested and verified

---

## 5. Observability

**Goal:** Diagnose failures quickly. Know what's happening in production.

### Structured Logging

#### Edge Function Logging
- [ ] Log with structured format:
  ```typescript
  console.log(JSON.stringify({
    level: "info",
    event_id: messageSid,
    phase: "webhook_received",
    family_id: familyId,
    from_phone: fromPhone,
    timestamp: new Date().toISOString()
  }));
  ```
- [ ] Include in every log:
  - `request_id` / `event_id` / `idempotency_key` (MessageSid)
  - `phase` (verify, persist, download, transcribe, finalize)
  - `family_id`
  - `timestamp`

#### Server Route Logging
- [ ] Log API requests with:
  - Request ID (generate UUID)
  - User ID (if authenticated)
  - Endpoint, method
  - Status code, latency
- [ ] Log errors with full context (sanitized)

### Log Metadata

- [ ] **Latency tracking:** Log time taken for each phase
- [ ] **Size metadata:** Log payload sizes, file sizes
- [ ] **Error context:** Include error message, stack trace (sanitized), phase where error occurred

### Error Tracking

- [ ] Set up centralized error tracking (Sentry, LogRocket, or similar)
- [ ] Capture errors from:
  - Edge Functions
  - Next.js API routes
  - Client-side (if applicable)
- [ ] Include context: MessageSid, family_id, user_id, phase
- [ ] Set up alerts for critical errors

### Monitoring

- [ ] Set up dashboards for:
  - Webhook volume (requests per hour/day)
  - Success/failure rates
  - Average processing time
  - Error rates by phase
- [ ] Set up alerts for:
  - High error rates
  - Processing time spikes
  - Failed webhook verifications

### Replay Tooling

- [ ] Create admin endpoint: `POST /api/admin/replay-webhook`
- [ ] Accept `message_sid` or `webhook_event_id`
- [ ] Read from `webhook_events` table
- [ ] Re-run processing with same idempotency key
- [ ] Return job status

**Done When:**
- ✅ All critical operations are logged
- ✅ Logs are structured and searchable
- ✅ Errors are tracked centrally
- ✅ Dashboards show key metrics
- ✅ Replay tooling exists
- ✅ Alerts are configured

---

## 6. Rate Limits & Cost Controls

**Goal:** Prevent runaway spend and abuse. Control costs and protect system.

### Rate Limiting

#### Per Sender Rate Limits
- [ ] Implement rate limiting per phone number
- [ ] Limit: X webhooks per minute per phone (e.g., 10/minute)
- [ ] Store rate limit state in database or Redis
- [ ] Return appropriate error (429 Too Many Requests) when exceeded

#### Per Account Rate Limits
- [ ] Implement global rate limits (all webhooks combined)
- [ ] Limit: X webhooks per hour/day
- [ ] Monitor for abuse patterns

### Cost Controls

#### Expensive Operations Gating
- [ ] **OpenAI transcription:** Gate with rate limits and cost tracking
- [ ] **Media downloads:** Limit file size, validate content type
- [ ] **OpenAI summarization:** Track usage, set daily limits

#### Limits to Enforce
- [ ] **Max audio length:** Reject audio files over X minutes (e.g., 10 minutes)
- [ ] **Max file size:** Reject files over X MB (e.g., 25 MB)
- [ ] **Max concurrent jobs:** Limit number of simultaneous processing jobs
- [ ] **Daily cost limit:** Track OpenAI API costs, stop processing if limit exceeded

### Backoff & Circuit Breaker

- [ ] **Exponential backoff:** Retry failed operations with increasing delays
- [ ] **Circuit breaker:** Stop processing if error rate exceeds threshold
- [ ] **Failure tracking:** Track consecutive failures per sender/account
- [ ] **Auto-recovery:** Resume processing after cooldown period

### Implementation Example

```typescript
// Rate limiting
async function checkRateLimit(phoneNumber: string): Promise<boolean> {
  const key = `rate_limit:${phoneNumber}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  return count <= 10; // 10 requests per minute
}

// Cost tracking
async function checkDailyCostLimit(familyId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const key = `cost:${familyId}:${today}`;
  const cost = await redis.get(key) || 0;
  return parseFloat(cost) < 10.0; // $10 daily limit
}
```

### Monitoring

- [ ] Track rate limit violations
- [ ] Track cost per family/account
- [ ] Alert when approaching limits
- [ ] Log all limit enforcement actions

**Done When:**
- ✅ Rate limiting is implemented
- ✅ Cost controls are in place
- ✅ Max limits are enforced (file size, audio length, concurrent jobs)
- ✅ Backoff and circuit breaker logic exists
- ✅ Cost tracking is implemented
- ✅ Alerts are configured for limit violations

---

## Verification Checklist

Before going to production, verify:

- [ ] **Webhook Security:** All requests verified, invalid requests rejected
- [ ] **Idempotency:** Duplicate requests don't create duplicates
- [ ] **Auditability:** All data stored, replay tooling exists
- [ ] **RLS Verification:** All role-switch tests pass
- [ ] **Observability:** Logging, monitoring, error tracking set up
- [ ] **Rate Limits:** Rate limiting and cost controls implemented

## Testing

Run end-to-end tests:

1. **Security Test:** Send forged webhook → should be rejected
2. **Idempotency Test:** Send same webhook twice → only processes once
3. **RLS Test:** User A tries to access User B's data → should be blocked
4. **Rate Limit Test:** Send many webhooks rapidly → should be rate limited
5. **Cost Control Test:** Exceed daily limit → should stop processing
6. **Replay Test:** Replay failed webhook → should process correctly

## Related Documentation

- `BUILD_PLAN.md` - Implementation phases
- `MANUAL_TESTING.md` - Manual testing procedures
- `.cursorrules` - Code standards and guardrails

---

**Last Updated:** 2024-12-30

