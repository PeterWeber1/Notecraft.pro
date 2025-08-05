#!/usr/bin/env python3
"""
Test the new PEGASUS-based humanization system
"""
import requests
import json

def test_pegasus_humanization():
    """Test the new PEGASUS-based humanization with real content"""
    
    # Test case from your screenshot - the Elijah story
    test_text = """His first few prototypes barely got off the ground. They spun wildly or crashed into walls. Friends laughed, and even his father gently suggested he focus on "something more practical." But Elijah kept going. He started learning from his mistakes, adjusting blade angles, rewriting code, and slowly—almost invisibly—improving. He learned that success didn't come from giant leaps, but from tiny, stubborn steps forward."""
    
    print("Testing PEGASUS Humanization System")
    print("=" * 60)
    print(f"Original text ({len(test_text.split())} words):")
    print(test_text)
    print()
    
    try:
        response = requests.post(
            "http://localhost:8000/humanize",
            json={
                "text": test_text,
                "tone": "neutral",
                "style": "professional"
            },
            timeout=120  # Longer timeout for model processing
        )
        
        if response.status_code == 200:
            result = response.json()
            humanized = result['humanizedText']
            
            print(f"Humanized text ({len(humanized.split())} words):")
            print(humanized)
            print()
            
            # Check if we have quality metrics
            if 'qualityMetrics' in result:
                metrics = result['qualityMetrics']
                print("Quality Metrics:")
                print(f"  Content Similarity: {metrics.get('contentSimilarity', 'N/A')}")
                print(f"  Overall Quality: {metrics.get('overallQuality', 'N/A')}")
                print(f"  Length Match: {metrics.get('lengthMatch', 'N/A')}")
                print(f"  Word Count - Original: {metrics.get('originalWordCount', 'N/A')}, Humanized: {metrics.get('humanizedWordCount', 'N/A')}")
                print(f"  Has Contractions: {metrics.get('hasContractions', 'N/A')}")
                print(f"  Has Human Patterns: {metrics.get('hasHumanPatterns', 'N/A')}")
                print(f"  Passes Validation: {metrics.get('passesValidation', 'N/A')}")
            
            # Check for processing note
            if 'note' in result:
                print(f"\nProcessing Note: {result['note']}")
            
            # Analyze results
            original_words = len(test_text.split())
            humanized_words = len(humanized.split())
            
            print(f"\nAnalysis:")
            print(f"  Original sentences: {test_text.count('.')}")
            print(f"  Humanized sentences: {humanized.count('.')}")
            print(f"  Word count preservation: {humanized_words}/{original_words} ({(humanized_words/original_words)*100:.1f}%)")
            
            # Check if content is preserved
            original_key_words = set(test_text.lower().split())
            humanized_key_words = set(humanized.lower().split())
            overlap = len(original_key_words.intersection(humanized_key_words))
            total_original = len(original_key_words)
            
            print(f"  Key word overlap: {overlap}/{total_original} ({(overlap/total_original)*100:.1f}%)")
            
            # Success criteria
            if humanized_words >= original_words * 0.8 and len(humanized) > 100:
                print("\nSUCCESS: Proper humanization achieved!")
                print("   - Content length preserved")
                print("   - Full text returned (not just one sentence)")
                return True
            else:
                print("\nFAILURE: Humanization still broken")
                print("   - Content may be truncated or destroyed")
                return False
                
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_api_health():
    """Quick health check"""
    try:
        response = requests.get("http://localhost:8000/healthz", timeout=5)
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    print("Testing PEGASUS Humanization System")
    
    # Check if API is running
    if not test_api_health():
        print("API is not running. Please start the FastAPI server first.")
        print("Run: cd api && python start.py")
        exit(1)
    
    # Test the new system
    success = test_pegasus_humanization()
    
    if success:
        print("\nPEGASUS humanization system is working correctly!")
        print("Ready for production use.")
    else:
        print("\nSystem needs further adjustments.")
        print("Check the API logs for more details.")