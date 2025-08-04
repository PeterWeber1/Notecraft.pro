#!/usr/bin/env python3
"""
Start script for the FastAPI humanizer server
"""
import os
import uvicorn
from main import app

if __name__ == "__main__":
    # Set default environment variables for development
    if not os.getenv("MODEL_REPO"):
        os.environ["MODEL_REPO"] = "humarin/chatgpt_paraphraser_on_T5_base"
    
    print("Starting Notecraft Pro Humanizer API")
    print(f"Model: {os.getenv('MODEL_REPO', 'humarin/chatgpt_paraphraser_on_T5_base')}")
    print(f"Authentication: {'Enabled' if os.getenv('API_SECRET') else 'Disabled (Development)'}")
    print("=" * 60)
    
    # Start the server
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )