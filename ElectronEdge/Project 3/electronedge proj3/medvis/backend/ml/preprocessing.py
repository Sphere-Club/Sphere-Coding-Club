import torch
import torchvision.transforms as transforms
from PIL import Image
import os

class ImagePreprocessor:
    def __init__(self, image_size=(224, 224)):
        self.image_size = image_size
        self.transform = transforms.Compose([
            transforms.Resize(image_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
    
    def preprocess_image(self, image_path):
        """Load and preprocess single image"""
        image = Image.open(image_path).convert('RGB')
        return self.transform(image).unsqueeze(0)
    
    def preprocess_dataset(self, dataset_path):
        """Preprocess entire dataset for training"""
        processed_data = []
        labels = []
        
        for disease_folder in os.listdir(dataset_path):
            disease_path = os.path.join(dataset_path, disease_folder)
            if not os.path.isdir(disease_path):
                continue
                
            label = 0 if disease_folder.lower() == 'eczema' else 1
            
            for img_file in os.listdir(disease_path):
                if img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    img_path = os.path.join(disease_path, img_file)
                    try:
                        processed_img = self.preprocess_image(img_path)
                        processed_data.append(processed_img.squeeze(0))
                        labels.append(label)
                    except Exception as e:
                        print(f"Error processing {img_path}: {e}")
        
        return torch.stack(processed_data), torch.tensor(labels)

def create_data_loaders(dataset_path, batch_size=32, train_split=0.8):
    """Create train and validation data loaders"""
    preprocessor = ImagePreprocessor()
    data, labels = preprocessor.preprocess_dataset(dataset_path)
    
    # Split data
    dataset_size = len(data)
    train_size = int(train_split * dataset_size)
    
    indices = torch.randperm(dataset_size)
    train_indices = indices[:train_size]
    val_indices = indices[train_size:]
    
    train_data = data[train_indices]
    train_labels = labels[train_indices]
    val_data = data[val_indices]
    val_labels = labels[val_indices]
    
    # Create datasets
    train_dataset = torch.utils.data.TensorDataset(train_data, train_labels)
    val_dataset = torch.utils.data.TensorDataset(val_data, val_labels)
    
    # Create data loaders
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, val_loader