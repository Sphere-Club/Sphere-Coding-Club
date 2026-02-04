# Architecture Overview
clean_main_project/
│── backend/ # Core quiz engine
│── ui/ # Pygame UI
│── assets/ # Images for UI screens
│── tests/ # Test scripts
│── docs/ # Documentation
│── run_quiz.py # Entry script


## Backend
Handles:
- Game state
- Question generation
- Timer logic
- Score management

## UI
Handles:
- Rendering
- User input
- Navigation between screens

## LLM Integration
- Fetches questions
- Converts them to engine format
