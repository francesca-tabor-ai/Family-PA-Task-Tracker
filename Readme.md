# Family PA Task Tracker

A voice-powered family task management application built with Next.js, Supabase, and Twilio WhatsApp integration. Capture tasks via voice messages, manage them through a clean web interface, and keep your family organized.

## What This App Does

- **Voice-powered task creation** via WhatsApp voice messages
- **AI-powered transcription** using OpenAI's speech-to-text
- **Structured task extraction** with confidence-based logic
- **Family-based organization** with role-based access control
- **Real-time task management** through a modern web interface

## Quick Start

1. **Setup**: See [Setup Documentation](./docs/03-setup/)
2. **Deploy**: Follow [Deployment Guide](./docs/04-deployment/)
3. **Configure**: Set up [Twilio WhatsApp Integration](./docs/03-setup/TWILIO_WHATSAPP_SETUP.example.md)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase Edge Functions
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Voice**: Twilio WhatsApp + OpenAI Whisper
- **AI**: OpenAI GPT-4o-mini for structured extraction
- **Deployment**: Vercel (Frontend), Supabase (Backend & Database)

## Core Principles

- **Security First**: All database access through Supabase client, RLS policies, no raw SQL
- **Schema-First**: All database changes via migrations in `supabase/migrations/`
- **Voice-First UX**: Confidence-based task creation with clarification questions
- **Family Isolation**: Row-level security ensures data privacy between families

## Documentation

Our documentation is organized by intent, not chronology. Navigate to what you need:

- 🧭 **[Overview & Intent](./docs/01-overview/)** - Project planning, testing procedures, and high-level understanding
- 🧠 **[Architecture](./docs/02-architecture/)** - System design, routing decisions, and technical deep dives
- ⚙️ **[Setup](./docs/03-setup/)** - Local development, Twilio configuration, and first-time setup
- 🚀 **[Deployment](./docs/04-deployment/)** - Vercel deployment, troubleshooting, and production shipping
- 🧪 **[Testing](./docs/05-testing/)** - Verification procedures, test results, and build analysis
- 🔒 **[Production](./docs/06-production/)** - Hardening checklist, security, and operational readiness
- 📊 **[Analysis](./docs/07-analysis/)** - Postmortems, build fixes, and historical context

## Commit Conventions

We use lightweight commit prefixes for readability:

- `intent:` - Product-level steps or decisions
- `schema:` - Database migrations, RLS, structural data changes
- `feat:` - New features
- `fix:` - Bug fixes and repairs

Examples:
- `feat: add task assignment flow`
- `schema: add RLS for tasks table`
- `intent: define household task lifecycle`
- `fix: correct overdue task calculation`

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (authed)/          # Protected routes
│   ├── api/               # API route handlers
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client setup
│   └── types/            # TypeScript definitions
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
└── docs/                 # Organized documentation
```

## Security

- **Row Level Security (RLS)** enabled on all tables
- **Family-based isolation** via RLS policies
- **Server-side identity enforcement** (no client spoofing)
- **Environment variables** properly scoped (NEXT_PUBLIC_ vs server-only)
- **No secrets in Git** - use `.secrets.env` template

## License

Private / internal use.

---

**Need help?** Start with the [Overview](./docs/01-overview/) or [Setup](./docs/03-setup/) documentation.