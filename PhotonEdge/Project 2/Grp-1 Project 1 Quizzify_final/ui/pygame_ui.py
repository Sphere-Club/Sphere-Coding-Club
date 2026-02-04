import sys
import pygame
import math
import os

# ============================================
#          BACKEND INTEGRATION (REAL ENGINE)
# ============================================

from backend.game_engine import QuizGame

# ============================================
#    CONFIG: WINDOW, COLORS, FONTS (MOBILE)
# ============================================

pygame.init()
pygame.display.set_caption("Quizzify Mobile")

# Mobile phone dimensions (portrait)
WIDTH, HEIGHT = 480, 750
screen = pygame.display.set_mode((WIDTH, HEIGHT))
clock = pygame.time.Clock()

# ============================================
#    EXACT COLORS FROM SCREENSHOTS
# ============================================

# Start Screen - EXACT matches
COLOR_BG_START_YELLOW = (239, 237, 214)
COLOR_BG_START_CREAM = (255, 252, 240)
COLOR_WAVE_BLACK = (0, 0, 0)
COLOR_WAVE_YELLOW = (252, 202, 27)
COLOR_BULB_GRADIENT_TOP = (255, 230, 100)
COLOR_BULB_GRADIENT_BOTTOM = (255, 160, 50)
COLOR_TITLE_BROWN = (125, 80, 75)
COLOR_TITLE_TEXT = (255, 250, 240)
COLOR_TITLE_SHADOW = (70, 40, 35)
COLOR_LETS_PLAY_BLACK = (0, 0, 0)
COLOR_TAGLINE = (100, 55, 40)
COLOR_TAGLINE_SHADOW = (60, 30, 20)
COLOR_BUTTON_BLACK = (0, 0, 0)
COLOR_BUTTON_WHITE = (255, 255, 255)

# Level difficulty colors
COLOR_EASY = (76, 175, 80)
COLOR_MODERATE = (255, 152, 0)
COLOR_HARD = (244, 67, 54)

# Question Screen - EXACT matches
COLOR_BG_QUESTION_BROWN = (75, 40, 30)
COLOR_QUESTION_CARD_CREAM = (255, 250, 240)
COLOR_QUESTION_TEXT = (30, 15, 10)
COLOR_OPTION_BG_CREAM = (255, 250, 240)
COLOR_OPTION_TEXT = (30, 15, 10)
COLOR_OPTION_BORDER = (220, 200, 180)
COLOR_OPTION_HOVER = (255, 245, 220)
COLOR_SUBMIT_ORANGE = (255, 165, 0)
COLOR_SUBMIT_TEXT = (0, 0, 0)

# Result Screen - EXACT matches
COLOR_RESULT_BG_CENTER = (255, 165, 70)
COLOR_RESULT_BG_OUTER = (255, 100, 50)
COLOR_RESULT_DOTS = (255, 120, 60)
COLOR_RESULTS_BUBBLE = (255, 250, 240)
COLOR_RESULTS_BUBBLE_BORDER = (210, 190, 170)
COLOR_RESULTS_TEXT = (200, 50, 40)
COLOR_RESULT_CARD = (140, 80, 60)
COLOR_RESULT_CARD_INNER = (255, 250, 240)
COLOR_SCORE_LABEL = (255, 200, 80)
COLOR_SCORE_TEXT = (0, 0, 0)
COLOR_CORRECT_LABEL = (255, 200, 80)
COLOR_CORRECT_TEXT = (30, 15, 10)
COLOR_HOME_BUTTON = (255, 250, 240)
COLOR_HOME_TEXT = (30, 15, 10)
COLOR_RESTART_BUTTON = (255, 165, 0)
COLOR_RESTART_TEXT = (0, 0, 0)

# Fonts - Better rendering with proper sizes
font_quizzify = pygame.font.SysFont("arial", 60, bold=True)
font_lets_play = pygame.font.SysFont("arial", 36, bold=True, italic=True)
font_tagline = pygame.font.SysFont("arial", 19, bold=True)
font_button = pygame.font.SysFont("arial", 20, bold=True)
font_question_num = pygame.font.SysFont("arial", 2, bold=True)
font_question = pygame.font.SysFont("arial", 28, bold=True)
font_option = pygame.font.SysFont("arial", 24, bold=False)
font_submit = pygame.font.SysFont("arial", 20, bold=False)
font_results_title = pygame.font.SysFont("arial", 40, bold=True)
font_result_label = pygame.font.SysFont("arial", 24, bold=False)
font_result_score = pygame.font.SysFont("arial", 52, bold=True)
font_result_correct = pygame.font.SysFont("arial", 24, bold=False)
font_level = pygame.font.SysFont("arial", 18, bold=True)

# Load bulb image with multiple path attempts
bulb_image = None
possible_paths = [
    "assets/bullb.png",
    "bullb.png",
    os.path.join("Assets", "bulb.png"),
    os.path.join("assets", "bulb.png")
]
for path in possible_paths:
    if os.path.exists(path):
        try:
            bulb_image = pygame.image.load(path)
            bulb_image = pygame.transform.scale(bulb_image, (100, 100))
            print(f"✅ Bulb image loaded from: {path}")
            break
        except Exception as e:
            print(f" Error loading {path}: {e}")
            continue

if bulb_image is None:
    print("WARNING: bulb.png not found. Using fallback drawing.")
    print(f"Current directory: {os.getcwd()}")
    print(f"Tried paths: {possible_paths}")

# ============================================
#      BACKEND ADAPTER
# ============================================

def create_game(topic: str = "General Knowledge") -> QuizGame:
    game = QuizGame()
    ok = game.start_new_game(topic=topic)
    if not ok:
        raise RuntimeError("start_new_game() failed")
    return game

def load_current_question(game: QuizGame):
    q = game.get_current_question()
    if q is None:
        return "No questions available.", ["", "", "", ""]
    text = q["text"]
    opts = q["options"]
    options_list = [
        opts.get("a", ""),
        opts.get("b", ""),
        opts.get("c", ""),
        opts.get("d", ""),
    ]
    return text, options_list

def submit_answer_and_check(game: QuizGame, selected_index: int) -> bool:
    idx_to_choice = {0: "a", 1: "b", 2: "c", 3: "d"}
    choice = idx_to_choice[selected_index]
    result = game.submit_answer(choice)
    return result["game_over"]

def get_result_stats(game: QuizGame):
    score = game.get_score()
    max_score = game.get_max_possible_score()
    total_questions = len(game.questions)
    correct_count = game.current_index
    return score, max_score, correct_count, total_questions

def get_level_info(question_number):
    """Get level name and color based on question number."""
    if 1 <= question_number <= 4:
        return "EASY", COLOR_EASY
    elif 5 <= question_number <= 8:
        return "MODERATE", COLOR_MODERATE
    elif 9 <= question_number <= 12:
        return "HARD", COLOR_HARD
    else:
        return "EASY", COLOR_EASY

# ============================================
#           MOBILE LAYOUT RECTS
# ============================================

# Start screen (mobile)
START_BULB_CENTER = (WIDTH // 2, 140)
START_TITLE_BOX = pygame.Rect(WIDTH // 2 - 200, 230, 400, 70)
START_LETS_PLAY_Y = 340
START_TAGLINE_Y = 385
START_BUTTON = pygame.Rect(WIDTH // 2 - 120, HEIGHT - 150, 240, 65)

# Question screen (mobile - vertical stack)
QUESTION_CARD = pygame.Rect(30, 80, WIDTH - 60, 160)
LEVEL_BADGE = pygame.Rect(WIDTH // 2 - 60, 15, 120, 35)

OPTION_W = WIDTH - 80
OPTION_H = 65
OPTION_GAP_Y = 15

OPTION_RECTS = [
    pygame.Rect(40, 270, OPTION_W, OPTION_H),
    pygame.Rect(40, 270 + OPTION_H + OPTION_GAP_Y, OPTION_W, OPTION_H),
    pygame.Rect(40, 270 + 2 * (OPTION_H + OPTION_GAP_Y), OPTION_W, OPTION_H),
    pygame.Rect(40, 270 + 3 * (OPTION_H + OPTION_GAP_Y), OPTION_W, OPTION_H),
]

SUBMIT_BUTTON = pygame.Rect(WIDTH // 2 - 120, HEIGHT - 90, 240, 55)

# Result screen (mobile)
RESULTS_BUBBLE = pygame.Rect(WIDTH // 2 - 140, 60, 280, 80)
RESULT_OUTER_CARD = pygame.Rect(30, 180, WIDTH - 60, 380)
RESULT_INNER_CARD = pygame.Rect(45, 195, WIDTH - 90, 350)
RESULT_HOME = pygame.Rect(WIDTH // 2 - 190, HEIGHT - 110, 160, 55)
RESULT_RESTART = pygame.Rect(WIDTH // 2 + 30, HEIGHT - 110, 160, 55)

# ============================================
#             ENHANCED DRAW HELPERS
# ============================================

def draw_smooth_wave_with_fill(surface, y_position, amplitude, wavelength, line_color, fill_color, thickness, is_top=True):
    """Draw a smooth sine wave with yellow fill above/below."""
    points = []
    for x in range(WIDTH + 10):
        y_offset = amplitude * math.sin(2 * math.pi * x / wavelength)
        if is_top:
            y = y_position + y_offset
        else:
            y = y_position - y_offset
        points.append((x, y))
    if is_top:
        fill_points = [(0, 0)] + points + [(WIDTH, 0)]
        pygame.draw.polygon(surface, fill_color, fill_points)
    else:
        fill_points = [(0, HEIGHT)] + points + [(WIDTH, HEIGHT)]
        pygame.draw.polygon(surface, fill_color, fill_points)
    if len(points) > 1:
        pygame.draw.lines(surface, line_color, False, points, thickness)

def draw_grid_pattern(surface, grid_size=30, line_color=(240, 240, 230), line_width=1):
    """Draw subtle grid pattern."""
    for x in range(0, WIDTH, grid_size):
        pygame.draw.line(surface, line_color, (x, 0), (x, HEIGHT), line_width)
    for y in range(0, HEIGHT, grid_size):
        pygame.draw.line(surface, line_color, (0, y), (WIDTH, y), line_width)

def draw_bulb_fallback(surface, center, radius=35):
    """Fallback: Draw bulb with gradient if image not available."""
    for r in range(radius, 0, -2):
        ratio = r / radius
        r_color = int(COLOR_BULB_GRADIENT_TOP[0] * (1 - ratio) + COLOR_BULB_GRADIENT_BOTTOM[0] * ratio)
        g_color = int(COLOR_BULB_GRADIENT_TOP[1] * (1 - ratio) + COLOR_BULB_GRADIENT_BOTTOM[1] * ratio)
        b_color = int(COLOR_BULB_GRADIENT_TOP[2] * (1 - ratio) + COLOR_BULB_GRADIENT_BOTTOM[2] * ratio)
        pygame.draw.circle(surface, (r_color, g_color, b_color), center, r)
    base_rect = pygame.Rect(center[0] - 12, center[1] + radius - 8, 24, 12)
    pygame.draw.rect(surface, (120, 80, 150), base_rect, border_radius=3)
    ray_length = 30
    dash_length = 8
    gap_length = 4
    ray_color = (255, 180, 60)
    ray_positions = [0, 45, 90, 135, 180, 225, 270, 315]
    for angle in ray_positions:
        rad = math.radians(angle)
        start_dist = radius + 8
        for dash_start in range(0, ray_length, dash_length + gap_length):
            dash_end = min(dash_start + dash_length, ray_length)
            start_x = center[0] + (start_dist + dash_start) * math.cos(rad)
            start_y = center[1] + (start_dist + dash_start) * math.sin(rad)
            end_x = center[0] + (start_dist + dash_end) * math.cos(rad)
            end_y = center[1] + (start_dist + dash_end) * math.sin(rad)
            pygame.draw.line(surface, ray_color, (start_x, start_y), (end_x, end_y), 5)

def draw_bulb_image(surface, center):
    """Draw bulb from image file or fallback to drawing."""
    if bulb_image:
        rect = bulb_image.get_rect(center=center)
        surface.blit(bulb_image, rect)
    else:
        draw_bulb_fallback(surface, center, radius=35)

def draw_text_with_border(surface, text, font, text_color, border_color, center, border_width=2):
    """Draw text with CLEAN border."""
    text_surf = font.render(text, True, text_color)
    text_rect = text_surf.get_rect(center=center)
    offsets = [(-border_width, 0), (border_width, 0), (0, -border_width), (0, border_width)]
    for dx, dy in offsets:
        border_surf = font.render(text, True, border_color)
        border_rect = border_surf.get_rect(center=(center[0] + dx, center[1] + dy))
        surface.blit(border_surf, border_rect)
    surface.blit(text_surf, text_rect)

def draw_text_with_drop_shadow(surface, text, font, text_color, shadow_color, center, shadow_offset=(2, 2)):
    """Draw text with subtle drop shadow."""
    shadow_surf = font.render(text, True, shadow_color)
    shadow_rect = shadow_surf.get_rect(center=(center[0] + shadow_offset[0], center[1] + shadow_offset[1]))
    surface.blit(shadow_surf, shadow_rect)
    text_surf = font.render(text, True, text_color)
    text_rect = text_surf.get_rect(center=center)
    surface.blit(text_surf, text_rect)

def draw_round_rect(surface, rect, color, radius=15, border_color=None, border_width=0):
    """Draw rounded rectangle."""
    pygame.draw.rect(surface, color, rect, border_radius=radius)
    if border_color and border_width > 0:
        pygame.draw.rect(surface, border_color, rect, border_width, border_radius=radius)

def draw_text_center(surface, text, font, color, center):
    """Draw centered text."""
    surf = font.render(text, True, color)
    rect = surf.get_rect(center=center)
    surface.blit(surf, rect)

def wrap_text(text, font, max_width):
    """Wrap text to fit width."""
    words = text.split()
    lines = []
    current = ""
    for w in words:
        test = (current + " " + w).strip()
        if font.size(test)[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines

def draw_multiline_center(surface, text, font, color, rect):
    """Draw multi-line centered text."""
    lines = wrap_text(text, font, rect.width - 30)
    line_h = font.get_linesize()
    total_h = len(lines) * line_h
    start_y = rect.centery - total_h // 2
    for i, line in enumerate(lines):
        surf = font.render(line, True, color)
        line_rect = surf.get_rect(center=(rect.centerx, start_y + i * line_h))
        surface.blit(surf, line_rect)

def draw_sunburst_background(surface, center, inner_color, outer_color, num_rays=16):
    """Draw comic-style sunburst background."""
    max_distance = max(WIDTH, HEIGHT) * 1.5
    for i in range(num_rays * 2):
        angle_start = (360 / (num_rays * 2)) * i
        angle_end = (360 / (num_rays * 2)) * (i + 1)
        color = inner_color if i % 2 == 0 else outer_color
        points = [
            center,
            (center[0] + max_distance * math.cos(math.radians(angle_start)),
             center[1] + max_distance * math.sin(math.radians(angle_start))),
            (center[0] + max_distance * math.cos(math.radians(angle_end)),
             center[1] + max_distance * math.sin(math.radians(angle_end)))
        ]
        pygame.draw.polygon(surface, color, points)

def draw_speech_bubble(surface, rect, color, border_color, border_width=3):
    """Draw comic-style speech bubble."""
    pygame.draw.ellipse(surface, color, rect)
    pygame.draw.ellipse(surface, border_color, rect, border_width)
    star_positions = [(rect.left + 25, rect.top + 15), (rect.right - 25, rect.top + 15)]
    for pos in star_positions:
        draw_star(surface, pos, 10, border_color)

def draw_star(surface, center, size, color):
    """Draw a simple star shape."""
    points = []
    for i in range(10):
        angle = math.radians(36 * i)
        radius = size if i % 2 == 0 else size // 2
        x = center[0] + radius * math.cos(angle - math.pi / 2)
        y = center[1] + radius * math.sin(angle - math.pi / 2)
        points.append((x, y))
    pygame.draw.polygon(surface, color, points)

# ============================================
#             SCREEN DRAWS (MOBILE)
# ============================================

def draw_start_screen():
    """Draw mobile start screen."""
    screen.fill(COLOR_BG_START_YELLOW)
    draw_grid_pattern(screen, grid_size=40, line_color=(247, 228, 196))
    draw_smooth_wave_with_fill(screen, 30, 20, 150, COLOR_WAVE_BLACK, COLOR_WAVE_YELLOW, 10, is_top=True)
    draw_smooth_wave_with_fill(screen, HEIGHT - 30, 20, 150, COLOR_WAVE_BLACK, COLOR_WAVE_YELLOW, 10, is_top=False)
    draw_bulb_image(screen, START_BULB_CENTER)
    draw_text_center(screen, "QUIZZIFY", font_quizzify, COLOR_TITLE_BROWN, START_TITLE_BOX.center)
    draw_text_with_drop_shadow(screen, "LET'S PLAY", font_lets_play, COLOR_LETS_PLAY_BLACK, (120, 120, 120), (WIDTH // 2, START_LETS_PLAY_Y), shadow_offset=(2, 2))
    draw_text_with_drop_shadow(screen, "THINK.TAP.SLAY", font_tagline, COLOR_TAGLINE, COLOR_TAGLINE_SHADOW, (WIDTH // 2, START_TAGLINE_Y), shadow_offset=(1, 1))
    draw_round_rect(screen, START_BUTTON, COLOR_BUTTON_BLACK, radius=35)
    draw_text_center(screen, "PLAY NOW", font_button, COLOR_BUTTON_WHITE, START_BUTTON.center)

def draw_question_screen(question_text, options, selected_option, question_number):
    """Draw mobile question screen with a glowing selection effect."""
    screen.fill(COLOR_BG_QUESTION_BROWN)

    # level badge
    level_name, level_color = get_level_info(question_number)
    draw_round_rect(screen, LEVEL_BADGE, level_color, radius=18)
    draw_text_center(screen, level_name, font_level, (255, 255, 255), LEVEL_BADGE.center)

    # question card
    draw_round_rect(screen, QUESTION_CARD, COLOR_QUESTION_CARD_CREAM, radius=18, border_color=COLOR_OPTION_BORDER, border_width=2)

    # question number
    q_num_text = f"{question_number}. "
    text_surf = font_question_num.render(q_num_text, True, COLOR_QUESTION_TEXT)
    screen.blit(text_surf, (QUESTION_CARD.left + 20, QUESTION_CARD.top + 15))

    draw_multiline_center(screen, question_text, font_question, COLOR_QUESTION_TEXT, QUESTION_CARD)

    # ---- Glow effect for selected option ----
    # Use a pulsing alpha to make the glow look alive
    t = pygame.time.get_ticks() / 1000.0
    pulse = (math.sin(t * 4.0) + 1.0) / 2.0  # 0..1
    base_alpha = 80
    pulse_alpha = int(base_alpha + pulse * 100)  # ranges roughly 80..180

    for idx, rect in enumerate(OPTION_RECTS):
        # if selected, draw glow first (behind the option)
        if idx == selected_option:
            # create a transparent surface slightly larger than rect
            halo_w = rect.width + 40
            halo_h = rect.height + 40
            halo = pygame.Surface((halo_w, halo_h), pygame.SRCALPHA)
            # radial-ish multi-layer glow (three layers with decreasing size/alpha)
            layer_colors = [
                (255, 200, 0, max(40, int(pulse_alpha * 0.35))),
                (255, 210, 50, max(30, int(pulse_alpha * 0.25))),
                (255, 230, 120, max(20, int(pulse_alpha * 0.15))),
            ]
            # outer
            pygame.draw.rect(halo, layer_colors[0], halo.get_rect(), border_radius=24)
            # middle (slightly smaller)
            inner_rect = pygame.Rect(8, 8, halo_w - 16, halo_h - 16)
            pygame.draw.rect(halo, layer_colors[1], inner_rect, border_radius=20)
            # inner faint
            inner_rect2 = pygame.Rect(14, 14, halo_w - 28, halo_h - 28)
            pygame.draw.rect(halo, layer_colors[2], inner_rect2, border_radius=16)
            # blit halo so it centers behind option rect
            halo_pos = (rect.x - (halo_w - rect.width) // 2, rect.y - (halo_h - rect.height) // 2)
            screen.blit(halo, halo_pos)

            bg_color = COLOR_OPTION_HOVER
            border_col = COLOR_OPTION_BORDER
            border_w = 3
        else:
            bg_color = COLOR_OPTION_BG_CREAM
            border_col = COLOR_OPTION_BORDER
            border_w = 2

        draw_round_rect(screen, rect, bg_color, radius=12, border_color=border_col, border_width=border_w)

        if idx < len(options):
            draw_multiline_center(screen, options[idx], font_option, COLOR_OPTION_TEXT, rect)

    # submit button
    draw_round_rect(screen, SUBMIT_BUTTON, COLOR_SUBMIT_ORANGE, radius=28)
    draw_text_center(screen, "SUBMIT", font_submit, COLOR_SUBMIT_TEXT, SUBMIT_BUTTON.center)

def draw_result_screen(score, max_score, correct_count, total_questions):
    """Draw mobile result screen."""
    draw_sunburst_background(screen, (WIDTH // 2, HEIGHT // 2), COLOR_RESULT_BG_CENTER, COLOR_RESULT_BG_OUTER, num_rays=16)

    dots_surface = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    for x in range(0, WIDTH, 20):
        for y in range(0, HEIGHT, 20):
            pygame.draw.circle(dots_surface, (*COLOR_RESULT_DOTS, 30), (x, y), 2)
    screen.blit(dots_surface, (0, 0))

    draw_speech_bubble(screen, RESULTS_BUBBLE, COLOR_RESULTS_BUBBLE, COLOR_RESULTS_BUBBLE_BORDER)
    draw_text_center(screen, "RESULTS", font_results_title, COLOR_RESULTS_TEXT, RESULTS_BUBBLE.center)

    draw_round_rect(screen, RESULT_OUTER_CARD, COLOR_RESULT_CARD, radius=22)
    draw_round_rect(screen, RESULT_INNER_CARD, COLOR_RESULT_CARD_INNER, radius=18)

    draw_text_center(screen, "Your Final Score is", font_result_label, COLOR_SCORE_LABEL, (RESULT_INNER_CARD.centerx, RESULT_INNER_CARD.top + 45))

    score_text = f"{score}/{max_score}"
    score_bg = pygame.Rect(RESULT_INNER_CARD.centerx - 80, RESULT_INNER_CARD.top + 85, 160, 70)
    pygame.draw.ellipse(screen, (255, 255, 245), score_bg)
    pygame.draw.ellipse(screen, COLOR_RESULTS_BUBBLE_BORDER, score_bg, 2)
    draw_text_center(screen, score_text, font_result_score, COLOR_SCORE_TEXT, (RESULT_INNER_CARD.centerx, RESULT_INNER_CARD.top + 120))

    draw_text_center(screen, "Total Correct answers:", font_result_label, COLOR_CORRECT_LABEL, (RESULT_INNER_CARD.centerx, RESULT_INNER_CARD.bottom - 90))

    correct_text = f"{correct_count} out of {total_questions} Questions"
    draw_text_center(screen, correct_text, font_result_correct, COLOR_CORRECT_TEXT, (RESULT_INNER_CARD.centerx, RESULT_INNER_CARD.bottom - 60))

    draw_round_rect(screen, RESULT_HOME, COLOR_HOME_BUTTON, radius=28, border_color=COLOR_RESULTS_BUBBLE_BORDER, border_width=2)
    draw_text_center(screen, "HOME", font_button, COLOR_HOME_TEXT, RESULT_HOME.center)

    draw_round_rect(screen, RESULT_RESTART, COLOR_RESTART_BUTTON, radius=28)
    draw_text_center(screen, "RESTART", font_button, COLOR_RESTART_TEXT, RESULT_RESTART.center)

# ============================================
#             MAIN LOOP
# ============================================

def run_quiz_ui():
    """Main UI loop."""
    state = "start"
    selected_option = None
    current_question_num = 1

    game = create_game()
    question_text, options = load_current_question(game)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False

            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                mx, my = event.pos

                if state == "start":
                    if START_BUTTON.collidepoint(mx, my):
                        current_question_num = 1
                        question_text, options = load_current_question(game)
                        state = "question"

                elif state == "question":
                    for idx, rect in enumerate(OPTION_RECTS):
                        if rect.collidepoint(mx, my):
                            selected_option = idx

                    if SUBMIT_BUTTON.collidepoint(mx, my) and selected_option is not None:
                        game_over = submit_answer_and_check(game, selected_option)
                        selected_option = None

                        if game_over:
                            state = "result"
                        else:
                            current_question_num += 1
                            question_text, options = load_current_question(game)

                elif state == "result":
                    if RESULT_HOME.collidepoint(mx, my):
                        game = create_game()
                        current_question_num = 1
                        question_text, options = load_current_question(game)
                        selected_option = None
                        state = "start"

                    elif RESULT_RESTART.collidepoint(mx, my):
                        game = create_game()
                        current_question_num = 1
                        question_text, options = load_current_question(game)
                        selected_option = None
                        state = "question"

        if state == "start":
            draw_start_screen()
        elif state == "question":
            draw_question_screen(question_text, options, selected_option, current_question_num)
        elif state == "result":
            score, max_score, correct_count, total_questions = get_result_stats(game)
            draw_result_screen(score, max_score, correct_count, total_questions)

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    run_quiz_ui()