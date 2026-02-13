import torch
import torch.nn.functional as F
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from ml.train import DiseaseClassifier
from ml.mock_model import MockDiseaseClassifier
from ml.preprocessing import ImagePreprocessor
import numpy as np

class ImagePredictor:
    def __init__(self, model_path="ml/model.pth"):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.preprocessor = ImagePreprocessor()
        self.disease_names = {0: "Eczema", 1: "Ringworm"}
        self.model = None
        self.is_mock_model = False
        
        # Try to load model
        self._load_model(model_path)
    
    def _load_model(self, model_path):
        """Load model with fallback to mock model"""
        if os.path.exists(model_path):
            try:
                # Check if it's a real trained model or mock
                model_size = os.path.getsize(model_path)
                
                if model_size > 10000:  # Real model should be larger
                    # Try to load as real model first
                    try:
                        self.model = DiseaseClassifier(num_classes=2)
                        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                        print(f"✅ Trained model loaded from {model_path}")
                    except Exception as e:
                        print(f"⚠️ Failed to load as trained model: {e}")
                        self._load_mock_model(model_path)
                else:
                    self._load_mock_model(model_path)
                    
            except Exception as e:
                print(f"⚠️ Error loading model: {e}")
                self._create_fallback_model()
        else:
            print(f"⚠️ Model file {model_path} not found.")
            self._create_fallback_model()
        
        if self.model:
            self.model.to(self.device)
            self.model.eval()
    
    def _load_mock_model(self, model_path):
        """Load mock model"""
        try:
            self.model = MockDiseaseClassifier(num_classes=2)
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.is_mock_model = True
            print(f"✅ Mock model loaded from {model_path} (for testing)")
        except Exception as e:
            print(f"⚠️ Failed to load mock model: {e}")
            self._create_fallback_model()
    
    def _create_fallback_model(self):
        """Create a simple fallback model"""
        self.model = MockDiseaseClassifier(num_classes=2)
        self.is_mock_model = True
        print("✅ Using fallback mock model")
    
    def predict(self, image_path):
        """
        Predict disease from image
        Returns: dict with disease name and confidence score
        """
        try:
            # Preprocess image
            image_tensor = self.preprocessor.preprocess_image(image_path)
            image_tensor = image_tensor.to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = F.softmax(outputs, dim=1)
                confidence, predicted_class = torch.max(probabilities, 1)
                
                # If using mock model, add some randomness for realistic testing
                if self.is_mock_model:
                    # Generate semi-realistic predictions
                    np.random.seed(hash(image_path) % 2**32)  # Consistent results for same image
                    mock_probs = np.random.dirichlet([2, 2])  # Generate realistic probabilities
                    predicted_class = torch.tensor([np.argmax(mock_probs)])
                    confidence = torch.tensor([np.max(mock_probs)])
                    probabilities = torch.tensor([mock_probs])
                
                predicted_disease = self.disease_names[predicted_class.item()]
                confidence_score = confidence.item()
                
                return {
                    "disease": predicted_disease,
                    "confidence": confidence_score,
                    "probabilities": {
                        "Eczema": probabilities[0][0].item(),
                        "Ringworm": probabilities[0][1].item()
                    },
                    "model_type": "mock" if self.is_mock_model else "trained"
                }
                
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}")
    
    def batch_predict(self, image_paths):
        """Predict multiple images at once"""
        results = []
        for image_path in image_paths:
            try:
                result = self.predict(image_path)
                results.append({"image_path": image_path, "prediction": result})
            except Exception as e:
                results.append({"image_path": image_path, "error": str(e)})
        return results