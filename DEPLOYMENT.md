# Notecraft Pro Deployment Guide

## Architecture
- **Frontend**: React app deployed to Vercel
- **Backend**: FastAPI app deployed to Render

## Render Deployment (FastAPI Backend)

### Option 1: Using render.yaml (Recommended)
1. Connect your GitHub repo to Render
2. Render will automatically detect the `render.yaml` file
3. Set environment variables in Render dashboard:
   - `MODEL_REPO`: `google/flan-t5-small`
   - `API_SECRET`: Generate a secure random string
   - `HF_TOKEN`: Your Hugging Face token (optional)

### Option 2: Manual Setup
1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `pip install -r api/requirements.txt`
   - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11
4. Set environment variables as above

## Vercel Deployment (React Frontend)

### Automatic Deployment
1. Connect your GitHub repo to Vercel
2. Vercel will auto-detect it's a React app
3. Set environment variables in Vercel dashboard:
   - `REACT_APP_FASTAPI_URL`: Your Render app URL (e.g., `https://notecraft-pro-api.onrender.com`)

### Manual Deployment
```bash
npm install -g vercel
vercel --prod
```

## Environment Variables Summary

### Render (Backend)
```
MODEL_REPO=google/flan-t5-small
API_SECRET=your-secure-random-string
HF_TOKEN=your-huggingface-token (optional)
```

### Vercel (Frontend)  
```
REACT_APP_FASTAPI_URL=https://your-render-app.onrender.com
```

## Testing Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-render-app.onrender.com/healthz
   ```

2. **Backend Humanize Test**:
   ```bash
   curl -X POST https://your-render-app.onrender.com/humanize \
     -H "Content-Type: application/json" \
     -d '{"text": "Test text to humanize", "tone": "friendly"}'
   ```

3. **Frontend**: Visit your Vercel URL and test the humanization feature

## Troubleshooting

### Common Issues
1. **Model Download Timeout**: First request may take 2-3 minutes as the model downloads
2. **CORS Errors**: Make sure the frontend URL is correct in the API calls
3. **Memory Issues on Render**: The free tier may struggle with the model - consider upgrading

### Logs
- **Render**: Check the logs in Render dashboard
- **Vercel**: Check the Functions tab for any errors