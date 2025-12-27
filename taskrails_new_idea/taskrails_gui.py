import tkinter as tk
from tkinter import ttk, scrolledtext
import threading
import re
import time
from taskrails_engine import refiner

class TaskrailsUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Taskrails Vibe Core - 指令中繼站")
        self.root.geometry("1100x750")
        
        # 配色方案
        self.colors = {
            "bg": "#f0f2f5", "chat_user": "#e3f2fd", "chat_ai": "#ffffff",
            "prompt_bg": "#2d2d2d", "prompt_fg": "#00ff00"
        }
        self.chat_history = [] # 用於 API 上下文

        self._setup_layout()

    def _setup_layout(self):
        # 主分割 (左: Local Chat, 右: Cloud Preview & Logs)
        main_paned = tk.PanedWindow(self.root, orient=tk.HORIZONTAL, sashwidth=5)
        main_paned.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # --- 左側面板 ---
        left_frame = ttk.Frame(main_paned)
        main_paned.add(left_frame, minsize=400)

        ttk.Label(left_frame, text="🧠 Local Architect (Qwen)", font=("Segoe UI", 11, "bold")).pack(anchor=tk.W, pady=5)
        
        self.chat_display = scrolledtext.ScrolledText(left_frame, wrap=tk.WORD, height=25, font=("Segoe UI", 10))
        self.chat_display.pack(fill=tk.BOTH, expand=True)
        self.chat_display.tag_config("user", foreground="#0056b3", justify="right")
        self.chat_display.tag_config("ai", foreground="#212529")
        self.chat_display.config(state=tk.DISABLED)

        # 輸入區
        input_frame = ttk.Frame(left_frame)
        input_frame.pack(fill=tk.X, pady=10)
        self.user_input = tk.Text(input_frame, height=3, font=("Segoe UI", 10))
        self.user_input.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.user_input.bind("<Return>", self._on_enter)
        
        send_btn = ttk.Button(input_frame, text="發送", command=self.send_message)
        send_btn.pack(side=tk.RIGHT, padx=5, fill=tk.Y)

        # --- 右側面板 ---
        right_frame = ttk.Frame(main_paned)
        main_paned.add(right_frame, minsize=400)

        # 上半部: Final Prompt Preview
        ttk.Label(right_frame, text="🚀 Ready for Cloud (Claude 3.5)", font=("Segoe UI", 11, "bold")).pack(anchor=tk.W, pady=5)
        self.prompt_preview = scrolledtext.ScrolledText(right_frame, height=15, bg=self.colors["prompt_bg"], fg=self.colors["prompt_fg"], font=("Consolas", 10))
        self.prompt_preview.pack(fill=tk.BOTH, expand=True)

        # 控制按鈕
        action_frame = ttk.Frame(right_frame)
        action_frame.pack(fill=tk.X, pady=10)
        self.status_label = ttk.Label(action_frame, text="● System Ready", foreground="green")
        self.status_label.pack(side=tk.LEFT)
        self.execute_btn = ttk.Button(action_frame, text="確認並執行 (Send to Cloud)", command=self.execute_cloud_task, state=tk.DISABLED)
        self.execute_btn.pack(side=tk.RIGHT)

        # 下半部: Cloud Logs (模擬 IDE 回傳)
        ttk.Label(right_frame, text="📡 Cloud IDE Logs", font=("Segoe UI", 11, "bold")).pack(anchor=tk.W, pady=(10,5))
        self.cloud_logs = scrolledtext.ScrolledText(right_frame, height=10, bg="#f8f9fa", font=("Consolas", 9))
        self.cloud_logs.pack(fill=tk.BOTH, expand=True)

    def _on_enter(self, event):
        if not event.state & 0x0001: 
            self.send_message()
            return "break"

    def append_chat(self, role, text):
        self.chat_display.config(state=tk.NORMAL)
        tag = "user" if role == "You" else "ai"
        header = f"\n[{role}]\n"
        self.chat_display.insert(tk.END, header, tag)
        self.chat_display.insert(tk.END, f"{text}\n", tag)
        self.chat_display.see(tk.END)
        self.chat_display.config(state=tk.DISABLED)

    def send_message(self):
        msg = self.user_input.get("1.0", tk.END).strip()
        if not msg: return
        self.user_input.delete("1.0", tk.END)
        
        self.append_chat("You", msg)
        self.chat_history.append({"role": "user", "content": msg})
        
        threading.Thread(target=self._process_ai, args=(msg,), daemon=True).start()

    def _process_ai(self, user_msg):
        self.status_label.config(text="● Thinking...", foreground="orange")
        full_res = ""
        stream = refiner.chat_stream(user_msg, self.chat_history)
        
        # 實時顯示回應
        self.chat_display.config(state=tk.NORMAL)
        self.chat_display.insert(tk.END, "\n[Local AI]\n", "ai")
        
        for chunk in stream:
            full_res += chunk
            self.chat_display.insert(tk.END, chunk, "ai")
            self.chat_display.see(tk.END)
        
        self.chat_display.config(state=tk.DISABLED)
        self.chat_history.append({"role": "assistant", "content": full_res})
        
        # 提取 <final_prompt>
        self.root.after(0, lambda: self._parse_prompt(full_res))

    def _parse_prompt(self, response):
        pattern = r'<final_prompt>(.*?)</final_prompt>'
        match = re.search(pattern, response, re.DOTALL)
        if match:
            prompt = match.group(1).strip()
            self.prompt_preview.delete("1.0", tk.END)
            self.prompt_preview.insert(tk.END, prompt)
            self.execute_btn.config(state=tk.NORMAL)
            self.status_label.config(text="● Waiting for Approval", foreground="blue")
        else:
            self.status_label.config(text="● Conversation Active", foreground="green")

    def execute_cloud_task(self):
        """模擬發送至 Cloud 並接收回傳"""
        prompt = self.prompt_preview.get("1.0", tk.END).strip()
        self.status_label.config(text="● Executing on Cloud...", foreground="purple")
        self.cloud_logs.insert(tk.END, f"> Sending request to Claude 3.5...\n")
        self.execute_btn.config(state=tk.DISABLED)

        # 模擬 Cloud 處理過程
        threading.Thread(target=self._mock_cloud_execution, daemon=True).start()

    def _mock_cloud_execution(self):
        """這裡未來應替換為真實的 Cloud API / MCP 調用"""
        steps = [
            "Analyzing memory bank context...",
            "Reading specifications from specs.md...",
            "Generating code for module: UserAuth...",
            "Running unit tests...",
            "Tests Passed. Updating project_flow.mmd..."
        ]
        for step in steps:
            time.sleep(1.5)
            self.root.after(0, lambda s=step: self.cloud_logs.insert(tk.END, f"[Cloud] {s}\n"))
            self.root.after(0, lambda: self.cloud_logs.see(tk.END))
        
        self.root.after(0, lambda: self.status_label.config(text="● Task Completed", foreground="green"))

if __name__ == "__main__":
    root = tk.Tk()
    app = TaskrailsUI(root)
    root.mainloop()