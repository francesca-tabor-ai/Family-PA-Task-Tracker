# URL Testing Guide - Vercel Deployment

## Deployment URLs to Test

### Production URLs

**Main Production URL:**
```
https://family-pa-task-tracker-francesca-tabors-projects.vercel.app
```

**Latest Failed Deployment (42s ago):**
```
https://family-pa-task-tracker-9wqtqi514-francesca-tabors-projects.vercel.app
```

**Last Successful Deployment (1h ago):**
```
https://family-pa-task-tracker-leuby7pho-francesca-tabors-projects.vercel.app
```

## Test Commands

### 1. Test Root URL
```bash
# Check headers
curl -I https://family-pa-task-tracker-francesca-tabors-projects.vercel.app/

# Expected: 200 OK (if build succeeded)
# Actual: 404 Not Found (if build failed)
```

### 2. Test API Routes
```bash
# Test GET /api/tasks
curl -I https://family-pa-task-tracker-francesca-tabors-projects.vercel.app/api/tasks

# Expected: 401 Unauthorized (requires auth)
# If 404: Route not generated (build failed)
```

### 3. Test Dynamic API Route
```bash
# Test PATCH /api/tasks/[id]
curl -I -X PATCH https://family-pa-task-tracker-francesca-tabors-projects.vercel.app/api/tasks/test-id

# Expected: 401 Unauthorized (requires auth)
# If 404: Route not generated (build failed)
```

### 4. Test 404 Page
```bash
# Test non-existent route
curl -I https://family-pa-task-tracker-francesca-tabors-projects.vercel.app/non-existent

# Expected: 404 Not Found with custom page
# If different: Check not-found.tsx
```

### 5. Verbose Output (Full Response)
```bash
# See full HTTP conversation
curl -v https://family-pa-task-tracker-francesca-tabors-projects.vercel.app/

# Look for:
# - HTTP status code
# - Headers (Content-Type, etc.)
# - Redirects (Location header)
```

### 6. Follow Redirects
```bash
# If there are redirects, follow them
curl -L https://family-pa-task-tracker-francesca-tabors-projects.vercel.app/

# Shows final destination after redirects
```

## Expected Responses

### ✅ Successful Deployment

**Root URL (`/`):**
```
HTTP/2 200
Content-Type: text/html; charset=utf-8
```

**API Route (`/api/tasks`):**
```
HTTP/2 401
Content-Type: application/json
{"error": "Unauthorized"}
```

**404 Page (`/non-existent`):**
```
HTTP/2 404
Content-Type: text/html; charset=utf-8
```

### ❌ Failed Deployment (Build Error)

**All Routes:**
```
HTTP/2 404
Content-Type: text/html; charset=utf-8
```

**Response Body:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>404: Not Found</title>
  </head>
  <body>
    <h1>404: Not Found</h1>
  </body>
</html>
```

## Diagnosis Steps

### Step 1: Check Production URL
```bash
curl -I https://family-pa-task-tracker-francesca-tabors-projects.vercel.app/
```

**If 404:**
- Build likely failed
- Check Vercel deployment logs
- Verify environment variables are set

**If 200:**
- Build succeeded
- Check if content loads correctly

### Step 2: Compare with Successful Deployment
```bash
# Test last successful deployment
curl -I https://family-pa-task-tracker-leuby7pho-francesca-tabors-projects.vercel.app/

# Compare headers and response
```

### Step 3: Check API Routes
```bash
# Test API endpoint
curl -I https://family-pa-task-tracker-francesca-tabors-projects.vercel.app/api/tasks

# If 404: Route not generated (build failed)
# If 401: Route exists, needs authentication (expected)
```

## Common Issues & Solutions

### Issue 1: All Routes Return 404
**Cause:** Build failed
**Solution:** 
- Check Vercel build logs
- Verify all dependencies in `package.json`
- Ensure TypeScript compiles

### Issue 2: Root Works, API Routes 404
**Cause:** API routes not generated
**Solution:**
- Check `app/api/` directory structure
- Verify route handlers export correct functions
- Check for TypeScript errors in API routes

### Issue 3: Different Behavior Locally vs Production
**Cause:** Environment variables missing
**Solution:**
- Check Vercel Dashboard → Settings → Environment Variables
- Verify `NEXT_PUBLIC_*` variables are set
- Redeploy after adding variables

## Testing Checklist

- [ ] Root URL (`/`) returns 200
- [ ] API route (`/api/tasks`) returns 401 (not 404)
- [ ] Dynamic API route (`/api/tasks/[id]`) returns 401 (not 404)
- [ ] 404 page works for non-existent routes
- [ ] No unexpected redirects
- [ ] Headers are correct (Content-Type, etc.)

## Quick Test Script

```bash
#!/bin/bash

BASE_URL="https://family-pa-task-tracker-francesca-tabors-projects.vercel.app"

echo "Testing Root URL..."
curl -I "$BASE_URL/" | head -1

echo "Testing API Route..."
curl -I "$BASE_URL/api/tasks" | head -1

echo "Testing Dynamic Route..."
curl -I "$BASE_URL/api/tasks/test-id" | head -1

echo "Testing 404..."
curl -I "$BASE_URL/non-existent" | head -1
```

---

**Last Updated:** $(date)
**Production URL:** https://family-pa-task-tracker-francesca-tabors-projects.vercel.app

