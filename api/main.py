import os
import functools
import torch
import re
import nltk
from typing import List
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, PegasusTokenizer, PegasusForConditionalGeneration

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

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
    """Load and cache the PEGASUS paraphraser model with error handling"""
    global _model_cache, _tokenizer_cache
    
    if _model_cache is not None and _tokenizer_cache is not None:
        return _tokenizer_cache, _model_cache
    
    try:
        # Use T5 paraphraser model for better content preservation
        repo = os.getenv("MODEL_REPO", "Vamsi/T5_Paraphrase_Paws")
        print(f"Loading T5 paraphraser model: {repo}")
        
        # Load T5 tokenizer and model
        _tokenizer_cache = AutoTokenizer.from_pretrained(
            repo,
            cache_dir="/tmp/model_cache"
        )
        
        _model_cache = AutoModelForSeq2SeqLM.from_pretrained(
            repo,
            torch_dtype=torch.float16,  # Use float16 to reduce memory
            low_cpu_mem_usage=True,
            cache_dir="/tmp/model_cache"
        )
        
        print(f"T5 paraphraser model {repo} loaded successfully")
        return _tokenizer_cache, _model_cache
        
    except Exception as e:
        print(f"Error loading T5 model: {e}")
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

def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences using NLTK"""
    try:
        sentences = nltk.sent_tokenize(text)
        return [s.strip() for s in sentences if s.strip()]
    except Exception as e:
        print(f"Error splitting sentences: {e}")
        # Fallback to simple split
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() + '.' if s.strip() and not s.strip().endswith(('.', '!', '?')) else s.strip() 
                for s in sentences if s.strip()]

def humanize_with_t5(text: str, tokenizer, model, max_length: int = 512) -> str:
    """Use T5 model to paraphrase/humanize text"""
    try:
        # T5 needs a task prefix for paraphrasing
        task_prompt = f"paraphrase: {text}"
        inputs = tokenizer(
            task_prompt,
            return_tensors="pt",
            max_length=max_length,
            truncation=True,
            padding=True
        )
        
        # Generate paraphrase
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_length=max_length,
                min_length=int(len(text.split()) * 0.8),  # At least 80% of original length
                num_beams=4,
                early_stopping=True,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1,
                length_penalty=1.0
            )
        
        # Decode the output
        humanized = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return humanized.strip()
        
    except Exception as e:
        print(f"T5 humanization error: {e}")
        return text  # Return original text if humanization fails

def sentence_by_sentence_humanization(text: str, tokenizer, model, tone: str = "neutral", style: str = "professional") -> str:
    """Humanize text sentence by sentence to preserve content structure"""
    
    # Split into sentences
    sentences = split_into_sentences(text)
    print(f"Processing {len(sentences)} sentences")
    
    humanized_sentences = []
    
    for i, sentence in enumerate(sentences):
        if len(sentence.strip()) < 10:  # Skip very short sentences
            humanized_sentences.append(sentence)
            continue
            
        print(f"Humanizing sentence {i+1}: {sentence[:50]}...")
        
        # Humanize individual sentence
        humanized = humanize_with_t5(sentence, tokenizer, model)
        
        # Quality check: ensure the humanized sentence makes sense
        if len(humanized.split()) < len(sentence.split()) * 0.5:
            # If humanized sentence is too short, use original
            print(f"Warning: Humanized sentence too short, using original")
            humanized_sentences.append(sentence)
        elif len(humanized.split()) > len(sentence.split()) * 2:
            # If humanized sentence is too long, use original
            print(f"Warning: Humanized sentence too long, using original")
            humanized_sentences.append(sentence)
        else:
            humanized_sentences.append(humanized)
    
    # Reconstruct the text maintaining paragraph structure
    result = ' '.join(humanized_sentences)
    
    # Apply light style adjustments based on tone and style
    result = apply_style_adjustments(result, tone, style)
    
    return result

def apply_style_adjustments(text: str, tone: str, style: str) -> str:
    """Apply light style adjustments without destroying content"""
    
    # Light contractions for casual tone
    if tone == "friendly" or style == "casual":
        text = re.sub(r'\bdo not\b', "don't", text)
        text = re.sub(r'\bcannot\b', "can't", text)
        text = re.sub(r'\bwill not\b', "won't", text)
        text = re.sub(r'\bit is\b', "it's", text)
        text = re.sub(r'\bthat is\b', "that's", text)
    
    # Professional adjustments
    if style == "professional":
        text = re.sub(r'\bgonna\b', "going to", text)
        text = re.sub(r'\bwanna\b', "want to", text)
        
    return text

def advanced_humanization_pipeline(text: str, tone: str = "neutral", style: str = "professional", preserve_length: bool = True) -> str:
    """Advanced humanization pipeline for StealthWriter-level quality"""
    import re
    import random
    
    result = text
    original_word_count = len(text.split())
    
    # 1. Strategic contractions (context-aware) - length neutral transformations
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
    
    # 4. Sentence structure variation (length-aware)
    if preserve_length:
        # Only do length-neutral sentence restructuring
        sentences = result.split('. ')
        for i in range(len(sentences)):
            # Internal sentence restructuring without changing length
            words = sentences[i].split()
            if len(words) > 6 and random.random() < 0.3:
                # Reorder clauses without adding/removing words
                if ', ' in sentences[i] and not sentences[i].lower().startswith(('however', 'therefore', 'additionally')):
                    parts = sentences[i].split(', ', 1)
                    if len(parts) == 2 and len(parts[1].split()) > 3:
                        sentences[i] = f"{parts[1].capitalize()}, {parts[0].lower()}"
        result = '. '.join(sentences)
    else:
        # Original sentence combination logic
        sentences = result.split('. ')
        for i in range(len(sentences) - 1):
            if len(sentences[i].split()) < 6 and len(sentences[i+1].split()) < 6:
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
    
    # 8. Light length balancing (NO aggressive truncation)
    if preserve_length:
        current_word_count = len(result.split())
        original_word_count = len(text.split())
        
        # Only make very light adjustments, never destroy content
        if current_word_count > original_word_count * 1.2:  # Only if 20% longer
            # Remove only obvious filler words, and only a few
            filler_words = ['really', 'very', 'quite', 'actually', 'basically']
            words = result.split()
            max_removals = min(3, current_word_count - original_word_count)  # Max 3 words
            
            for filler in filler_words:
                if max_removals <= 0:
                    break
                if filler in words:
                    words.remove(filler)
                    max_removals -= 1
            
            result = ' '.join(words)
        
        # If much shorter, add a few light qualifiers
        elif current_word_count < original_word_count * 0.8:  # Only if 20% shorter
            words = result.split()
            additions = ['also', 'really', 'actually']
            max_additions = min(2, original_word_count - current_word_count)  # Max 2 words
            
            for addition in additions[:max_additions]:
                # Insert near the middle of the text
                insert_pos = len(words) // 2
                if insert_pos > 0:
                    words.insert(insert_pos, addition)
            
            result = ' '.join(words)
    
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
    
    # 2. Strict length check (StealthWriter-level: exact word count)
    original_length = len(original.split())
    humanized_length = len(humanized.split())
    
    # For StealthWriter-level quality, lengths should be exactly the same
    length_match = original_length == humanized_length
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
    
    # 5. Overall quality score (enhanced for StealthWriter-level requirements)
    quality_score = (
        similarity_score * 0.35 +  # 35% content preservation
        (1.0 if length_match else length_ratio * 0.5) * 0.25 +  # 25% exact length match (StealthWriter requirement)
        (1.0 if has_contractions else 0.0) * 0.2 +  # 20% natural language
        (1.0 if has_variety else 0.5) * 0.1 +       # 10% vocabulary variety  
        (1.0 if has_human_patterns else 0.0) * 0.1  # 10% human-like patterns
    )
    
    # StealthWriter-level validation requires exact length match
    stealthwriter_validation = (
        similarity_score >= min_similarity and 
        quality_score >= 0.7 and 
        length_match  # Exact word count match required
    )
    
    return {
        'content_similarity': similarity_score,
        'length_ratio': length_ratio,
        'length_match': length_match,
        'original_word_count': original_length,
        'humanized_word_count': humanized_length,
        'has_contractions': has_contractions,
        'vocabulary_variety': has_variety,
        'has_human_patterns': has_human_patterns,
        'overall_quality': quality_score,
        'passes_validation': stealthwriter_validation
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
        
        # If model loading failed, use rule-based fallback
        if tokenizer is None or model is None:
            print("T5 model not available, using rule-based fallback")
            humanized_text = advanced_humanization_pipeline(
                payload.text, 
                tone=payload.tone, 
                style=payload.style
            )
            
            # Validate quality even for fallback
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
                    "lengthMatch": quality_metrics['length_match'],
                    "originalWordCount": quality_metrics['original_word_count'],
                    "humanizedWordCount": quality_metrics['humanized_word_count'],
                    "hasContractions": quality_metrics['has_contractions'],
                    "hasHumanPatterns": quality_metrics['has_human_patterns'],
                    "passesValidation": quality_metrics['passes_validation']
                },
                "note": "Using rule-based fallback (T5 not available)"
            }
        
        # Use sentence-by-sentence T5 humanization for better content preservation
        print("Using T5 sentence-by-sentence humanization")
        humanized_text = sentence_by_sentence_humanization(
            payload.text,
            tokenizer,
            model,
            tone=payload.tone,
            style=payload.style
        )
        
        # If the output is empty or too short, use fallback
        if not humanized_text.strip() or len(humanized_text.strip()) < len(payload.text.strip()) * 0.5:
            print("T5 output too short, using rule-based fallback")
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
                "lengthMatch": quality_metrics['length_match'],
                "originalWordCount": quality_metrics['original_word_count'],
                "humanizedWordCount": quality_metrics['humanized_word_count'],
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
        
        # Validate quality even for error fallback
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
                "lengthMatch": quality_metrics['length_match'],
                "originalWordCount": quality_metrics['original_word_count'],
                "humanizedWordCount": quality_metrics['humanized_word_count'],
                "hasContractions": quality_metrics['has_contractions'],
                "hasHumanPatterns": quality_metrics['has_human_patterns'],
                "passesValidation": quality_metrics['passes_validation']
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