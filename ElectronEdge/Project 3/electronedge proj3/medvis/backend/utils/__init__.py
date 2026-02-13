# Utils module for medical image analysis
"""
Medical Image Analysis Utilities

This module provides utility functions for:
- Image processing and validation
- Confidence analysis and scoring
- File handling and management
- Data formatting and conversion
- Error handling and logging
"""

from .image_utils import (
    validate_image,
    get_image_info,
    resize_image,
    convert_to_rgb,
    create_thumbnail,
    is_medical_image_format
)

from .confidence_utils import (
    is_valid_prediction,
    get_confidence_level,
    should_recommend_specialist,
    get_confidence_message,
    calculate_prediction_reliability,
    format_confidence_for_report
)

__version__ = "1.0.0"
__author__ = "MedVision AI Team"

# Export all utility functions
__all__ = [
    # Image utilities
    'validate_image',
    'get_image_info', 
    'resize_image',
    'convert_to_rgb',
    'create_thumbnail',
    'is_medical_image_format',
    
    # Confidence utilities
    'is_valid_prediction',
    'get_confidence_level',
    'should_recommend_specialist', 
    'get_confidence_message',
    'calculate_prediction_reliability',
    'format_confidence_for_report'
]