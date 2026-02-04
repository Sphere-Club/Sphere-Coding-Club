# ------------------------------------------------------------------------------
# Installation Guide:
# 
# This application requires the 'customtkinter', 'tkinter', 'tkcalendar' libraries.
# You can install it using pip:
# 
# pip install customtkinter
# pip install tkinter
# pip install tkcalendar
# ------------------------------------------------------------------------------

import customtkinter as ctk
import tkinter as tk
from tkinter import ttk, messagebox as mb
import json
import os
import uuid
import calendar
from datetime import datetime, date
from functools import partial

# Try to import Pillow for GIF resizing/animation; fallback gracefully if not installed
try:
    from PIL import Image, ImageTk, ImageSequence
    PIL_AVAILABLE = True
except Exception:
    PIL_AVAILABLE = False

# ----------------------
# Config / Appearance
# ----------------------
DATA_FILE = "data.json"
GIF_PATH = "/mnt/data/check.gif"  # uploaded gif path (provided)
SPLASH_SECONDS = 7.0  # splash duration in seconds

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("dark-blue")


# ----------------------
# JSON helpers
# ----------------------
def load_data():
    if not os.path.exists(DATA_FILE):
        return {"users": {}}
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"users": {}}


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def ensure_user(data, username):
    if username not in data["users"]:
        data["users"][username] = {"password": "", "projects": {}, "project_count": 0}


# ----------------------
# Business logic
# ----------------------
def create_account(data, username, password):
    if username in data["users"]:
        return False, "Username already exists."
    data["users"][username] = {"password": password, "projects": {}, "project_count": 0}
    save_data(data)
    return True, "Account created."


def check_login(data, username, password):
    if username not in data["users"]:
        return False, "No such user."
    if data["users"][username]["password"] != password:
        return False, "Incorrect password."
    return True, "Login successful."


def create_project(data, username, project_name):
    ensure_user(data, username)
    pid = str(uuid.uuid4())
    project = {"id": pid, "name": project_name, "tasks": [], "status": "not completed"}
    data["users"][username]["projects"][pid] = project
    data["users"][username]["project_count"] = data["users"][username].get("project_count", 0) + 1
    save_data(data)
    return pid


def delete_project(data, username, pid):
    user = data["users"].get(username)
    if not user or pid not in user["projects"]:
        return False
    del user["projects"][pid]
    user["project_count"] = max(0, user.get("project_count", 0) - 1)
    save_data(data)
    return True


def add_task(data, username, pid, title, desc, priority, due_date_str):
    user = data["users"].get(username)
    if not user:
        return None
    project = user["projects"].get(pid)
    if not project:
        return None
    tid = str(uuid.uuid4())
    task = {
        "id": tid,
        "title": title,
        "desc": desc,
        "priority": priority,
        "due_date": due_date_str,
        "status": "pending",
    }
    project["tasks"].append(task)
    update_project_status(project)
    save_data(data)
    return tid


def remove_task(data, username, pid, tid):
    user = data["users"].get(username)
    if not user:
        return False
    project = user["projects"].get(pid)
    if not project:
        return False
    project["tasks"] = [t for t in project["tasks"] if t["id"] != tid]
    update_project_status(project)
    save_data(data)
    return True


def update_task_status(data, username, pid, tid, status):
    user = data["users"].get(username)
    if not user:
        return False
    project = user["projects"].get(pid)
    if not project:
        return False
    for t in project["tasks"]:
        if t["id"] == tid:
            t["status"] = status
            update_project_status(project)
            save_data(data)
            return True
    return False


def edit_task(data, username, pid, tid, title, desc, priority, due_date_str):
    user = data["users"].get(username)
    project = user["projects"].get(pid)
    if not project:
        return False
    for t in project["tasks"]:
        if t["id"] == tid:
            t.update({"title": title, "desc": desc, "priority": priority, "due_date": due_date_str})
            update_project_status(project)
            save_data(data)
            return True
    return False


def update_project_status(project):
    tasks = project.get("tasks", [])
    if not tasks:
        project["status"] = "not completed"
        return
    if all(t.get("status") == "completed" for t in tasks):
        project["status"] = "completed"
    else:
        project["status"] = "not completed"


# ----------------------
# Utilities
# ----------------------
def valid_date(s):
    try:
        if not s:
            return True  # empty date allowed (means no due date)
        datetime.strptime(s, "%Y-%m-%d")
        return True
    except Exception:
        return False


def parse_date(s):
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except Exception:
        return None


def is_overdue(task):
    due = parse_date(task.get("due_date", "") or "")
    if due is None:
        return False
    if task.get("status") == "completed":
        return False
    return date.today() > due


def priority_value(p):
    mapping = {"High": 3, "Medium": 2, "Low": 1}
    return mapping.get(p, 0)


def sort_tasks(tasks, mode="priority"):
    if mode == "priority":
        return sorted(tasks, key=lambda t: (-priority_value(t.get("priority")), t.get("due_date") or ""))
    if mode == "due":
        def key(t):
            d = parse_date(t.get("due_date", "") or "")
            return (d is None, d or date.max, -priority_value(t.get("priority")))
        return sorted(tasks, key=key)
    if mode == "status":
        return sorted(tasks, key=lambda t: (t.get("status") != "completed", t.get("due_date") or ""))
    return tasks


# ----------------------
# GUI: App / Screens
# ----------------------
class TaskTrackerApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Task Tracker (CustomTkinter)")
        self.geometry("980x620")
        self.minsize(860, 520)

        # app data / state
        self.data = load_data()
        self.current_user = None
        self.current_project_id = None
        self.current_sort_mode = "priority"  # priority / due / status

        # container frames
        self.container = ctk.CTkFrame(self, fg_color="transparent")
        self.container.pack(fill="both", expand=True)

        # frames dictionary
        self.frames = {}
        # include LoadingFrame first
        for F in (LoadingFrame, StartFrame, LoginFrame, SignupFrame, HomeFrame, CreateProjectFrame, ProjectViewFrame):
            frame = F(parent=self.container, app=self)
            self.frames[F.__name__] = frame
            frame.place(relx=0, rely=0, relwidth=1, relheight=1)

        # show loading first (no fade from nothing)
        self.show_frame("LoadingFrame", fade=False)

    def show_frame(self, name, fade=False):
        """Bring frame to front. If fade True, do a small fade animation."""
        frame = self.frames[name]
        frame.refresh()
        if fade:
            self._fade_to_frame(frame)
        else:
            frame.lift()

    def _fade_to_frame(self, frame, steps=6, delay=25):
        # simple fade-out -> lift frame -> fade-in
        try:
            a0 = self.attributes("-alpha")
            if a0 is None:
                a0 = 1.0
        except Exception:
            a0 = 1.0

        def fade_out(step=0):
            if step >= steps:
                frame.lift()
                fade_in(0)
                return
            try:
                self.attributes("-alpha", a0 * (1 - step / steps))
            except Exception:
                pass
            self.after(delay, lambda: fade_out(step + 1))

        def fade_in(step=0):
            if step >= steps:
                try:
                    self.attributes("-alpha", a0)
                except Exception:
                    pass
                return
            try:
                self.attributes("-alpha", a0 * (step / steps))
            except Exception:
                pass
            self.after(delay, lambda: fade_in(step + 1))

        fade_out(0)


# Base Frame with helper styling
class BaseFrame(ctk.CTkFrame):
    def __init__(self, parent, app):
        super().__init__(parent, fg_color="#222327")
        self.app = app

    def refresh(self):
        pass

    @staticmethod
    def make_hover(widget, normal_color, hover_color):
        def on_enter(e):
            try:
                widget.configure(fg_color=hover_color)
            except Exception:
                pass

        def on_leave(e):
            try:
                widget.configure(fg_color=normal_color)
            except Exception:
                pass

        widget.bind("<Enter>", on_enter)
        widget.bind("<Leave>", on_leave)


# ----------------------
# Loading / Splash Frame
# ----------------------
class LoadingFrame(BaseFrame):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        # center layout
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)

        content = ctk.CTkFrame(self, fg_color="transparent")
        content.grid(row=0, column=0, sticky="nsew")

        # image placeholder
        self.img_label = tk.Label(content, bg="#222327")
        self.img_label.pack(pady=(48, 12))

        # loading text
        self.loading_text = ctk.CTkLabel(content, text="Loading application...", font=ctk.CTkFont(size=14))
        self.loading_text.pack(pady=(6, 8))

        # progress bar (customtkinter)
        self.progress = ctk.CTkProgressBar(content, width=420)
        self.progress.set(0.0)
        self.progress.pack(pady=(4, 12))

        # small note text
        self.note = ctk.CTkLabel(content, text="Preparing your workspace...", font=ctk.CTkFont(size=10))
        self.note.pack(pady=(4, 24))

        # animation state
        self._gif_frames = []
        self._gif_index = 0
        self._progress_steps = max(1, int(SPLASH_SECONDS * 60))  # 60 updates / sec smooth
        self._current_step = 0
        self._after_id = None

        # Try to load GIF and prepare frames
        self._load_gif(GIF_PATH, target_size=(220, 220))

    def _load_gif(self, path, target_size=(220, 220)):
        if not os.path.exists(path):
            # nothing to show
            return
        try:
            if PIL_AVAILABLE:
                pil_img = Image.open(path)
                frames = []
                for frame in ImageSequence.Iterator(pil_img):
                    frame = frame.convert("RGBA")
                    frame.thumbnail(target_size, Image.LANCZOS)
                    frames.append(ImageTk.PhotoImage(frame))
                if frames:
                    self._gif_frames = frames
            else:
                img = tk.PhotoImage(file=path)
                self._gif_frames = [img]
        except Exception:
            try:
                img = tk.PhotoImage(file=path)
                self._gif_frames = [img]
            except Exception:
                self._gif_frames = []

    def refresh(self):
        # start the splash animation & progress when this frame is shown
        self._gif_index = 0
        self._current_step = 0
        self.progress.set(0.0)
        self.loading_text.configure(text="Loading application...")
        if self._after_id:
            try:
                self.after_cancel(self._after_id)
            except Exception:
                pass
        self._start_time = datetime.now()
        self._start_animation_loop()

    def _start_animation_loop(self):
        if self._gif_frames:
            frame = self._gif_frames[self._gif_index % len(self._gif_frames)]
            self.img_label.image = frame
            self.img_label.configure(image=frame)
            self._gif_index += 1

        self._current_step += 1
        fraction = min(1.0, self._current_step / float(self._progress_steps))
        try:
            self.progress.set(fraction)
        except Exception:
            pass

        perc = int(fraction * 100)
        self.loading_text.configure(text=f"Loading application... {perc}%")

        elapsed = (datetime.now() - self._start_time).total_seconds()
        if elapsed >= SPLASH_SECONDS:
            self.after(150, lambda: self.app.show_frame("StartFrame", fade=True))
            return
        self._after_id = self.after(int(1000 / 60), self._start_animation_loop)


# ---------- Start Frame ----------
class StartFrame(BaseFrame):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        title = ctk.CTkLabel(self, text="Task Tracker", font=ctk.CTkFont(size=28, weight="bold"))
        title.pack(pady=(36, 6))
        subtitle = ctk.CTkLabel(self, text="Projects · Tasks · Due dates · Priorities", font=ctk.CTkFont(size=12))
        subtitle.pack(pady=(0, 20))

        btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        btn_frame.pack(pady=10)

        b1 = ctk.CTkButton(btn_frame, text="Login", width=140, command=lambda: app.show_frame("LoginFrame", fade=True))
        b2 = ctk.CTkButton(btn_frame, text="Create Account", width=180, command=lambda: app.show_frame("SignupFrame", fade=True))
        b3 = ctk.CTkButton(btn_frame, text="Exit", width=120, command=self.quit)

        b1.grid(row=0, column=0, padx=8)
        b2.grid(row=0, column=1, padx=8)
        b3.grid(row=0, column=2, padx=8)

        for b in (b1, b2, b3):
            BaseFrame.make_hover(b, normal_color=b._fg_color, hover_color="#2a8bd8")

        hint = ctk.CTkLabel(self, text="Tip: use YYYY-MM-DD for due dates. Leave blank for no due date.", font=ctk.CTkFont(size=10))
        hint.pack(pady=(16, 0))


# ---------- Login Frame ----------
class LoginFrame(BaseFrame):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        header = ctk.CTkLabel(self, text="Login", font=ctk.CTkFont(size=20, weight="bold"))
        header.pack(pady=(24, 8))

        form = ctk.CTkFrame(self, fg_color="transparent")
        form.pack(pady=6)

        lbl_user = ctk.CTkLabel(form, text="Username:")
        lbl_user.grid(row=0, column=0, padx=6, pady=6, sticky="e")
        self.ent_user = ctk.CTkEntry(form, width=320)
        self.ent_user.grid(row=0, column=1, padx=6, pady=6)

        lbl_pass = ctk.CTkLabel(form, text="Password:")
        lbl_pass.grid(row=1, column=0, padx=6, pady=6, sticky="e")
        self.ent_pass = ctk.CTkEntry(form, width=320, show="*")
        self.ent_pass.grid(row=1, column=1, padx=6, pady=6)

        btns = ctk.CTkFrame(self, fg_color="transparent")  # keep buttons outside 'form' to avoid mix
        btns.pack(pady=(8, 0))
        b_login = ctk.CTkButton(btns, text="Login", width=120, command=self.do_login)
        b_back = ctk.CTkButton(btns, text="Back", width=120, command=lambda: app.show_frame("StartFrame", fade=True))
        b_login.grid(row=0, column=0, padx=8)
        b_back.grid(row=0, column=1, padx=8)
        BaseFrame.make_hover(b_login, normal_color=b_login._fg_color, hover_color="#339966")
        BaseFrame.make_hover(b_back, normal_color=b_back._fg_color, hover_color="#2a8bd8")

    def do_login(self):
        user = self.ent_user.get().strip()
        pwd = self.ent_pass.get().strip()
        ok, msg = check_login(self.app.data, user, pwd)
        if ok:
            self.app.current_user = user
            mb.showinfo("Welcome", msg)
            self.app.show_frame("HomeFrame", fade=True)
        else:
            mb.showerror("Login failed", msg)

    def refresh(self):
        self.ent_user.delete(0, "end")
        self.ent_pass.delete(0, "end")


# ---------- Signup Frame ----------
class SignupFrame(BaseFrame):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        header = ctk.CTkLabel(self, text="Create Account", font=ctk.CTkFont(size=20, weight="bold"))
        header.pack(pady=(24, 8))

        form = ctk.CTkFrame(self, fg_color="transparent")
        form.pack(pady=6)

        ctk.CTkLabel(form, text="Username:").grid(row=0, column=0, padx=6, pady=6, sticky="e")
        self.ent_user = ctk.CTkEntry(form, width=320)
        self.ent_user.grid(row=0, column=1, padx=6, pady=6)

        ctk.CTkLabel(form, text="Password:").grid(row=1, column=0, padx=6, pady=6, sticky="e")
        self.ent_pass = ctk.CTkEntry(form, width=320, show="*")
        self.ent_pass.grid(row=1, column=1, padx=6, pady=6)

        btns = ctk.CTkFrame(self, fg_color="transparent")
        btns.pack(pady=(8, 0))
        b_create = ctk.CTkButton(btns, text="Create", width=120, command=self.do_create)
        b_back = ctk.CTkButton(btns, text="Back", width=120, command=lambda: app.show_frame("StartFrame", fade=True))
        b_create.grid(row=0, column=0, padx=8)
        b_back.grid(row=0, column=1, padx=8)
        BaseFrame.make_hover(b_create, normal_color=b_create._fg_color, hover_color="#339966")
        BaseFrame.make_hover(b_back, normal_color=b_back._fg_color, hover_color="#2a8bd8")

    def do_create(self):
        user = self.ent_user.get().strip()
        pwd = self.ent_pass.get().strip()
        if not user or not pwd:
            mb.showerror("Error", "Provide username and password.")
            return
        ok, msg = create_account(self.app.data, user, pwd)
        if ok:
            mb.showinfo("Success", msg)
            self.app.show_frame("LoginFrame", fade=True)
        else:
            mb.showerror("Error", msg)

    def refresh(self):
        self.ent_user.delete(0, "end")
        self.ent_pass.delete(0, "end")


# ---------- Home Frame (Projects list) ----------
class HomeFrame(BaseFrame):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", pady=8)
        ctk.CTkLabel(header, text="Projects", font=ctk.CTkFont(size=18, weight="bold")).pack(side="left", padx=12)

        top_right = ctk.CTkFrame(header, fg_color="transparent")
        top_right.pack(side="right", padx=12)
        self.lbl_user = ctk.CTkLabel(top_right, text="")
        self.lbl_user.pack(side="left", padx=(0, 8))
        btn_logout = ctk.CTkButton(top_right, text="Logout", width=90, command=self.logout)
        btn_logout.pack(side="left")

        body = ctk.CTkFrame(self, fg_color="transparent")
        body.pack(fill="both", expand=True, padx=12, pady=6)

        left = ctk.CTkFrame(body, fg_color="#171718")
        left.pack(side="left", fill="y", padx=(0, 12), pady=6)

        ctk.CTkLabel(left, text="Your Projects:").pack(anchor="w", padx=8, pady=(8, 4))

        # Use a standard tkinter Listbox to get the native blue selection highlight
        listbox_frame = tk.Frame(left, bg="#171718")
        listbox_frame.pack(padx=8, pady=6)

        self.listbox = tk.Listbox(
            listbox_frame,
            width=44,
            height=14,
            activestyle="none",
            bd=0,
            highlightthickness=0,
            selectbackground="#2a8bd8",  # blue bar
            selectforeground="white",
            bg="#0f0f10",
            fg="#e6e6e6",
            font=("Helvetica", 10),
            exportselection=False,
        )
        self.listbox.pack(side="left", fill="both", expand=False)

        scrollbar = tk.Scrollbar(listbox_frame, orient="vertical", command=self.listbox.yview)
        scrollbar.pack(side="right", fill="y")
        self.listbox.config(yscrollcommand=scrollbar.set)

        # Bind selection and double-click
        self.listbox.bind("<<ListboxSelect>>", self._on_listbox_select)
        self.listbox.bind("<Double-Button-1>", self._on_listbox_double)

        # mapping index -> project id
        self._project_index_map = {}
        self._selected_index = None

        btns = ctk.CTkFrame(left, fg_color="transparent")
        btns.pack(pady=6)
        b_view = ctk.CTkButton(btns, text="Open", command=self.open_selected)
        b_create = ctk.CTkButton(btns, text="New", command=lambda: self.app.show_frame("CreateProjectFrame", fade=True))
        b_delete = ctk.CTkButton(btns, text="Delete", command=self.delete_selected)
        b_view.grid(row=0, column=0, padx=6)
        b_create.grid(row=0, column=1, padx=6)
        b_delete.grid(row=0, column=2, padx=6)

        for b in (b_view, b_create, b_delete):
            BaseFrame.make_hover(b, normal_color=b._fg_color, hover_color="#2a8bd8")

        right = ctk.CTkFrame(body, fg_color="#171718")
        right.pack(side="left", fill="both", expand=True)

        ctk.CTkLabel(right, text="Project Details:").pack(anchor="w", padx=8, pady=(8, 4))
        self.details = ctk.CTkLabel(right, text="Select project and press Open", anchor="nw", justify="left")
        self.details.pack(padx=12, pady=6, anchor="nw")

    def refresh(self):
        if not self.app.current_user:
            # if not logged in go back
            self.app.show_frame("StartFrame", fade=True)
            return
        user = self.app.current_user
        self.lbl_user.configure(text=f"User: {user}")
        self._reload_project_list()

    def _reload_project_list(self):
        self.listbox.delete(0, "end")
        self._project_index_map.clear()
        self._selected_index = None

        projects = self.app.data["users"].get(self.app.current_user, {}).get("projects", {})
        if not projects:
            self.listbox.insert("end", "No projects yet.")
            self.details.configure(text="Create a new project to get started.")
        else:
            for idx, (pid, p) in enumerate(projects.items()):
                line = f"{idx+1}. {p['name']}  [{p.get('status')}]  (Tasks: {len(p.get('tasks', []))})"
                self.listbox.insert("end", line)
                self._project_index_map[idx] = pid
            self.details.configure(text="Single-click to select a project, double-click to open it.")

    def _on_listbox_select(self, event):
        w = event.widget
        sel = w.curselection()
        if not sel:
            self._selected_index = None
            return
        idx = sel[0]
        self._selected_index = idx
        pid = self._project_index_map.get(idx)
        if pid:
            p = self.app.data["users"][self.app.current_user]["projects"].get(pid)
            if p:
                self.details.configure(text=f"Project: {p['name']}\nStatus: {p['status']}\nTasks: {len(p.get('tasks', []))}")

    def _on_listbox_double(self, event):
        sel = self.listbox.curselection()
        if sel:
            self._selected_index = sel[0]
            self.open_selected()

    def get_selected_project_id(self):
        if self._selected_index is not None and self._selected_index in self._project_index_map:
            return self._project_index_map[self._selected_index]
        projects = list(self.app.data["users"].get(self.app.current_user, {}).get("projects", {}).items())
        if not projects:
            return None
        return projects[0][0]

    def open_selected(self):
        pid = self.get_selected_project_id()
        if not pid:
            mb.showerror("Error", "Select a project (click to highlight it).")
            return
        self.app.current_project_id = pid
        self.app.show_frame("ProjectViewFrame", fade=True)

    def delete_selected(self):
        pid = self.get_selected_project_id()
        if not pid:
            mb.showerror("Error", "Select a project to delete (click to highlight it).")
            return
        projects = self.app.data["users"][self.app.current_user]["projects"]
        pname = projects[pid]["name"]
        if mb.askyesno("Confirm", f"Delete project '{pname}'?"):
            ok = delete_project(self.app.data, self.app.current_user, pid)
            if ok:
                mb.showinfo("Deleted", "Project deleted.")
                self._reload_project_list()
            else:
                mb.showerror("Error", "Could not delete project.")

    def logout(self):
        self.app.current_user = None
        self.app.current_project_id = None
        self.app.show_frame("StartFrame", fade=True)


# ---------- Create Project Frame ----------
class CreateProjectFrame(BaseFrame):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        header = ctk.CTkLabel(self, text="Create Project", font=ctk.CTkFont(size=20, weight="bold"))
        header.pack(pady=(20, 8))

        form = ctk.CTkFrame(self, fg_color="transparent")
        form.pack(pady=6)

        ctk.CTkLabel(form, text="Project name:").grid(row=0, column=0, padx=6, pady=6, sticky="e")
        self.ent_name = ctk.CTkEntry(form, width=420)
        self.ent_name.grid(row=0, column=1, padx=6, pady=6)

        btns = ctk.CTkFrame(self, fg_color="transparent")
        btns.pack(pady=12)
        b_create = ctk.CTkButton(btns, text="Create", width=140, command=self.create)
        b_back = ctk.CTkButton(btns, text="Back", width=140, command=lambda: app.show_frame("HomeFrame", fade=True))
        b_create.grid(row=0, column=0, padx=8)
        b_back.grid(row=0, column=1, padx=8)
        BaseFrame.make_hover(b_create, normal_color=b_create._fg_color, hover_color="#339966")
        BaseFrame.make_hover(b_back, normal_color=b_back._fg_color, hover_color="#2a8bd8")

    def create(self):
        name = self.ent_name.get().strip()
        if not name:
            mb.showerror("Error", "Project name cannot be empty.")
            return
        pid = create_project(self.app.data, self.app.current_user, name)
        self.ent_name.delete(0, "end")
        self.app.current_project_id = pid
        mb.showinfo("Created", f"Project '{name}' created.")
        self.app.show_frame("ProjectViewFrame", fade=True)

    def refresh(self):
        if not self.app.current_user:
            self.app.show_frame("StartFrame", fade=True)
            return
        self.ent_name.delete(0, "end")


# ---------- Project View Frame ----------
class ProjectViewFrame(BaseFrame):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", pady=8)
        self.lbl_proj = ctk.CTkLabel(header, text="Project", font=ctk.CTkFont(size=18, weight="bold"))
        self.lbl_proj.pack(side="left", padx=12)

        self.top_right = ctk.CTkFrame(header, fg_color="transparent")
        self.top_right.pack(side="right", padx=12)
        ctk.CTkButton(self.top_right, text="Back", width=100, command=lambda: app.show_frame("HomeFrame", fade=True)).pack()

        body = ctk.CTkFrame(self, fg_color="transparent")
        body.pack(fill="both", expand=True, padx=12, pady=6)

        left = ctk.CTkFrame(body, fg_color="#161617")
        left.pack(side="left", fill="y", padx=(0, 12), pady=6)

        sort_frame = ctk.CTkFrame(left, fg_color="transparent")
        sort_frame.pack(pady=6)
        ctk.CTkLabel(sort_frame, text="Sort by:").grid(row=0, column=0, padx=6)
        self.sort_var = ctk.StringVar(value=self.app.current_sort_mode)
        ctk.CTkOptionMenu(sort_frame, values=["priority", "due", "status"], variable=self.sort_var, width=120,
                          command=self.change_sort).grid(row=0, column=1, padx=6)

        self.tasks_container = ctk.CTkScrollableFrame(left, width=420, height=360, fg_color="#0f0f10")
        self.tasks_container.pack(padx=6, pady=6)

        btns = ctk.CTkFrame(left, fg_color="transparent")
        btns.pack(pady=(6, 12))
        ctk.CTkButton(btns, text="Add Task", command=self.add_task).grid(row=0, column=0, padx=6)
        ctk.CTkButton(btns, text="Remove Task", command=self.remove_task).grid(row=0, column=1, padx=6)
        ctk.CTkButton(btns, text="Toggle Status", command=self.toggle_status).grid(row=0, column=2, padx=6)

        right = ctk.CTkFrame(body, fg_color="#161617")
        right.pack(side="left", fill="both", expand=True)

        ctk.CTkLabel(right, text="Project Summary:", anchor="w").pack(anchor="nw", pady=(6, 4), padx=8)
        self.lbl_summary = ctk.CTkLabel(right, text="---", anchor="nw", justify="left")
        self.lbl_summary.pack(anchor="nw", padx=12, pady=6)
        self._selected_task_id = None

    def refresh(self):
        if not self.app.current_user or not self.app.current_project_id:
            self.app.show_frame("HomeFrame", fade=True)
            return
        self._selected_task_id = None
        self.sort_var.set(self.app.current_sort_mode)
        self._load_project()

    def _load_project(self):
        user = self.app.current_user
        pid = self.app.current_project_id
        project = self.app.data["users"][user]["projects"][pid]
        self.lbl_proj.configure(text=f"Project: {project['name']}  [{project['status']}]")
        self._render_tasks(project)

    def _clear_tasks_container(self):
        for w in self.tasks_container.winfo_children():
            w.destroy()

    def _render_tasks(self, project):
        self._clear_tasks_container()
        tasks = list(project.get("tasks", []))
        mode = self.sort_var.get() or self.app.current_sort_mode
        tasks = sort_tasks(tasks, mode=mode)
        for t in tasks:
            self._create_task_widget(t)
        total = len(tasks)
        completed = sum(1 for t in tasks if t.get("status") == "completed")
        text = f"Name: {project['name']}\nStatus: {project['status']}\nTasks: {total}\nCompleted: {completed}"
        self.lbl_summary.configure(text=text)

    def _create_task_widget(self, task):
        frame = ctk.CTkFrame(self.tasks_container, fg_color="#1b1b1b", corner_radius=8)
        frame.pack(fill="x", pady=6, padx=6)

        top = ctk.CTkFrame(frame, fg_color="transparent")
        top.pack(fill="x", padx=6, pady=(6, 0))
        title_lbl = ctk.CTkLabel(top, text=task["title"], anchor="w", font=ctk.CTkFont(size=12, weight="bold"))
        title_lbl.pack(side="left", anchor="w")

        prio = task.get("priority", "Low")
        color_map = {"High": "#ff6b6b", "Medium": "#ffb86b", "Low": "#7fd29b"}
        prio_badge = ctk.CTkLabel(top, text=prio, width=80, fg_color=color_map.get(prio, "#7fd29b"))
        prio_badge.pack(side="right", padx=(6, 0))

        sub = ctk.CTkLabel(frame, text=f"Due: {task.get('due_date') or '—'}    Status: {task.get('status')}", anchor="w")
        sub.pack(fill="x", padx=6, pady=(6, 4))

        if task.get("desc"):
            desc = ctk.CTkLabel(frame, text=task.get("desc"), anchor="w", wraplength=500, fg_color="transparent")
            desc.pack(fill="x", padx=6, pady=(0, 6))

        bframe = ctk.CTkFrame(frame, fg_color="transparent")
        bframe.pack(fill="x", padx=6, pady=(0, 8))
        b_edit = ctk.CTkButton(bframe, text="Edit", width=80, command=partial(self.edit_task_dialog, task["id"]))
        b_sel = ctk.CTkButton(bframe, text="Select", width=80, command=partial(self.select_task, task["id"]))
        b_edit.pack(side="left", padx=6)
        b_sel.pack(side="left", padx=6)

        if task.get("status") == "completed":
            frame.configure(fg_color="#173e1e")
        elif is_overdue(task):
            frame.configure(fg_color="#3e1313")
        else:
            if task.get("priority") == "High":
                frame.configure(fg_color="#1f1414")
            else:
                frame.configure(fg_color="#1b1b1b")

        BaseFrame.make_hover(b_edit, normal_color=b_edit._fg_color, hover_color="#2a8bd8")
        BaseFrame.make_hover(b_sel, normal_color=b_sel._fg_color, hover_color="#339966")

    def select_task(self, tid):
        self._selected_task_id = tid
        mb.showinfo("Selected", "Task selected. You can Remove or Toggle Status now.")

    def add_task(self):
        dlg = TaskDialog(self, title="Add Task")
        self.wait_window(dlg)
        if dlg.result:
            title, desc, prio, due = dlg.result
            if not title.strip():
                mb.showerror("Error", "Task must have a title.")
                return
            if due and not valid_date(due):
                mb.showerror("Error", "Due date must be YYYY-MM-DD or empty.")
                return
            add_task(self.app.data, self.app.current_user, self.app.current_project_id, title.strip(), desc.strip(), prio, due.strip())
            self._load_project()

    def remove_task(self):
        if not self._selected_task_id:
            mb.showerror("Error", "Select a task first.")
            return
        if mb.askyesno("Confirm", "Remove selected task?"):
            ok = remove_task(self.app.data, self.app.current_user, self.app.current_project_id, self._selected_task_id)
            if ok:
                mb.showinfo("Removed", "Task removed.")
                self._selected_task_id = None
                self._load_project()
            else:
                mb.showerror("Error", "Could not remove task.")

    def toggle_status(self):
        if not self._selected_task_id:
            mb.showerror("Error", "Select a task first.")
            return
        project = self.app.data["users"][self.app.current_user]["projects"][self.app.current_project_id]
        task = next((t for t in project["tasks"] if t["id"] == self._selected_task_id), None)
        if not task:
            mb.showerror("Error", "Task not found.")
            return
        new = "completed" if task["status"] != "completed" else "pending"
        update_task_status(self.app.data, self.app.current_user, self.app.current_project_id, self._selected_task_id, new)
        mb.showinfo("Updated", f"Task status set to {new}.")
        self._selected_task_id = None
        self._load_project()

    def edit_task_dialog(self, tid):
        project = self.app.data["users"][self.app.current_user]["projects"][self.app.current_project_id]
        task = next((t for t in project["tasks"] if t["id"] == tid), None)
        if not task:
            mb.showerror("Error", "Task not found.")
            return
        dlg = TaskDialog(self, title="Edit Task", initial={
            "title": task.get("title", ""),
            "desc": task.get("desc", ""),
            "priority": task.get("priority", "Low"),
            "due": task.get("due_date", "")
        })
        self.wait_window(dlg)
        if dlg.result:
            title, desc, prio, due = dlg.result
            if due and not valid_date(due):
                mb.showerror("Error", "Due date must be YYYY-MM-DD or empty.")
                return
            edit_task(self.app.data, self.app.current_user, self.app.current_project_id, tid, title.strip(), desc.strip(), prio, due.strip())
            mb.showinfo("Saved", "Task saved.")
            self._load_project()

    def change_sort(self, value):
        self.app.current_sort_mode = value
        self._load_project()


# ---------- Calendar Dialog ----------
class CalendarDialog(ctk.CTkToplevel):
    """
    Small calendar widget that lets user pick a date.
    Returns selected date as 'YYYY-MM-DD' via callback.
    """

    def __init__(self, parent, initial_date=None, callback=None):
        super().__init__(parent)
        self.title("Select Date")
        self.transient(parent)
        self.grab_set()
        self.resizable(False, False)
        self.callback = callback
        # Keep consistent look
        self.configure(fg_color="#222327")

        # Default to today if no initial
        if initial_date:
            try:
                d = datetime.strptime(initial_date, "%Y-%m-%d").date()
            except Exception:
                d = date.today()
        else:
            d = date.today()

        self.year = d.year
        self.month = d.month

        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", pady=(8, 6), padx=8)
        self.lbl_month = ctk.CTkLabel(header, text="", font=ctk.CTkFont(size=14, weight="bold"))
        self.lbl_month.pack(side="left", padx=(6, 12))

        nav = ctk.CTkFrame(header, fg_color="transparent")
        nav.pack(side="right")
        btn_prev = ctk.CTkButton(nav, text="◀", width=34, command=self.prev_month)
        btn_next = ctk.CTkButton(nav, text="▶", width=34, command=self.next_month)
        btn_prev.grid(row=0, column=0, padx=(0, 6))
        btn_next.grid(row=0, column=1)

        # weekday header
        days_frame = ctk.CTkFrame(self, fg_color="transparent")
        days_frame.pack(padx=8, pady=(6, 0))
        for i, wd in enumerate(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]):
            lbl = ctk.CTkLabel(days_frame, text=wd, width=4)
            lbl.grid(row=0, column=i, padx=2, pady=2)

        # grid for day buttons
        self.grid_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.grid_frame.pack(padx=8, pady=(6, 12))

        # footer: today and cancel
        footer = ctk.CTkFrame(self, fg_color="transparent")
        footer.pack(fill="x", pady=(0, 8), padx=8)
        btn_today = ctk.CTkButton(footer, text="Today", width=120, command=self.select_today)
        btn_cancel = ctk.CTkButton(footer, text="Cancel", width=120, command=self.close_no_select)
        btn_today.pack(side="left", padx=(0, 8))
        btn_cancel.pack(side="right")

        self._build_calendar()

    def _build_calendar(self):
        # clear existing day widgets
        for w in self.grid_frame.winfo_children():
            w.destroy()
        # update month label
        self.lbl_month.configure(text=f"{calendar.month_name[self.month]} {self.year}")
        # calendar month matrix: weeks are lists of ints (0 means day from adjacent month)
        cal = calendar.Calendar(firstweekday=0)  # monday start
        month_days = cal.monthdayscalendar(self.year, self.month)
        for r, week in enumerate(month_days):
            for c, day_num in enumerate(week):
                if day_num == 0:
                    # empty placeholder
                    lbl = ctk.CTkLabel(self.grid_frame, text=" ", width=4)
                    lbl.grid(row=r, column=c, padx=2, pady=2)
                else:
                    btn = ctk.CTkButton(self.grid_frame, text=str(day_num), width=34, height=28,
                                       command=partial(self._on_day_selected, day_num))
                    btn.grid(row=r, column=c, padx=2, pady=2)

    def _on_day_selected(self, day):
        sel = date(self.year, self.month, day)
        s = sel.strftime("%Y-%m-%d")
        if self.callback:
            try:
                self.callback(s)
            except Exception:
                pass
        self.destroy()

    def prev_month(self):
        if self.month == 1:
            self.month = 12
            self.year -= 1
        else:
            self.month -= 1
        self._build_calendar()

    def next_month(self):
        if self.month == 12:
            self.month = 1
            self.year += 1
        else:
            self.month += 1
        self._build_calendar()

    def select_today(self):
        td = date.today().strftime("%Y-%m-%d")
        if self.callback:
            try:
                self.callback(td)
            except Exception:
                pass
        self.destroy()

    def close_no_select(self):
        self.destroy()


# ---------- Task Dialog (Add / Edit) with calendar button ----------
class TaskDialog(ctk.CTkToplevel):
    def __init__(self, parent, title="Task", initial=None):
        super().__init__(parent)
        self.title(title)
        self.geometry("540x360")
        self.transient(parent)
        self.grab_set()
        self.result = None

        frame = ctk.CTkFrame(self, fg_color="#1b1b1b")
        frame.pack(fill="both", expand=True, padx=12, pady=12)

        ctk.CTkLabel(frame, text="Title:", anchor="w").grid(row=0, column=0, pady=8, sticky="w")
        self.ent_title = ctk.CTkEntry(frame, width=420)
        self.ent_title.grid(row=0, column=1, pady=8, sticky="w")

        ctk.CTkLabel(frame, text="Description:", anchor="w").grid(row=1, column=0, pady=8, sticky="nw")
        self.txt_desc = ctk.CTkTextbox(frame, width=420, height=100)
        self.txt_desc.grid(row=1, column=1, pady=8, sticky="w")

        ctk.CTkLabel(frame, text="Priority:", anchor="w").grid(row=2, column=0, pady=6, sticky="w")
        self.prio_var = ctk.StringVar(value="Low")
        ctk.CTkOptionMenu(frame, values=["Low", "Medium", "High"], variable=self.prio_var, width=140).grid(row=2, column=1, sticky="w")

        # Due date row: entry + calendar button (keeps UI consistent)
        ctk.CTkLabel(frame, text="Due date (YYYY-MM-DD):", anchor="w").grid(row=3, column=0, pady=6, sticky="w")
        due_container = ctk.CTkFrame(frame, fg_color="transparent")
        due_container.grid(row=3, column=1, pady=6, sticky="w")
        self.ent_due = ctk.CTkEntry(due_container, width=170)
        self.ent_due.pack(side="left", padx=(0, 8))
        # Calendar open button (small)
        self.btn_calendar = ctk.CTkButton(due_container, text="📅", width=40, command=self.open_calendar)
        self.btn_calendar.pack(side="left")

        btn_frame = ctk.CTkFrame(frame, fg_color="transparent")
        btn_frame.grid(row=4, column=1, pady=10, sticky="e")
        ctk.CTkButton(btn_frame, text="Save", width=110, command=self.on_save).grid(row=0, column=0, padx=6)
        ctk.CTkButton(btn_frame, text="Cancel", width=110, command=self.destroy).grid(row=0, column=1, padx=6)

        if initial:
            self.ent_title.insert(0, initial.get("title", ""))
            self.txt_desc.insert("0.0", initial.get("desc", ""))
            self.prio_var.set(initial.get("priority", "Low"))
            self.ent_due.insert(0, initial.get("due", ""))

    def open_calendar(self):
        # callback will set the entry text
        def _set_date(selected):
            try:
                # validate and set to entry
                if selected and valid_date(selected):
                    self.ent_due.delete(0, "end")
                    self.ent_due.insert(0, selected)
            except Exception:
                pass

        # open calendar dialog; pass current entry as initial
        initial = self.ent_due.get().strip() or None
        cal = CalendarDialog(self, initial_date=initial, callback=_set_date)
        # CalendarDialog is modal (grab_set), so no further action here

    def on_save(self):
        title = self.ent_title.get().strip()
        desc = self.txt_desc.get("0.0", "end").strip()
        prio = self.prio_var.get()
        due = self.ent_due.get().strip()
        if due and not valid_date(due):
            mb.showerror("Bad date", "Due date must be YYYY-MM-DD or empty.")
            return
        self.result = (title, desc, prio, due)
        self.destroy()


# ----------------------
# Run the App
# ----------------------
def main():
    if not os.path.exists(DATA_FILE):
        save_data({"users": {}})
    app = TaskTrackerApp()
    app.mainloop()


if __name__ == "__main__":
    main()
