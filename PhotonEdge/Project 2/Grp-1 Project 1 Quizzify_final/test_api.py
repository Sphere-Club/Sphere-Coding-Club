import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if api_key:
    print(f"API Key loaded: {api_key[:20]}...")  # First 20 chars
else:
    print("API Key NOT found in environment")
