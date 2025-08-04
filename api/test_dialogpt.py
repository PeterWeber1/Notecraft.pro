#!/usr/bin/env python3
"""
Test script for DialoGPT humanization model
"""
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

def test_dialogpt_model():
    """Test DialoGPT model loading and text generation"""
    model_repo = "microsoft/DialoGPT-small"
    print(f"Testing DialoGPT model: {model_repo}")
    print("This may take a few minutes on first run (downloading model)...")
    
    try:
        # Load tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_repo)
        print("Tokenizer loaded successfully!")
        
        # Set pad token if not set
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
            print("Set pad_token to eos_token")
        
        # Load model
        print("Loading model...")
        model = AutoModelForCausalLM.from_pretrained(
            model_repo,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        print("Model loaded successfully!")
        
        # Test humanization
        test_text = "This is an AI-generated text that sounds robotic and artificial. It needs to be more natural and human-like."
        conversation_prompt = f"Human: Please rewrite this text to sound more natural and human-like: {test_text}\nBot: Here's a more natural version:"
        
        print(f"\nTesting humanization...")
        print(f"Original text: {test_text}")
        print(f"Conversation prompt: {conversation_prompt}")
        
        # Tokenize and generate
        inputs = tokenizer.encode(conversation_prompt, return_tensors="pt", max_length=256, truncation=True)
        
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_new_tokens=128,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id,
                num_return_sequences=1
            )
        
        # Decode result
        full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"Full response: {full_response}")
        
        # Extract humanized text
        if "Bot: Here's a more natural version:" in full_response:
            humanized_text = full_response.split("Bot: Here's a more natural version:")[-1].strip()
        else:
            humanized_text = full_response.replace(conversation_prompt, "").strip()
        
        print(f"Humanized text: {humanized_text}")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("DialoGPT Model Test")
    print("=" * 60)
    
    success = test_dialogpt_model()
    
    if success:
        print("\n[SUCCESS] DialoGPT model test passed!")
    else:
        print("\n[FAILED] DialoGPT model test failed!")