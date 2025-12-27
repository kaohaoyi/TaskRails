# **開發環境設置指南 (Developer Setup)**

## **1\. 安裝本地 AI 引擎 (LM Studio)**

1. 下載並安裝 **LM Studio**。  
2. 在 Search 欄位搜尋 Qwen 2.5 Coder。  
3. 下載推薦版本 (建議: Qwen 2.5 Coder 7B Instruct, Q4\_K\_M)。  
4. 前往 **Local Server** 分頁：  
   * 載入模型。  
   * **重要**：將 Context Length 設為 8192 或更高。  
   * **重要**：點擊綠色按鈕 Start Server。  
   * 確認 Server 運行在 localhost:1234。

## **2\. Python 環境設置**

建立虛擬環境並安裝依賴：

python \-m venv venv  
\# Windows  
venv\\Scripts\\activate  
\# Mac/Linux  
source venv/bin/activate

pip install openai tkinter

*(註: tkinter 通常隨 Python 安裝，若報錯請單獨安裝)*

## **3\. 專案結構**

確保你的工作目錄如下：

/project  
  ├── taskrails\_engine.py  
  ├── taskrails\_gui.py  
  ├── project\_flow.mmd  
  └── memory-bank/       \<-- 必須建立此資料夾  
      ├── specs.md       \<-- 填入一些假資料  
      ├── tech-stack.md  
      └── architecture.md

## **4\. 啟動系統**

執行前端 GUI：

python taskrails\_gui.py

你應該會看到視窗開啟，左側顯示 "Local Architect"，若 LM Studio 未開啟，控制台會報錯。