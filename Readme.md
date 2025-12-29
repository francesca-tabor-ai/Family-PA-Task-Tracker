# Voice-Powered To-Do App

A modern to-do application that lets you add tasks by voice using a Custom GPT, while keeping your backend and database fully secure. The AI understands intent — your app stays in control.

## What This App Does

- Add to-dos via voice notes
- Uses a Custom GPT to:
  - Transcribe audio
  - Extract task intent
  - Convert speech into structured data
- Calls a secure backend API
- Persists tasks in your existing database
- Instantly updates your deployed app

You never need to open the app to capture tasks — just speak.

## High-Level Architecture

```
User (Voice)
    ↓
Custom GPT (Transcription + Intent Parsing)
    ↓
(Action / Function Call)
    ↓
Secure Backend API (Vercel)
    ↓
Database (Source of Truth)
    ↓
Frontend App (Live Updates)
```

### Core Principle (Non-Negotiable)

**A Custom GPT never writes directly to the database.**

- GPT can request actions
- Backend authorizes and executes
- Database remains the single source of truth

## Tech Stack

- **Frontend**: Existing To-Do App (Vercel)
- **Backend**: Vercel Serverless Functions
- **AI / Voice**: OpenAI Custom GPT + Whisper
- **Database**: Prisma / Supabase / Firebase (existing setup)

## Security Model

- Backend API secured with Bearer token authentication
- API key stored as a Vercel environment variable
- Requests validated server-side
- No database credentials exposed to GPT

## Setup

### 1. Environment Variables

Add the following environment variable in Vercel:

```
GPT_API_KEY=your-secure-random-key
```

### 2. Backend API Endpoint

Create a serverless endpoint: `/api/add-todo`

**Responsibilities:**
- Accept POST requests only
- Authenticate using `Authorization: Bearer <GPT_API_KEY>`
- Validate request payload
- Write to database
- Return minimal success or error response

**The backend is the only write layer.**

### 3. Custom GPT Action

Define a single action in Custom GPT → Actions:

```json
{
  "name": "add_todo",
  "description": "Add a task to my to-do list",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The task description"
      },
      "dueDate": {
        "type": "string",
        "description": "Optional due date in ISO format"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "normal", "high"]
      }
    },
    "required": ["title"]
  }
}
```

Map the action to:

```
POST https://your-app.vercel.app/api/add-todo
Authorization: Bearer GPT_API_KEY
```

## Voice to Task Flow

### Voice Input
```
"Remind me to submit the expense report tomorrow morning"
```

### Structured Task Parsed by GPT
```json
{
  "title": "Submit expense report",
  "dueDate": "2025-01-15T09:00:00",
  "priority": "normal"
}
```

### Backend Result
- Task written to database
- App updates instantly
- GPT confirms briefly

## Confirmation UX

**Short • Clear • Non-technical**

Example:
```
Added: Submit expense report (tomorrow morning)
```

## Usage

1. Open the ChatGPT mobile app
2. Send a voice note to your Custom GPT
3. Task appears instantly in your app

Think of this as a **voice inbox for tasks**.

## Common Pitfalls to Avoid

- Letting GPT access the database directly
- Missing authentication on API routes
- Over-verbose confirmations
- Silent failures
- Business logic inside GPT

## Mental Model

- **GPT** = Brain + Voice
- **API** = Hands
- **App / Database** = Memory

If logic affects **data integrity**, it belongs in the **backend**  
If logic affects **understanding or intent**, it belongs in **GPT**

## Optional Enhancements

- Multiple tasks from a single voice note
- Natural-language date parsing ("next Friday", "in two hours")
- Task category inference (Life Admin, Travel, Health, etc.)
- Batch confirmation flows
- Rate limiting and request logging

## License

Private / internal use (customize as needed).

## Final Note

This architecture is designed to be:

- **Secure**
- **Clear**
- **Extensible**
- **Low-friction**

It scales cleanly from a personal voice task inbox to a production-grade assistant-driven system.