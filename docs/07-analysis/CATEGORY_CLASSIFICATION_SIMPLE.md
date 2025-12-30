# Category Auto-Assignment - Simple Architecture

## 🧭 Mental Model

```
WhatsApp / UI
   ↓
Task created
   ↓
AI assigns category (if confident)
   ↓
Sidebar reflects categories
   ↓
Dashboards show filtered tasks
```

**Key Principles:**
- ✅ No hard-coding
- ✅ No enums
- ✅ Fully extensible
- ✅ Database-driven

## OpenAI Prompt Format

**Simple, clean prompt:**

```
You are categorising a family assistant task.

Available categories:
- travel-mobility
- school-childrens-activities
- health-wellness
- household-administration
- celebrations-gifting
- pets
- expiry-renewals
- concierge-lifestyle
- [all other categories from database...]

Task text:
"{message}"

Return JSON:
{
  "category_slug": "...",
  "confidence": 0.0
}
```

**Features:**
- Flat list of slugs (no hierarchy, no names)
- Simple JSON response (just `category_slug` and `confidence`)
- Categories fetched dynamically from database
- No hard-coded values

## Classification Logic

### High Confidence (≥ 0.7)
- ✅ Assign `category_id` to task
- ✅ Return: "✅ Task created: '{title}'\n📁 Category: {name}"

### Low Confidence (< 0.7)
- ⚠️ Leave `category_id` as `NULL`
- ⚠️ Return: "✅ Task created: '{title}'\n⚠️ Please categorize this task manually."

## Implementation

### 1. Fetch Categories
```typescript
const categories = await fetchCategoriesForFamily(supabase, familyId)
// Returns: [{ id, name, slug, parent_id }, ...]
```

### 2. Build Prompt
```typescript
const categorySlugs = categories
  .map(cat => cat.slug)
  .sort()
  .join("\n- ")

const prompt = `You are categorising a family assistant task.

Available categories:
- ${categorySlugs}

Task text:
"${transcript}"

Return JSON:
{
  "category_slug": "...",
  "confidence": 0.0
}`
```

### 3. Classify with OpenAI
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  }),
})
```

### 4. Validate & Assign
```typescript
// Validate slug exists in database
const categoryId = await resolveCategoryId(supabase, familyId, classification.category_slug)

// Create task
if (classification.confidence >= 0.7 && categoryId) {
  // Assign category
} else {
  // Leave category_id NULL
}
```

## Safety Features

1. **Slug Validation**
   - Only assigns categories that exist in database
   - Verifies family ownership (`household_id`)
   - Checks `is_active` flag

2. **Error Handling**
   - Invalid slug → `category_id = NULL`
   - API error → `category_id = NULL`
   - All errors result in safe fallback (task still created)

3. **Extensibility**
   - New categories added to database → automatically available
   - No code changes needed
   - Fully dynamic

## Example Flow

**Input:** "Book dentist appointment for next Tuesday"

**Classification:**
```json
{
  "category_slug": "health-wellness",
  "confidence": 0.92
}
```

**Result:**
- ✅ Task created with `category_id` = health-wellness UUID
- ✅ Response: "✅ Task created: 'Book dentist appointment for next Tuesday'\n📁 Category: Health & Wellness"

**Input:** "Do that thing we talked about"

**Classification:**
```json
{
  "category_slug": null,
  "confidence": 0.35
}
```

**Result:**
- ⚠️ Task created with `category_id` = `NULL`
- ⚠️ Response: "✅ Task created: 'Do that thing we talked about'\n⚠️ Please categorize this task manually."

## Configuration

**Constants:**
```typescript
const CONFIDENCE_THRESHOLD = 0.7  // 70% confidence required
```

**Environment Variables:**
- `OPENAI_API_KEY` - Required for classification
- `PROJECT_URL` - Supabase project URL
- `SERVICE_ROLE_KEY` - Supabase service role key

## Benefits

1. **Simple**: Clean prompt, simple JSON response
2. **Extensible**: Add categories to database, no code changes
3. **Safe**: Validates all slugs, never invents categories
4. **Flexible**: Works with any category structure (hierarchical or flat)

