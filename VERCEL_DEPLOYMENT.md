# Vercel Deployment Guide

## Issue Analysis

Your Vercel deployment is failing with "data is too long" error because:

1. **Large ML Models**: The `google/flan-t5-small` model is several hundred MB
2. **Vercel Limitations**: Serverless functions have size and memory constraints
3. **Cold Start Issues**: Loading large models during cold starts can timeout

## Solutions

### Option 1: Use Simplified API (Recommended for initial deployment)

1. **Rename the simplified API**:
   ```bash
   mv api/main.py api/main_ml.py
   mv api/main_simple.py api/main.py
   mv api/requirements.txt api/requirements_ml.txt
   mv api/requirements_simple.txt api/requirements.txt
   ```

2. **Deploy with simplified version**:
   ```bash
   vercel --prod
   ```

This version uses rule-based text humanization without ML models, which will deploy successfully.

### Option 2: Use ML API with Optimizations

If you want to use the ML version:

1. **Keep the optimized main.py** (already updated with fallbacks)
2. **Set environment variables** in Vercel dashboard:
   - `MODEL_REPO`: `google/flan-t5-base` (smaller model)
   - `API_SECRET`: Your API secret

3. **Deploy with longer timeout**:
   ```bash
   vercel --prod
   ```

### Option 3: Alternative Deployment Platforms

For ML-heavy applications, consider:

- **Railway**: Better for Python ML apps
- **Render**: Good Python support
- **Heroku**: Traditional but reliable
- **Google Cloud Run**: Excellent for ML workloads

## Current Configuration

The updated `vercel.json` includes:
- 30-second function timeout
- Proper Python path configuration
- Build environment setup

## Testing

After deployment, test the API:

```bash
curl -X POST https://your-app.vercel.app/api/humanize \
  -H "Content-Type: application/json" \
  -d '{"text": "I am going to the store to purchase some items."}'
```

## Monitoring

Check Vercel dashboard for:
- Function execution times
- Memory usage
- Error logs
- Cold start performance

## Next Steps

1. Deploy the simplified version first
2. Test functionality
3. If ML features are needed, consider alternative platforms
4. Monitor performance and scale as needed 