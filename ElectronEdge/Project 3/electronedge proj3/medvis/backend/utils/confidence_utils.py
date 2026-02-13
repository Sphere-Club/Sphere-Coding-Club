def is_valid_prediction(confidence: float, threshold: float = 0.7) -> bool:
    """
    Determine if prediction confidence is high enough for reliable diagnosis
    """
    return confidence >= threshold

def get_confidence_level(confidence: float) -> str:
    """
    Convert numerical confidence to human-readable level
    """
    if confidence >= 0.9:
        return "Very High"
    elif confidence >= 0.8:
        return "High" 
    elif confidence >= 0.7:
        return "Moderate"
    elif confidence >= 0.6:
        return "Low"
    else:
        return "Very Low"

def should_recommend_specialist(confidence: float, disease: str) -> bool:
    """
    Determine if specialist recommendation should be made based on confidence and disease type
    """
    # Always recommend specialist for medical conditions
    if confidence >= 0.6:
        return True
    
    # For low confidence, still recommend specialist but with different messaging
    return True

def get_confidence_message(confidence: float) -> dict:
    """
    Get appropriate message and recommendations based on confidence level
    """
    level = get_confidence_level(confidence)
    
    messages = {
        "Very High": {
            "message": "The AI system is very confident in this diagnosis.",
            "recommendation": "Please consult with a healthcare professional to confirm the diagnosis and discuss treatment options.",
            "urgency": "moderate"
        },
        "High": {
            "message": "The AI system has high confidence in this diagnosis.",
            "recommendation": "It is recommended to consult with a healthcare professional for proper evaluation and treatment planning.",
            "urgency": "moderate"
        },
        "Moderate": {
            "message": "The AI system has moderate confidence in this diagnosis.",
            "recommendation": "Please seek professional medical evaluation to confirm the diagnosis and explore treatment options.",
            "urgency": "moderate"
        },
        "Low": {
            "message": "The AI system has low confidence in this diagnosis.",
            "recommendation": "Professional medical evaluation is strongly recommended for accurate diagnosis.",
            "urgency": "high"
        },
        "Very Low": {
            "message": "The AI system cannot make a confident diagnosis from this image.",
            "recommendation": "Please consult with a healthcare professional immediately for proper evaluation.",
            "urgency": "high"
        }
    }
    
    return {
        "confidence_level": level,
        "confidence_score": confidence,
        **messages.get(level, messages["Very Low"])
    }

def calculate_prediction_reliability(probabilities: dict) -> dict:
    """
    Calculate additional reliability metrics from prediction probabilities
    """
    prob_values = list(probabilities.values())
    max_prob = max(prob_values)
    second_max = sorted(prob_values, reverse=True)[1] if len(prob_values) > 1 else 0
    
    # Calculate margin between top predictions
    margin = max_prob - second_max
    
    # Calculate entropy (uncertainty measure)
    import math
    entropy = -sum(p * math.log2(p + 1e-10) for p in prob_values if p > 0)
    max_entropy = math.log2(len(prob_values))
    normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
    
    return {
        "margin": margin,
        "entropy": entropy,
        "normalized_entropy": normalized_entropy,
        "certainty": 1 - normalized_entropy,
        "is_decisive": margin > 0.3,  # Clear winner vs close call
        "reliability_score": max_prob * (1 - normalized_entropy)
    }

def format_confidence_for_report(confidence: float, probabilities: dict) -> str:
    """
    Format confidence information for inclusion in PDF report
    """
    confidence_info = get_confidence_message(confidence)
    reliability = calculate_prediction_reliability(probabilities)
    
    report_text = f"""
CONFIDENCE ANALYSIS:

Overall Confidence: {confidence:.1%} ({confidence_info['confidence_level']})
Reliability Score: {reliability['reliability_score']:.1%}

INTERPRETATION:
{confidence_info['message']}

RECOMMENDATION:
{confidence_info['recommendation']}

TECHNICAL DETAILS:
• Prediction Margin: {reliability['margin']:.1%}
• Decision Certainty: {reliability['certainty']:.1%}
• Classification: {'Decisive' if reliability['is_decisive'] else 'Uncertain'}

URGENCY LEVEL: {confidence_info['urgency'].upper()}
"""
    
    return report_text