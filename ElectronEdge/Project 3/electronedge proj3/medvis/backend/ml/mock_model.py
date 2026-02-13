import torch
import torch.nn as nn
import numpy as np
from pathlib import Path

class MockDiseaseClassifier(nn.Module):
    """Mock model for testing purposes when no trained model is available"""
    
    def __init__(self, num_classes=2):
        super(MockDiseaseClassifier, self).__init__()
        # Simple mock architecture
        self.features = nn.Sequential(
            nn.AdaptiveAvgPool2d((7, 7)),
            nn.Flatten(),
            nn.Linear(7 * 7 * 3, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x):
        # Handle different input shapes
        if len(x.shape) == 3:
            x = x.unsqueeze(0)
        
        # Ensure we have the right number of channels
        if x.shape[1] == 1:  # Grayscale
            x = x.repeat(1, 3, 1, 1)
        elif x.shape[1] > 3:  # More than RGB
            x = x[:, :3, :, :]
            
        return self.features(x)

def create_mock_model():
    """Create and save a mock model for testing"""
    model = MockDiseaseClassifier(num_classes=2)
    
    # Initialize with reasonable weights
    for module in model.modules():
        if isinstance(module, nn.Linear):
            nn.init.xavier_uniform_(module.weight)
            nn.init.zeros_(module.bias)
    
    return model

def save_mock_model(model_path="model.pth"):
    """Save a mock model for testing purposes"""
    model = create_mock_model()
    
    # Create a mock state dict that simulates a trained model
    torch.save(model.state_dict(), model_path)
    print(f"Mock model saved to {model_path}")
    
    return model_path

if __name__ == "__main__":
    # Create mock model if no real model exists
    model_path = Path("model.pth")
    if not model_path.exists() or model_path.stat().st_size < 1000:  # If file is too small (placeholder)
        save_mock_model()
        print("✅ Mock model created for testing")
    else:
        print("✅ Model file already exists")