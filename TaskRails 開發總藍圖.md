# **TaskRails 專案開發總藍圖 (Project Blueprint)**

版本: 8.0 (Master Execution Plan)  
核心概念: Windows 優先、硬重置協議、任務導向的執行總檔

## **1\. 產品定義 (Product Definition)**

### **1.1 核心價值**

TaskRails 是一個「原生桌面級 AI 協作編排器」。  
它以 Tauri v2 構建，優先針對 Windows 10/11 優化，未來擴充至 macOS/Linux。透過 MCP (Model Context Protocol)，它在本地端 (Localhost) 運作，充當 IDE 與 AI Agent 之間的中樞神經，強制執行開發紀律。

### **1.2 目標平台 (Target Platforms)**

* **Phase 1 (MVP)**: **Windows 10/11**  
  * 格式: .msi (WiX Toolset) 或 .exe (NSIS)。  
  * 特性: 自定義標題列、Windows Toast Notifications、System Tray。  
* **Phase 2**: macOS (Silicon/Intel) & Linux (Deb/AppImage)。

## **2\. 系統架構與適配策略 (Architecture & Strategy)**

### **2.1 技術堆疊 (Tech Stack)**

* **Host Application**: Tauri v2 (Rust Core)  
* **Frontend**: React \+ TypeScript \+ Tailwind CSS  
* **Core Engine**: Rust (MCP Server \+ State Machine)  
* **Database**: SQLite (Local-first storage)

### **2.2 適配策略矩陣 (Adaptive Matrix)**

TaskRails 根據 IDE 類型自動切換模式：

| 特性 | Type A: Prompt 模擬型 | Type B: 原生 Agent 型 |
| :---- | :---- | :---- |
| **代表工具** | Cursor, VS Code, Trae, Gemini-CLI | Google Antigravity |
| **Context 隔離** | **Hard Reset** (API) \> **Soft Reset** (Prompt Injection) | **Native Isolation** (獨立記憶體) |
| **身分識別** | **Hello Protocol** (AI 自我宣告) | **UI Badge** (IDE 原生顯示) |
| **資源管理** | **Token Monitor** (Tiktoken 計算) | **Native Quota** (IDE 限制) |

## **3\. 完整運作流程 (End-to-End Workflow)**

1. **啟動 (Boot)**: App 啟動，註冊 trs 指令，MCP Server 開始監聽 (Stdio/SSE)。  
2. **配置 (Config)**: 使用者設定專案路徑、語言 (繁中) 與 Agent 角色。  
3. **開發 (Coder Mode)**:  
   * 注入 Coder Prompt。  
   * **Token Monitor** 實時監控用量。  
4. **氣閘 (Airlock)**:  
   * AI 請求審查 \-\> 流程暫停 \-\> 彈出 Windows 通知。  
   * 人類介入批准。  
5. **審查 (Reviewer Mode)**:  
   * 執行 **Hard Reset** 清除 Context。  
   * 注入 Reviewer Prompt 進行檢查。  
6. **驗收 (Gatekeeping)**:  
   * 通過 Review \-\> 自動執行 npm test。  
   * 測試成功 \-\> 任務 Done。

## **4\. 風險緩解與協議 (Risk Protocols)**

* **Context 隔離**: 優先使用物理刪除對話記錄；若不可行，則注入分隔符號。  
* **身分廣播**: AI 必須在回應首行宣告 🛑 審查模式啟動 (可設定開關/多語系)。  
* **跨平台路徑**: 強制使用 Rust PathBuf 處理檔案路徑，嚴禁字串拼接。

## **5\. 詳細開發任務清單 (Detailed Development Roadmap & Tasks)**

此章節為具體執行項目，依賴順序排列。

### **Phase 1: 基礎建設與 Windows 適配 (Foundation)**

* \[ \] **TASK-1.1: 專案初始化**  
  * 執行 npm create tauri-app (React/TS)。  
  * 設定 Rust 依賴 (Cargo.toml): 加入 serde, tokio, rusqlite, tauri-plugin-mcp (若無官方 crate 則需手刻)。  
  * 設定前端依賴: tailwindcss, lucide-react, dnd-kit (預備用)。  
* \[ \] **TASK-1.2: Windows 視窗控制 (Custom Titlebar)**  
  * 修改 tauri.conf.json: 設定 decorations: false, transparent: false。  
  * 實作 React 組件 \<Titlebar /\>: 包含 Drag Region 與 右上角 (Min/Max/Close) 按鈕。  
  * 串接 Tauri Window API: 綁定按鈕事件。  
* \[ \] **TASK-1.3: 系統托盤 (System Tray)**  
  * Rust 後端實作 SystemTray。  
  * 功能: 顯示 App 狀態、快速退出、重啟 MCP Server。

### **Phase 2: MCP 核心引擎 (The Engine)**

* \[ \] **TASK-2.1: 雙模伺服器架構**  
  * 實作 Rust struct McpServer。  
  * 實作 **Stdio Channel**: 透過 stdin/stdout 處理 JSON-RPC (供 Cursor/Trae)。  
  * 實作 **SSE Channel**: 透過 warp 或 axum 啟動 HTTP Server (供 Antigravity)。  
* \[ \] **TASK-2.2: 狀態機 (State Machine)**  
  * 定義 Rust Enum: TaskState (Idle, CoderWorking, AirlockWait, ReviewerWorking, Done)。  
  * 實作狀態流轉邏輯: 確保 submit\_review 只能在 CoderWorking 狀態觸發。  
* \[ \] **TASK-2.3: Token 監控模組**  
  * 整合 tiktoken-rs。  
  * 實作 Middleware: 攔截所有 MCP tools/call 與 resources/read，計算 Token 數並累加。  
  * 實作警報邏輯: \>80% 觸發前端 Event。

### **Phase 3: 前端互動與氣閘 (UI & Airlock)**

* \[ \] **TASK-3.1: 看板介面 (Kanban)**  
  * 實作 \<KanbanBoard /\> (3欄布局)。  
  * 串接 Rust Command: get\_tasks, move\_task。  
  * 針對 Windows 優化 Scrollbar CSS。  
* \[ \] **TASK-3.2: 氣閘模態窗 (Airlock Modal)**  
  * 實作全域 Overlay 組件。  
  * 實作 Diff View: 使用 react-diff-view 或簡單的文字比對展示 AI 請求變更的內容。  
  * 綁定 Approve/Reject 按鈕至 Rust 後端狀態變更。  
* \[ \] **TASK-3.3: 設定與多語系**  
  * 建立 i18n 系統 (載入 zh-TW.json)。  
  * 實作設定頁面: 切換語言、開啟/關閉身分廣播。

### **Phase 4: 打包與發布 (Release)**

* \[ \] **TASK-4.1: Windows 打包設定**  
  * 設定 tauri.conf.json bundle identifier。  
  * 設定 WiX / NSIS 模板 (加入 EULA, 安裝路徑選擇)。  
  * 產生 .msi 與 .exe 進行安裝測試。  
* \[ \] **TASK-4.2: CLI Alias (trs)**  
  * 編寫 Rust 邏輯: App 首次啟動時，檢測 Path，將 taskrails.exe 的軟連結或 shim 寫入 System Path (命名為 trs.exe)。

## **6\. 開發邊界 (Boundaries)**

### **✅ In Scope**

1. **Windows Native**: 專注於 Windows 10/11 的 UX 細節 (字體、視窗行為)。  
2. **Local Context**: 所有對話與狀態優先儲存於本地 SQLite。  
3. **Protocol Enforcement**: 強制執行 Airlock 與 Hard Reset。

### **❌ Out of Scope**

1. **Mobile Native**: 不開發 iOS/Android App。  
2. **Cloud Billing**: 不處理任何 API 計費。  
3. **Linux/Mac Optimization**: Phase 1 暫不處理非 Windows 的特殊相容性問題。