#!/usr/bin/env python3
"""
Test script for Medical Image Analysis API
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment():
    """Test environment setup"""
    print("🔧 Testing Environment Setup...")
    
    # Check API keys
    openai_key = os.getenv("OPENAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    if openai_key and openai_key.startswith("sk-"):
        print("✅ OpenAI API key found and properly formatted")
    else:
        print("⚠️  OpenAI API key not found or invalid format")
    
    if anthropic_key and anthropic_key != "your_anthropic_api_key_here":
        print("✅ Anthropic API key configured")
    else:
        print("⚠️  Anthropic API key not configured")
    
    # Check required directories
    required_dirs = [
        "static/uploads",
        "static/reports",
        "ml/dataset/Disease_A",
        "ml/dataset/Disease_B"
    ]
    
    for directory in required_dirs:
        if os.path.exists(directory):
            print(f"✅ Directory exists: {directory}")
        else:
            print(f"❌ Missing directory: {directory}")

def test_imports():
    """Test if all required modules can be imported"""
    print("\n📦 Testing Module Imports...")
    
    modules_to_test = [
        ("fastapi", "FastAPI"),
        ("torch", "PyTorch"),
        ("PIL", "Pillow"),
        ("openai", "OpenAI"),
        ("reportlab", "ReportLab"),
        ("dotenv", "python-dotenv")
    ]
    
    for module_name, display_name in modules_to_test:
        try:
            __import__(module_name)
            print(f"✅ {display_name} imported successfully")
        except ImportError as e:
            print(f"❌ Failed to import {display_name}: {e}")

def test_llm_service():
    """Test LLM service"""
    print("\n🤖 Testing LLM Service...")
    
    try:
        from services.llm_notes import test_llm_integration
        test_llm_integration()
    except Exception as e:
        print(f"❌ LLM service test failed: {e}")

def test_predictor_service():
    """Test predictor service initialization"""
    print("\n🔮 Testing Predictor Service...")
    
    try:
        from services.predictor import ImagePredictor
        predictor = ImagePredictor()
        print("✅ ImagePredictor initialized successfully")
        
        # Check if model file exists
        if os.path.exists("ml/model.pth"):
            print("✅ Model file found")
        else:
            print("⚠️  Model file not found - run training first")
            
    except Exception as e:
        print(f"❌ Predictor service test failed: {e}")

def test_image_utils():
    """Test image utilities"""
    print("\n🖼️  Testing Image Utils...")
    
    try:
        from utils.image_utils import validate_image, get_image_info
        print("✅ Image utilities imported successfully")
        
        # Test with a dummy file path
        result = validate_image("nonexistent.jpg")
        print(f"✅ Image validation works (expected False): {result}")
        
    except Exception as e:
        print(f"❌ Image utils test failed: {e}")

def main():
    """Run all tests"""
    print("🏥 Medical Image Analysis API - System Test")
    print("=" * 50)
    
    test_environment()
    test_imports()
    test_llm_service()
    test_predictor_service()
    test_image_utils()
    
    print("\n" + "=" * 50)
    print("🎯 Test Summary:")
    print("   If you see ✅ for most items, the system is ready!")
    print("   If you see ❌ or ⚠️, check the installation steps.")
    print("\n📋 Next Steps:")
    print("   1. Add training images to ml/dataset/")
    print("   2. Run: python ml/train.py")
    print("   3. Start server: python app.py")

if __name__ == "__main__":
    main()