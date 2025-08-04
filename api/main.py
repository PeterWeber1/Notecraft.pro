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

# Global variables to cache model
_model_cache = None
_tokenizer_cache = None

def get_model():
    """Load and cache the Hugging Face model and tokenizer with error handling"""
    global _model_cache, _tokenizer_cache
    
    if _model_cache is not None and _tokenizer_cache is not None:
        return _tokenizer_cache, _model_cache
    
    try:
        # Use a smaller model for Vercel deployment
        repo = os.getenv("MODEL_REPO", "google/flan-t5-base")
        print(f"Loading model: {repo}")
        
        # Load tokenizer first
        _tokenizer_cache = AutoTokenizer.from_pretrained(
            repo,
            cache_dir="/tmp/model_cache"  # Use temp directory for Vercel
        )
        
        # Load model with reduced precision and memory optimizations
        _model_cache = AutoModelForSeq2SeqLM.from_pretrained(
            repo,
            torch_dtype=torch.float16,  # Use float16 to reduce memory
            low_cpu_mem_usage=True,
            cache_dir="/tmp/model_cache"
        )
        
        print(f"Model {repo} loaded successfully")
        return _tokenizer_cache, _model_cache
        
    except Exception as e:
        print(f"Error loading model: {e}")
        # Return None to indicate model loading failed
        return None, None

def verify(req: Request):
    """Verify API authentication"""
    api_secret = os.getenv('API_SECRET')
    if not api_secret:
        # If no API_SECRET is set, skip authentication for development
        return
    
    auth_header = req.headers.get("authorization")
    if not auth_header or auth_header != f"Bearer {api_secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")

def simple_humanize_fallback(text: str) -> str:
    """Simple fallback humanization when model is not available"""
    # Basic text improvements
    improvements = [
        ("I am", "I'm"),
        ("you are", "you're"),
        ("we are", "we're"),
        ("they are", "they're"),
        ("it is", "it's"),
        ("that is", "that's"),
        ("this is", "this's"),
        ("there is", "there's"),
        ("here is", "here's"),
        ("I will", "I'll"),
        ("you will", "you'll"),
        ("we will", "we'll"),
        ("they will", "they'll"),
        ("it will", "it'll"),
        ("that will", "that'll"),
        ("I would", "I'd"),
        ("you would", "you'd"),
        ("we would", "we'd"),
        ("they would", "they'd"),
        ("it would", "it'd"),
        ("that would", "that'd"),
        ("I have", "I've"),
        ("you have", "you've"),
        ("we have", "we've"),
        ("they have", "they've"),
        ("it has", "it's"),
        ("that has", "that's"),
    ]
    
    result = text
    for formal, informal in improvements:
        result = result.replace(f" {formal} ", f" {informal} ")
        result = result.replace(f" {formal}.", f" {informal}.")
        result = result.replace(f" {formal},", f" {informal},")
    
    return result

@app.post("/humanize")
async def humanize(req: Request, payload: Payload):
    """Humanize AI-generated text using Hugging Face model"""
    verify(req)
    
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        tokenizer, model = get_model()
        
        # If model loading failed, use fallback
        if tokenizer is None or model is None:
            print("Model not available, using fallback humanization")
            humanized_text = simple_humanize_fallback(payload.text)
            
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
                "note": "Using fallback humanization (model not available)"
            }
        
        # Create a simple, effective prompt for FLAN-T5
        system_prompt = f"Rewrite this text to sound more natural and human-like: {payload.text}"
        
        # Tokenize the input with smaller limits for Vercel
        inputs = tokenizer(
            system_prompt,
            return_tensors="pt",
            max_length=256,  # Reduced from 512
            truncation=True,
            padding=True
        )
        
        # Generate humanized text with reduced parameters
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_new_tokens=128,  # Reduced from 256
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode the output
        humanized_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Clean up the output - remove the prompt part if it's included
        if system_prompt in humanized_text:
            humanized_text = humanized_text.replace(system_prompt, "").strip()
        
        # If the output is empty or too short, provide a fallback
        if not humanized_text.strip() or len(humanized_text.strip()) < 10:
            humanized_text = simple_humanize_fallback(payload.text)
        
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
        # Use fallback on any error
        humanized_text = simple_humanize_fallback(payload.text)
        
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
            "note": f"Using fallback due to error: {str(e)}"
        }

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