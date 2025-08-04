#!/usr/bin/env python3
"""
Direct test of FastAPI endpoints without running a server
"""
from fastapi.testclient import TestClient
from main import app

def test_endpoints():
    """Test FastAPI endpoints using TestClient"""
    client = TestClient(app)
    
    print("Testing FastAPI endpoints...")
    
    # Test health check
    print("\n1. Testing /healthz endpoint...")
    response = client.get("/healthz")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code != 200:
        print("[FAIL] Health check failed")
        return False
    
    print("[PASS] Health check passed")
    
    # Test humanize endpoint with a simple request
    print("\n2. Testing /humanize endpoint...")
    test_data = {
        "text": "This is a simple test message that needs humanization.",
        "tone": "friendly",
        "style": "casual"
    }
    
    print("Sending request (this may take a while for model loading)...")
    response = client.post("/humanize", json=test_data)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("[PASS] Humanize endpoint worked!")
        print(f"Original: {result.get('originalText', 'N/A')}")
        print(f"Humanized: {result.get('humanizedText', 'N/A')}")
        print(f"Success: {result.get('success', False)}")
        return True
    else:
        print(f"[FAIL] Humanize endpoint failed")
        print(f"Error: {response.text}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("FastAPI Direct Test")
    print("=" * 60)
    
    try:
        success = test_endpoints()
        if success:
            print("\n[SUCCESS] All FastAPI tests passed!")
        else:
            print("\n[FAILED] Some tests failed")
    except Exception as e:
        print(f"\n[ERROR] Test failed with exception: {e}")
        import traceback
        traceback.print_exc()