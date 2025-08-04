import os
import re
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Notecraft Pro Humanizer API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Payload(BaseModel):
    text: str
    tone: str = "neutral"
    style: str = "professional"
    length: str = "maintain"

def verify(req: Request):
    """Verify API authentication"""
    api_secret = os.getenv('API_SECRET')
    if not api_secret:
        return
    
    auth_header = req.headers.get("authorization")
    if not auth_header or auth_header != f"Bearer {api_secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")

def humanize_text(text: str, tone: str = "neutral", style: str = "professional") -> str:
    """Humanize text using rule-based approach"""
    
    # Basic contractions
    contractions = {
        r'\bI am\b': "I'm",
        r'\byou are\b': "you're",
        r'\bwe are\b': "we're",
        r'\bthey are\b': "they're",
        r'\bit is\b': "it's",
        r'\bthat is\b': "that's",
        r'\bthis is\b': "this's",
        r'\bthere is\b': "there's",
        r'\bhere is\b': "here's",
        r'\bI will\b': "I'll",
        r'\byou will\b': "you'll",
        r'\bwe will\b': "we'll",
        r'\bthey will\b': "they'll",
        r'\bit will\b': "it'll",
        r'\bthat will\b': "that'll",
        r'\bI would\b': "I'd",
        r'\byou would\b': "you'd",
        r'\bwe would\b': "we'd",
        r'\bthey would\b': "they'd",
        r'\bit would\b': "it'd",
        r'\bthat would\b': "that'd",
        r'\bI have\b': "I've",
        r'\byou have\b': "you've",
        r'\bwe have\b': "we've",
        r'\bthey have\b': "they've",
        r'\bit has\b': "it's",
        r'\bthat has\b': "that's",
    }
    
    result = text
    
    # Apply contractions
    for pattern, replacement in contractions.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Add natural language patterns based on tone
    if tone == "casual":
        # Make it more casual
        result = re.sub(r'\bvery\b', 'really', result, flags=re.IGNORECASE)
        result = re.sub(r'\bimportant\b', 'big', result, flags=re.IGNORECASE)
        result = re.sub(r'\bexcellent\b', 'awesome', result, flags=re.IGNORECASE)
        result = re.sub(r'\bterrible\b', 'awful', result, flags=re.IGNORECASE)
    
    elif tone == "professional":
        # Keep it professional but natural
        result = re.sub(r'\bawesome\b', 'excellent', result, flags=re.IGNORECASE)
        result = re.sub(r'\bawful\b', 'poor', result, flags=re.IGNORECASE)
    
    # Add conversational elements
    if style == "conversational":
        # Add some conversational starters
        if not result.startswith(('I', 'You', 'We', 'They', 'It', 'This', 'That')):
            result = f"Well, {result.lower()}"
    
    # Fix common AI-generated patterns
    result = re.sub(r'\bIn conclusion\b', 'So', result, flags=re.IGNORECASE)
    result = re.sub(r'\bFurthermore\b', 'Also', result, flags=re.IGNORECASE)
    result = re.sub(r'\bMoreover\b', 'Plus', result, flags=re.IGNORECASE)
    result = re.sub(r'\bAdditionally\b', 'Also', result, flags=re.IGNORECASE)
    result = re.sub(r'\bIt is important to note\b', 'Keep in mind', result, flags=re.IGNORECASE)
    
    # Add natural pauses and flow
    result = re.sub(r'\.(?=\s*[A-Z])', '. ', result)
    
    return result

@app.post("/humanize")
async def humanize(req: Request, payload: Payload):
    """Humanize AI-generated text using rule-based approach"""
    verify(req)
    
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        humanized_text = humanize_text(
            payload.text, 
            tone=payload.tone, 
            style=payload.style
        )
        
        return {
            "success": True,
            "originalText": payload.text,
            "humanizedText": humanized_text,
            "wordCount": len(humanized_text.split()),
            "characterCount": len(humanized_text),
            "settings": {
                "tone": payload.tone,
                "style": payload.style,
                "length": payload.length
            },
            "method": "rule-based"
        }
        
    except Exception as e:
        print(f"Humanization error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to humanize text: {str(e)}"
        )

@app.get("/healthz")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "message": "Notecraft Pro Humanizer API is running"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Notecraft Pro Humanizer API",
        "version": "1.0.0",
        "endpoints": {
            "humanize": "/humanize",
            "health": "/healthz"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 