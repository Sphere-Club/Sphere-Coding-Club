import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import cv2
import os

class SkinDiseaseClassifier(nn.Module):
    """Real CNN model for skin disease classification - Eczema vs Basal Cell Carcinoma"""
    
    def __init__(self, num_classes=2, pretrained=True):
        super(SkinDiseaseClassifier, self).__init__()
        
        # Use ResNet18 as backbone
        self.backbone = models.resnet18(pretrained=pretrained)
        
        # Replace the final layer for our classes
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x):
        return self.backbone(x)

class ImageAnalyzer:
    """Advanced image analysis for Eczema vs Basal Cell Carcinoma"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Image preprocessing pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        # Load or create model
        self.model = self._load_model()
        
    def _load_model(self):
        """Load trained model or create a new one"""
        model = SkinDiseaseClassifier(num_classes=2)
        model_path = "ml/model.pth"
        
        if os.path.exists(model_path):
            try:
                # Try to load existing trained model
                state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
                model.load_state_dict(state_dict)
                print("✅ Loaded trained Eczema vs Basal Cell model")
            except Exception as e:
                print(f"⚠️ Could not load trained model: {e}")
                print("🔄 Using pretrained ResNet18 with random classification layer")
        else:
            print("🔄 No trained model found, using pretrained ResNet18")
            
        model.to(self.device)
        model.eval()
        return model
    
    def analyze_image_features(self, image_path):
        """Analyze image features for skin condition detection"""
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
            
        # Convert to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Feature analysis
        features = {}
        
        # 1. Color analysis
        features.update(self._analyze_colors(image_rgb))
        
        # 2. Texture analysis
        features.update(self._analyze_texture(image_rgb))
        
        # 3. Shape analysis
        features.update(self._analyze_shapes(image_rgb))
        
        return features
    
    def _analyze_colors(self, image):
        """Analyze color characteristics"""
        # Convert to different color spaces
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Calculate color statistics
        red_mean = np.mean(image[:,:,0])
        red_std = np.std(image[:,:,0])
        
        # Redness ratio (important for inflammation)
        redness_ratio = red_mean / (np.mean(image[:,:,1]) + np.mean(image[:,:,2]) + 1e-6)
        
        # Saturation analysis
        saturation_mean = np.mean(hsv[:,:,1])
        
        return {
            'red_mean': red_mean,
            'red_std': red_std,
            'redness_ratio': redness_ratio,
            'saturation_mean': saturation_mean
        }
    
    def _analyze_texture(self, image):
        """Analyze texture patterns"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Calculate texture features using Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Edge density
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        return {
            'texture_variance': laplacian_var,
            'edge_density': edge_density
        }
    
    def _analyze_shapes(self, image):
        """Analyze shape characteristics"""
        # Convert to grayscale and threshold
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Get largest contour
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Calculate circularity (important for ringworm detection)
            area = cv2.contourArea(largest_contour)
            perimeter = cv2.arcLength(largest_contour, True)
            
            if perimeter > 0:
                circularity = 4 * np.pi * area / (perimeter * perimeter)
            else:
                circularity = 0
                
            return {
                'circularity': circularity,
                'contour_area': area
            }
        
        return {'circularity': 0, 'contour_area': 0}
    
    def predict_with_features(self, image_path):
        """Make prediction using both CNN and feature analysis"""
        # 1. CNN prediction
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            cnn_probs = probabilities.cpu().numpy()[0]
        
        # 2. Feature-based analysis
        features = self.analyze_image_features(image_path)
        feature_probs = self._classify_by_features(features)
        
        # 3. Combine predictions (weighted average)
        combined_probs = 0.7 * cnn_probs + 0.3 * feature_probs
        
        # Get final prediction
        predicted_class = np.argmax(combined_probs)
        confidence = np.max(combined_probs)
        
        return {
            'predicted_class': predicted_class,
            'confidence': float(confidence),
            'probabilities': {
                'Eczema': float(combined_probs[0]),
                'Ringworm': float(combined_probs[1])
            },
            'features': features,
            'cnn_probs': cnn_probs.tolist(),
            'feature_probs': feature_probs.tolist()
        }
    
    def _classify_by_features(self, features):
        """Rule-based classification using extracted features"""
        # Initialize probabilities
        eczema_score = 0.5
        ringworm_score = 0.5
        
        # Redness analysis (eczema tends to be redder)
        if features['redness_ratio'] > 1.2:
            eczema_score += 0.2
        
        # Circularity analysis (ringworm tends to be more circular)
        if features['circularity'] > 0.7:
            ringworm_score += 0.3
        elif features['circularity'] < 0.3:
            eczema_score += 0.2
        
        # Texture analysis (eczema tends to have more texture variation)
        if features['texture_variance'] > 500:
            eczema_score += 0.1
        
        # Edge density (ringworm often has clearer borders)
        if features['edge_density'] > 0.1:
            ringworm_score += 0.1
        
        # Normalize scores
        total = eczema_score + ringworm_score
        return np.array([eczema_score / total, ringworm_score / total])

# Global analyzer instance
image_analyzer = ImageAnalyzer()