import requests
from typing import List, Dict

class SpecialistFinder:
    def __init__(self):
        # In production, integrate with real medical directory APIs
        self.mock_specialists = {
            "Eczema": [
                {
                    "name": "Dr. Sarah Johnson",
                    "specialty": "Dermatology",
                    "rating": 4.8,
                    "address": "123 Medical Center Dr",
                    "phone": "+91 98765 43267",
                    "distance": "2.3 miles"
                },
                {
                    "name": "Dr. Michael Chen",
                    "specialty": "Dermatology", 
                    "rating": 4.6,
                    "address": "456 Health Plaza",
                    "phone": "+91 98765 43268",
                    "distance": "3.1 miles"
                },
                {
                    "name": "Dr. Emily Rodriguez",
                    "specialty": "Allergy & Immunology",
                    "rating": 4.7,
                    "address": "789 Wellness Blvd",
                    "phone": "+91 98765 43269",
                    "distance": "1.8 miles"
                },
                {
                    "name": "Dr. Anita Sharma",
                    "specialty": "Pediatric Dermatology",
                    "rating": 4.9,
                    "address": "321 Children's Hospital",
                    "phone": "+91 98765 43270",
                    "distance": "4.5 miles"
                }
            ],
            "Ringworm": [
                {
                    "name": "Dr. James Wilson",
                    "specialty": "Dermatology",
                    "rating": 4.9,
                    "address": "321 Care Center Ave",
                    "phone": "+91 98765 43271",
                    "distance": "4.2 miles"
                },
                {
                    "name": "Dr. Lisa Thompson",
                    "specialty": "Infectious Disease",
                    "rating": 4.5,
                    "address": "654 Health Street",
                    "phone": "+91 98765 43272",
                    "distance": "2.7 miles"
                },
                {
                    "name": "Dr. Robert Kim",
                    "specialty": "Family Medicine",
                    "rating": 4.6,
                    "address": "987 Primary Care Blvd",
                    "phone": "+91 98765 43273",
                    "distance": "3.5 miles"
                },
                {
                    "name": "Dr. Priya Patel",
                    "specialty": "Dermatology",
                    "rating": 4.8,
                    "address": "159 Skin Clinic Center",
                    "phone": "+91 98765 43274",
                    "distance": "1.9 miles"
                },
                {
                    "name": "Dr. Rajesh Kumar",
                    "specialty": "Internal Medicine",
                    "rating": 4.7,
                    "address": "753 Medical Complex",
                    "phone": "+91 98765 43275",
                    "distance": "5.1 miles"
                }
            ]
        }
    
    def find_by_location(self, disease: str, location: str) -> List[Dict]:
        """Find specialists near given location"""
        # In production, use real geolocation and medical directory APIs
        specialists = self.mock_specialists.get(disease, [])
        
        # Add location context to results
        for specialist in specialists:
            specialist["search_location"] = location
            specialist["availability"] = "Call for appointment"
        
        return specialists
    
    def find_by_insurance(self, disease: str, insurance_provider: str) -> List[Dict]:
        """Find specialists that accept specific insurance"""
        specialists = self.find_by_location(disease, "")
        
        # Mock insurance filtering
        for specialist in specialists:
            specialist["accepts_insurance"] = True
            specialist["insurance_note"] = f"Accepts {insurance_provider}"
        
        return specialists

def find_specialists(disease: str, location: str = None, insurance: str = None) -> List[Dict]:
    """
    Main function to find specialists for a given disease
    """
    finder = SpecialistFinder()
    
    if location:
        specialists = finder.find_by_location(disease, location)
    else:
        specialists = finder.mock_specialists.get(disease, [])
    
    if insurance:
        specialists = finder.find_by_insurance(disease, insurance)
    
    # Sort by rating and distance
    specialists.sort(key=lambda x: (-x.get('rating', 0), float(x.get('distance', '999').split()[0])))
    
    return specialists[:5]  # Return top 5 specialists

def format_specialists_for_report(specialists: List[Dict]) -> str:
    """Format specialist information for PDF report"""
    if not specialists:
        return "No specialists found in your area. Please consult your primary care physician for referrals."
    
    formatted = "RECOMMENDED SPECIALISTS:\n\n"
    
    for i, specialist in enumerate(specialists, 1):
        formatted += f"{i}. {specialist['name']}\n"
        formatted += f"   Specialty: {specialist['specialty']}\n"
        formatted += f"   Rating: {specialist['rating']}/5.0\n"
        formatted += f"   Address: {specialist['address']}\n"
        formatted += f"   Phone: {specialist['phone']}\n"
        if 'distance' in specialist:
            formatted += f"   Distance: {specialist['distance']}\n"
        formatted += f"   Availability: {specialist.get('availability', 'Call for appointment')}\n\n"
    
    return formatted