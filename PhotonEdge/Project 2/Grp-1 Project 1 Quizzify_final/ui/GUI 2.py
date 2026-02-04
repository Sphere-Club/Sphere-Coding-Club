import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import tkinter as tk
from tkinter import messagebox
from backend.game_engine import QuizGame

class QuizzifyGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Quizzify - Quiz Master")
        self.geometry("450x750")
        self.resizable(False, False)
        
        # Initialize game engine
        self.game = QuizGame()
        
        # Show home screen
        self.home_screen()

    def home_screen(self):
        """Home Screen - Yellow background"""
        self.clear()
        self.configure(bg='#FFC107')
        
        container = tk.Frame(self, bg='#FFC107')
        container.pack(expand=True, fill='both')
        
        # Top spacing
        tk.Label(container, bg='#FFC107', height=2).pack()
        
        # Logo
        logo_frame = tk.Frame(container, bg='#FFE082', width=140, height=140, 
                             relief='solid', bd=3)
        logo_frame.pack(pady=20)
        logo_frame.pack_propagate(False)
        tk.Label(logo_frame, text="💡", font=('Arial', 70), bg='#FFE082').pack(expand=True)
        
        # Wavy line
        tk.Frame(container, bg='#000000', height=3).pack(fill='x', padx=50, pady=10)
        
        # Title
        tk.Label(container, text="QUIZZIFY", 
                font=('Arial Black', 42, 'bold'),
                bg='#FFC107', fg='#8B0000', pady=10).pack()
        
        tk.Label(container, text="LET'S PLAY",
                font=('Arial', 22, 'bold'),
                bg='#FFC107', fg='#000000', pady=5).pack()
        
        tk.Label(container, text="THINK.TAP.SLAY",
                font=('Arial', 16, 'bold'),
                bg='#FFC107', fg='#8B0000', pady=10).pack()
        
        # Spacing
        tk.Label(container, bg='#FFC107', height=2).pack()
        tk.Frame(container, bg='#000000', height=3).pack(fill='x', padx=50, pady=10)
        
        # Play button
        tk.Button(container, text="PLAY NOW",
                 font=('Arial', 18, 'bold'),
                 bg='#000000', fg='#FFC107',
                 activebackground='#333333', activeforeground='#FFC107',
                 relief='raised', bd=6, padx=50, pady=18,
                 cursor='hand2', command=self.start_game).pack(pady=30)

    def start_game(self):
        """Start new game"""
        success = self.game.start_new_game()
        if success:
            self.show_question()
        else:
            messagebox.showerror("Error", "Failed to start game!")

    def show_question(self):
        """Question Screen - Dark red background"""
        self.clear()
        self.configure(bg='#8B0000')
        
        # Get current question
        question_data = self.game.get_current_question()
        
        if not question_data:
            # No more questions, show results
            self.show_results()
            return
        
        container = tk.Frame(self, bg='#8B0000')
        container.pack(expand=True, fill='both', padx=20, pady=20)
        
        # Get difficulty level from backend
        level_name, points_value = self.game.get_current_level()
        
        # Difficulty level header
        tk.Label(container, text=level_name.upper(),
                font=('Arial', 14, 'bold'),
                bg='#8B0000', fg='#FFC107', pady=5).pack()
        
        tk.Frame(container, bg='#FFFFFF', height=2).pack(fill='x', pady=10)
        
        # Question number
        progress = self.game.get_progress()
        q_num = progress["current_question"]
        
        tk.Label(container, text=f"{q_num}.",
                font=('Arial', 14),
                bg='#8B0000', fg='#FFFFFF').pack(pady=5)
        
        # Question text
        tk.Label(container, text=question_data["text"],
                font=('Arial', 16, 'bold'),
                bg='#8B0000', fg='#FFFFFF',
                wraplength=380, justify='center').pack(pady=20)
        
        # Image placeholder
        image_frame = tk.Frame(container, bg='#FFA500', 
                              width=180, height=240, relief='solid', bd=2)
        image_frame.pack(pady=15)
        image_frame.pack_propagate(False)
        tk.Label(image_frame, text="🧍", font=('Arial', 100), bg='#FFA500').pack(expand=True)
        
        # Options in 2x2 grid
        options_frame = tk.Frame(container, bg='#8B0000')
        options_frame.pack(pady=20)
        
        self.selected_option = tk.StringVar()
        self.option_buttons = []
        
        # Get options from backend
        options = question_data["options"]
        option_keys = ['a', 'b', 'c', 'd']
        
        for i, key in enumerate(option_keys):
            row = i // 2
            col = i % 2
            
            btn = tk.Button(options_frame, 
                           text=options[key],
                           font=('Arial', 12, 'bold'),
                           bg='#F5E6D3', fg='#000000',
                           activebackground='#FFC107', activeforeground='#000000',
                           relief='solid', bd=3,
                           width=11, height=2,
                           wraplength=100,
                           cursor='hand2',
                           command=lambda k=key, idx=i: self.select_option(k, idx))
            btn.grid(row=row, column=col, padx=12, pady=12)
            self.option_buttons.append(btn)
        
        # Separator
        tk.Frame(container, bg='#FFFFFF', height=2).pack(fill='x', pady=15)
        
        # Submit button
        self.submit_btn = tk.Button(container, text="SUBMIT",
                                    font=('Arial', 16, 'bold'),
                                    bg='#FFC107', fg='#8B0000',
                                    activebackground='#FF9800', activeforeground='#8B0000',
                                    relief='raised', bd=5,
                                    padx=60, pady=12,
                                    cursor='hand2',
                                    state='disabled',
                                    command=self.submit_answer)
        self.submit_btn.pack(pady=15)

    def select_option(self, key, btn_index):
        """Handle option selection"""
        # Reset all buttons
        for btn in self.option_buttons:
            btn.config(bg='#F5E6D3', fg='#000000')
        
        # Highlight selected
        self.option_buttons[btn_index].config(bg='#FFC107', fg='#000000')
        self.selected_option.set(key)
        self.submit_btn.config(state='normal')

    def submit_answer(self):
        """Submit answer to backend"""
        answer = self.selected_option.get()
        
        if not answer:
            messagebox.showwarning("Warning", "Please select an answer!")
            return
        
        # Submit to backend
        result = self.game.submit_answer(answer)
        
        # Show feedback based on result
        if result["correct"]:
            messagebox.showinfo("✅ Correct!", 
                              f"{result['message']}\n+{result['points_earned']} points!\n\nTotal Score: {result['total_score']}")
        else:
            messagebox.showerror("❌ Wrong!", 
                               f"{result['message']}\n\nGame Over!\nFinal Score: {result['total_score']}")
        
        # Check game status from result
        if result["game_over"]:
            self.show_results()
        else:
            # Continue to next question
            self.show_question()

    def show_results(self):
        """Results Screen - Orange-red background"""
        self.clear()
        self.configure(bg='#FF6347')
        
        # Get final score and progress
        score = self.game.get_score()
        progress = self.game.get_progress()
        max_score = self.game.get_max_possible_score()
        
        container = tk.Frame(self, bg='#FF6347')
        container.pack(expand=True, fill='both', padx=30, pady=30)
        
        # Top spacing
        tk.Label(container, bg='#FF6347', height=1).pack()
        
        # RESULTS title
        results_frame = tk.Frame(container, bg='#FF6347')
        results_frame.pack(pady=20)
        
        tk.Label(results_frame, text="RESULTS",
                font=('Arial Black', 38, 'bold'),
                bg='#FF6347', fg='#FFFFFF',
                relief='solid', bd=4,
                padx=20, pady=10).pack()
        
        # Score card
        score_card = tk.Frame(container, bg='#8B0000', relief='solid', bd=5)
        score_card.pack(pady=25, padx=20, fill='x')
        
        tk.Label(score_card, text="Your Final\nScore is",
                font=('Arial', 15, 'bold'),
                bg='#8B0000', fg='#FFFFFF', pady=15).pack()
        
        # Score circle
        score_circle = tk.Frame(score_card, bg='#FFFFFF',
                               width=130, height=130, relief='solid', bd=3)
        score_circle.pack(pady=10)
        score_circle.pack_propagate(False)
        
        tk.Label(score_circle, text=f"{score}/{max_score}",
                font=('Arial', 22, 'bold'),
                bg='#FFFFFF', fg='#8B0000').pack(expand=True)
        
        # Calculate correct answers (questions answered before wrong answer or completion)
        questions_answered = progress["current_question"]
        if self.game.is_game_over() and self.game.current_index >= len(self.game.questions):
            # All questions answered correctly
            correct_answers = 12
        else:
            # Calculate correct answers from score
            # Easy: 10pts, Medium: 20pts, Hard: 30pts
            # First 4 = Easy, Next 4 = Medium, Last 4 = Hard
            correct_answers = 0
            remaining_score = score
            # Count hard (30pts each)
            if progress["current_question"] > 8:
                hard_correct = min(progress["current_question"] - 8, (remaining_score // 30))
                correct_answers += hard_correct
                remaining_score -= hard_correct * 30
            # Count medium (20pts each)
            if progress["current_question"] > 4:
                medium_correct = min(min(4, progress["current_question"] - 4), (remaining_score // 20))
                correct_answers += medium_correct
                remaining_score -= medium_correct * 20
            # Count easy (10pts each)
            easy_correct = remaining_score // 10
            correct_answers += easy_correct
        
        tk.Label(score_card, 
                text=f"Total Correct answers:\n{correct_answers} out of {questions_answered} Questions",
                font=('Arial', 13, 'bold'),
                bg='#8B0000', fg='#FFC107', pady=15).pack()
        
        # Buttons
        btn_frame = tk.Frame(container, bg='#FF6347')
        btn_frame.pack(pady=25, fill='x')
        
        tk.Button(btn_frame, text="HOME",
                 font=('Arial', 15, 'bold'),
                 bg='#FFFFFF', fg='#8B0000',
                 activebackground='#F0F0F0', activeforeground='#8B0000',
                 relief='raised', bd=5, width=8, height=2,
                 cursor='hand2', command=self.home_screen).pack(side='left', padx=15, expand=True)
        
        tk.Button(btn_frame, text="RESTART",
                 font=('Arial', 15, 'bold'),
                 bg='#FFC107', fg='#8B0000',
                 activebackground='#FF9800', activeforeground='#8B0000',
                 relief='raised', bd=5, width=8, height=2,
                 cursor='hand2', command=self.start_game).pack(side='right', padx=15, expand=True)

    def clear(self):
        """Clear all widgets"""
        for widget in self.winfo_children():
            widget.destroy()

if __name__ == "__main__":
    app = QuizzifyGUI()
    app.mainloop()
