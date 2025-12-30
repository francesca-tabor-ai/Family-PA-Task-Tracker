# AI Security Principles

**Core architectural principles for security-first, AI-assisted task management.**

## Core Principles (Non-Negotiable)

### Never Allow AI Logic to Write Directly to the Database

- ✅ **All writes must go through authenticated backend routes**
- ✅ **The database is the single source of truth**
- ✅ **GPT may parse intent, classify, request actions**
- ❌ **GPT may NOT invent categories, bypass validation, assume database state**

**If a value is uncertain or invalid → fail safely.**

---

## Architecture Rules

### Backend: Vercel Serverless / Supabase Functions
- All data writes happen here
- All validation happens here
- All authentication happens here

### Frontend: Next.js App Router
- Reads data (with RLS protection)
- Displays UI
- Sends requests to backend routes

### AI: OpenAI (JSON mode preferred)
- Parses natural language
- Classifies intent
- Extracts structured data
- **Never writes to database**
- **Never invents data**

### Database Access
- Always scoped by `household_id`
- Never cross household boundaries
- Validate IDs and slugs before use
- RLS policies enforce isolation

---

## Separation of Concerns

### What Lives Where

**Backend (API Routes / Edge Functions):**
- Data integrity logic
- Validation
- Authentication
- Authorization
- Database writes
- ID/slug resolution
- Household scoping

**AI (OpenAI):**
- Language understanding
- Intent parsing
- Classification
- Structured extraction
- User-facing questions
- UX improvements

**Frontend (Next.js):**
- Data display
- User interactions
- Form handling
- Client-side validation (UX only)

---

## Safety & Validation

### Never Invent Data

- ❌ **Never invent categories, IDs, or enums**
- ✅ **Always validate against the database**
- ✅ **If classification confidence is low: ask clarification, do not guess**
- ✅ **On any error: create task without optional fields, never block task creation**

**Silent data corruption is worse than missing enrichment.**

### Validation Flow

```
AI Classification
  ↓
Validate slug exists in DB
  ↓
Validate household_id matches
  ↓
Validate is_active = true
  ↓
If any validation fails → category_id = NULL
  ↓
Task still created (never blocked)
```

### Error Handling

**On Classification Error:**
- Log error server-side
- Return `category_slug: null, confidence: 0.0`
- Create task without category
- User can manually categorize later

**On Validation Error:**
- Log warning server-side
- Return `category_id: null`
- Create task without category
- No data loss

**On Database Error:**
- Log error server-side
- Return user-friendly message
- Task creation may fail (critical path)
- User can retry

---

## Code Style

### Principles

- **Prefer clarity over cleverness**
- **Small, explicit functions**
- **Defensive checks > assumptions**
- **Exhaustive TypeScript typing**
- **Early returns for invalid states**

### Example: Safe Category Resolution

```typescript
// ✅ Good: Defensive, explicit, validated
async function resolveCategoryId(
  supabase: SupabaseClient,
  familyId: string,
  categorySlug: string | null
): Promise<string | null> {
  if (!categorySlug) {
    return null
  }

  const { data: category, error } = await supabase
    .from("categories")
    .select("id")
    .eq("household_id", familyId)  // Validate household
    .eq("slug", categorySlug)      // Validate slug
    .eq("is_active", true)          // Validate active
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error resolving category:", error)
    return null  // Safe fallback
  }

  if (!category) {
    console.warn(`Category slug "${categorySlug}" not found`)
    return null  // Safe fallback
  }

  return category.id
}
```

```typescript
// ❌ Bad: Assumes data exists, no validation
async function resolveCategoryId(slug: string): Promise<string> {
  const category = await getCategory(slug)
  return category.id  // What if category is null?
}
```

---

## Documentation Expectations

### When Adding or Modifying Significant Logic

- ✅ **Update or create a `.md` file under `/docs`**
- ✅ **Explain *why*, not just *what***
- ✅ **Prefer architecture notes over tutorials**

### Documentation Audience

Docs are for:
- **Future maintainers** - Understanding decisions
- **AI agents** - Context for code generation
- **Production debugging** - Troubleshooting guides

### Documentation Structure

```
docs/
  01-overview/      # High-level understanding
  02-architecture/  # System design (this file)
  03-setup/         # Setup instructions
  04-deployment/     # Deployment guides
  05-testing/        # Testing procedures
  06-production/    # Production hardening
  07-analysis/      # Postmortems, fixes
```

---

## Deployment Awareness

### Preview vs Production

- ✅ **Assume Preview deployments may lack secrets**
- ✅ **Never require secrets at build time**
- ✅ **Guard runtime-only logic appropriately**
- ✅ **Production must remain stable even if Preview fails**

### Environment Variable Strategy

```typescript
// ✅ Good: Graceful degradation
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
if (!OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not configured - classification disabled")
  return { category_slug: null, confidence: 0.0 }
}
```

```typescript
// ❌ Bad: Fails hard if missing
const OPENAI_API_KEY = getRequiredEnv("OPENAI_API_KEY")  // Throws if missing
```

---

## Mental Model

### GPT = Brain + Language
- Understands natural language
- Parses intent
- Classifies content
- Generates responses

### API = Hands
- Executes actions
- Validates data
- Writes to database
- Enforces security

### App / DB = Memory
- Stores state
- Single source of truth
- Enforces constraints
- Provides data

### Separation

**If logic affects understanding → GPT**
- "What category does this belong to?"
- "What is the user asking for?"
- "How should I phrase this response?"

**If logic affects state → Backend**
- "Does this category exist?"
- "Does this user have permission?"
- "Should I create this task?"

**Always preserve this separation.**

---

## Examples

### ✅ Correct: AI Classifies, Backend Validates

```typescript
// 1. AI classifies (GPT)
const classification = await classifyMessage(transcript, categories)
// Returns: { category_slug: "health-wellness", confidence: 0.85 }

// 2. Backend validates (API)
const categoryId = await resolveCategoryId(
  supabase,
  familyId,
  classification.category_slug
)
// Returns: UUID or null (validated against DB)

// 3. Backend creates task (API)
await supabase.from("tasks").insert({
  title: transcript,
  category_id: categoryId,  // null if validation failed
  confidence: classification.confidence,
  // ... other fields
})
```

### ❌ Incorrect: AI Assumes Database State

```typescript
// ❌ Bad: AI returns UUID directly (never do this)
const classification = await classifyMessage(transcript)
// Returns: { category_id: "uuid-here", confidence: 0.85 }
// Problem: AI doesn't know database state!

// ❌ Bad: No validation
await supabase.from("tasks").insert({
  category_id: classification.category_id,  // What if this UUID doesn't exist?
})
```

### ✅ Correct: Low Confidence Handling

```typescript
// AI returns low confidence
const classification = {
  category_slug: null,
  confidence: 0.35
}

// Backend handles gracefully
if (classification.confidence < 0.7) {
  // Don't guess - create task without category
  await supabase.from("tasks").insert({
    title: transcript,
    category_id: null,  // Safe: no category assigned
    confidence: classification.confidence,
  })
  
  // User can manually categorize later
  return "Task created. Please categorize it manually."
}
```

### ❌ Incorrect: Guessing on Low Confidence

```typescript
// ❌ Bad: AI guesses category when uncertain
if (classification.confidence < 0.7) {
  // Don't do this - guessing leads to wrong categories
  classification.category_slug = "other"  // Wrong!
}
```

---

## Checklist

Before implementing AI-assisted features:

- [ ] **AI only reads/classifies, never writes**
- [ ] **All database writes go through authenticated routes**
- [ ] **All IDs/slugs validated against database**
- [ ] **Low confidence = ask clarification, don't guess**
- [ ] **Errors = safe fallback, never block task creation**
- [ ] **Household scoping verified on all queries**
- [ ] **TypeScript types exhaustive**
- [ ] **Documentation updated**

---

## Related Documents

- **[Category Classification](./../07-analysis/CATEGORY_CLASSIFICATION_SIMPLE.md)** - Implementation of these principles
- **[Production Hardening](./../06-production/PRODUCTION_HARDENING.md)** - Security checklist
- **[Cursor Rules](../../.cursorrules)** - Code style and conventions

---

**Last Updated:** 2025-01-01  
**Maintainer:** Development Team

