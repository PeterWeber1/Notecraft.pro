#!/usr/bin/env python3
"""
Quick test of humanization endpoint with timeout
"""
import requests
import json

def test_humanize_quick():
    """Quick test of humanization endpoint"""
    try:
        response = requests.post(
            "http://localhost:8000/humanize",
            json={
                "text": "This text is very robotic and needs to sound more human.",
                "tone": "friendly",
                "style": "casual"
            },
            timeout=30  # 30 second timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Humanization successful!")
            print(f"Original: {result['originalText']}")
            print(f"Humanized: {result['humanizedText']}")
            print(f"Model note: {result.get('note', 'Using ML model')}")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - model is still loading")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("Quick Humanization Test")
    print("=" * 30)
    
    # Test health first
    try:
        health = requests.get("http://localhost:8000/healthz", timeout=5)
        if health.status_code == 200:
            print("✅ API is running")
        else:
            print("❌ API health check failed")
            exit(1)
    except:
        print("❌ API is not responding")
        exit(1)
    
    # Test humanization
    success = test_humanize_quick()
    print(f"\nResult: {'SUCCESS' if success else 'FAILED or TIMEOUT'}")