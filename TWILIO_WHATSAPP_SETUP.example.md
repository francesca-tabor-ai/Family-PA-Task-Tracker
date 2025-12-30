# Twilio WhatsApp Webhook Setup

## WhatsApp-Specific Request Format

Twilio's WhatsApp inbound webhooks use the same general format as SMS/MMS, with one key difference:

### Phone Number Format

**WhatsApp messages have `whatsapp:+` prefix on phone numbers:**

- `From`: `whatsapp:+14155551234` (sender's WhatsApp number)
- `To`: `whatsapp:+14155559876` (your Twilio WhatsApp number)

**Regular SMS/MMS format (for comparison):**
- `From`: `+14155551234`
- `To`: `+14155559876`

### Webhook Request Format

Twilio sends `application/x-www-form-urlencoded` POST requests (not JSON). Parse using `FormData` or form parsing.

#### Required Core Fields
- `MessageSid` - Unique message identifier (use for idempotency) ⚠️ **Critical for duplicate prevention**
- `AccountSid` - Your Twilio account SID
- `From` - Sender's WhatsApp number: `whatsapp:+14155551234` ⚠️ **Always has `whatsapp:+` prefix**
- `To` - Your Twilio WhatsApp number: `whatsapp:+14155559876` ⚠️ **Always has `whatsapp:+` prefix**

#### Content Fields
- `Body` - Text content (may be empty for voice-only messages)
- `NumMedia` - Number of media attachments (string: "0", "1", "2", etc.) ⚠️ **Always present, even if "0"**

#### Media Fields (when NumMedia > 0)

**First Media:**
- `MediaUrl0` - URL to first media file (requires Basic Auth to download)
- `MediaContentType0` - MIME type of first media (e.g., `audio/ogg`, `audio/mpeg`, `image/jpeg`)

**Second Media (if NumMedia >= 2):**
- `MediaUrl1` - URL to second media file
- `MediaContentType1` - MIME type of second media

**Additional Media:**
- `MediaUrl2`, `MediaContentType2` - Third media (if present)
- `MediaUrl3`, `MediaContentType3` - Fourth media (if present)
- ... pattern continues for up to 10 media items

**Important Media Notes:**
- Media URLs are temporary and require authentication
- Use `TWILIO_ACCOUNT_SID:TWILIO_AUTH_TOKEN` for Basic Auth when fetching
- Content types help determine file extension and processing method
- Voice notes typically use: `audio/ogg`, `audio/opus`, `audio/mpeg`, `audio/mp3`

#### WhatsApp-Specific Fields
- `WaId` - WhatsApp ID (optional, may be present in some cases)

#### Additional Fields (may be present)
- `ProfileName` - Sender's WhatsApp display name (if available)
- `MessageType` - Type of message (e.g., "text", "media")

### Example Requests

**Voice Message (with media):**
```
POST /whatsapp-webhook?secret=YOUR_WEBHOOK_SHARED_SECRET
Content-Type: application/x-www-form-urlencoded

MessageSid=SM1234567890abcdef
AccountSid=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
From=whatsapp:+15555551234
To=whatsapp:+15555559876
Body=
NumMedia=1
MediaUrl0=https://api.twilio.com/2010-04-01/Accounts/AC.../Messages/SM.../Media/ME...
MediaContentType0=audio/ogg
```

**Text Message (no media):**
```
POST /whatsapp-webhook?secret=YOUR_WEBHOOK_SHARED_SECRET
Content-Type: application/x-www-form-urlencoded

MessageSid=SM9876543210fedcba
AccountSid=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
From=whatsapp:+15555551234
To=whatsapp:+15555559876
Body=Remind me to buy groceries tomorrow
NumMedia=0
```

**Multiple Media (e.g., image + voice):**
```
POST /whatsapp-webhook?secret=YOUR_WEBHOOK_SHARED_SECRET
Content-Type: application/x-www-form-urlencoded

MessageSid=SMabcdef1234567890
AccountSid=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
From=whatsapp:+15555551234
To=whatsapp:+15555559876
Body=
NumMedia=2
MediaUrl0=https://api.twilio.com/.../Media/ME...
MediaContentType0=image/jpeg
MediaUrl1=https://api.twilio.com/.../Media/ME...
MediaContentType1=audio/ogg
```

### Implementation Notes

1. **Request Parsing**: Twilio sends `application/x-www-form-urlencoded`, NOT JSON
   ```typescript
   // Correct: Parse as form data
   const form = await req.formData();
   const messageSid = form.get("MessageSid");
   const fromPhone = form.get("From"); // "whatsapp:+41791234567"
   const numMedia = Number(form.get("NumMedia") ?? "0");
   const mediaUrl0 = form.get("MediaUrl0");
   const mediaContentType0 = form.get("MediaContentType0");
   ```

2. **Phone Number Parsing**: Always expect `whatsapp:+` prefix when processing WhatsApp messages
   - Strip prefix when storing: `fromPhone.replace(/^whatsapp:/, '')`
   - Keep prefix when comparing with Twilio data

3. **NumMedia Field**: Always present as a string ("0", "1", "2", etc.)
   - Convert to number: `Number(payload["NumMedia"] ?? "0")`
   - Check `NumMedia > 0` before accessing `MediaUrl0`, `MediaContentType0`

4. **Body Field**: May be empty for voice-only messages
   - Check: `const bodyText = payload["Body"] ?? "";`
   - If `NumMedia > 0` and `Body` is empty, it's likely a voice note

5. **Idempotency**: Use `MessageSid` as the idempotency key (stored in `inbound_messages` table)
   - Check for duplicate `MessageSid` before processing
   - Return success response for duplicates (Twilio retries)

6. **Media Handling**: 
   - Media URLs require authentication (use `TWILIO_ACCOUNT_SID:TWILIO_AUTH_TOKEN` for Basic Auth)
   - Always check `MediaContentType0` to determine file type and extension
   - Validate content type before processing (only accept audio for voice notes)

7. **Multiple Media**: Handle up to 10 media items
   - Loop through: `MediaUrl0` through `MediaUrl9`
   - Process each based on `MediaContentTypeN`

### Twilio Console Configuration

1. Go to **Twilio Console** → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Or: **Phone Numbers** → Select your WhatsApp number → **Messaging Configuration**
3. Set **"When a message comes in"** to:
   ```
   POST https://YOUR_PROJECT_REF.functions.supabase.co/whatsapp-webhook?secret=YOUR_WEBHOOK_SHARED_SECRET
   ```

### Webhook URL Format

**Production:**
```
https://YOUR_PROJECT_REF.functions.supabase.co/whatsapp-webhook?secret=YOUR_WEBHOOK_SHARED_SECRET
```

**Local Testing:**
```
http://127.0.0.1:54321/functions/v1/whatsapp-webhook?secret=YOUR_WEBHOOK_SHARED_SECRET
```

### Security

- **Shared Secret**: Always include `?secret=YOUR_WEBHOOK_SHARED_SECRET` in the webhook URL
- **Signature Verification**: Recommended to also verify Twilio signature (X-Twilio-Signature header)
- **HTTPS Only**: Production webhooks must use HTTPS

## Responding to WhatsApp Messages

Twilio provides two ways to respond to incoming WhatsApp messages:

### Option 1: TwiML Response (Inline Reply)

Return TwiML (XML) directly from your webhook handler. Twilio will send this as a reply to the user.

#### TwiML Format

TwiML is XML that tells Twilio what to do. For WhatsApp messages, use the `<Message>` verb:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Your reply text here</Message>
</Response>
```

#### Implementation Example

```typescript
// Helper function to create TwiML response
function twimlMessage(body: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(body)}</Message>
</Response>`;
  
  return new Response(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

// Escape XML special characters
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Usage in webhook handler
serve(async (req) => {
  // ... process incoming message ...
  
  // Reply inline with TwiML
  return twimlMessage("✅ Got it! I created a task: Buy groceries");
});
```

#### TwiML Response Examples

**Simple text reply:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>✅ Added: Buy groceries</Message>
</Response>
```

**Reply with emoji:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>✅ Got it! I created a task: "Submit expense report" (tomorrow morning)</Message>
</Response>
```

**Clarification question:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>❓ When is it due?</Message>
</Response>
```

**Error message:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ Sorry—something went wrong while processing that message.</Message>
</Response>
```

### Option 2: Twilio API (Asynchronous Reply)

Send replies using Twilio's REST API. Useful for:
- Delayed responses (after async processing)
- Sending messages not triggered by webhooks
- More complex message flows

#### API Implementation Example

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function sendWhatsAppMessage(
  to: string, // WhatsApp number: "whatsapp:+14155551234"
  body: string,
): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER"); // Your Twilio WhatsApp number

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const formData = new FormData();
  formData.append("From", fromNumber);
  formData.append("To", to);
  formData.append("Body", body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio API error: ${response.status} ${error}`);
  }
}

// Usage: Send reply after async processing
await processTask();
await sendWhatsAppMessage(
  "whatsapp:+15555551234",
  "✅ Task created successfully!"
);
```

### Response Best Practices

1. **Always respond**: Twilio expects a response (even if empty TwiML)
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <Response></Response>
   ```

2. **Keep messages concise**: WhatsApp messages should be short and clear
   - ✅ Good: `"✅ Added: Buy groceries (tomorrow)"`
   - ❌ Too long: Detailed explanations that span multiple messages

3. **Use emojis sparingly**: They help convey tone but don't overuse
   - ✅: `"✅ Added"`, `"❓ When is it due?"`, `"⚠️ Error"`
   - ❌: Too many emojis can look unprofessional

4. **Handle errors gracefully**: Never expose internal errors to users
   ```typescript
   try {
     // Process message
     return twimlMessage("✅ Success message");
   } catch (err) {
     console.error("Error:", err); // Log for debugging
     return twimlMessage("⚠️ Sorry—something went wrong. Please try again.");
   }
   ```

5. **Response timing**: 
   - **TwiML**: Immediate response (best for quick confirmations)
   - **API**: Use for delayed/async responses (after processing completes)

### Choosing Between TwiML and API

| Use TwiML (Inline) | Use API (Async) |
|-------------------|-----------------|
| Quick confirmations | Long-running processing |
| Immediate replies | Delayed notifications |
| Simple responses | Complex message flows |
| Error handling | Scheduled messages |
| Clarification questions | Multi-step conversations |

### Complete Webhook Handler Pattern

```typescript
serve(async (req) => {
  try {
    // 1. Authenticate (shared secret)
    assertSharedSecret(req);
    
    // 2. Parse Twilio form data
    const form = await req.formData();
    const messageSid = form.get("MessageSid");
    const fromPhone = form.get("From"); // "whatsapp:+41791234567"
    const bodyText = form.get("Body") ?? "";
    const numMedia = Number(form.get("NumMedia") ?? "0");
    
    // 3. Check idempotency
    if (await isDuplicate(messageSid)) {
      return twimlMessage("✅ Already received—processing was skipped.");
    }
    
    // 4. Process message
    const result = await processMessage(fromPhone, bodyText, numMedia);
    
    // 5. Reply inline with TwiML
    return twimlMessage(result.message);
    
  } catch (err) {
    console.error("Webhook error:", err);
    return twimlMessage("⚠️ Sorry—something went wrong while processing that message.");
  }
});
```

