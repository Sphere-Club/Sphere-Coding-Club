import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("HUGGINGFACE_API_TOKEN")
if not token:
    raise Exception("API token not found. Check your .env file.")

headers = {"Authorization": f"Bearer {token}"}

model_id = "bigscience/bloom"

response = requests.post(
    f"https://router.huggingface.co/hf-inference/{model_id}",
    headers=headers,
    json={"inputs": "Hello world"}
)

print(response.status_code)
print(response.text)
