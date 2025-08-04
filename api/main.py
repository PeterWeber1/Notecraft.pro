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
        # Use specialized paraphraser model for StealthWriter-level quality
        repo = os.getenv("MODEL_REPO", "humarin/chatgpt_paraphraser_on_T5_base")
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

def advanced_humanization_pipeline(text: str, tone: str = "neutral", style: str = "professional") -> str:
    """Advanced humanization pipeline for StealthWriter-level quality"""
    import re
    import random
    
    result = text
    
    # 1. Strategic contractions (context-aware)
    contractions = [
        (r"\bI am\b", "I'm"),
        (r"\byou are\b", "you're"), 
        (r"\bwe are\b", "we're"),
        (r"\bthey are\b", "they're"),
        (r"\bit is\b", "it's"),
        (r"\bthat is\b", "that's"),
        (r"\bdo not\b", "don't"),
        (r"\bdoes not\b", "doesn't"),
        (r"\bwill not\b", "won't"),
        (r"\bcannot\b", "can't"),
        (r"\bshould not\b", "shouldn't"),
        (r"\bwould not\b", "wouldn't"),
    ]
    
    for formal, informal in contractions:
        # Apply contractions with 70% probability for natural variation
        if random.random() < 0.7:
            result = re.sub(formal, informal, result, flags=re.IGNORECASE)
    
    # 2. Add natural qualifiers and softeners
    qualifiers = ["perhaps", "likely", "it seems", "apparently", "generally", "typically"]
    sentences = result.split('. ')
    
    for i, sentence in enumerate(sentences):
        if len(sentence.split()) > 8 and random.random() < 0.3:  # 30% chance for longer sentences
            qualifier = random.choice(qualifiers)
            if sentence.lower().startswith(('this', 'that', 'these', 'the')):
                sentences[i] = f"{qualifier.capitalize()}, {sentence.lower()}"
    
    result = '. '.join(sentences)
    
    # 3. Vocabulary sophistication (context-aware synonyms)
    word_replacements = {
        "very": ["quite", "rather", "fairly", "extremely"],
        "good": ["excellent", "great", "solid", "effective"],
        "bad": ["poor", "problematic", "concerning", "inadequate"],
        "big": ["large", "significant", "substantial", "considerable"],
        "small": ["minor", "limited", "modest", "compact"],
        "important": ["crucial", "vital", "significant", "key"],
        "many": ["numerous", "several", "multiple", "various"],
    }
    
    for word, synonyms in word_replacements.items():
        if random.random() < 0.4:  # 40% chance to replace
            pattern = r'\b' + re.escape(word) + r'\b'
            replacement = random.choice(synonyms)
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE, count=1)
    
    # 4. Sentence structure variation
    sentences = result.split('. ')
    for i in range(len(sentences) - 1):
        if len(sentences[i].split()) < 6 and len(sentences[i+1].split()) < 6:
            # Combine short sentences occasionally
            if random.random() < 0.3:
                connector = random.choice([", and", ", but", ", so", "; however,"])
                sentences[i] = sentences[i] + connector + " " + sentences[i+1].lower()
                sentences.pop(i+1)
                break
    
    result = '. '.join(sentences)
    
    # 5. Natural flow improvements based on tone and style
    if tone == "friendly":
        result = result.replace("Additionally", "Plus")
        result = result.replace("Furthermore", "Also")
        result = result.replace("Therefore", "So")
    
    if style == "casual":
        result = result.replace("utilize", "use")
        result = result.replace("demonstrate", "show")
        result = result.replace("indicate", "suggest")
    
    # 6. Remove overly formal transitions
    formal_transitions = [
        ("In conclusion,", "Overall,"),
        ("To summarize,", "In short,"),
        ("It is important to note that", "Note that"),
        ("It should be emphasized that", ""),
        ("As previously mentioned,", "As mentioned,"),
    ]
    
    for formal, casual in formal_transitions:
        result = result.replace(formal, casual)
    
    # 7. Add subtle imperfections that humans make
    if random.random() < 0.2:  # 20% chance
        # Occasionally start sentences with "And" or "But"
        sentences = result.split('. ')
        for i in range(1, len(sentences)):
            if sentences[i].lower().startswith(('however', 'additionally', 'furthermore')):
                if random.random() < 0.5:
                    sentences[i] = re.sub(r'^(However|Additionally|Furthermore)', 
                                        random.choice(['And', 'But']), 
                                        sentences[i], flags=re.IGNORECASE)
        result = '. '.join(sentences)
    
    return result.strip()

def calculate_content_similarity(original: str, humanized: str) -> float:
    """Calculate semantic similarity to ensure content preservation"""
    import difflib
    from collections import Counter
    import re
    
    # Extract key content words (nouns, verbs, adjectives)
    def extract_key_words(text):
        # Simple keyword extraction - remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'}
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        return [w for w in words if w not in stop_words and len(w) > 2]
    
    original_words = extract_key_words(original)
    humanized_words = extract_key_words(humanized)
    
    if not original_words or not humanized_words:
        return 0.5  # Neutral score if no content words
    
    # Calculate word overlap
    original_counter = Counter(original_words)
    humanized_counter = Counter(humanized_words)
    
    common_words = sum((original_counter & humanized_counter).values())
    total_words = sum(original_counter.values())
    
    if total_words == 0:
        return 0.5
    
    overlap_ratio = common_words / total_words
    
    # Also check sequence similarity
    sequence_similarity = difflib.SequenceMatcher(None, original.lower(), humanized.lower()).ratio()
    
    # Weighted combination: 70% content overlap, 30% sequence similarity
    final_score = (overlap_ratio * 0.7) + (sequence_similarity * 0.3)
    
    return min(final_score, 1.0)

def validate_humanization_quality(original: str, humanized: str, min_similarity: float = 0.6) -> dict:
    """Validate that humanization meets StealthWriter-level quality standards"""
    
    # 1. Content preservation check
    similarity_score = calculate_content_similarity(original, humanized)
    
    # 2. Length check (shouldn't be too different)
    original_length = len(original.split())
    humanized_length = len(humanized.split())
    length_ratio = min(original_length, humanized_length) / max(original_length, humanized_length) if max(original_length, humanized_length) > 0 else 0
    
    # 3. Structural improvements check
    has_contractions = "'" in humanized and "'m" in humanized or "'re" in humanized or "'ve" in humanized
    has_variety = len(set(humanized.split())) / len(humanized.split()) > 0.7 if humanized.split() else False
    
    # 4. Human-like patterns
    human_patterns = [
        'perhaps', 'likely', 'it seems', 'apparently', 'generally', 'typically',
        'quite', 'rather', 'fairly', 'really', 'actually', 'basically'
    ]
    has_human_patterns = any(pattern in humanized.lower() for pattern in human_patterns)
    
    # 5. Overall quality score
    quality_score = (
        similarity_score * 0.4 +  # 40% content preservation
        length_ratio * 0.2 +      # 20% appropriate length
        (1.0 if has_contractions else 0.0) * 0.2 +  # 20% natural language
        (1.0 if has_variety else 0.5) * 0.1 +       # 10% vocabulary variety  
        (1.0 if has_human_patterns else 0.0) * 0.1  # 10% human-like patterns
    )
    
    return {
        'content_similarity': similarity_score,
        'length_ratio': length_ratio,
        'has_contractions': has_contractions,
        'vocabulary_variety': has_variety,
        'has_human_patterns': has_human_patterns,
        'overall_quality': quality_score,
        'passes_validation': similarity_score >= min_similarity and quality_score >= 0.7
    }

def simple_humanize_fallback(text: str) -> str:
    """Simple fallback when advanced pipeline fails"""
    return advanced_humanization_pipeline(text)

@app.post("/humanize")
async def humanize(req: Request, payload: Payload):
    """Humanize AI-generated text using Hugging Face model"""
    verify(req)
    
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        tokenizer, model = get_model()
        
        # If model loading failed, use advanced fallback
        if tokenizer is None or model is None:
            print("Model not available, using advanced fallback humanization")
            humanized_text = advanced_humanization_pipeline(
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
                "note": "Using fallback humanization (model not available)"
            }
        
        # Create specialized humanization prompt for paraphraser model
        instruction_prompt = f"paraphrase: {payload.text}"
        
        # Tokenize the input for seq2seq model
        inputs = tokenizer(
            instruction_prompt,
            return_tensors="pt",
            max_length=256,
            truncation=True,
            padding=True
        )
        
        # Generate humanized text with seq2seq model
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=len(payload.text.split()) + 20,  # Dynamic length
                min_length=len(payload.text.split()),  # Minimum length
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                num_return_sequences=1,
                repetition_penalty=1.1,
                length_penalty=1.0
            )
        
        # Decode the output
        humanized_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Apply advanced humanization pipeline for StealthWriter-level quality
        humanized_text = advanced_humanization_pipeline(
            humanized_text, 
            tone=payload.tone, 
            style=payload.style
        )
        
        # If the output is empty or too short, provide a fallback
        if not humanized_text.strip() or len(humanized_text.strip()) < 10:
            humanized_text = advanced_humanization_pipeline(payload.text, payload.tone, payload.style)
        
        # Validate quality (StealthWriter-level standards)
        quality_metrics = validate_humanization_quality(payload.text, humanized_text)
        
        # If quality is insufficient, try advanced pipeline on original text
        if not quality_metrics['passes_validation']:
            print(f"Quality insufficient (score: {quality_metrics['overall_quality']:.2f}), using advanced pipeline")
            humanized_text = advanced_humanization_pipeline(payload.text, payload.tone, payload.style)
            quality_metrics = validate_humanization_quality(payload.text, humanized_text)
        
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
            "qualityMetrics": {
                "contentSimilarity": round(quality_metrics['content_similarity'], 3),
                "overallQuality": round(quality_metrics['overall_quality'], 3),
                "hasContractions": quality_metrics['has_contractions'],
                "hasHumanPatterns": quality_metrics['has_human_patterns'],
                "passesValidation": quality_metrics['passes_validation']
            }
        }
        
    except Exception as e:
        print(f"Humanization error: {e}")
        # Use advanced fallback on any error
        humanized_text = advanced_humanization_pipeline(
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