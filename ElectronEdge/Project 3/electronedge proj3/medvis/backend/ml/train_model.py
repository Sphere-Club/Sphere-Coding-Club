#!/usr/bin/env python3
"""
Training script for Eczema vs Basal Cell Carcinoma classification
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms
from torchvision import models
import os
from PIL import Image
import numpy as np
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm
import json

class SkinDiseaseDataset(Dataset):
    """Custom dataset for skin disease classification"""
    
    def __init__(self, data_dir, transform=None):
        self.data_dir = data_dir
        self.transform = transform
        self.images = []
        self.labels = []
        self.class_names = ['eczema', 'basal cell']
        
        # Load images and labels
        for class_idx, class_name in enumerate(self.class_names):
            class_path = os.path.join(data_dir, class_name)
            if os.path.exists(class_path):
                for img_name in os.listdir(class_path):
                    if img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                        img_path = os.path.join(class_path, img_name)
                        self.images.append(img_path)
                        self.labels.append(class_idx)
        
        print(f"Loaded {len(self.images)} images:")
        print(f"  Eczema: {self.labels.count(0)} images")
        print(f"  Basal Cell: {self.labels.count(1)} images")
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]
        
        try:
            image = Image.open(img_path).convert('RGB')
            if self.transform:
                image = self.transform(image)
            return image, label
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            # Return a black image as fallback
            if self.transform:
                return self.transform(Image.new('RGB', (224, 224), (0, 0, 0))), label
            return Image.new('RGB', (224, 224), (0, 0, 0)), label

class SkinDiseaseClassifier(nn.Module):
    """CNN model for skin disease classification"""
    
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

def create_data_loaders(data_dir, batch_size=16, train_split=0.8):
    """Create train and validation data loaders"""
    
    # Data augmentation for training
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    # No augmentation for validation
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    # Load full dataset
    full_dataset = SkinDiseaseDataset(data_dir, transform=None)
    
    # Split indices
    dataset_size = len(full_dataset)
    indices = list(range(dataset_size))
    np.random.shuffle(indices)
    
    train_size = int(train_split * dataset_size)
    train_indices = indices[:train_size]
    val_indices = indices[train_size:]
    
    # Create separate datasets with different transforms
    train_dataset = SkinDiseaseDataset(data_dir, transform=train_transform)
    val_dataset = SkinDiseaseDataset(data_dir, transform=val_transform)
    
    # Create subset samplers
    train_sampler = torch.utils.data.SubsetRandomSampler(train_indices)
    val_sampler = torch.utils.data.SubsetRandomSampler(val_indices)
    
    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=batch_size, sampler=train_sampler)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, sampler=val_sampler)
    
    print(f"Training samples: {len(train_indices)}")
    print(f"Validation samples: {len(val_indices)}")
    
    return train_loader, val_loader

def train_model(model, train_loader, val_loader, num_epochs=20, learning_rate=0.001):
    """Train the model"""
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Training on device: {device}")
    
    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
    
    train_losses = []
    val_losses = []
    train_accuracies = []
    val_accuracies = []
    
    best_val_acc = 0.0
    best_model_state = None
    
    for epoch in range(num_epochs):
        print(f'\\nEpoch {epoch+1}/{num_epochs}')
        print('-' * 50)
        
        # Training phase
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        
        train_pbar = tqdm(train_loader, desc='Training')
        for images, labels in train_pbar:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()
            
            train_pbar.set_postfix({
                'Loss': f'{loss.item():.4f}',
                'Acc': f'{100 * train_correct / train_total:.2f}%'
            })
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            val_pbar = tqdm(val_loader, desc='Validation')
            for images, labels in val_pbar:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
                val_pbar.set_postfix({
                    'Loss': f'{loss.item():.4f}',
                    'Acc': f'{100 * val_correct / val_total:.2f}%'
                })
        
        # Calculate epoch metrics
        epoch_train_loss = train_loss / len(train_loader)
        epoch_val_loss = val_loss / len(val_loader)
        epoch_train_acc = 100 * train_correct / train_total
        epoch_val_acc = 100 * val_correct / val_total
        
        train_losses.append(epoch_train_loss)
        val_losses.append(epoch_val_loss)
        train_accuracies.append(epoch_train_acc)
        val_accuracies.append(epoch_val_acc)
        
        print(f'Train Loss: {epoch_train_loss:.4f}, Train Acc: {epoch_train_acc:.2f}%')
        print(f'Val Loss: {epoch_val_loss:.4f}, Val Acc: {epoch_val_acc:.2f}%')
        
        # Save best model
        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            best_model_state = model.state_dict().copy()
            print(f'New best validation accuracy: {best_val_acc:.2f}%')
        
        scheduler.step()
    
    # Load best model
    model.load_state_dict(best_model_state)
    
    return model, {
        'train_losses': train_losses,
        'val_losses': val_losses,
        'train_accuracies': train_accuracies,
        'val_accuracies': val_accuracies,
        'best_val_acc': best_val_acc
    }

def evaluate_model(model, val_loader):
    """Evaluate model and generate detailed metrics"""
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    model.eval()
    
    all_predictions = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels in tqdm(val_loader, desc='Evaluating'):
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            
            all_predictions.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    # Calculate metrics
    accuracy = accuracy_score(all_labels, all_predictions)
    class_names = ['Eczema', 'Basal Cell']
    
    print(f'\\nFinal Evaluation Results:')
    print(f'Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)')
    print('\\nClassification Report:')
    print(classification_report(all_labels, all_predictions, target_names=class_names))
    
    # Confusion Matrix
    cm = confusion_matrix(all_labels, all_predictions)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    return accuracy, cm

def plot_training_history(history):
    """Plot training history"""
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    # Plot losses
    ax1.plot(history['train_losses'], label='Training Loss')
    ax1.plot(history['val_losses'], label='Validation Loss')
    ax1.set_title('Model Loss')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss')
    ax1.legend()
    ax1.grid(True)
    
    # Plot accuracies
    ax2.plot(history['train_accuracies'], label='Training Accuracy')
    ax2.plot(history['val_accuracies'], label='Validation Accuracy')
    ax2.set_title('Model Accuracy')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Accuracy (%)')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
    plt.close()

def main():
    """Main training function"""
    
    print("🧠 Training Eczema vs Basal Cell Carcinoma Classifier")
    print("=" * 60)
    
    # Configuration
    data_dir = "dataset"
    batch_size = 16
    num_epochs = 25
    learning_rate = 0.001
    
    # Create data loaders
    print("📊 Loading dataset...")
    train_loader, val_loader = create_data_loaders(data_dir, batch_size)
    
    # Create model
    print("🏗️ Creating model...")
    model = SkinDiseaseClassifier(num_classes=2, pretrained=True)
    
    # Train model
    print("🚀 Starting training...")
    trained_model, history = train_model(model, train_loader, val_loader, num_epochs, learning_rate)
    
    # Evaluate model
    print("📈 Evaluating model...")
    accuracy, cm = evaluate_model(trained_model, val_loader)
    
    # Plot training history
    plot_training_history(history)
    
    # Save model
    model_path = "model.pth"
    torch.save(trained_model.state_dict(), model_path)
    print(f"✅ Model saved to {model_path}")
    
    # Save training info
    training_info = {
        'accuracy': float(accuracy),
        'best_val_acc': history['best_val_acc'],
        'num_epochs': num_epochs,
        'batch_size': batch_size,
        'learning_rate': learning_rate,
        'class_names': ['Eczema', 'Basal Cell Carcinoma']
    }
    
    with open('training_info.json', 'w') as f:
        json.dump(training_info, f, indent=2)
    
    print(f"🎉 Training completed!")
    print(f"Final accuracy: {accuracy*100:.2f}%")
    print(f"Best validation accuracy: {history['best_val_acc']:.2f}%")

if __name__ == "__main__":
    main()