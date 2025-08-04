#!/usr/bin/env python3
"""
Test script for the FastAPI humanizer API
"""
import requests
import json
import sys

def test_api():
    """Test the FastAPI humanizer endpoint"""
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/healthz")
        if response.status_code == 200:
            print("[PASS] Health check passed!")
            print(f"Response: {response.json()}")
        else:
            print(f"[FAIL] Health check failed: {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"[ERROR] Error connecting to server: {e}")
        print("Make sure the FastAPI server is running with: python main.py")
        return False
    
    # Test humanize endpoint
    print("\nTesting humanize endpoint...")
    test_text = "This is an AI-generated text that needs humanization. It might sound robotic and needs to be more natural."
    
    payload = {
        "text": test_text,
        "tone": "friendly",
        "style": "casual",
        "length": "maintain"
    }
    
    try:
        response = requests.post(
            f"{base_url}/humanize",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("[PASS] Humanization successful!")
            print(f"Original: {result['originalText']}")
            print(f"Humanized: {result['humanizedText']}")
            print(f"Word count: {result['wordCount']}")
            print(f"Character count: {result['characterCount']}")
        else:
            print(f"[FAIL] Humanization failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"[ERROR] Error during humanization: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Starting FastAPI Humanizer API Test")
    print("=" * 50)
    
    success = test_api()
    
    if success:
        print("\n[SUCCESS] All tests passed! The FastAPI server is working correctly.")
    else:
        print("\n[FAILED] Tests failed. Please check the server and try again.")
        sys.exit(1)