from PIL import Image
import os
from typing import Union
from fastapi import UploadFile

def validate_image(file: Union[UploadFile, str]) -> bool:
    """
    Validate if uploaded file is a valid image
    """
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    valid_mime_types = {
        'image/jpeg', 'image/jpg', 'image/png', 
        'image/bmp', 'image/tiff', 'image/webp'
    }
    
    if isinstance(file, UploadFile):
        # Check file extension
        if file.filename:
            ext = os.path.splitext(file.filename.lower())[1]
            if ext not in valid_extensions:
                return False
        
        # Check MIME type
        if file.content_type not in valid_mime_types:
            return False
        
        # Check file size (max 10MB)
        if hasattr(file, 'size') and file.size > 10 * 1024 * 1024:
            return False
            
        return True
    
    elif isinstance(file, str):
        # File path validation
        if not os.path.exists(file):
            return False
        
        ext = os.path.splitext(file.lower())[1]
        if ext not in valid_extensions:
            return False
        
        try:
            with Image.open(file) as img:
                img.verify()
            return True
        except Exception:
            return False
    
    return False

def get_image_info(image_path: str) -> dict:
    """Get basic information about an image"""
    try:
        with Image.open(image_path) as img:
            return {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "mode": img.mode,
                "size_bytes": os.path.getsize(image_path)
            }
    except Exception as e:
        return {"error": str(e)}

def resize_image(image_path: str, output_path: str, max_size: tuple = (800, 800)) -> bool:
    """Resize image while maintaining aspect ratio"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(output_path, optimize=True, quality=85)
        return True
    except Exception as e:
        print(f"Error resizing image: {e}")
        return False

def convert_to_rgb(image_path: str, output_path: str = None) -> str:
    """Convert image to RGB format"""
    if output_path is None:
        name, ext = os.path.splitext(image_path)
        output_path = f"{name}_rgb{ext}"
    
    try:
        with Image.open(image_path) as img:
            if img.mode != 'RGB':
                rgb_img = img.convert('RGB')
                rgb_img.save(output_path)
                return output_path
            else:
                return image_path
    except Exception as e:
        print(f"Error converting to RGB: {e}")
        return image_path

def create_thumbnail(image_path: str, thumbnail_path: str, size: tuple = (150, 150)) -> bool:
    """Create thumbnail of image"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size, Image.Resampling.LANCZOS)
            img.save(thumbnail_path, optimize=True, quality=75)
        return True
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return False

def is_medical_image_format(image_path: str) -> bool:
    """Check if image appears to be in medical imaging format"""
    try:
        info = get_image_info(image_path)
        
        # Basic checks for medical images
        if info.get("mode") == "L":  # Grayscale often used in medical imaging
            return True
        
        # Check for common medical image dimensions
        width, height = info.get("width", 0), info.get("height", 0)
        if width == height and width in [512, 1024, 2048]:  # Common medical image sizes
            return True
        
        return False
    except Exception:
        return False