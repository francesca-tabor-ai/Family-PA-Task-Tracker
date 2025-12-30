# Setup

This section covers getting started locally and configuring the development environment.

## Purpose

When you're setting up the project for the first time or configuring integrations, these documents guide you through the process without guessing. They cover:

- Local development environment setup
- Third-party service integration (Twilio, WhatsApp)
- Vercel configuration for local testing

## Documents

- **[VERCEL_SETUP_CHECKLIST.md](./VERCEL_SETUP_CHECKLIST.md)** - Checklist for configuring Vercel settings to avoid common deployment issues
- **[TWILIO_WHATSAPP_SETUP.md](./TWILIO_WHATSAPP_SETUP.md)** - Complete guide for setting up Twilio WhatsApp webhook integration (with real credentials - keep secure)
- **[TWILIO_WHATSAPP_SETUP.example.md](./TWILIO_WHATSAPP_SETUP.example.md)** - Template version with placeholders for safe sharing

## When to Read

- **First time setup**: Follow VERCEL_SETUP_CHECKLIST.md
- **Configuring WhatsApp integration**: Use TWILIO_WHATSAPP_SETUP.md (keep secure) or TWILIO_WHATSAPP_SETUP.example.md (for templates)
- **Troubleshooting setup issues**: Reference these documents for configuration details

## Reading Order

1. VERCEL_SETUP_CHECKLIST.md for basic deployment configuration
2. TWILIO_WHATSAPP_SETUP.example.md for integration template
3. TWILIO_WHATSAPP_SETUP.md (secure version) when actually configuring

## Security Note

TWILIO_WHATSAPP_SETUP.md contains real credentials and should never be committed to Git. Use TWILIO_WHATSAPP_SETUP.example.md as the template for version control.

