#!/usr/bin/env python3
"""
Quick test for length preservation functionality
"""
import requests
import json

def test_length_preservation():
    """Test that the humanization preserves exact word count like StealthWriter"""
    
    test_cases = [
        "This is a short test sentence.",  # 6 words
        "Artificial intelligence is rapidly evolving and transforming our modern society.",  # 10 words
        "The quick brown fox jumps over the lazy dog in the forest.",  # 12 words
        "Machine learning algorithms can process vast amounts of data to identify patterns and make predictions with remarkable accuracy and speed.",  # 20 words
    ]
    
    print("Length Preservation Test - StealthWriter Quality")
    print("=" * 60)
    
    for i, text in enumerate(test_cases, 1):
        original_word_count = len(text.split())
        print(f"\nTest {i}: {original_word_count} words")
        print(f"Original: {text}")
        
        try:
            response = requests.post(
                "http://localhost:8000/humanize",
                json={
                    "text": text,
                    "tone": "neutral",
                    "style": "professional"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                humanized = result['humanizedText']
                humanized_word_count = len(humanized.split())
                
                print(f"Humanized: {humanized}")
                print(f"Word count - Original: {original_word_count}, Humanized: {humanized_word_count}")
                
                if 'qualityMetrics' in result:
                    metrics = result['qualityMetrics']
                    print(f"Length Match: {metrics.get('lengthMatch', 'N/A')}")
                    print(f"Content Similarity: {metrics.get('contentSimilarity', 'N/A')}")
                    print(f"Overall Quality: {metrics.get('overallQuality', 'N/A')}")
                    
                    if metrics.get('lengthMatch', False):
                        print("PASS - Exact length match achieved!")
                    else:
                        print("FAIL - Length mismatch")
                else:
                    print("No quality metrics returned (likely using fallback)")
                    if original_word_count == humanized_word_count:
                        print("PASS - Manual length check: exact match")
                    else:
                        print("FAIL - Manual length check: mismatch")
                
            else:
                print(f"HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    # Check if API is running
    try:
        response = requests.get("http://localhost:8000/healthz", timeout=5)
        if response.status_code != 200:
            print("API health check failed")
            exit(1)
    except:
        print("API is not running. Please start the FastAPI server first.")
        print("Run: cd api && python start.py")
        exit(1)
    
    test_length_preservation()