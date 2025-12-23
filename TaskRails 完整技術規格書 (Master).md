# **TaskRails 完整技術規格書 (Master Specification)**

版本: 1.0 (Final Release Candidate)  
日期: 2025-12-17  
核心概念: Windows 優先、硬重置協議、角色導向的原生桌面協作器

## **1\. 產品與品牌定義 (Product Identity)**

### **1.1 核心價值**

TaskRails 是一個「原生桌面級 AI 協作編排器」。  
它利用 Model Context Protocol (MCP) 充當 IDE 與 AI Agent 之間的中樞神經。透過嚴格的 Context 隔離 與 氣閘 (Airlock) 機制，它強制執行「開發 \-\> 審查 \-\> 驗收」的標準作業程序，防止 AI 幻覺與權限越界。

### **1.2 品牌識別**

* **產品名稱**: **TaskRails** (PascalCase)  
* **CLI 指令**:  
  * 主指令: taskrails  
  * 縮寫別名: **trs**  
* **Logo 設計**:  
  * **Task** (深灰/粗體) \+ **Rails** (亮橘/細體)。  
  * 圖形: 盾牌與軌道的結合 (The Guardrail Shield)。  
* **目標平台**:  
  * **Phase 1**: **Windows 10/11** (.msi/.exe)。  
  * **Phase 2**: macOS & Linux。

## **2\. UI/UX 規範 (Windows Native)**

### **2.1 視窗框架 (Window Frame)**

* **標題列**: 高度 32px，自定義繪製。  
  * **控制項**: 強制固定於 **右上角** (Windows 風格: Min/Max/Close)。  
  * **字體**: Segoe UI (Windows 預設)。  
  * **行為**: 支援無邊框拖曳 (data-tauri-drag-region)。  
* **系統托盤 (System Tray)**:  
  * 支援背景執行，右鍵選單包含 Show, MCP Status, Quit。

### **2.2 角色切換分頁 (Role Tabs)**

位於側邊欄頂部的全域切換器，連動 MCP Context 與 UI 主題。

* **\[1\] Coder (開發)**:  
  * 快捷鍵: Alt \+ 1 | 主色: **Orange** | Icon: 🔨  
* **\[2\] Reviewer (審核)**:  
  * 快捷鍵: Alt \+ 2 | 主色: **Red** | Icon: 🛡️  
* **\[3\] Architect (架構)**:  
  * 快捷鍵: Alt \+ 3 | 主色: **Blue** | Icon: 📐

### **2.3 核心介面**

* **看板 (Kanban)**: 3 欄式 (To-Do, Doing, Done)。Doing 欄位需有對應角色顏色的光暈。  
* **氣閘模態窗 (Airlock)**: 全域遮罩，顯示 AI 請求的 Diff View 與 Approve/Reject 按鈕。  
* **Token Widget**: 圓形進度條，顯示 Context 用量 (綠 \< 50%, 黃 \< 80%, 紅 \> 90%)。

## **3\. 系統架構 (System Architecture)**

### **3.1 技術堆疊 (Tech Stack)**

* **Host Application**: **Tauri v2** (Rust Core)  
* **Frontend**: React \+ TypeScript \+ Tailwind CSS \+ Lucide React  
* **Database**: **SQLite** (本地儲存任務、對話紀錄、設定)  
* **Build System**: WiX Toolset (for .msi), NSIS (for .exe)

### **3.2 雙模 MCP Server (Dual-Mode Engine)**

Rust 後端同時運行兩種傳輸協議以支援不同 IDE：

1. **Stdio Channel**:  
   * 透過標準輸入/輸出 (stdin/stdout) 通訊。  
   * 適用: Cursor, Trae, Cline, Windsurf, Gemini-CLI。  
2. **SSE Channel**:  
   * 透過 HTTP Server Sent Events (localhost:4567) 通訊。  
   * 適用: Google Antigravity, Web-based IDEs。

## **4\. 協定與風險緩解 (Protocols & Mitigation)**

### **4.1 Context 隔離策略 (Isolation)**

在角色切換 (如 Coder \-\> Reviewer) 時，強制執行重置：

* **Priority 1: Hard Reset**: 嘗試呼叫 IDE API (如 workbench.action.clearEditorHistory) 物理刪除對話。  
* **Priority 2: Soft Reset**: 若不支援 API，注入分隔符號 \--- SYSTEM RESET \--- 並加上 \[IGNORE PREVIOUS INSTRUCTIONS\] 指令。

### **4.2 身分廣播 (Hello Protocol)**

* **機制**: 角色切換後，TaskRails 自動發送一條隱藏 Prompt。  
* **效果**: AI 必須以特定格式回應，例如 🛑 \*\*審查模式啟動\*\* | 目標: 檢查邏輯漏洞...。  
* **設定**: 支援多語系 (i18n) 與開關 (Toggle)。

### **4.3 資源監控 (Token Monitor)**

* **機制**: 透過 tiktoken-rs 攔截計算所有進出的 Prompt Token。  
* **閾值**:  
  * **\> 80%**: 發送前端警告 (Toast Warning)。  
  * **\> 95%**: 阻擋 Tool Call，強制要求使用者執行 Hard Reset。

## **5\. 適配器矩陣 (Adapter Matrix)**

| IDE | 連接協議 | 設定方式 | 備註 |
| :---- | :---- | :---- | :---- |
| **Cursor** | **Stdio** | Features \> MCP \> Add Command: trs mcp-stdio | 支援度最佳 |
| **Trae** | **Stdio** | Settings \> MCP Servers \> Add: trs mcp-stdio |  |
| **Antigravity** | **SSE** | MCP Toolbox 連接 http://localhost:4567/sse | 支援並行 Agent |
| **Gemini-CLI** | **Stdio** | Config YAML 設定 command | 用於純終端環境 |
| **Cline** | **Stdio** | Config JSON 指向 trs |  |

## **6\. 詳細開發任務清單 (Execution Plan)**

### **Phase 1: 基礎建設 (Foundation)**

* \[ \] **TASK-1.1**: 初始化 Tauri v2 \+ React 專案，配置 Tailwind。  
* \[ \] **TASK-1.2**: 實作 Windows 自定義標題列 (Min/Max/Close) 與拖曳區。  
* \[ \] **TASK-1.3**: 設定 SQLite 資料庫連線與 Schema (Tasks, Settings)。  
* \[ \] **TASK-1.4**: 實作 trs CLI Alias 註冊邏輯 (修改 Windows PATH)。

### **Phase 2: MCP 核心 (Core Engine)**

* \[ \] **TASK-2.1**: 實作 Rust 雙模 MCP Server (Stdio \+ Warp/Axum SSE)。  
* \[ \] **TASK-2.2**: 整合 tiktoken-rs 實作 Token 計算 Middleware。  
* \[ \] **TASK-2.3**: 實作狀態機 (State Machine) 管理 Coder/Reviewer 狀態流轉。

### **Phase 3: 前端互動 (UI Implementation)**

* \[ \] **TASK-3.1**: 實作側邊欄 Role Tabs (Alt+1/2/3 切換邏輯)。  
* \[ \] **TASK-3.2**: 實作 Kanban 看板 (Drag & Drop 觸發 Rust Command)。  
* \[ \] **TASK-3.3**: 實作氣閘 (Airlock) 模態窗與 Diff View Mockup。  
* \[ \] **TASK-3.4**: 實作設定頁面 (語言、廣播開關)。

### **Phase 4: 打包發布 (Release)**

* \[ \] **TASK-4.1**: 設定 tauri.conf.json 之 Windows 打包參數 (.msi/.exe)。  
* \[ \] **TASK-4.2**: 編寫 GitHub Actions 腳本進行自動化構建。