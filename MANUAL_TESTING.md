# Manual Testing Documentation

This file documents manual testing procedures for features that don't have automated tests. Every code change must include either automated tests OR an entry in this file.

## Format

For each feature/change, document:

```markdown
## [Feature Name] - [Date] - [Author]

### Context
Brief description of what was changed and why.

### Steps to Test
1. Step one
2. Step two
3. Step three

### Expected Results
- Result one
- Result two
- Result three

### Edge Cases
- Edge case one: Expected behavior
- Edge case two: Expected behavior

### Rollback Steps (if needed)
1. Step to rollback
2. Step to verify rollback

### Related
- Issue/PR: #123
- Migration: `20251230120000_feature_name.sql`
```

---

## Testing Entries

### Example: Task Creation from WhatsApp Voice Note

**Date:** 2024-12-30  
**Author:** Development Team

#### Context
Testing the end-to-end flow of receiving a WhatsApp voice note, transcribing it, extracting task data, and creating a task.

#### Steps to Test
1. Send WhatsApp voice note to Twilio number: "Remind me to buy groceries tomorrow"
2. Wait for webhook processing (check Supabase Edge Function logs)
3. Check `inbound_messages` table for new entry
4. Check `voice_transcriptions` table for transcript
5. Check `tasks` table for new task
6. Verify WhatsApp receives confirmation message
7. Check dashboard for new task

#### Expected Results
- `inbound_messages` table has entry with `MessageSid`
- `voice_transcriptions` table has transcript: "Remind me to buy groceries tomorrow"
- `tasks` table has task with:
  - `title`: "Buy groceries"
  - `due_at`: Tomorrow's date
  - `status`: "open"
  - `source_type`: "whatsapp"
- WhatsApp receives: "✅ Got it. I created a task: 'Buy groceries'"
- Dashboard shows new task in task list

#### Edge Cases
- **Low confidence transcript (<0.80):** Should ask clarifying question instead of creating task immediately
- **Duplicate MessageSid:** Should return OK but skip processing (idempotency)
- **Unknown phone number:** Should return error message, no task created
- **Non-audio media:** Should reject and return error message
- **Audio file too large (>25MB):** Should reject and return error message

#### Rollback Steps
1. Delete test task from `tasks` table
2. Delete test transcription from `voice_transcriptions` table
3. Delete test message from `inbound_messages` table

#### Related
- Edge Function: `whatsapp-webhook`
- Migration: `20251229120000_init_family_tasks_transcriptions.sql`

---

## Add Your Testing Entries Below

Use the format above to document manual tests for your changes.

