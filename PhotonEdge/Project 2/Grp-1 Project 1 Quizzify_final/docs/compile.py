"""
Quiz Master - Main Entry Point
Complete system initialization and documentation.
"""

import sys
import os
from pathlib import Path

# CRITICAL: Add project root to Python path
project_root = Path(__file__).parent.parent  # Go up from docs/ to main/
sys.path.insert(0, str(project_root))

# Now imports will work
from backend.game_engine import QuizGame
from backend.llm_questions import get_questions_from_llm


def print_banner():
    """Print welcome banner."""
    print("\n" + "="*60)
    print("   QUIZ MASTER - Backend System Ready!")
    print("="*60)


def verify_backend():
    """Verify all backend modules are working."""
    print("\nVerifying Backend Components...")
    
    try:
        # Test 1: Import LLM module
        print("  LLM Questions Module", end=" ... ")
        questions = get_questions_from_llm(topic="Test")
        assert len(questions) == 12
        print("OK")
        
        # Test 2: Game Engine
        print("  Game Engine", end=" ... ")
        game = QuizGame()
        game.start_new_game()
        assert game.score == 0
        print("OK")
        
        # Test 3: Question retrieval
        print("  Question Retrieval", end=" ... ")
        q = game.get_current_question()
        assert "text" in q and "options" in q
        print("OK")
        
        # Test 4: Answer submission
        print("  Answer Submission", end=" ... ")
        result = game.submit_answer(q["answer"])
        assert "correct" in result and "total_score" in result
        print("OK")
        
        print("\nAll backend components verified!\n")
        return True
        
    except Exception as e:
        print("FAILED")
        print(f"Backend verification failed: {e}\n")
        return False


def show_api_documentation():
    """Show API documentation for GUI developer."""
    print("BACKEND API FOR GUI DEVELOPER (Ayush)")
    print("-" * 60)
    
    api_doc = """
Import:
-------
from backend.game_engine import QuizGame


Usage Example:
--------------
# 1. CREATE GAME INSTANCE
game = QuizGame()


# 2. START NEW GAME (no level selection)
game.start_new_game(topic="General Knowledge")
# Returns: bool (True if successful)


# 3. GET CURRENT QUESTION
question = game.get_current_question()
# Returns: {
#     "text": "What is the capital of France?",
#     "options": {"a": "London", "b": "Paris", "c": "Berlin", "d": "Madrid"},
#     "answer": "b"
# }


# 4. SUBMIT ANSWER
result = game.submit_answer("b")
# Returns: {
#     "correct": True/False,
#     "correct_answer": "b",
#     "points_earned": 10/20/30,
#     "total_score": 60,
#     "game_over": False,
#     "next_question_number": 7,
#     "message": "Correct!" or "Wrong! Correct answer was B"
# }


# 5. CHECK IF GAME OVER
is_over = game.is_game_over()


# 6. GET CURRENT SCORE
score = game.get_score()


# 7. GET PROGRESS
progress = game.get_progress()


# 8. GET MAX POSSIBLE SCORE
max_score = game.get_max_possible_score()


SCORING SYSTEM:
---------------
Questions 1-4 (Easy):       +10 points each = 40 max
Questions 5-8 (Medium):     +20 points each = 80 max
Questions 9-12 (Hard):      +30 points each = 120 max
Maximum Total Score: 240 points


GAME FLOW:
----------
1. User clicks "Start Game"
2. Display question
3. User submits an answer
4. If wrong → game ends
5. If all correct → perfect score


UI SPECIFICATIONS:
------------------
- No level selection page
- Question page has only Submit button
- Results page shows final score + Home/Restart buttons
- Use moderate color palette


RESTART/HOME LOGIC:
-------------------
# Restart: Create new game instance
game = QuizGame()
game.start_new_game()

# Home: Show home screen
show_home_screen()
"""
    
    print(api_doc)
    print("-" * 60)


def show_project_structure():
    """Show project structure."""
    print("\nPROJECT STRUCTURE")
    print("-" * 60)
    
    structure = """
main/
│
├── backend/                    
│   ├── __init__.py
│   ├── llm_questions.py
│   ├── game_engine.py          
│
├── tests/                      
│   ├── __init__.py
│   ├── dev_test.py             
│
├── UI/                         
│   ├── __init__.py
│   └── main_gui.py             
│
├── docs/                       
│   ├── compile.py              
│   ├── requirements.txt        
│   ├── SRS.docx               
│   ├── System_Design.docx     
│   ├── Flowchart.png          
│   ├── Algorithm.pdf          
│   └── Presentation.pptx      
│
├── venv/                       
├── .env                        
└── .gitignore                  
"""
    
    print(structure)
    print("-" * 60)


def show_next_steps():
    """Show next steps for team."""
    print("\nNEXT STEPS - TEAM ASSIGNMENTS")
    print("-" * 60)
    
    steps = """
SHREYASH:
- Backend modules completed
- Testing suite completed
- API documentation ready
- Share API with Ayush
- Share specs with Samira
- Support GUI integration
- Final testing


AYUSH:
- Build UI/main_gui.py
- Create 3 screens: Home, Question, Results
- Connect backend API
- Use moderate colors
- Test integration


SAMIRA:
- Prepare SRS.docx
- Prepare System_Design.docx
- Create Flowchart.png
- Create Algorithm.pdf
- Create Presentation.pptx


FINAL:
- Integrate backend + frontend
- Test end-to-end
- Fix bugs
- Review documentation
- Prepare viva
- Submit project
"""
    
    print(steps)
    print("-" * 60)


def show_color_palette():
    """Show recommended color palette for GUI."""
    print("\nRECOMMENDED COLOR PALETTE (For Ayush)")
    print("-" * 60)
    
    palette = """
Use maximum 3-4 colors:

PRIMARY:
- #2C7A7B  
- #718096  

BACKGROUNDS:
- #FFFFFF
- #F7FAFC

TEXT:
- #2D3748
- #718096

FEEDBACK:
- #48BB78
- #C6F6D5
- #F56565
- #FED7D7
"""
    
    print(palette)
    print("-" * 60)


def main():
    """Main function - System initialization."""
    print_banner()
    
    if not verify_backend():
        print("Fix backend issues before proceeding.\n")
        return False
    
    show_api_documentation()
    show_project_structure()
    show_color_palette()
    show_next_steps()
    
    print("\n" + "="*60)
    print("   Backend Ready for GUI Integration!")
    print("   Share this output with Ayush and Samira")
    print("="*60 + "\n")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
