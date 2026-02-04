
# Quizzify — AI‑Powered Quiz Game

Quizzify is a modern, interactive quiz game built using **Python**, **PyGame**, and optional **LLM‑generated questions**.  
The project is designed with clean architecture, modular components, and a visually appealing UI.

---

## Core Highlights
-  Beautiful multi‑screen UI (Start → Quiz → Result)
-  Optional AI question generation (HuggingFace)
-  Configurable quiz engine
-  Modular backend (easy to extend)
-  Built‑in test suite
-  Full documentation inside `/docs`

---

## Project Structure
```
Quizzify/
│ run_quiz.py
│ requirements.txt
│
├── backend/
│   ├── game_engine.py
│   ├── llm_questions.py
│   ├── config.py
│   └── utils.py
│
├── ui/
│   ├── pygame_ui.py
│   ├── index_graphics.py
│   └── GUI 2.py
│
├── assets/
│   ├── start_screen.jpg
│   ├── question_screen.jpg
│   └── result_screen.jpg
│
├── docs/
└── tests/
```

---

## 🛠 Installation
```bash
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate    # Windows
pip install pygame
pip install -r requirements.txt
```

---

## Running the Game
```bash
python run_quiz.py
```

---

## AI Question Mode
Run the LLM test:
```bash
python test_hf_model.py
```
If the model is unavailable, the game gracefully falls back to local question logic.

---

## Run Tests
```bash
python -m pytest
```

---

## Notes
- Ensure PyGame is installed correctly.
- Do not rename or move `/assets` or UI files.
- For deployment, package only source files, not virtual environments.

---

## Credits
Designed & developed as part of an advanced interactive Python project.  
Modular, clean, extendable — built to scale.

Enjoy building with **Quizzify** 
