import os
import re
from typing import Dict, Optional, Generator
from openai import OpenAI

# --- 全局配置 (Configuration) ---
# 連接至 LM Studio 的本地伺服器
LM_STUDIO_URL = "http://localhost:1234/v1"
API_KEY = "lm-studio"
LOCAL_MODEL = "qwen2.5-coder-7b-instruct"  # 請確認與 LM Studio 載入的模型一致

# 檔案路徑配置
MEMORY_BANK_PATH = "./memory-bank"
MERMAID_FILE = "project_flow.mmd"

# 初始化 OpenAI 客戶端
try:
    client = OpenAI(base_url=LM_STUDIO_URL, api_key=API_KEY)
except Exception as e:
    print(f"Warning: Client init failed - {e}")
    client = None

class MermaidParser:
    """解析 Mermaid 流程圖，識別 Active 節點"""
    def __init__(self, file_path: str):
        self.file_path = file_path

    def get_active_node(self) -> Optional[Dict[str, str]]:
        if not os.path.exists(self.file_path):
            return None
        with open(self.file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Regex: 尋找 id[text]:::active 或 id["text"]:::active
        pattern = r'(\w+)\["?(.*?)"?\]:::active'
        match = re.search(pattern, content)
        if match:
            return {"id": match.group(1), "text": match.group(2)}
        return None

class ContextAssembler:
    """讀取並組裝 Memory Bank 上下文"""
    def __init__(self, memory_path: str):
        self.memory_path = memory_path

    def read_file(self, filename: str) -> str:
        path = os.path.join(self.memory_path, filename)
        return open(path, 'r', encoding='utf-8').read() if os.path.exists(path) else ""

    def get_context_summary(self) -> str:
        specs = self.read_file("specs.md")
        tech = self.read_file("tech-stack.md")
        arch = self.read_file("architecture.md")
        # 簡單截斷以防 Token 溢出 (生產環境應改為 AI 摘要)
        return f"{specs[:2000]}\n{tech[:1000]}\n{arch[:1000]}"

class PromptRefiner:
    """核心邏輯：與用戶對話並生成工程 Prompt"""
    def __init__(self):
        self.assembler = ContextAssembler(MEMORY_BANK_PATH)
        self.parser = MermaidParser(MERMAID_FILE)

    def get_system_prompt(self, active_node_text: str) -> str:
        context = self.assembler.get_context_summary()
        return f"""
你是一個 Taskrails 的中繼架構師。
目標：協助用戶將口語指令轉化為精確的工程 Prompt，供雲端 AI (Cloud Agent) 執行。

[當前 Mermaid 任務]
{active_node_text}

[專案上下文摘要]
{context}

[行為準則]
1. 分析用戶指令是否模糊。若模糊，請用繁體中文反問。
2. 若指令清晰，請生成一段英文或技術中文的 Prompt。
3. **重要**：將最終要給 Cloud AI 的指令包在 <final_prompt> 標籤中。
4. 在 <final_prompt> 外部，請用口語解釋你的規劃。
"""

    def chat_stream(self, user_input: str, history: list) -> Generator:
        """串流式對話接口"""
        if not client:
            yield "錯誤: 無法連接 LM Studio。請檢查 Server 是否啟動。"
            return

        active_node = self.parser.get_active_node()
        node_text = active_node['text'] if active_node else "General Task (No Active Node)"
        
        system_msg = {"role": "system", "content": self.get_system_prompt(node_text)}
        # 建構完整訊息歷史
        messages = [system_msg] + history + [{"role": "user", "content": user_input}]

        try:
            stream = client.chat.completions.create(
                model=LOCAL_MODEL,
                messages=messages,
                temperature=0.7,
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            yield f"Error: {str(e)}"

# 單例模式供 GUI 調用
refiner = PromptRefiner()