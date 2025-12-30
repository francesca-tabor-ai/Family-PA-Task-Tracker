import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Environment variables
const PROJECT_URL = Deno.env.get("PROJECT_URL") || Deno.env.get("SUPABASE_URL")
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
const WEBHOOK_SHARED_SECRET = Deno.env.get("WEBHOOK_SHARED_SECRET")
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")

// Constants
const CONFIDENCE_THRESHOLD = 0.7
const MAX_AUDIO_SIZE_MB = 25
const MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024

// Types
interface CategoryClassification {
  category_slug: string | null
  confidence: number
}

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

// Helper: Get required environment variable
function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Helper: Assert shared secret authentication
function assertSharedSecret(req: Request): void {
  const url = new URL(req.url)
  const secret = url.searchParams.get("secret")
  const expected = WEBHOOK_SHARED_SECRET

  if (expected && secret !== expected) {
    throw new Response("Unauthorized", { status: 401 })
  }
}

// Helper: Parse Twilio form data
async function parseTwilioForm(req: Request): Promise<Record<string, string>> {
  const form = await req.formData()
  const obj: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    obj[key] = String(value)
  }
  return obj
}

// Helper: Resolve family_id from phone number
async function resolveFamilyId(supabase: any, fromPhone: string): Promise<string> {
  // Remove whatsapp: prefix if present
  const cleanPhone = fromPhone.replace(/^whatsapp:/, "")
  
  const { data, error } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("phone_e164", cleanPhone)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error resolving family:", error)
    throw error
  }

  if (!data?.family_id) {
    throw new Error(`Unknown phone number: ${cleanPhone}. No family match found.`)
  }

  return data.family_id
}

// Helper: Fetch categories for a family
async function fetchCategoriesForFamily(supabase: any, familyId: string): Promise<Category[]> {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("household_id", familyId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    throw error
  }

  return (categories || []) as Category[]
}

// Helper: Build category classification prompt
function buildClassificationPrompt(transcript: string, categories: Category[]): string {
  // Build simple flat list of slugs (no hierarchy, no names)
  const categorySlugs = categories
    .map(cat => cat.slug)
    .sort()
    .join("\n- ")

  return `You are categorising a family assistant task.

Available categories:
- ${categorySlugs}

Task text:
"${transcript}"

Return JSON:
{
  "category_slug": "...",
  "confidence": 0.0
}`
}

// Helper: Classify message using OpenAI
async function classifyMessage(
  transcript: string,
  categories: Category[]
): Promise<CategoryClassification> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured")
  }

  if (categories.length === 0) {
    // No categories available - return null classification
    return {
      category_slug: null,
      confidence: 0.0
    }
  }

  const prompt = buildClassificationPrompt(transcript, categories)

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more consistent classification
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI classification error:", errorText)
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("No content in OpenAI response")
    }

    // Parse JSON response
    let classification: CategoryClassification
    try {
      classification = JSON.parse(content)
    } catch (parseError) {
      console.error("Failed to parse OpenAI JSON:", content)
      // Fallback: return low confidence
      return {
        category_slug: null,
        confidence: 0.0
      }
    }

    // Validate classification structure
    if (typeof classification.confidence !== "number" || 
        classification.confidence < 0 || 
        classification.confidence > 1) {
      console.error("Invalid confidence score:", classification.confidence)
      classification.confidence = 0.0
    }

    // Ensure category_slug is valid or null
    if (classification.category_slug && 
        !categories.some(cat => cat.slug === classification.category_slug)) {
      console.warn(`Invalid category slug: ${classification.category_slug}`)
      classification.category_slug = null
      classification.confidence = 0.0
    }

    return classification

  } catch (error) {
    console.error("Error classifying message:", error)
    // Safe fallback: return null classification with low confidence
    return {
      category_slug: null,
      confidence: 0.0
    }
  }
}

// Helper: Validate and resolve category_id from slug
async function resolveCategoryId(
  supabase: any,
  familyId: string,
  categorySlug: string | null
): Promise<string | null> {
  if (!categorySlug) {
    return null
  }

  const { data: category, error } = await supabase
    .from("categories")
    .select("id")
    .eq("household_id", familyId)
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error resolving category:", error)
    return null // Safe fallback: don't assign category if lookup fails
  }

  if (!category) {
    console.warn(`Category slug "${categorySlug}" not found for family ${familyId}`)
    return null // Safe fallback: slug doesn't exist
  }

  return category.id
}

// Helper: Download media from Twilio
async function fetchMediaFromTwilio(mediaUrl: string): Promise<ArrayBuffer> {
  const sid = TWILIO_ACCOUNT_SID
  const token = TWILIO_AUTH_TOKEN

  const headers: HeadersInit = {}
  if (sid && token) {
    const basic = btoa(`${sid}:${token}`)
    headers["Authorization"] = `Basic ${basic}`
  }

  const response = await fetch(mediaUrl, { headers })
  
  if (!response.ok) {
    throw new Error(`Media fetch failed: ${response.status} ${response.statusText}`)
  }

  const contentLength = response.headers.get("content-length")
  if (contentLength && parseInt(contentLength) > MAX_AUDIO_SIZE_BYTES) {
    throw new Error(`Media file too large: ${contentLength} bytes (max: ${MAX_AUDIO_SIZE_BYTES})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  
  if (arrayBuffer.byteLength > MAX_AUDIO_SIZE_BYTES) {
    throw new Error(`Media file too large: ${arrayBuffer.byteLength} bytes (max: ${MAX_AUDIO_SIZE_BYTES})`)
  }

  return arrayBuffer
}

// Helper: Transcribe audio using OpenAI
async function transcribeWithOpenAI(audioBytes: ArrayBuffer, filename = "audio.ogg"): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured")
  }

  const form = new FormData()
  form.append("model", "gpt-4o-mini-transcribe")
  form.append("file", new Blob([audioBytes]), filename)
  form.append("language", "en") // Optional: can be made dynamic based on user preference

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: form,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Transcription failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return String(data.text || "").trim()
}

// Helper: Generate TwiML response
function twimlMessage(body: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(body)}</Message>
</Response>`
  
  return new Response(xml, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  })
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// Main handler
serve(async (req) => {
  try {
    // Handle GET requests (webhook verification)
    if (req.method === "GET") {
      const url = new URL(req.url)
      const mode = url.searchParams.get("hub.mode")
      const token = url.searchParams.get("hub.verify_token")
      const challenge = url.searchParams.get("hub.challenge")

      if (mode === "subscribe" && token === Deno.env.get("WEBHOOK_VERIFY_TOKEN")) {
        return new Response(challenge, { status: 200 })
      }
      return new Response("Forbidden", { status: 403 })
    }

    // Handle POST requests (incoming messages)
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 })
    }

    // Authenticate
    assertSharedSecret(req)

    // Parse Twilio form data
    const payload = await parseTwilioForm(req)
    const messageSid = payload["MessageSid"]
    const fromPhone = payload["From"] // e.g., "whatsapp:+4179..."
    const bodyText = payload["Body"] ?? ""
    const numMedia = Number(payload["NumMedia"] ?? "0")
    const mediaUrl0 = payload["MediaUrl0"] ?? null
    const mediaContentType0 = payload["MediaContentType0"] ?? null

    if (!messageSid || !fromPhone) {
      return new Response("Bad Request: Missing MessageSid or From", { status: 400 })
    }

    // Initialize Supabase client
    const supabaseUrl = PROJECT_URL || getRequiredEnv("PROJECT_URL")
    const supabaseKey = SERVICE_ROLE_KEY || getRequiredEnv("SERVICE_ROLE_KEY")
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Resolve family
    const familyId = await resolveFamilyId(supabase, fromPhone)

    // Check idempotency
    const { error: idempotencyError } = await supabase
      .from("inbound_messages")
      .insert({
        provider: "twilio",
        message_sid: messageSid,
        family_id: familyId,
        from_phone: fromPhone,
        raw_payload: payload,
      })

    if (idempotencyError) {
      // If duplicate key, Twilio retry → return OK response
      if (String(idempotencyError.message).toLowerCase().includes("duplicate") ||
          String(idempotencyError.message).toLowerCase().includes("unique")) {
        return twimlMessage("✅ Already received—processing was skipped.")
      }
      throw idempotencyError
    }

    // Get transcript (from audio or text)
    let transcript = bodyText.trim()
    let storedMediaUrl: string | null = null

    if (numMedia > 0 && mediaUrl0) {
      // Validate content type (audio only)
      if (mediaContentType0 && !mediaContentType0.startsWith("audio/")) {
        return twimlMessage("⚠️ I can only process audio messages. Please send a voice note.")
      }

      try {
        const audioBytes = await fetchMediaFromTwilio(mediaUrl0)
        const filename = mediaUrl0.split("/").pop() || "audio.ogg"
        transcript = await transcribeWithOpenAI(audioBytes, filename)
        storedMediaUrl = mediaUrl0
      } catch (error) {
        console.error("Error processing audio:", error)
        return twimlMessage("⚠️ I couldn't process the audio. Please try again or send a text message.")
      }
    }

    if (!transcript) {
      return twimlMessage("⚠️ I didn't receive any text or audio. Please send a message with your task.")
    }

    // Store transcription for audit
    const { error: transcriptionError } = await supabase
      .from("voice_transcriptions")
      .insert({
        family_id: familyId,
        from_phone: fromPhone,
        media_url: storedMediaUrl,
        transcript,
        raw_payload: payload,
      })

    if (transcriptionError) {
      console.error("Error storing transcription:", transcriptionError)
      // Continue processing even if transcription storage fails
    }

    // Fetch available categories for this family
    const categories = await fetchCategoriesForFamily(supabase, familyId)

    // Classify the message
    const classification = await classifyMessage(transcript, categories)

    // Resolve category_id from slug (with safe fallback)
    const categoryId = await resolveCategoryId(
      supabase,
      familyId,
      classification.category_slug
    )

    // Determine task status and response message
    const taskStatus = "open" // Default status
    let responseMessage = ""

    if (classification.confidence >= CONFIDENCE_THRESHOLD && categoryId) {
      // High confidence: create task with category
      const categoryName = categories.find(c => c.id === categoryId)?.name || "Unknown"
      responseMessage = `✅ Task created: "${transcript}"\n📁 Category: ${categoryName}`
    } else {
      // Low confidence: create task without category
      responseMessage = `✅ Task created: "${transcript}"\n⚠️ Please categorize this task manually.`
    }

    // Create task
    const { error: taskError } = await supabase
      .from("tasks")
      .insert({
        family_id: familyId,
        title: transcript,
        category_id: categoryId, // Use category_id (new field)
        category: null, // Legacy field - keep null
        status: taskStatus,
        source_type: "whatsapp",
        source_media_url: storedMediaUrl,
        confidence: classification.confidence,
        created_by_user_id: null, // WhatsApp tasks don't have a user_id
      })

    if (taskError) {
      console.error("Error creating task:", taskError)
      throw taskError
    }

    // Return TwiML response
    return twimlMessage(responseMessage)

  } catch (error) {
    console.error("Webhook error:", error)
    
    // Don't leak internals to WhatsApp
    return twimlMessage("⚠️ Sorry—something went wrong while processing that message. Please try again.")
  }
})
