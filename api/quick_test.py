#!/usr/bin/env python3
"""
Quick test of the humanization function without the FastAPI server
"""
import os
from main import get_pipe

def test_humanization():
    """Test the humanization function directly"""
    try:
        print("Loading model...")
        tokenizer, model = get_pipe()
        print("Model loaded!")
        
        # Test text
        test_text = "This is an AI-generated text that sounds robotic and artificial. It needs to be more natural."
        print(f"\nOriginal text: {test_text}")
        
        # Simple prompt for FLAN-T5
        prompt = f"Rewrite this text to sound more natural and human-like: {test_text}"
        
        # Tokenize
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        )
        
        # Generate
        import torch
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_new_tokens=256,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Clean up
        if prompt in result:
            result = result.replace(prompt, "").strip()
            
        if not result.strip() or len(result.strip()) < 10:
            result = test_text
            
        print(f"Humanized text: {result}")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_humanization()