#!/usr/bin/env python3
"""
Test StealthWriter-level humanization quality
"""
import requests
import json
import time

def test_stealthwriter_quality():
    """Test humanization against StealthWriter-level benchmarks"""
    
    # Test cases that represent typical AI-generated content
    test_cases = [
        {
            "name": "Academic AI Text",
            "text": "Artificial intelligence is a rapidly evolving field that has the potential to revolutionize many aspects of human society. The implementation of AI systems requires careful consideration of ethical implications and potential societal impacts. Furthermore, it is important to note that the development of AI must be approached with appropriate caution and regulatory oversight.",
            "expected_improvements": ["contractions", "natural_flow", "vocabulary_variety"]
        },
        {
            "name": "Business AI Text", 
            "text": "The company has implemented a comprehensive strategy to optimize operational efficiency and maximize return on investment. This approach involves leveraging advanced technologies and streamlining business processes. Additionally, the organization is committed to maintaining high standards of quality and customer satisfaction.",
            "expected_improvements": ["casual_language", "human_patterns", "sentence_variety"]
        },
        {
            "name": "Technical AI Text",
            "text": "The software application utilizes machine learning algorithms to process large datasets and generate predictive analytics. The system architecture is designed to handle scalable workloads and ensure optimal performance. The implementation includes robust error handling and comprehensive logging capabilities.",
            "expected_improvements": ["simplification", "readability", "natural_transitions"]
        },
        {
            "name": "Marketing AI Text",
            "text": "Our product offers numerous benefits and advantages that will significantly enhance your experience. The innovative features and cutting-edge technology provide exceptional value and outstanding results. We are confident that you will be extremely satisfied with the superior quality and performance.",
            "expected_improvements": ["authenticity", "personality", "conversational_tone"]
        }
    ]
    
    print("🎯 StealthWriter Quality Benchmark Test")
    print("=" * 60)
    
    total_score = 0
    passed_tests = 0
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {case['name']}")
        print(f"Original: {case['text'][:100]}...")
        
        try:
            # Test the humanization endpoint
            response = requests.post(
                "http://localhost:8000/humanize",
                json={
                    "text": case['text'],
                    "tone": "friendly",
                    "style": "professional"
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"✅ Success!")
                print(f"Humanized: {result['humanizedText'][:100]}...")
                
                # Check quality metrics
                metrics = result.get('qualityMetrics', {})
                print(f"\n📊 Quality Metrics:")
                print(f"  • Content Similarity: {metrics.get('contentSimilarity', 'N/A')}")
                print(f"  • Overall Quality: {metrics.get('overallQuality', 'N/A')}")
                print(f"  • Has Contractions: {metrics.get('hasContractions', 'N/A')}")
                print(f"  • Has Human Patterns: {metrics.get('hasHumanPatterns', 'N/A')}")  
                print(f"  • Passes Validation: {metrics.get('passesValidation', 'N/A')}")
                
                # Score this test
                quality_score = metrics.get('overallQuality', 0)
                content_score = metrics.get('contentSimilarity', 0)
                
                test_score = (quality_score * 0.6) + (content_score * 0.4)
                total_score += test_score
                
                if test_score >= 0.7:  # 70% threshold for StealthWriter quality
                    passed_tests += 1
                    print(f"🎉 PASSED (Score: {test_score:.2f})")
                else:
                    print(f"❌ FAILED (Score: {test_score:.2f})")
                
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.Timeout:
            print("⏰ Request timed out")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Final assessment
    avg_score = total_score / len(test_cases) if test_cases else 0
    pass_rate = (passed_tests / len(test_cases)) * 100 if test_cases else 0
    
    print(f"\n🏆 FINAL RESULTS")
    print("=" * 60)
    print(f"Tests Passed: {passed_tests}/{len(test_cases)} ({pass_rate:.1f}%)")
    print(f"Average Quality Score: {avg_score:.2f}")
    
    # StealthWriter-level assessment
    if avg_score >= 0.8 and pass_rate >= 75:
        print("🎯 EXCELLENT: StealthWriter-level quality achieved!")
        return "excellent"
    elif avg_score >= 0.7 and pass_rate >= 60:
        print("✅ GOOD: High-quality humanization, approaching StealthWriter level")
        return "good"
    elif avg_score >= 0.6 and pass_rate >= 40:
        print("⚠️  FAIR: Decent humanization, needs improvement") 
        return "fair"
    else:
        print("❌ POOR: Significant improvements needed")
        return "poor"

def test_api_health():
    """Quick health check"""
    try:
        response = requests.get("http://localhost:8000/healthz", timeout=5)
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    print("🚀 Starting StealthWriter Quality Assessment")
    
    # Check if API is running
    if not test_api_health():
        print("❌ API is not running. Please start the FastAPI server first.")
        print("Run: cd api && python start.py")
        exit(1)
    
    # Run quality tests
    result = test_stealthwriter_quality()
    
    print(f"\n📋 Next Steps:")
    if result == "excellent":
        print("✅ Ready for production deployment!")
    elif result == "good":
        print("🔧 Consider minor optimizations for perfect StealthWriter quality")
    else:
        print("🛠️  Review model configuration and pipeline parameters")
    
    print(f"🔗 Full implementation ready for deployment to Render")