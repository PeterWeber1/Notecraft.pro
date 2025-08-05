#!/usr/bin/env python3
"""
Debug the humanization functions directly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import (
    advanced_humanization_pipeline, 
    sentence_by_sentence_humanization,
    split_into_sentences,
    get_model
)

# Fix NLTK data
try:
    import nltk
    nltk.download('punkt_tab', quiet=True)
except:
    pass

def debug_functions():
    """Test each function separately to find the bug"""
    
    test_text = """His first few prototypes barely got off the ground. They spun wildly or crashed into walls. Friends laughed, and even his father gently suggested he focus on "something more practical." But Elijah kept going. He started learning from his mistakes, adjusting blade angles, rewriting code, and slowly—almost invisibly—improving. He learned that success didn't come from giant leaps, but from tiny, stubborn steps forward."""
    
    print("DEBUG: Humanization Functions")
    print("=" * 50)
    print(f"Original text ({len(test_text.split())} words):")
    print(test_text)
    print()
    
    # Test 1: Sentence splitting
    print("1. Testing sentence splitting:")
    sentences = split_into_sentences(test_text)
    print(f"Found {len(sentences)} sentences:")
    for i, sentence in enumerate(sentences, 1):
        print(f"  {i}. {sentence}")
    print()
    
    # Test 2: Advanced humanization pipeline (fallback)
    print("2. Testing advanced_humanization_pipeline (fallback):")
    try:
        result = advanced_humanization_pipeline(test_text, "neutral", "professional", True)
        print(f"Result ({len(result.split())} words): {result}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        print()
    
    # Test 3: Model loading
    print("3. Testing model loading:")
    tokenizer, model = get_model()
    if tokenizer is None or model is None:
        print("Model loading failed - will use fallback")
    else:
        print("Model loaded successfully")
        
        # Test 4: Sentence-by-sentence humanization
        print("4. Testing sentence_by_sentence_humanization:")
        try:
            result = sentence_by_sentence_humanization(test_text, tokenizer, model, "neutral", "professional")
            print(f"Result ({len(result.split())} words): {result}")
        except Exception as e:
            print(f"Error: {e}")
    print()

if __name__ == "__main__":
    debug_functions()