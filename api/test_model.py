#!/usr/bin/env python3
"""
Test script to check model loading and basic functionality
"""
import os
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

def test_model_loading():
    """Test loading the Hugging Face model"""
    model_repo = "google/flan-t5-small"
    print(f"Testing model loading: {model_repo}")
    print("This may take a few minutes on first run (downloading model)...")
    
    try:
        # Load tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_repo)
        print("Tokenizer loaded successfully!")
        
        # Load model
        print("Loading model...")
        model = AutoModelForSeq2SeqLM.from_pretrained(
            model_repo,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        print("Model loaded successfully!")
        
        # Test simple text generation
        print("\nTesting text generation...")
        test_text = "Rewrite this to sound more human: This is robotic AI text."
        
        inputs = tokenizer(test_text, return_tensors="pt", max_length=256, truncation=True)
        
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_new_tokens=50,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"Input: {test_text}")
        print(f"Output: {result}")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Model Loading Test")
    print("=" * 60)
    
    success = test_model_loading()
    
    if success:
        print("\n[SUCCESS] Model loading and generation test passed!")
    else:
        print("\n[FAILED] Model loading test failed!")