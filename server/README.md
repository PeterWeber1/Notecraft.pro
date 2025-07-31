# Notecraft Pro Backend API

This is the backend API for Notecraft Pro, providing AI humanization, grammar checking, and AI detection services.

## Features

- **Text Humanization**: Transform AI-generated text into natural, human-like writing
- **Grammar Checking**: Check text for grammar and style issues using LanguageTool
- **AI Detection**: Analyze text to determine likelihood of AI generation
- **Advanced Options**: Customize tone, style, target audience, and creativity levels

## API Endpoints

### POST /api/humanize
Basic text humanization with minimal options.

**Request Body:**
```json
{
  "text": "Your AI-generated text here",
  "tone": "neutral",
  "style": "professional",
  "length": "maintain"
}
```

**Response:**
```json
{
  "success": true,
  "originalText": "Original text",
  "humanizedText": "Humanized version",
  "wordCount": 150,
  "characterCount": 750
}
```

### POST /api/humanize-advanced
Advanced humanization with full customization options.

**Request Body:**
```json
{
  "text": "Your AI-generated text here",
  "tone": "friendly",
  "style": "casual",
  "targetAudience": "general",
  "length": "maintain",
  "creativity": "balanced"
}
```

### POST /api/grammar
Check text for grammar and style issues.

**Request Body:**
```json
{
  "text": "Text to check for grammar issues"
}
```

### POST /api/detect
Analyze text for AI generation likelihood.

**Request Body:**
```json
{
  "text": "Text to analyze"
}
```

**Response:**
```json
{
  "success": true,
  "aiScore": 25,
  "humanScore": 75,
  "assessment": "Likely Human"
}
```

### GET /api/health
Health check endpoint.

## Environment Variables

Create a `.env` file in the server directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=production

# LanguageTool API (optional - for grammar checking)
LANGUAGETOOL_API_KEY=your_languagetool_api_key_here

# CORS Configuration
CORS_ORIGIN=https://notecraft.pro
```

## Installation & Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Deployment on Render

1. Connect your GitHub repository to Render
2. Set up a new Web Service
3. Configure environment variables in Render dashboard
4. Set build command: `npm install`
5. Set start command: `node server/server.js`

## Frontend Integration

Update your React app's environment variables:

```env
REACT_APP_API_URL=https://your-render-app.onrender.com
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Rate Limiting & Security

- Consider implementing rate limiting for production
- Add authentication for premium features
- Validate input text length and content
- Monitor API usage and costs

## Dependencies

- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `openai`: OpenAI API client
- `axios`: HTTP client for external APIs 