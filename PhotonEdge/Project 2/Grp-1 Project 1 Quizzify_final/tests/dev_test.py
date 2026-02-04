import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


"""
Complete backend testing suite.
Tests all functionality before GUI integration.
"""

from backend.game_engine import QuizGame
from backend.llm_questions import get_questions_from_llm
import json


def test_llm_questions():
    """Test LLM question generation."""
    print("\n" + "="*50)
    print("TEST 1: LLM Questions Generation")
    print("="*50)
    try:
        questions = get_questions_from_llm(topic="Science")
        assert len(questions) == 12, f"Expected 12 questions, got {len(questions)}"
        assert all("text" in q for q in questions), "Missing 'text' field"
        assert all("options" in q for q in questions), "Missing 'options' field"
        assert all("answer" in q for q in questions), "Missing 'answer' field"
        print(f"✅ PASSED: {len(questions)} valid questions generated")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def test_game_start():
    """Test game initialization."""
    print("\n" + "="*50)
    print("TEST 2: Game Start")
    print("="*50)
    try:
        game = QuizGame()
        result = game.start_new_game()
        assert result == True, "Game failed to start"
        assert game.score == 0, "Initial score should be 0"
        assert game.current_index == 0, "Initial index should be 0"
        assert game.game_over == False, "Game should not be over"
        print("✅ PASSED: Game initialized correctly")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def test_correct_answers():
    """Test scoring with correct answers."""
    print("\n" + "="*50)
    print("TEST 3: Correct Answers & Scoring")
    print("="*50)
    try:
        game = QuizGame()
        game.start_new_game()
        
        # Answer first 3 questions correctly
        for i in range(3):
            q = game.get_current_question()
            result = game.submit_answer(q["answer"])
            assert result["correct"] == True, f"Question {i+1} should be correct"
            assert result["points_earned"] == 10, "Easy question should give 10 points"
        
        assert game.score == 30, f"Score should be 30, got {game.score}"
        print(f"PASSED: Correct scoring (score: {game.score})")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def test_wrong_answer():
    """Test game over on wrong answer."""
    print("\n" + "="*50)
    print("TEST 4: Wrong Answer - Game Over")
    print("="*50)
    try:
        game = QuizGame()
        game.start_new_game()
        
        q = game.get_current_question()
        # Submit wrong answer
        result = game.submit_answer("x")  # Invalid choice
        
        assert result["correct"] == False, "Answer should be wrong"
        assert game.game_over == True, "Game should be over"
        print("✅ PASSED: Game over on wrong answer")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def test_difficulty_levels():
    """Test difficulty levels and points."""
    print("\n" + "="*50)
    print("TEST 5: Difficulty Levels")
    print("="*50)
    try:
        game = QuizGame()
        game.start_new_game()
        
        # Test Easy (0-3)
        level, points = game.get_current_level()
        assert level == "Easy" and points == 10, f"Level 1 should be Easy/10, got {level}/{points}"
        
        # Skip to Medium (4-7)
        game.current_index = 4
        level, points = game.get_current_level()
        assert level == "Medium" and points == 20, f"Level 5 should be Medium/20, got {level}/{points}"
        
        # Skip to Hard (8-11)
        game.current_index = 8
        level, points = game.get_current_level()
        assert level == "Hard" and points == 30, f"Level 9 should be Hard/30, got {level}/{points}"
        
        print("✅ PASSED: All difficulty levels correct")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def test_all_correct_run():
    """Test perfect game (all 12 correct)."""
    print("\n" + "="*50)
    print("TEST 6: Perfect Run (All 12 Correct)")
    print("="*50)
    try:
        game = QuizGame()
        game.start_new_game()
        
        for i in range(12):
            q = game.get_current_question()
            result = game.submit_answer(q["answer"])
            assert result["correct"] == True, f"Question {i+1} should be correct"
            
            if i < 11:
                assert game.game_over == False, f"Game should not be over at Q{i+1}"
            else:
                assert game.game_over == True, "Game should be over after Q12"
        
        max_score = game.get_max_possible_score()
        assert game.score == max_score, f"Score should be {max_score}, got {game.score}"
        print(f"✅ PASSED: Perfect run completed (Final Score: {game.score}/{max_score})")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def test_progress_tracking():
    """Test progress tracking."""
    print("\n" + "="*50)
    print("TEST 7: Progress Tracking")
    print("="*50)
    try:
        game = QuizGame()
        game.start_new_game()
        
        progress = game.get_progress()
        assert progress["current_question"] == 1, "Should be on question 1"
        assert progress["total_questions"] == 12, "Should have 12 questions"
        assert progress["level"] == "Easy", "Level should be Easy"
        
        # Move forward
        q = game.get_current_question()
        game.submit_answer(q["answer"])
        
        progress = game.get_progress()
        assert progress["current_question"] == 2, "Should be on question 2"
        print("PASSED: Progress tracking working")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def run_all_tests():
    """Run all tests and report results."""
    print("\n" + "🧪 BACKEND TEST SUITE".center(50, "="))
    
    tests = [
        test_llm_questions,
        test_game_start,
        test_correct_answers,
        test_wrong_answer,
        test_difficulty_levels,
        test_all_correct_run,
        test_progress_tracking
    ]
    
    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"Test error: {e}")
            results.append(False)
    
    print("\n" + "="*50)
    print(f"RESULTS: {sum(results)}/{len(results)} tests passed")
    print("="*50)
    
    if all(results):
        print("ALL TESTS PASSED - Backend is ready!")
        return True
    else:
        print("Some tests failed. Fix issues before integration.")
        return False


if __name__ == "__main__":
    run_all_tests()
