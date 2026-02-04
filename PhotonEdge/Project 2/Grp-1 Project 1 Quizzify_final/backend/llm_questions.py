import os
import json
from dotenv import load_dotenv
import requests

load_dotenv()

HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")

def get_questions_from_huggingface(topic="General Knowledge"):
    """
    Fetch 12 MCQs from Hugging Face Inference API using Bloom model.
    
    Returns:
        A list of question dicts or fallback questions on failure.
    """
    if not HUGGINGFACE_API_TOKEN:
        raise ValueError("HUGGINGFACE_API_TOKEN not found in .env")

    model_id = "bigscience/bloom"  # Updated model id to valid one

    prompt = f"""
Generate exactly 12 multiple-choice quiz questions about: {topic}

Return ONLY a JSON array of questions, for example:

[
  {{
    "text": "Question text?",
    "options": {{"a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D"}},
    "answer": "a"
  }},
  ...
]
"""

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 700,
            "do_sample": False,
        }
    }

    response = requests.post(
        f"https://router.huggingface.co/hf-inference/{model_id}",
        headers=headers,
        json=payload
    )

    if response.status_code != 200:
        raise ValueError(f"Hugging Face API Error: {response.status_code} - {response.text}")

    response_json = response.json()

    if isinstance(response_json, list) and "generated_text" in response_json[0]:
        generated_text = response_json[0]["generated_text"]
    else:
        raise ValueError("Unexpected response format from Hugging Face API")

    try:
        start_index = generated_text.find('[')
        end_index = generated_text.rfind(']') + 1
        json_str = generated_text[start_index:end_index]

        questions = json.loads(json_str)
    except Exception as e:
        print(f"Warning: Failed to parse Hugging Face JSON output ({e}), falling back to default questions.")
        questions = parse_fallback_questions()

    valid_questions = []
    for i, q in enumerate(questions):
        try:
            question = {
                "text": str(q.get("text", "")).strip(),
                "options": {
                    "a": str(q.get("options", {}).get("a", "")).strip(),
                    "b": str(q.get("options", {}).get("b", "")).strip(),
                    "c": str(q.get("options", {}).get("c", "")).strip(),
                    "d": str(q.get("options", {}).get("d", "")).strip(),
                },
                "answer": str(q.get("answer", "")).strip().lower()
            }
            if not question["text"]:
                raise ValueError("Missing question text")
            if question["answer"] not in ["a", "b", "c", "d"]:
                raise ValueError(f"Invalid answer '{question['answer']}'")
            if any(not opt for opt in question["options"].values()):
                raise ValueError("One or more options missing")
            valid_questions.append(question)
        except Exception as e:
            print(f"Question {i+1} invalid: {e}")

    if len(valid_questions) != 12:
        print(f"Warning: Expected 12 valid questions but got {len(valid_questions)}. Using fallback questions.")
        valid_questions = parse_fallback_questions()

    return valid_questions


def get_questions_from_llm(topic="General Knowledge"):
    """
    Primary function to get questions via Hugging Face API.
    Falls back on failure.
    """
    try:
        return get_questions_from_huggingface(topic)
    except Exception as e:
        print(f"Error fetching questions from Hugging Face: {e}")
        print("Using fallback questions instead...")
        return parse_fallback_questions()


def get_fallback_questions():
    fallback_json = """{
        "questions": [
            {
                "text": "What is the capital of France?",
                "options": {"a": "London", "b": "Paris", "c": "Berlin", "d": "Madrid"},
                "answer": "b"
            },
            {
                "text": "Which planet is known as the Red Planet?",
                "options": {"a": "Venus", "b": "Jupiter", "c": "Mars", "d": "Saturn"},
                "answer": "c"
            },
            {
                "text": "What is 2 + 2?",
                "options": {"a": "3", "b": "4", "c": "5", "d": "6"},
                "answer": "b"
            },
            {
                "text": "Who wrote Romeo and Juliet?",
                "options": {"a": "Charles Dickens", "b": "Jane Austen", "c": "William Shakespeare", "d": "Mark Twain"},
                "answer": "c"
            },
            {
                "text": "What is the largest ocean on Earth?",
                "options": {"a": "Atlantic", "b": "Indian", "c": "Arctic", "d": "Pacific"},
                "answer": "d"
            },
            {
                "text": "In what year did World War II end?",
                "options": {"a": "1943", "b": "1944", "c": "1945", "d": "1946"},
                "answer": "c"
            },
            {
                "text": "What is the chemical formula for salt?",
                "options": {"a": "NaCl", "b": "KCl", "c": "MgCl", "d": "CaCl"},
                "answer": "a"
            },
            {
                "text": "Which country has the most population?",
                "options": {"a": "India", "b": "USA", "c": "Indonesia", "d": "Brazil"},
                "answer": "a"
            },
            {
                "text": "What is the Fibonacci sequence's 7th number?",
                "options": {"a": "8", "b": "13", "c": "21", "d": "34"},
                "answer": "b"
            },
            {
                "text": "How many bones does an adult human have?",
                "options": {"a": "186", "b": "206", "c": "256", "d": "306"},
                "answer": "b"
            },
            {
                "text": "What is the derivative of x^3?",
                "options": {"a": "x^2", "b": "3x^2", "c": "3x", "d": "x^4"},
                "answer": "b"
            },
            {
                "text": "Which algorithm has O(n log n) average time complexity?",
                "options": {"a": "Bubble Sort", "b": "Merge Sort", "c": "Selection Sort", "d": "Insertion Sort"},
                "answer": "b"
            }
        ]
    }"""
    return fallback_json


def parse_fallback_questions():
    data = json.loads(get_fallback_questions())
    return data["questions"]


if __name__ == "__main__":
    print("Testing LLM Questions Module...")
    try:
        questions = get_questions_from_llm(topic="Python Programming")
        print(f"\nGot {len(questions)} questions!")
        print(f"\nFirst question:\n{json.dumps(questions[0], indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
