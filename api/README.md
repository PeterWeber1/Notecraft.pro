# Notecraft Pro Humanizer API

FastAPI backend for text humanization using Hugging Face Transformers.

## Features

- **FastAPI**: Modern, fast web framework for building APIs
- **Hugging Face Transformers**: State-of-the-art NLP models
- **FLAN-T5**: Google's instruction-tuned language model
- **CORS Support**: Cross-origin requests enabled
- **Authentication**: Optional API key protection
- **Docker Ready**: Containerized deployment support

## Setup

### Local Development

1. **Install Dependencies**
   ```bash
   cd api
   pip install -r requirements.txt
   ```

2. **Environment Variables** (Optional)
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start Server**
   ```bash
   python start.py
   # or
   python main.py
   # or
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Test API**
   ```bash
   python test_api.py
   ```

### Docker Deployment

1. **Build Image**
   ```bash
   docker build -t notecraft-pro-api .
   ```

2. **Run Container**
   ```bash
   docker run -p 8000:8000 -e MODEL_REPO=google/flan-t5-small notecraft-pro-api
   ```

### Render Deployment

1. **Environment Variables**
   - `MODEL_REPO`: `google/flan-t5-small` (or your preferred model)
   - `API_SECRET`: Your authentication secret key
   - `HF_TOKEN`: Hugging Face token (for private models)

2. **Build Command**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Command**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

## API Endpoints

### Health Check
```
GET /healthz
```

Response:
```json
{
  "status": "ok",
  "message": "Notecraft Pro Humanizer API is running"
}
```

### Humanize Text
```
POST /humanize
Content-Type: application/json
Authorization: Bearer <API_SECRET> (optional)
```

Request:
```json
{
  "text": "Your AI-generated text here",
  "tone": "neutral",      // optional: neutral, friendly, formal, enthusiastic, confident
  "style": "professional", // optional: professional, casual, academic, creative, technical
  "length": "maintain"     // optional: maintain, shorter, longer
}
```

Response:
```json
{
  "success": true,
  "originalText": "Your original text",
  "humanizedText": "The humanized version",
  "wordCount": 25,
  "characterCount": 142,
  "settings": {
    "tone": "neutral",
    "style": "professional", 
    "length": "maintain"
  }
}
```

## Model Configuration

The API uses Google's FLAN-T5-small model by default. You can specify different models:

- `google/flan-t5-small` (default) - Fast, lightweight
- `google/flan-t5-base` - Better quality, slower
- `google/flan-t5-large` - Best quality, requires more resources

## Frontend Integration

Update your frontend to point to the FastAPI server:

```javascript
// In your React app
const apiUrl = process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000';

const response = await fetch(`${apiUrl}/humanize`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer your-api-secret' // if using authentication
  },
  body: JSON.stringify({
    text: yourText,
    tone: 'friendly',
    style: 'casual',
    length: 'maintain'
  })
});
```

## Development

- **main.py**: FastAPI application
- **start.py**: Development server starter
- **test_api.py**: API testing script
- **requirements.txt**: Python dependencies
- **Dockerfile**: Container configuration
- **.env.example**: Environment variables template

## Performance Notes

- First request may be slower due to model loading
- Model is cached in memory after first load
- Use GPU-enabled deployment for better performance
- Consider using larger models for better quality