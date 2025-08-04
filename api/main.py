import os
import functools
import torch
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = FastAPI(title="Notecraft Pro Humanizer API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Payload(BaseModel):
    text: str
    tone: str = "neutral"
    style: str = "professional"
    length: str = "maintain"

@functools.lru_cache
def get_pipe():
    """Load and cache the Hugging Face model and tokenizer"""
    repo = os.getenv("MODEL_REPO", "google/flan-t5-small")
    print(f"Loading model: {repo}")
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(repo)
        model = AutoModelForSeq2SeqLM.from_pretrained(
            repo,
            torch_dtype=torch.float32,  # Use float32 for better compatibility
            low_cpu_mem_usage=True
        )
        print(f"Model {repo} loaded successfully")
        return tokenizer, model
    except Exception as e:
        print(f"Error loading model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

def verify(req: Request):
    """Verify API authentication"""
    api_secret = os.getenv('API_SECRET')
    if not api_secret:
        # If no API_SECRET is set, skip authentication for development
        return
    
    auth_header = req.headers.get("authorization")
    if not auth_header or auth_header != f"Bearer {api_secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.post("/humanize")
async def humanize(req: Request, payload: Payload):
    """Humanize AI-generated text using Hugging Face model"""
    verify(req)
    
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        tokenizer, model = get_pipe()
        
        # Create a comprehensive prompt for humanization
        system_prompt = f"""Rewrite the following text to make it sound more human and natural while preserving the original meaning.

Instructions:
- Make it sound conversational and authentic
- Use natural language patterns
- Maintain the {payload.tone} tone
- Keep the {payload.style} writing style
- {'Make it more concise' if payload.length == 'shorter' else 'Expand with more detail' if payload.length == 'longer' else 'Maintain similar length'}
- Remove any robotic or AI-like phrasing
- Add personality and warmth to the writing

Text to humanize: {payload.text}

Humanized version:"""
        
        # Tokenize the input
        inputs = tokenizer(
            system_prompt,
            return_tensors="pt",
            max_length=512,  # Limit input length
            truncation=True
        )
        
        # Generate humanized text
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_new_tokens=256,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode the output
        humanized_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Clean up the output - remove the prompt part if it's included
        if "Humanized version:" in humanized_text:
            humanized_text = humanized_text.split("Humanized version:")[-1].strip()
        
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
            }
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