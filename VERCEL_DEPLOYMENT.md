# Vercel Deployment Guide

## Prerequisites

1. **Push to GitHub main branch**
   - Ensure your Next.js app is on the `main` branch
   - All code is committed and pushed

2. **Vercel Account**
   - Sign up at https://vercel.com (or use existing account)
   - Connect your GitHub account

## Deployment Steps

### Step 1: Import Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your repository: `francesca-tabor-ai/family-pa-task-tracker`
5. Click **"Import"**

### Step 2: Configure Project Settings

**Framework Preset:**
- Select: **Next.js**
- Vercel will auto-detect App Router

**Build Settings:**
- **Framework Preset:** Next.js
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
- **Root Directory:** `./` (default, unless your Next.js app is in a subdirectory)

### Step 3: Environment Variables

Configure environment variables in **Vercel → Project → Settings → Environment Variables**.

#### Required (Browser-safe - Add to Preview + Production):

These variables are exposed to the browser and are safe to use with `NEXT_PUBLIC_` prefix:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Security Note:** 
- ✅ Supabase URL + anon key are **designed for browser exposure** (assuming RLS is correctly configured)
- ✅ These are safe because Row Level Security (RLS) enforces access control server-side
- ✅ Always add these to **both Preview and Production** environments

#### Server-Only Variables (Only if Needed):

If you need server-only values in Next.js Route Handlers or Server Actions, add them **without** the `NEXT_PUBLIC_` prefix:

```
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WEBHOOK_SECRET=your_webhook_secret
OPENAI_API_KEY=your_openai_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important Security Rules:**
- ❌ **Never** prefix server-only secrets with `NEXT_PUBLIC_`
- ❌ **Avoid** using `SUPABASE_SERVICE_ROLE_KEY` in Next.js if possible
- ✅ **Prefer** doing privileged operations in Supabase Edge Functions instead
- ✅ Server-only variables are only accessible in:
  - Route Handlers (`app/api/**/route.ts`)
  - Server Actions
  - Server Components (via `process.env`)

**Best Practice:** Keep sensitive operations (like webhook handling, OpenAI API calls) in Supabase Edge Functions where secrets are managed separately.

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Run `next build`
   - Deploy to a preview URL
   - Create a production deployment

## Deploy Workflow

### Automatic Deployments

**Production Deployments:**
- ✅ Every push to `main` branch triggers a **Production** deploy
- ✅ Production uses environment variables marked for "Production"
- ✅ Production URL: `https://your-project.vercel.app`

**Preview Deployments:**
- ✅ Every Pull Request triggers a **Preview** deploy
- ✅ Preview uses environment variables marked for "Preview"
- ✅ Preview URL: `https://your-project-git-branch.vercel.app`
- ✅ **Great for testing webhooks safely** before merging to main

### Manual Deployments

- You can also trigger deployments manually from the Vercel dashboard
- Useful for redeploying after environment variable changes

### Step 5: Post-Deployment

1. **Verify Environment Variables** are set correctly for each environment
2. **Test Preview Deployments** on PRs before merging
3. **Configure Custom Domain** (optional)
4. **Set up monitoring** and error tracking

## Environment Variables Setup

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. For each variable:
   - **Key:** Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value:** Enter the variable value
   - **Environment:** Select which environments to apply to:
     - ✅ **Production** (for main branch deployments)
     - ✅ **Preview** (for PR deployments)
     - ⚠️ **Development** (for local `vercel dev` - optional)

### Required Variables (Add to Preview + Production):

| Variable | Value Source | Environments |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public key | Production, Preview |

### Get Your Supabase Keys:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Security Best Practices

**✅ DO:**
- Use `NEXT_PUBLIC_` prefix only for browser-safe values (Supabase URL + anon key)
- Add variables to both Preview and Production environments
- Double-check which environment variables are applied to which deployments
- Use Supabase Edge Functions for privileged operations instead of service role keys in Next.js

**❌ DON'T:**
- Never prefix secrets with `NEXT_PUBLIC_` (they'll be exposed to browsers)
- Don't add `SUPABASE_SERVICE_ROLE_KEY` to Vercel if you can avoid it
- Don't assume environment variables sync automatically—verify they're set correctly

## Build Configuration

Vercel automatically detects Next.js and uses these defaults:

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

You can override these in `vercel.json` if needed:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Check `package.json`** has all dependencies
4. **Ensure TypeScript compiles** without errors

### Environment Variables Not Working

1. **Redeploy** after adding env vars (they're injected at build time)
2. **Check variable names** match exactly (case-sensitive)
3. **Verify `NEXT_PUBLIC_` prefix** for browser-exposed variables

### Common Issues

- **Module not found:** Add missing dependency to `package.json`
- **Type errors:** Fix TypeScript errors before deploying
- **Build timeout:** Optimize build or increase timeout in settings

## Optional: Supabase ↔ Vercel Integration

If you use Supabase heavily, Vercel offers a Supabase integration that can:

- ✅ **Sync environment variables** more conveniently
- ✅ **Connect preview deployments** to your Supabase project automatically
- ✅ **Reduce copy/paste mistakes** when setting up new projects

### Setting Up the Integration

1. In Vercel Dashboard → **Settings** → **Integrations**
2. Find **Supabase** and click **"Add"**
3. Connect your Supabase account
4. Select your Supabase project
5. Choose which environment variables to sync

### Important Notes

- ⚠️ **Don't treat it as magic**—always double-check which environment (Preview vs Production) the variables land in
- ⚠️ **Verify variable values** after syncing to ensure they're correct
- ⚠️ **Review security**—ensure sensitive variables aren't accidentally exposed

The integration is helpful but manual verification is still recommended for production deployments.

## Next Steps After Deployment

1. **Test the deployed app** at your Vercel URL
2. **Test Preview Deployments** by creating a PR
3. **Verify environment variables** are working correctly
4. **Set up custom domain** (optional)
5. **Configure monitoring** and error tracking
6. **Test webhook endpoints** using Preview URLs before merging to main

## References

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)
- [Supabase Vercel Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

