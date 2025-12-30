# Build Plan: Family PA Task Tracker

This document outlines the implementation phases in dependency order. Each phase includes "done when" criteria and manual verification steps.

## Implementation Loop

**Work through phases one at a time.** Complete, test, and commit each phase before moving to the next.

### Process Per Phase

1. **Implement Phase** (using Cursor Agent)
   - Focus on ONE phase only
   - Follow `.cursorrules` guardrails
   - Keep changes scoped to the phase

2. **Test Locally**
   - Run app locally: `npm run dev`
   - Test webhook locally: `supabase functions serve whatsapp-webhook --no-verify-jwt`
   - Run phase-specific tests (see checklist below)

3. **Fix Issues Immediately**
   - Fix bugs in the same phase
   - Don't move to next phase until current phase is complete
   - Iterate until all "Done When" criteria are met

4. **Commit with Intent-Based Messages**
   - Use lightweight prefixes: `schema:`, `rls:`, `edge:`, `feat:`, `fix:`
   - Keep commits focused on the phase
   - Small, atomic commits make rollbacks easier

5. **Verify Phase Completion**
   - Check all "Done When" criteria
   - Complete all manual verification steps
   - Update `MANUAL_TESTING.md` if needed

### Example Commit Messages

```bash
# Schema phase
git commit -m "schema: add families + family_members tables"
git commit -m "schema: add tasks table with constraints"
git commit -m "schema: add voice_transcriptions + inbound_messages tables"

# RLS phase
git commit -m "rls: enable RLS on all tables"
git commit -m "rls: add is_family_member helper function"
git commit -m "rls: restrict transcripts to owner + service role"

# Edge Function phase
git commit -m "edge: verify twilio webhook + persist payload"
git commit -m "edge: download media + transcribe with OpenAI"
git commit -m "edge: extract task data with confidence gate"

# UI phase
git commit -m "feat: add transcriptions admin feed page"
git commit -m "feat: add dashboard with task filters"
git commit -m "feat: add task create/edit forms"
```

### Testing Checklist Per Phase

**Before committing each phase, verify:**

#### Schema Phase
- [ ] Migrations run without errors: `supabase db reset`
- [ ] Tables exist: `supabase db diff`
- [ ] Can insert test data
- [ ] Constraints work (try invalid data)

#### RLS Phase
- [ ] RLS enabled on all tables
- [ ] Test with anon key (should be restricted)
- [ ] Test with authenticated user (should see only their family)
- [ ] Test with service role (should see everything)

#### Edge Function Phase
- [ ] Function serves locally: `supabase functions serve whatsapp-webhook --no-verify-jwt`
- [ ] Webhook receives test payload
- [ ] Idempotency works (duplicate MessageSid)
- [ ] Family resolution works
- [ ] Transcription works (if applicable)
- [ ] Task creation works (if applicable)

#### UI Phase
- [ ] App runs locally: `npm run dev`
- [ ] Pages load without errors
- [ ] Data displays correctly
- [ ] Forms submit successfully
- [ ] RLS enforced (can't see other families' data)

#### Auth Phase
- [ ] Sign in works
- [ ] Sign out works
- [ ] Session persists
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based access works (if applicable)

### Benefits of This Approach

✅ **Small Diffs:** Each commit is focused and easy to review  
✅ **Sane Rollbacks:** Can rollback a single phase without affecting others  
✅ **Clear Progress:** Intent-based commits show what was done  
✅ **Early Detection:** Issues found and fixed before moving forward  
✅ **Testable:** Each phase can be verified independently  

### When to Move to Next Phase

Only move to the next phase when:
- ✅ All "Done When" criteria are met
- ✅ All manual verification steps pass
- ✅ All tests in checklist pass
- ✅ Code is committed with intent-based messages
- ✅ No blocking issues remain

**Don't skip ahead.** Each phase builds on the previous one.

### Webhook Testing Checklist

When testing Edge Function phases, use this checklist:

#### Local Testing Setup
```bash
# Start Supabase locally
supabase start

# Serve Edge Function locally
supabase functions serve whatsapp-webhook --no-verify-jwt

# Function will be available at:
# http://localhost:54321/functions/v1/whatsapp-webhook
```

#### Test Cases

**1. Basic Webhook Reception**
```bash
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook?secret=YOUR_SECRET \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=test123&From=whatsapp:+1234567890&To=whatsapp:+0987654321&Body=Test message"
```
- [ ] Returns 200 OK
- [ ] Returns TwiML response
- [ ] `inbound_messages` table has entry

**2. Shared Secret Verification**
```bash
# Test without secret (should fail)
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook \
  -d "MessageSid=test123&From=whatsapp:+1234567890"
```
- [ ] Returns 401 Unauthorized

```bash
# Test with wrong secret (should fail)
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook?secret=wrong_secret \
  -d "MessageSid=test123&From=whatsapp:+1234567890"
```
- [ ] Returns 401 Unauthorized

**3. Idempotency (Duplicate MessageSid)**
```bash
# Send same webhook twice
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook?secret=YOUR_SECRET \
  -d "MessageSid=duplicate123&From=whatsapp:+1234567890&Body=First"
  
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook?secret=YOUR_SECRET \
  -d "MessageSid=duplicate123&From=whatsapp:+1234567890&Body=Second"
```
- [ ] First request processes normally
- [ ] Second request returns OK but skips processing
- [ ] Only one entry in `inbound_messages` table
- [ ] Only one task/transcription created (if applicable)

**4. Family Resolution**
```bash
# Test with known phone number (should resolve to family_id)
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook?secret=YOUR_SECRET \
  -d "MessageSid=test456&From=whatsapp:+1234567890&Body=Test"
```
- [ ] Resolves to correct family_id
- [ ] Processes successfully

```bash
# Test with unknown phone number (should fail gracefully)
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook?secret=YOUR_SECRET \
  -d "MessageSid=test789&From=whatsapp:+9999999999&Body=Test"
```
- [ ] Returns error message
- [ ] No task/transcription created
- [ ] Error logged appropriately

**5. Media Handling (if applicable)**
```bash
# Test with audio media
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook?secret=YOUR_SECRET \
  -d "MessageSid=test789&From=whatsapp:+1234567890&NumMedia=1&MediaUrl0=https://api.twilio.com/...&MediaContentType0=audio/ogg"
```
- [ ] Downloads audio successfully
- [ ] Transcribes audio (if applicable)
- [ ] Stores transcript in `voice_transcriptions` table

**6. Error Handling**
- [ ] Network errors (media download fails) → returns user-friendly error
- [ ] OpenAI API errors → returns user-friendly error, logs details
- [ ] Invalid payload → returns 400 Bad Request
- [ ] Database errors → returns user-friendly error, logs details

#### Database Verification

After each test, verify database state:

```bash
# Check inbound messages
supabase db query "SELECT * FROM inbound_messages ORDER BY created_at DESC LIMIT 5;"

# Check transcriptions (if applicable)
supabase db query "SELECT * FROM voice_transcriptions ORDER BY created_at DESC LIMIT 5;"

# Check tasks (if applicable)
supabase db query "SELECT * FROM tasks ORDER BY created_at DESC LIMIT 5;"
```

#### Production Testing (After Deployment)

Once deployed, test with real Twilio webhook:

1. Configure Twilio webhook URL in Console
2. Send test WhatsApp message
3. Check Supabase Edge Function logs
4. Verify database entries
5. Verify WhatsApp receives response

---

## Phase 1: Schema & Database Foundation

### 1.1 Tables, Indexes, Constraints

**Dependencies:** None (foundation)

**Tasks:**
- [ ] Create migration: `families` table
- [ ] Create migration: `family_members` table (with phone_e164 index)
- [ ] Create migration: `tasks` table (with status, confidence constraints)
- [ ] Create migration: `voice_transcriptions` table
- [ ] Create migration: `inbound_messages` table (idempotency)
- [ ] Add indexes for common queries (family_id, user_id, phone_e164, due_at, created_at)
- [ ] Add foreign key constraints and cascade rules

**Done When:**
- ✅ All tables exist in `supabase/migrations/`
- ✅ All indexes are created
- ✅ All constraints (check, foreign key) are defined
- ✅ Migration runs without errors: `supabase db reset`

**Manual Verification:**
```bash
# Check migrations exist
ls supabase/migrations/*.sql

# Apply migrations locally
supabase db reset

# Verify tables exist
supabase db diff

# Check indexes in Supabase Dashboard → Database → Indexes
```

**Test:**
- [ ] Can insert a family
- [ ] Can insert a family_member
- [ ] Can insert a task with valid status
- [ ] Cannot insert a task with invalid status (constraint violation)
- [ ] Foreign key cascade works (delete family → deletes members/tasks)

---

### 1.2 Row Level Security (RLS)

**Dependencies:** Phase 1.1 (tables must exist)

**Tasks:**
- [ ] Create helper function: `is_family_member(family_id)`
- [ ] Enable RLS on `families` table
- [ ] Enable RLS on `family_members` table
- [ ] Enable RLS on `tasks` table
- [ ] Enable RLS on `voice_transcriptions` table
- [ ] Enable RLS on `inbound_messages` table
- [ ] Create SELECT policies (family members can read their family's data)
- [ ] Create INSERT policies (family members can create tasks/transcriptions)
- [ ] Create UPDATE policies (family members can update their family's data)
- [ ] Create DELETE policies (appropriate roles can delete)

**Done When:**
- ✅ RLS is enabled on all tables
- ✅ `is_family_member()` function exists and works
- ✅ Policies allow family members to access their family's data
- ✅ Policies prevent cross-family access
- ✅ Service role key bypasses RLS (for Edge Functions)

**Manual Verification:**
```bash
# Check RLS is enabled
supabase db diff

# Test with anon key (should be restricted)
# Test with authenticated user (should see only their family)
# Test with service role (should see everything)
```

**Test:**
- [ ] User A cannot see User B's family data
- [ ] User A can see their own family's tasks
- [ ] User A cannot insert tasks for User B's family
- [ ] Service role key can insert/read all data (for Edge Functions)

---

### 1.3 Server-Side Identity Enforcement

**Dependencies:** Phase 1.1 (tasks table must exist)

**Tasks:**
- [ ] Create trigger function: `enforce_created_by_user_id()`
- [ ] Create trigger: `trg_tasks_enforce_created_by` on tasks table
- [ ] Ensure trigger sets `created_by_user_id = auth.uid()` if null
- [ ] Ensure trigger rejects spoofed `created_by_user_id` values

**Done When:**
- ✅ Trigger function exists
- ✅ Trigger fires on INSERT
- ✅ Client cannot spoof `created_by_user_id`
- ✅ Default value works when not provided

**Manual Verification:**
```sql
-- Test as authenticated user
INSERT INTO tasks (family_id, title) VALUES (...);
-- Should auto-set created_by_user_id

-- Try to spoof (should fail)
INSERT INTO tasks (family_id, title, created_by_user_id) 
VALUES (..., 'Task', 'different-user-id');
-- Should raise exception
```

**Test:**
- [ ] Insert without `created_by_user_id` → auto-sets to current user
- [ ] Insert with matching `created_by_user_id` → succeeds
- [ ] Insert with different `created_by_user_id` → raises exception

---

## Phase 2: Edge Function (WhatsApp Webhook)

### 2.1 Webhook Intake & Verification

**Dependencies:** Phase 1.1 (inbound_messages table for idempotency)

**Tasks:**
- [ ] Create Edge Function: `whatsapp-webhook`
- [ ] Parse Twilio form-encoded payload
- [ ] Extract `MessageSid`, `From`, `To`, `NumMedia`, `MediaUrl0`
- [ ] Implement shared secret verification (`WEBHOOK_SHARED_SECRET`)
- [ ] Implement idempotency check (insert into `inbound_messages`)
- [ ] Handle duplicate `MessageSid` gracefully (return OK, skip processing)
- [ ] Resolve family_id from phone number (`family_members.phone_e164`)

**Done When:**
- ✅ Function receives Twilio webhook
- ✅ Shared secret gate works (rejects invalid requests)
- ✅ Idempotency prevents duplicate processing
- ✅ Family resolution works from phone number
- ✅ Returns appropriate TwiML response

**Manual Verification:**
```bash
# Test locally
supabase functions serve whatsapp-webhook --no-verify-jwt

# Send test webhook (use curl or Twilio console)
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook?secret=... \
  -d "MessageSid=test123&From=whatsapp:+1234567890&..."

# Check inbound_messages table
supabase db query "SELECT * FROM inbound_messages ORDER BY created_at DESC LIMIT 5;"
```

**Test:**
- [ ] Webhook without secret → 401 Unauthorized
- [ ] Webhook with wrong secret → 401 Unauthorized
- [ ] Webhook with correct secret → 200 OK
- [ ] Duplicate MessageSid → returns OK, skips processing
- [ ] Unknown phone number → returns error message
- [ ] Known phone number → resolves to family_id

---

### 2.2 Media Download & Transcription

**Dependencies:** Phase 2.1 (webhook intake working)

**Tasks:**
- [ ] Download audio from Twilio `MediaUrl0`
- [ ] Authenticate with Twilio (Basic Auth: AccountSid:AuthToken)
- [ ] Validate content type (audio only)
- [ ] Enforce max file size limit (e.g., 25MB)
- [ ] Extract filename from URL or Content-Type
- [ ] Call OpenAI `/v1/audio/transcriptions` endpoint
- [ ] Use `gpt-4o-mini-transcribe` model (with `whisper-1` fallback)
- [ ] Handle transcription errors gracefully
- [ ] Store transcript in `voice_transcriptions` table

**Done When:**
- ✅ Downloads audio from Twilio successfully
- ✅ Validates file type and size
- ✅ Transcribes audio using OpenAI
- ✅ Stores transcript with metadata
- ✅ Handles errors (network, API, invalid audio)

**Manual Verification:**
```bash
# Test with real audio file
# Send WhatsApp voice note to Twilio number
# Check voice_transcriptions table
supabase db query "SELECT transcript, media_url, created_at FROM voice_transcriptions ORDER BY created_at DESC LIMIT 1;"
```

**Test:**
- [ ] Downloads audio file successfully
- [ ] Rejects non-audio files (images, PDFs)
- [ ] Rejects files over size limit
- [ ] Transcribes audio correctly
- [ ] Stores transcript in database
- [ ] Handles OpenAI API errors gracefully

---

### 2.3 Structured Task Extraction

**Dependencies:** Phase 2.2 (transcription working)

**Tasks:**
- [ ] Call OpenAI `/v1/chat/completions` with transcript
- [ ] Use `gpt-4o-mini` model
- [ ] Define strict JSON schema for task extraction:
  - `title` (string, required)
  - `category` (string | null)
  - `due_at` (ISO 8601 string | null)
  - `assignee` (string | null)
  - `confidence` (number 0-1)
  - `clarifying_question` (string | null)
- [ ] Parse JSON response
- [ ] Validate extracted fields
- [ ] Handle extraction errors

**Done When:**
- ✅ Extracts structured task data from transcript
- ✅ Returns confidence score
- ✅ Returns clarifying question when confidence is low
- ✅ Handles malformed JSON responses
- ✅ Validates extracted data (dates, confidence range)

**Manual Verification:**
```bash
# Test with sample transcript
# Check extracted JSON structure
# Verify confidence calculation
```

**Test:**
- [ ] Extracts title from transcript
- [ ] Extracts due date (converts "tomorrow" to ISO date)
- [ ] Extracts assignee name
- [ ] Returns confidence score (0-1)
- [ ] Returns clarifying question when confidence < 0.80
- [ ] Handles ambiguous transcripts gracefully

---

### 2.4 Confidence Gate & Task Creation

**Dependencies:** Phase 2.3 (task extraction working), Phase 1.1 (tasks table)

**Tasks:**
- [ ] Define confidence threshold (e.g., 0.80)
- [ ] If confidence >= threshold: create task immediately
- [ ] If confidence < threshold: store pending clarification
- [ ] Store clarification state (link to `voice_transcriptions` or use `inbound_messages`)
- [ ] Send confirmation message for high-confidence tasks
- [ ] Send clarifying question for low-confidence tasks
- [ ] Handle clarification responses (next message from same phone)

**Done When:**
- ✅ High-confidence tasks are created automatically
- ✅ Low-confidence tasks trigger clarification questions
- ✅ Clarification responses complete task creation
- ✅ Appropriate TwiML responses are sent

**Manual Verification:**
```bash
# Test high-confidence transcript
# Should create task immediately

# Test low-confidence transcript
# Should ask clarifying question
# Send follow-up message
# Should create task from clarification
```

**Test:**
- [ ] High confidence (≥0.80) → creates task, sends confirmation
- [ ] Low confidence (<0.80) → asks question, stores pending state
- [ ] Clarification response → creates task with updated data
- [ ] Multiple clarifications → handles gracefully

---

## Phase 3: UI (Minimal Admin/Debug First)

### 3.1 Admin/Debug UI

**Dependencies:** Phase 1.1 (tables exist), Phase 2.1 (webhook working)

**Tasks:**
- [ ] Create page: `/transcriptions` (recent voice transcriptions feed)
- [ ] Display: transcript text, extracted JSON, confidence, created_at
- [ ] Show raw webhook payload (for debugging)
- [ ] Create page: `/inbound-messages` (recent webhook calls)
- [ ] Display: MessageSid, From, To, NumMedia, created_at
- [ ] Show processing status (success/error)
- [ ] Add "Create Task" button for manual task creation from transcriptions

**Done When:**
- ✅ Can view recent transcriptions
- ✅ Can view recent inbound messages
- ✅ Can see extracted task data
- ✅ Can manually create tasks from transcriptions
- ✅ Debug info is visible (raw payloads, errors)

**Manual Verification:**
```bash
# Start Next.js app
npm run dev

# Visit http://localhost:3000/transcriptions
# Visit http://localhost:3000/inbound-messages
# Verify data displays correctly
```

**Test:**
- [ ] Transcriptions page loads
- [ ] Shows recent transcriptions in reverse chronological order
- [ ] Shows extracted JSON structure
- [ ] Shows confidence scores
- [ ] "Create Task" button works
- [ ] Inbound messages page shows webhook calls

---

### 3.2 User-Facing Dashboard

**Dependencies:** Phase 3.1 (admin UI working), Phase 4.1 (auth working)

**Tasks:**
- [ ] Create page: `/dashboard` (family task list)
- [ ] Display tasks filtered by family (via RLS)
- [ ] Add filters: status, assignee, category, due date
- [ ] Show task cards with: title, category, assignee, due date, status
- [ ] Add "Inbox" view for low-confidence items needing review
- [ ] Add link to create new task manually

**Done When:**
- ✅ Dashboard shows family's tasks
- ✅ Filters work (status, assignee, category)
- ✅ Inbox shows items needing clarification
- ✅ Tasks are properly filtered by RLS
- ✅ UI is responsive and usable

**Manual Verification:**
```bash
# Visit http://localhost:3000/dashboard
# Test filters
# Verify only your family's tasks are visible
# Test inbox view
```

**Test:**
- [ ] Dashboard loads with family's tasks
- [ ] Filters update task list
- [ ] Inbox shows low-confidence items
- [ ] Cannot see other families' tasks (RLS enforced)
- [ ] Task cards display all relevant info

---

### 3.3 Task Create/Edit Forms

**Dependencies:** Phase 3.2 (dashboard working)

**Tasks:**
- [ ] Create page: `/tasks/new` (new task form)
- [ ] Create page: `/tasks/[id]` (edit task form)
- [ ] Form fields: title, category, assignee, due date, status
- [ ] Pre-populate edit form with existing task data
- [ ] Handle form submission (API routes)
- [ ] Show success/error messages
- [ ] Redirect after successful create/edit

**Done When:**
- ✅ Can create new tasks manually
- ✅ Can edit existing tasks
- ✅ Form validation works
- ✅ API routes handle create/update
- ✅ RLS prevents editing other families' tasks

**Manual Verification:**
```bash
# Visit http://localhost:3000/tasks/new
# Fill form and submit
# Visit http://localhost:3000/tasks/[id]
# Edit and save
# Verify changes persist
```

**Test:**
- [ ] Create task form works
- [ ] Edit task form pre-populates correctly
- [ ] Form validation prevents invalid data
- [ ] Cannot edit other families' tasks
- [ ] Success/error messages display correctly

---

## Phase 4: Authentication

### 4.1 Sign-In/Out & Session Handling

**Dependencies:** Phase 3.2 (UI exists)

**Tasks:**
- [ ] Create page: `/login` (sign-in form)
- [ ] Integrate Supabase Auth (email/password or OAuth)
- [ ] Handle sign-in flow
- [ ] Create sign-out functionality
- [ ] Set up session handling in Next.js (cookies)
- [ ] Protect authenticated routes (`(authed)` route group)
- [ ] Redirect unauthenticated users to `/login`

**Done When:**
- ✅ Users can sign in
- ✅ Users can sign out
- ✅ Session persists across page refreshes
- ✅ Protected routes require authentication
- ✅ Unauthenticated users are redirected

**Manual Verification:**
```bash
# Visit http://localhost:3000/login
# Sign in with test account
# Verify redirect to dashboard
# Sign out
# Verify redirect to login
# Try accessing /dashboard without auth
# Should redirect to /login
```

**Test:**
- [ ] Sign in works
- [ ] Sign out works
- [ ] Session persists
- [ ] Protected routes require auth
- [ ] Redirects work correctly

---

### 4.2 Role-Based Routing (Optional)

**Dependencies:** Phase 4.1 (auth working)

**Tasks:**
- [ ] Check user role from `family_members.role`
- [ ] Restrict admin pages to owners/admins
- [ ] Show/hide UI elements based on role
- [ ] Add role checks to API routes

**Done When:**
- ✅ Owners/admins can access admin pages
- ✅ Regular members cannot access admin pages
- ✅ UI reflects user's role
- ✅ API routes enforce role checks

**Manual Verification:**
```bash
# Sign in as owner/admin
# Verify admin pages accessible
# Sign in as regular member
# Verify admin pages blocked
```

**Test:**
- [ ] Owner can access admin pages
- [ ] Admin can access admin pages
- [ ] Member cannot access admin pages
- [ ] UI shows/hides elements based on role

---

## Phase 5: Hardening

### 5.1 Idempotency

**Dependencies:** Phase 2.1 (webhook intake)

**Tasks:**
- [ ] Ensure `inbound_messages` table prevents duplicates
- [ ] Use `MessageSid` as idempotency key
- [ ] Handle Twilio retries gracefully
- [ ] Return OK response for duplicate webhooks

**Done When:**
- ✅ Duplicate webhooks don't create duplicate tasks
- ✅ Duplicate webhooks don't create duplicate transcriptions
- ✅ System handles Twilio retries correctly

**Manual Verification:**
```bash
# Send same webhook twice
# Verify only one task/transcription created
# Check inbound_messages table for duplicate MessageSid
```

**Test:**
- [ ] Duplicate MessageSid → only processes once
- [ ] Returns OK response for duplicates
- [ ] No duplicate tasks created
- [ ] No duplicate transcriptions created

---

### 5.2 Logging & Monitoring

**Dependencies:** All phases (system working)

**Tasks:**
- [ ] Add structured logging to Edge Function
- [ ] Log webhook intake (MessageSid, From, To)
- [ ] Log transcription attempts (success/failure)
- [ ] Log task creation (success/failure)
- [ ] Add error tracking (Sentry, LogRocket, or similar)
- [ ] Set up alerts for critical errors

**Done When:**
- ✅ All critical operations are logged
- ✅ Errors are tracked and alertable
- ✅ Logs are searchable and useful for debugging

**Manual Verification:**
```bash
# Check Edge Function logs in Supabase Dashboard
# Verify logs are structured and searchable
# Test error scenarios and verify they're logged
```

**Test:**
- [ ] Webhook intake is logged
- [ ] Transcription attempts are logged
- [ ] Task creation is logged
- [ ] Errors are logged with context
- [ ] Logs are searchable

---

### 5.3 Rate Limiting

**Dependencies:** Phase 2.1 (webhook intake)

**Tasks:**
- [ ] Implement rate limiting per phone number
- [ ] Limit: X webhooks per minute per phone
- [ ] Return appropriate error message when rate limited
- [ ] Log rate limit violations

**Done When:**
- ✅ Rate limiting prevents abuse
- ✅ Legitimate users aren't blocked
- ✅ Rate limit errors are logged

**Manual Verification:**
```bash
# Send many webhooks rapidly from same number
# Verify rate limiting kicks in
# Verify appropriate error message
```

**Test:**
- [ ] Rate limit prevents rapid requests
- [ ] Legitimate requests aren't blocked
- [ ] Rate limit errors are logged
- [ ] Error messages are user-friendly

---

### 5.4 Replay & Recovery

**Dependencies:** Phase 5.2 (logging working)

**Tasks:**
- [ ] Store raw webhook payloads in `inbound_messages.raw_payload`
- [ ] Store transcription results in `voice_transcriptions`
- [ ] Create admin tool to replay failed webhooks
- [ ] Create admin tool to manually process transcriptions

**Done When:**
- ✅ Failed webhooks can be replayed
- ✅ Manual processing tools exist
- ✅ Audit trail is complete

**Manual Verification:**
```bash
# Simulate failed webhook
# Use admin tool to replay
# Verify task is created
```

**Test:**
- [ ] Can replay failed webhooks
- [ ] Can manually process transcriptions
- [ ] Audit trail is complete
- [ ] Replay doesn't create duplicates (idempotency)

---

## Phase 6: Deployment

### 6.1 Supabase Edge Function Deployment

**Dependencies:** Phase 2.4 (Edge Function complete)

**Tasks:**
- [ ] Set production secrets in Supabase
- [ ] Deploy Edge Function: `supabase functions deploy whatsapp-webhook`
- [ ] Verify function is accessible
- [ ] Test webhook with production URL

**Done When:**
- ✅ Function is deployed to production
- ✅ Production secrets are set
- ✅ Webhook URL is accessible
- ✅ Test webhook succeeds

**Manual Verification:**
```bash
# Deploy function
supabase functions deploy whatsapp-webhook

# Test production webhook
curl -X POST https://[project].functions.supabase.co/whatsapp-webhook?secret=...
```

**Test:**
- [ ] Function deploys successfully
- [ ] Production webhook works
- [ ] Secrets are set correctly
- [ ] No errors in production logs

---

### 6.2 Next.js App Deployment (Vercel)

**Dependencies:** Phase 3.3 (UI complete), Phase 4.1 (auth working)

**Tasks:**
- [ ] Push code to GitHub main branch
- [ ] Import project in Vercel
- [ ] Set environment variables (Preview + Production)
- [ ] Deploy to production
- [ ] Test production deployment

**Done When:**
- ✅ App is deployed to Vercel
- ✅ Environment variables are set
- ✅ Production URL is accessible
- ✅ Authentication works in production

**Manual Verification:**
```bash
# Push to GitHub
git push origin main

# In Vercel Dashboard:
# - Import project
# - Set env vars
# - Deploy
# - Test production URL
```

**Test:**
- [ ] App deploys successfully
- [ ] Environment variables work
- [ ] Authentication works
- [ ] Dashboard loads correctly
- [ ] No console errors

---

### 6.3 Twilio Webhook Configuration

**Dependencies:** Phase 6.1 (Edge Function deployed)

**Tasks:**
- [ ] Get production Edge Function URL
- [ ] Configure Twilio webhook URL in Console
- [ ] Add shared secret to URL query param
- [ ] Test webhook with real WhatsApp message

**Done When:**
- ✅ Twilio webhook points to production Edge Function
- ✅ Shared secret is included in URL
- ✅ Test WhatsApp message is processed successfully

**Manual Verification:**
```bash
# In Twilio Console:
# - Go to WhatsApp Sender settings
# - Set webhook URL: https://[project].functions.supabase.co/whatsapp-webhook?secret=...
# - Send test WhatsApp message
# - Verify task is created
```

**Test:**
- [ ] Webhook URL is configured correctly
- [ ] Test WhatsApp message is received
- [ ] Task is created from message
- [ ] Response is sent back to WhatsApp

---

## Verification Checklist (End-to-End)

After all phases are complete, verify the entire system:

- [ ] **Schema:** All tables exist, RLS is enabled, policies work
- [ ] **Edge Function:** Webhook receives messages, transcribes audio, creates tasks
- [ ] **UI:** Dashboard shows tasks, can create/edit tasks, transcriptions feed works
- [ ] **Auth:** Users can sign in/out, protected routes work, RLS enforces access
- [ ] **Hardening:** Idempotency works, logging exists, rate limiting prevents abuse
- [ ] **Deployment:** Production Edge Function works, Vercel app works, Twilio webhook works

**End-to-End Test:**
1. Send WhatsApp voice note to Twilio number
2. Verify webhook is received (check `inbound_messages` table)
3. Verify audio is transcribed (check `voice_transcriptions` table)
4. Verify task is created (check `tasks` table)
5. Verify task appears in dashboard
6. Verify WhatsApp receives confirmation message

---

## Notes

- **Dependency Order:** Each phase depends on previous phases. Don't skip ahead.
- **Testing:** Test each phase before moving to the next.
- **Manual Verification:** Use the provided commands to verify each phase.
- **Iteration:** It's okay to iterate on phases (e.g., improve UI after basic functionality works).

