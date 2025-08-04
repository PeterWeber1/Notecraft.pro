#!/usr/bin/env python3
"""
Direct test of the humanization functions
"""
from main import advanced_humanization_pipeline, validate_humanization_quality

def test_direct():
    """Test the functions directly"""
    
    text = "This is a test sentence with exactly ten words."
    print(f"Original: {text} ({len(text.split())} words)")
    
    # Test the pipeline directly
    humanized = advanced_humanization_pipeline(text, preserve_length=True)
    print(f"Humanized: {humanized} ({len(humanized.split())} words)")
    
    # Test quality validation
    quality = validate_humanization_quality(text, humanized)
    print(f"Quality metrics: {quality}")

if __name__ == "__main__":
    test_direct()