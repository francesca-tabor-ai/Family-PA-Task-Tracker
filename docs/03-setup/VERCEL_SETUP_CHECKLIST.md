# Vercel Setup Checklist - Fix 404 Issue

## ✅ Current Project Status

All required files are present and correctly configured:

- ✅ `package.json` - Next.js 14.2.5, React 18.3.1
- ✅ `next.config.js` - Basic Next.js config
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `app/page.tsx` - Root page component exists
- ✅ `app/layout.tsx` - Root layout exists
- ✅ `app/globals.css` - Global styles
- ✅ `tailwind.config.ts` - Tailwind configuration
- ✅ `postcss.config.js` - PostCSS configuration

## Vercel Dashboard Configuration

Go to: **https://vercel.com/dashboard** → Your Project → **Settings** → **General**

### Framework Preset
```
Next.js
```

### Root Directory
```
./
```
(Leave blank or set to `./` - repo root)

### Build Command
```
next build
```

### Output Directory
```
(Leave empty - Next.js auto-detects .next)
```

### Install Command
```
npm install
```
(or leave as default)

### Node.js Version
```
20.x
```
(or latest LTS)

## Environment Variables

Go to: **Settings** → **Environment Variables**

Add these for **Production** and **Preview**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Common 404 Causes & Fixes

### 1. Wrong Root Directory
- **Problem:** Vercel looking in wrong folder
- **Fix:** Set Root Directory to `./` (repo root)

### 2. Framework Not Detected
- **Problem:** Vercel doesn't recognize Next.js
- **Fix:** Set Framework Preset to `Next.js` manually

### 3. Build Failing Silently
- **Problem:** Build errors causing 404
- **Fix:** Check **Deployments** → **Build Logs** for errors

### 4. Missing Dependencies
- **Problem:** `package.json` dependencies not installed
- **Fix:** Ensure `npm install` runs (check Install Command)

### 5. TypeScript Errors
- **Problem:** TypeScript compilation failing
- **Fix:** Check build logs for TS errors, ensure `tsconfig.json` is correct

## Verification Steps

1. **Check Build Logs:**
   - Go to **Deployments** tab
   - Click on latest deployment
   - Review **Build Logs** for errors

2. **Verify Deployment:**
   - After successful build, check **Functions** tab
   - Should see Next.js serverless functions

3. **Test Routes:**
   - Visit: `https://your-project.vercel.app/`
   - Should show the home page (not 404)

## If Still Getting 404

1. **Manual Redeploy:**
   - Go to **Deployments**
   - Click **...** on latest deployment
   - Click **Redeploy**

2. **Check File Structure:**
   ```bash
   # Ensure these exist in repo root:
   - package.json
   - next.config.js
   - app/page.tsx
   - app/layout.tsx
   ```

3. **Verify Git Push:**
   - Ensure all files are committed and pushed to `main` branch
   - Vercel deploys from the `main` branch by default

4. **Contact Support:**
   - If still failing, check Vercel build logs
   - Share error messages with support

## Quick Fix Commands

If you need to verify locally first:

```bash
# Install dependencies
npm install

# Build locally
npm run build

# Test production build
npm start
```

If local build works but Vercel doesn't, the issue is in Vercel configuration.

