import os
import json
from typing import Dict, Optional
import requests
from openai import OpenAI

class LLMExplanationService:
    def __init__(self):
        self.openai_api_key = os.getenv("your_openai_api_key_here")
        self.anthropic_api_key = os.getenv("your_anthropic_api_key_here")
        
        # Initialize OpenAI client if API key is available
        if self.openai_api_key and self.openai_api_key.startswith("sk-"):
            self.openai_client = OpenAI(api_key=self.openai_api_key)
            print("✅ OpenAI client initialized")
        else:
            self.openai_client = None
            print("⚠️ OpenAI API key not found")
    
    def generate_with_openai(self, disease_name: str, confidence: float) -> Dict:
        """Generate explanation using OpenAI GPT"""
        if not self.openai_client:
            raise Exception("OpenAI client not initialized")
            
        try:
            prompt = f"""
            As a medical AI assistant, provide a comprehensive but accessible explanation for a patient who has been diagnosed with {disease_name} with {confidence:.1%} confidence from medical image analysis.

            Please structure your response as a JSON object with the following fields:
            - name: The condition name in patient-friendly terms
            - description: A clear, non-technical explanation of what this condition is
            - symptoms: List of 4-5 common symptoms patients might experience
            - causes: List of 3-4 potential causes or risk factors
            - treatment: List of 4-5 general treatment approaches
            - urgency: "low", "moderate", or "high" based on typical urgency
            - next_steps: Specific recommendation for what the patient should do next
            - disclaimer: Important medical disclaimer
            - dos: List of 4-5 specific do's for managing this condition
            - donts: List of 4-5 specific don'ts to avoid

            Keep the language compassionate, clear, and avoid overly technical medical jargon. Focus on being informative while encouraging professional medical consultation.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful medical AI assistant that explains medical conditions in patient-friendly language. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            explanation_text = response.choices[0].message.content
            
            # Clean up the response to ensure it's valid JSON
            explanation_text = explanation_text.strip()
            if explanation_text.startswith('```json'):
                explanation_text = explanation_text[7:]
            if explanation_text.endswith('```'):
                explanation_text = explanation_text[:-3]
            
            result = json.loads(explanation_text)
            print(f"✅ OpenAI generated explanation for {disease_name}")
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error from OpenAI: {e}")
            return self._get_fallback_explanation(disease_name)
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._get_fallback_explanation(disease_name)
    
    def generate_with_anthropic(self, disease_name: str, confidence: float) -> Dict:
        """Generate explanation using Anthropic Claude"""
        try:
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.anthropic_api_key,
                "anthropic-version": "2023-06-01"
            }
            
            prompt = f"""
            Provide a patient-friendly medical explanation for {disease_name} detected with {confidence:.1%} confidence.
            
            Return a JSON response with: name, description, symptoms (array), causes (array), treatment (array), urgency, next_steps, disclaimer, dos (array), donts (array).
            
            Use clear, compassionate language that patients can understand while being medically accurate.
            """
            
            data = {
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                explanation_text = result["content"][0]["text"]
                
                # Clean up the response
                explanation_text = explanation_text.strip()
                if explanation_text.startswith('```json'):
                    explanation_text = explanation_text[7:]
                if explanation_text.endswith('```'):
                    explanation_text = explanation_text[:-3]
                
                parsed_result = json.loads(explanation_text)
                print(f"✅ Anthropic generated explanation for {disease_name}")
                return parsed_result
            else:
                raise Exception(f"Anthropic API error: {response.status_code}")
                
        except Exception as e:
            print(f"Anthropic API error: {e}")
            return self._get_fallback_explanation(disease_name)
    
    def _get_fallback_explanation(self, disease_name: str) -> Dict:
        """Fallback explanations when LLM APIs are unavailable"""
        fallback_explanations = {
            "Eczema": {
                "name": "Eczema (Atopic Dermatitis)",
                "description": "Eczema is a chronic inflammatory skin condition that causes red, itchy, and inflamed patches of skin. It's one of the most common skin conditions, especially in children, but can affect people of all ages.",
                "symptoms": [
                    "Red, inflamed patches of skin",
                    "Intense itching, especially at night",
                    "Dry, scaly, or cracked skin",
                    "Small, raised bumps that may leak fluid when scratched"
                ],
                "causes": [
                    "Genetic predisposition and family history",
                    "Environmental allergens (dust mites, pollen, pet dander)",
                    "Irritants like soaps, detergents, or fabrics",
                    "Stress and hormonal changes"
                ],
                "treatment": [
                    "Moisturizing creams and ointments applied regularly",
                    "Topical corticosteroids for inflammation control",
                    "Antihistamines to reduce itching",
                    "Avoiding known triggers and irritants"
                ],
                "dos": [
                    "Apply prescribed topical treatments as directed",
                    "Use gentle, fragrance-free moisturizers daily",
                    "Keep fingernails short to prevent scratching damage",
                    "Wear soft, breathable fabrics like cotton",
                    "Take lukewarm baths with mild soap"
                ],
                "donts": [
                    "Don't scratch or rub the affected areas",
                    "Avoid harsh soaps, detergents, and fragrances",
                    "Don't take hot showers or baths",
                    "Avoid known allergens and irritants",
                    "Don't ignore worsening symptoms"
                ],
                "urgency": "moderate",
                "next_steps": "Schedule an appointment with a dermatologist for proper diagnosis and personalized treatment plan.",
                "disclaimer": "This information is for educational purposes only and should not replace professional medical advice."
            },
            
            "Ringworm": {
                "name": "Ringworm (Dermatophytosis)",
                "description": "Ringworm is a common fungal infection of the skin that creates circular, ring-shaped rashes. Despite its name, it's not caused by worms but by fungi called dermatophytes.",
                "symptoms": [
                    "Circular, ring-shaped rash with raised, scaly borders",
                    "Clear or normal-looking skin in the center of the ring",
                    "Itching and burning sensation",
                    "Red, inflamed skin around the affected area"
                ],
                "causes": [
                    "Fungal infection from dermatophyte organisms",
                    "Direct contact with infected people or animals",
                    "Contact with contaminated surfaces",
                    "Warm, moist environments that promote fungal growth"
                ],
                "treatment": [
                    "Antifungal creams, ointments, or oral medications",
                    "Keep the affected area clean and dry",
                    "Avoid sharing personal items like towels or clothing",
                    "Treatment typically lasts 2-4 weeks beyond symptom resolution"
                ],
                "dos": [
                    "Apply antifungal medication as prescribed",
                    "Keep the affected area clean and dry",
                    "Wash hands thoroughly after touching affected area",
                    "Use separate towels and clothing",
                    "Complete the full course of treatment"
                ],
                "donts": [
                    "Don't share personal items like towels or clothing",
                    "Avoid touching or scratching the infected area",
                    "Don't stop treatment early even if symptoms improve",
                    "Avoid tight-fitting or synthetic clothing",
                    "Don't ignore spreading or worsening symptoms"
                ],
                "urgency": "moderate",
                "next_steps": "Consult with a healthcare provider or dermatologist for proper diagnosis and antifungal treatment.",
                "disclaimer": "This information is for educational purposes only and should not replace professional medical advice."
            }
        }
        
        return fallback_explanations.get(disease_name, {
            "name": "Dermatological Condition",
            "description": "A skin condition has been detected that requires professional evaluation.",
            "symptoms": ["Consult with healthcare provider for symptom assessment"],
            "causes": ["Multiple factors may contribute to this condition"],
            "treatment": ["Professional medical evaluation required"],
            "urgency": "moderate",
            "next_steps": "Please consult with a dermatologist for proper diagnosis and treatment recommendations.",
            "disclaimer": "This information is for educational purposes only and should not replace professional medical advice."
        })

# Global service instance
llm_service = LLMExplanationService()

def generate_disease_explanation(disease_name: str, confidence: float = 0.8) -> Dict:
    """
    Generate human-friendly explanation for detected disease using LLM API
    Falls back to static explanations if API is unavailable
    """
    
    # Try OpenAI first if API key is available
    if llm_service.openai_api_key and llm_service.openai_api_key.startswith("sk-"):
        try:
            result = llm_service.generate_with_openai(disease_name, confidence)
            print(f"✅ Using OpenAI explanation for {disease_name}")
            return result
        except Exception as e:
            print(f"OpenAI failed, trying Anthropic: {e}")
    
    # Try Anthropic if OpenAI fails and API key is available
    if llm_service.anthropic_api_key and llm_service.anthropic_api_key.startswith("sk-ant-"):
        try:
            result = llm_service.generate_with_anthropic(disease_name, confidence)
            print(f"✅ Using Anthropic explanation for {disease_name}")
            return result
        except Exception as e:
            print(f"Anthropic failed, using fallback: {e}")
    
    # Use fallback explanations
    print(f"⚠️ Using fallback explanation for {disease_name}")
    return llm_service._get_fallback_explanation(disease_name)

def format_explanation_for_report(explanation):
    """Format explanation for PDF report"""
    formatted = f"""
CONDITION: {explanation['name']}

DESCRIPTION:
{explanation['description']}

SYMPTOMS:
"""
    for symptom in explanation.get('symptoms', []):
        formatted += f"• {symptom}\n"
    
    formatted += f"""
POSSIBLE CAUSES:
"""
    for cause in explanation.get('causes', []):
        formatted += f"• {cause}\n"
    
    formatted += f"""
TREATMENT CONSIDERATIONS:
"""
    for treatment in explanation.get('treatment', []):
        formatted += f"• {treatment}\n"
    
    formatted += f"""
RECOMMENDED NEXT STEPS:
{explanation.get('next_steps', 'Consult with a healthcare professional.')}

URGENCY LEVEL: {explanation.get('urgency', 'moderate').upper()}
"""
    
    return formatted

def test_llm_integration():
    """Test function to verify LLM API integration"""
    print("🧪 Testing LLM API Integration...")
    
    # Test with sample data
    test_disease = "Eczema"
    test_confidence = 0.85
    
    try:
        explanation = generate_disease_explanation(test_disease, test_confidence)
        
        print("✅ LLM Integration Test Results:")
        print(f"   Disease: {explanation.get('name', 'N/A')}")
        print(f"   Description: {explanation.get('description', 'N/A')[:100]}...")
        print(f"   Urgency: {explanation.get('urgency', 'N/A')}")
        print(f"   Symptoms count: {len(explanation.get('symptoms', []))}")
        print(f"   Causes count: {len(explanation.get('causes', []))}")
        print(f"   Treatment count: {len(explanation.get('treatment', []))}")
        
        # Check if it's using LLM or fallback
        if "educational purposes only" in explanation.get('disclaimer', ''):
            print("   Source: Fallback explanations (no API key or API error)")
        else:
            print("   Source: LLM API (dynamic generation)")
            
        return True
        
    except Exception as e:
        print(f"❌ LLM Integration Test Failed: {e}")
        return False

if __name__ == "__main__":
    # Load environment variables for testing
    from dotenv import load_dotenv
    load_dotenv()
    
    test_llm_integration()