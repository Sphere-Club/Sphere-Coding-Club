#!/usr/bin/env python3
"""
Test script to verify the ML functionality
"""

import requests
import os
from PIL import Image, ImageDraw
import numpy as np

def create_test_images():
    """Create test images for different skin conditions"""
    
    # Create test directory
    os.makedirs("test_images", exist_ok=True)
    
    # Create a reddish image (simulating eczema)
    eczema_img = Image.new('RGB', (224, 224), color=(200, 100, 100))
    draw = ImageDraw.Draw(eczema_img)
    # Add some texture/patches
    for i in range(10):
        x, y = np.random.randint(0, 200, 2)
        draw.ellipse([x, y, x+20, y+20], fill=(220, 80, 80))
    eczema_img.save("test_images/test_eczema.jpg")
    
    # Create a circular image (simulating ringworm)
    ringworm_img = Image.new('RGB', (224, 224), color=(150, 120, 100))
    draw = ImageDraw.Draw(ringworm_img)
    # Draw a ring shape
    draw.ellipse([50, 50, 170, 170], outline=(100, 50, 50), width=15)
    draw.ellipse([70, 70, 150, 150], fill=(180, 140, 120))
    ringworm_img.save("test_images/test_ringworm.jpg")
    
    print("✅ Test images created")
    return ["test_images/test_eczema.jpg", "test_images/test_ringworm.jpg"]

def test_ml_endpoint(image_path, expected_condition=None):
    """Test the ML prediction endpoint"""
    
    print(f"\n🧪 Testing ML analysis for: {image_path}")
    
    # Prepare the file for upload
    with open(image_path, 'rb') as f:
        files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
        data = {'location': 'Test City'}
        
        try:
            response = requests.post('http://localhost:8000/predict', files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"✅ Prediction successful!")
                print(f"   Condition: {result['condition']}")
                print(f"   Confidence: {result['confidence']}")
                print(f"   Model Type: {result.get('model_type', 'unknown')}")
                
                if 'probabilities' in result:
                    print(f"   Probabilities:")
                    for disease, prob in result['probabilities'].items():
                        print(f"     {disease}: {prob:.2%}")
                
                if expected_condition and expected_condition.lower() in result['condition'].lower():
                    print(f"✅ Correct prediction for {expected_condition}")
                else:
                    print(f"⚠️ Expected {expected_condition}, got {result['condition']}")
                    
                return True
                
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Test failed: {e}")
            return False

def main():
    print("🧪 Testing ML functionality...")
    
    # Check if server is running
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code != 200:
            print("❌ Server not running. Please start the server first.")
            return
    except:
        print("❌ Cannot connect to server. Please start the server first.")
        return
    
    # Create test images
    test_images = create_test_images()
    
    # Test each image
    success_count = 0
    
    # Test eczema image
    if test_ml_endpoint(test_images[0], "Eczema"):
        success_count += 1
    
    # Test ringworm image  
    if test_ml_endpoint(test_images[1], "Ringworm"):
        success_count += 1
    
    print(f"\n📊 Test Results: {success_count}/2 tests passed")
    
    if success_count == 2:
        print("🎉 All ML tests passed!")
    else:
        print("⚠️ Some tests failed. Check the implementation.")

if __name__ == "__main__":
    main()