# 🚀 Quick Deployment Fix

## Problem
Vercel was failing because you tried to deploy a 500MB+ ML model to a platform with 50MB limits.

## Solution: Split Architecture
- **React Frontend** → Vercel ✅
- **FastAPI Backend** → Render ✅

## Deploy Steps

### 1. Deploy Backend to Render
1. Go to [render.com](https://render.com)
2. **New Web Service** → Connect GitHub → Select your repo
3. Render will auto-detect `render.yaml`
4. Set these environment variables:
   - `MODEL_REPO`: `google/flan-t5-small`
   - `API_SECRET`: Generate random string (e.g., `mySecretKey123`)
5. Deploy (takes ~5-10 minutes for first deploy)
6. **Copy your Render URL** (e.g., `https://notecraft-pro-api.onrender.com`)

### 2. Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. **Import Project** → GitHub → Select your repo
3. Vercel will auto-detect React app
4. Set environment variable:
   - `REACT_APP_FASTAPI_URL`: Your Render URL from step 1
5. Deploy (takes ~2 minutes)

### 3. Test
- Backend: `https://your-render-url.onrender.com/healthz`
- Frontend: Use your Vercel URL

## Why This Works
- ✅ Vercel only handles lightweight React (no ML models)
- ✅ Render handles heavy ML workloads
- ✅ No size limit issues
- ✅ Both services are optimized for their use case

## Files Changed
- `vercel.json` - Removed API function config
- `.vercelignore` - Excludes API folder from Vercel
- `render.yaml` - Optimized for backend-only deployment