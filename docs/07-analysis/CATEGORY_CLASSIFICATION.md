# Category Auto-Assignment During WhatsApp Ingestion

## Overview

When processing WhatsApp messages, the system automatically classifies tasks into categories using OpenAI's GPT-4o-mini model. This ensures tasks are properly organized from the moment they're created.

## Classification Flow

```
WhatsApp Message → Transcribe (if audio) → Classify → Create Task
                                      ↓
                              Fetch Categories
                                      ↓
                              OpenAI Classification
                                      ↓
                          Confidence >= 0.7? → Assign category_id
                          Confidence < 0.7? → Leave NULL, ask clarification
```

## Implementation Details

### 1. Category Fetching

**Function:** `fetchCategoriesForFamily()`

- Fetches all active categories for the family from the `categories` table
- Filters by `household_id` and `is_active = true`
- Returns: `id`, `name`, `slug`, `parent_id`
- Used to build the classification prompt

**Safety:** Only categories that exist in the database are included in the prompt.

### 2. Classification Prompt

**Function:** `buildClassificationPrompt()`

The prompt includes:
- All available categories with their slugs
- Hierarchical structure (parent > child)
- Clear instructions to only use provided slugs
- JSON schema requirement

**Example Prompt Structure:**
```
Available categories (ONLY use these exact slugs):
- Home (slug: home)
- Home > Cleaning (slug: cleaning)
- Home > Maintenance (slug: maintenance)
- Health (slug: health)
...

Message to classify:
"Book dentist appointment for next week"

Instructions:
1. Determine the most appropriate category slug
2. Provide confidence score (0.0-1.0)
3. If confidence < 0.7, provide clarifying question
...
```

### 3. OpenAI Classification

**Function:** `classifyMessage()`

**Model:** `gpt-4o-mini`
**Temperature:** `0.3` (for consistency)
**Response Format:** `json_object` (structured output)

**Request:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a task classification assistant. Always return valid JSON only..."
    },
    {
      "role": "user",
      "content": "<classification prompt>"
    }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.3
}
```

**Response:**
```json
{
  "category_slug": "health",
  "confidence": 0.85,
  "clarifying_question": null
}
```

### 4. Safe Category Resolution

**Function:** `resolveCategoryId()`

**Safety Checks:**
1. Validates `category_slug` exists in database
2. Verifies category belongs to the correct family (`household_id`)
3. Checks category is active (`is_active = true`)
4. Returns `null` if any check fails (safe fallback)

**Why This Matters:**
- Prevents assigning non-existent categories
- Prevents cross-family category leaks
- Handles cases where OpenAI returns invalid slugs

### 5. Confidence Threshold Logic

**Threshold:** `0.7` (70%)

**High Confidence (≥ 0.7):**
- ✅ Assign `category_id` to task
- ✅ Set task `status` to `"open"`
- ✅ Return confirmation message with category name

**Low Confidence (< 0.7):**
- ⚠️ Leave `category_id` as `NULL`
- ⚠️ Set task `status` to `"open"` (default)
- ⚠️ Return clarification question to user
- ⚠️ User can manually categorize later

### 6. Error Handling & Fallbacks

**Classification Errors:**
- OpenAI API failure → Returns `null` category with low confidence
- Invalid JSON response → Returns `null` category with clarification question
- Network timeout → Returns `null` category with error message

**Category Resolution Errors:**
- Invalid slug → Returns `null` (task created without category)
- Database error → Returns `null` (safe fallback)
- Missing category → Returns `null` (task created, user can categorize manually)

**All Errors:**
- Task is still created (even if classification fails)
- User receives friendly error message
- No data loss - task can be manually categorized later

## Example Scenarios

### Scenario 1: High Confidence Classification

**Input:** "Book dentist appointment for next Tuesday"

**Classification:**
```json
{
  "category_slug": "health",
  "confidence": 0.92,
  "clarifying_question": null
}
```

**Result:**
- ✅ Task created with `category_id` = health category UUID
- ✅ Status: `"open"`
- ✅ Response: "✅ Task created: 'Book dentist appointment for next Tuesday'\n📁 Category: Health"

### Scenario 2: Low Confidence Classification

**Input:** "Do that thing we talked about"

**Classification:**
```json
{
  "category_slug": null,
  "confidence": 0.35,
  "clarifying_question": "Which category does this task belong to? (e.g., Home, Health, Work)"
}
```

**Result:**
- ⚠️ Task created with `category_id` = `NULL`
- ⚠️ Status: `"open"`
- ⚠️ Response: "✅ Task created, but I need help categorizing it. Which category should this belong to?"

### Scenario 3: Invalid Category Slug (Safe Fallback)

**Input:** "Buy groceries"

**Classification:**
```json
{
  "category_slug": "shopping-groceries",  // Valid slug
  "confidence": 0.88,
  "clarifying_question": null
}
```

**Category Resolution:**
- ✅ Slug exists → `category_id` assigned
- ✅ Task created with category

**But if OpenAI returned invalid slug:**
```json
{
  "category_slug": "nonexistent-category",  // Invalid slug
  "confidence": 0.88,
  "clarifying_question": null
}
```

**Category Resolution:**
- ⚠️ Slug not found → `category_id` = `NULL`
- ⚠️ Task created without category
- ⚠️ User can manually categorize later

## Configuration

### Environment Variables

Required in `supabase/functions/.env` (local) and via `supabase secrets set` (production):

- `PROJECT_URL` - Supabase project URL
- `SERVICE_ROLE_KEY` - Supabase service role key (bypasses RLS)
- `OPENAI_API_KEY` - OpenAI API key for classification
- `WEBHOOK_SHARED_SECRET` - Shared secret for webhook authentication
- `TWILIO_ACCOUNT_SID` - Twilio account SID (for media downloads)
- `TWILIO_AUTH_TOKEN` - Twilio auth token (for media downloads)

### Constants

```typescript
const CONFIDENCE_THRESHOLD = 0.7  // 70% confidence required
const MAX_AUDIO_SIZE_MB = 25      // Max audio file size
```

## Testing

### Manual Testing

1. **High Confidence Test:**
   ```bash
   # Send WhatsApp message: "Book dentist appointment"
   # Expected: Task created with Health category
   ```

2. **Low Confidence Test:**
   ```bash
   # Send WhatsApp message: "Do that thing"
   # Expected: Task created without category, clarification question sent
   ```

3. **Invalid Slug Test:**
   ```bash
   # Mock OpenAI to return invalid slug
   # Expected: Task created without category (safe fallback)
   ```

### Database Verification

```sql
-- Check tasks with categories
SELECT t.title, c.name as category_name, t.confidence
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.source_type = 'whatsapp'
ORDER BY t.created_at DESC
LIMIT 10;

-- Check tasks without categories (low confidence)
SELECT title, confidence, source_media_url
FROM tasks
WHERE source_type = 'whatsapp' AND category_id IS NULL
ORDER BY created_at DESC;
```

## Future Enhancements

1. **Learning from Manual Corrections:**
   - Track when users manually change categories
   - Use this feedback to improve classification prompts

2. **Multi-Task Detection:**
   - Detect multiple tasks in one message
   - Create separate tasks for each

3. **Context Awareness:**
   - Use conversation history to improve classification
   - Remember user preferences for common tasks

4. **Category Suggestions:**
   - When confidence < 0.7, suggest top 3 likely categories
   - Let user choose from suggestions

## Security Considerations

1. **Category Validation:**
   - ✅ Only existing categories can be assigned
   - ✅ Categories are family-scoped (no cross-family leaks)
   - ✅ Active categories only (respects `is_active` flag)

2. **Error Handling:**
   - ✅ Never expose internal errors to users
   - ✅ All failures result in safe fallback (task created, no category)
   - ✅ No data loss on classification errors

3. **API Security:**
   - ✅ Shared secret authentication
   - ✅ Idempotency checks (prevents duplicate processing)
   - ✅ Service role key only used server-side (Edge Function)

