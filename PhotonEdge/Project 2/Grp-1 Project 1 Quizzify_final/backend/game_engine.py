"""
Quiz Master Game Engine
Handles all game logic, scoring, and state management.
"""

from backend.llm_questions import get_questions_from_llm
import json


class QuizGame:
    """
    Complete quiz game engine with state management.
    """
    
    def __init__(self):
        """Initialize game state."""
        self.questions = []
        self.score = 0
        self.current_index = 0
        self.game_over = False
        self.game_started = False
    
    def start_new_game(self, topic="General Knowledge"):
        """
        Start a new game by fetching questions from LLM.
        
        Args:
            topic (str): Quiz topic
        
        Returns:
            bool: True if game started successfully
        """
        try:
            print(f"Starting new game: {topic}")
            self.questions = get_questions_from_llm(topic=topic)
            self.score = 0
            self.current_index = 0
            self.game_over = False
            self.game_started = True
            print(f"Game started with {len(self.questions)} questions")
            return True
        except Exception as e:
            print(f"Failed to start game: {e}")
            self.game_over = True
            return False
    
    def get_current_question(self):
        """
        Get the current question.
        
        Returns:
            dict: Current question with text, options, answer
            None: If no game is running
        """
        if not self.game_started or self.game_over or self.current_index >= len(self.questions):
            return None
        
        return self.questions[self.current_index]
    
    def get_current_level(self):
        """
        Determine current difficulty level based on question index.
        
        Returns:
            tuple: (level_name, points_for_correct_answer)
                   ("Easy", 10), ("Medium", 20), or ("Hard", 30)
        """
        if self.current_index < 4:
            return ("Easy", 10)
        elif self.current_index < 8:
            return ("Medium", 20)
        else:
            return ("Hard", 30)
    
    def submit_answer(self, choice):
        """
        Submit an answer for the current question.
        
        Args:
            choice (str): User's answer: "a", "b", "c", or "d"
        
        Returns:
            dict: {
                "correct": bool,
                "correct_answer": str,
                "points_earned": int,
                "total_score": int,
                "game_over": bool,
                "next_question_number": int or None
            }
        """
        if not self.game_started or self.game_over:
            return {
                "correct": False,
                "correct_answer": None,
                "points_earned": 0,
                "total_score": self.score,
                "game_over": True,
                "next_question_number": None,
                "message": "Game is not running"
            }
        
        current_q = self.get_current_question()
        if not current_q:
            self.game_over = True
            return {
                "correct": False,
                "correct_answer": None,
                "points_earned": 0,
                "total_score": self.score,
                "game_over": True,
                "next_question_number": None,
                "message": "No more questions"
            }
        
        correct_answer = current_q["answer"].lower()
        choice = choice.lower()
        is_correct = (choice == correct_answer)
        
        _, points = self.get_current_level()
        
        if is_correct:
            self.score += points
            points_earned = points
            
            # Move to next question
            self.current_index += 1
            
            # Check if quiz is complete (all 12 answered correctly)
            if self.current_index >= len(self.questions):
                self.game_over = True
                next_q_num = None
            else:
                next_q_num = self.current_index + 1
        
        else:
            # Wrong answer - game over
            self.game_over = True
            points_earned = 0
            next_q_num = None
        
        return {
            "correct": is_correct,
            "correct_answer": correct_answer,
            "points_earned": points_earned,
            "total_score": self.score,
            "game_over": self.game_over,
            "next_question_number": next_q_num,
            "message": "Correct!" if is_correct else f"Wrong! Correct answer was {correct_answer.upper()}"
        }
    
    def is_game_over(self):
        """
        Check if the game has ended.
        
        Returns:
            bool: True if game is over
        """
        return self.game_over
    
    def get_score(self):
        """
        Get current score.
        
        Returns:
            int: Total points earned
        """
        return self.score
    
    def get_progress(self):
        """
        Get game progress.
        
        Returns:
            dict: {
                "current_question": int (1-12),
                "total_questions": int (12),
                "score": int,
                "level": str (Easy/Medium/Hard)
            }
        """
        level_name, _ = self.get_current_level()
        return {
            "current_question": self.current_index + 1,
            "total_questions": len(self.questions),
            "score": self.score,
            "level": level_name
        }
    
    def get_max_possible_score(self):
        """
        Calculate maximum possible score (all answers correct).
        
        Returns:
            int: 4*10 (easy) + 4*20 (medium) + 4*30 (hard) = 240
        """
        return 4 * 10 + 4 * 20 + 4 * 30  # 240


# Global game instance (used by GUI)
game_instance = QuizGame()


def initialize_game(topic="General Knowledge"):
    """Initialize global game instance."""
    global game_instance
    game_instance = QuizGame()
    return game_instance.start_new_game(topic=topic)


def get_game():
    """Get global game instance."""
    global game_instance
    return game_instance


# Test the engine
if __name__ == "__main__":
    print("Testing Game Engine...\n")
    
    # Initialize
    game = QuizGame()
    
    # Start game
    if game.start_new_game(topic="General Knowledge"):
        print("✅ Game started\n")
        
        # Get first question
        q = game.get_current_question()
        print(f"Question 1 ({game.get_current_level()[0]}):")
        print(f"Text: {q['text']}")
        print(f"Options: {q['options']}")
        print(f"Correct Answer: {q['answer']}\n")
        
        # Test correct answer
        print("Submitting correct answer...")
        result = game.submit_answer(q['answer'])
        print(f"Result: {json.dumps(result, indent=2)}\n")
        
        # Test progress
        progress = game.get_progress()
        print(f"Progress: {json.dumps(progress, indent=2)}\n")
        
        # Test wrong answer
        print("Submitting wrong answer...")
        wrong_q = game.get_current_question()
        wrong_result = game.submit_answer("a")
        print(f"Result: {json.dumps(wrong_result, indent=2)}")
    else:
        print("Failed to start game")