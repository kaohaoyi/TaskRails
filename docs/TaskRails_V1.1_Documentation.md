# TaskRails V1.1 完整功能規格與架構說明書

> **版本**: v1.1
> **最後更新**: 2025-12

## 1. 專案概述 (Project Overview)

TaskRails 是一個結合 **AI Agent** 與 **任務管理** 的現代化開發輔助平台。它不只是一個看板工具，更是一個「AI 原生」的 IDE 伴侶，旨在幫助開發者將複雜需求轉化為可執行的原子任務，並透過 AI 角色（Agents）協同完成代碼編寫、審查與運維工作。

**核心價值：**

- **結構化思維**：強制執行 6A (Align, Architect, Atomize, Approve, Act, Audit) 開發流程。
- **AI 協作**：內建 MCP (Model Context Protocol) 伺服器，允許 AI 直接操作文件系統與執行指令。
- **記憶體銀行**：自動記錄開發經驗 (Experience) 與專案狀態 (Memory Bank)，減少知識流失。

---

## 2. 系統架構 (System Architecture)

本專案採用 **Tauri** 框架，實現高效能的跨平台桌面應用。

### 2.1 技術堆疊 (Tech Stack)

- **Frontend (UI/UX)**:
  - **Framework**: React 19 + Vite 7 + TypeScript
  - **Styling**: Tailwind CSS v3 + Shadcn/UI (Lucide Icons)
  - **State Management**: React Hooks + Local Component State
  - **Visualization**: Mermaid.js (流程圖), DnD Kit (拖拉操作)
- **Backend (Core logic)**:
  - **Runtime**: Rust (Tauri v2)
  - **Database**: SQLite (本地數據持久化)
  - **Communication**:
    - **Tauri Invoke**: 前後端指令溝通
    - **MCP Server (Stdio/SSE)**: 作為 Agent 接口
    - **Satellite Server (Actix)**: 提供外部 API 訪問能力

### 2.2 核心模組設計

- **Command System**: 所有檔案讀寫、終端機指令、AI 對話皆透過 Rust `#[tauri::command]` 執行，確保安全性與效能。
- **State Machine**: 內建狀態管理器，追蹤當前專案、活躍角色 (Role) 與開發階段。
- **Dual-Server Architecture**:
  - **MCP Server**: 負責與 LLM (如 Claude/Gemini) 標準化溝通。
  - **Satellite Server**: 輕量級 HTTP 伺服器，用於接收來自 IDE (如 VSCode) 或其他工具的 Webhook。

---

## 3. 功能規格詳解 (Feature Specifications)

### 3.1 專案控制塔 (Project Setup Hub)

- **功能**: 專案初始化的入口。
- **流程**:
  1.  選擇/建立工作目錄 (Workspace)。
  2.  定義專案基礎 AI 設定 (Provider, Model, Key)。
  3.  初始化專案結構 (生成 `.taskrails` 配置檔)。
- **組件**: `ProjectSetupHub.tsx`, `ProjectSetupPopup.tsx`

### 3.2 智能規劃儀表板 (Planner & Kanban)

- **功能**: 視覺化任務管理。
- **視圖**:
  - **Board View**: 典型的看板 (To Do, In Progress, Done)，支援拖拉。
  - **Planner View**: 針對 Sprint 規劃的視圖，結合 AI 建議。
- **特色**: 任務包含詳細的 Markdown 描述、驗收標準與關聯檔案。
- **組件**: `KanbanBoard.tsx`, `Planner.tsx`, `TaskDetailModal.tsx`

### 3.3 Agent 實驗室 (Agent Lab & Chat)

- **功能**: 與 AI 協作的核心區域。
- **能力**:
  - **多角色切換**: 可切換不同 Persona (e.g., Architect, Backend Dev)。
  - **上下文感知**: AI 自動讀取當前任務與專案文件。
  - **執行力**: 可直接調用工具 (如 `view_file`, `run_command`)。
- **組件**: `AgentLab.tsx`, `AiChatWindow.tsx`, `ChatInterface.tsx`

### 3.4 記憶與經驗庫 (Memory & Experience)

- **功能**: 知識管理系統。
- **Memory Bank**: 存儲專案核心文件 (Project Rules, Tech Spec)。
- **Experience Library**: 記錄 Debug 過程與解決方案，供 AI 未來參考。
- **組件**: `MemoryBankViewer.tsx`, `ExperienceLibrary.tsx`

### 3.5 運維儀表板 (Ops Dashboard)

- **功能**: Git 版控與 CI/CD 監控。
- **能力**: 檢視 Commit 歷史、當前變更狀態、執行 Git 指令。
- **組件**: `OpsDashboard.tsx`, `MissionsPage.tsx`

---

## 4. 使用者流程指南 (Workflow Guide)

### 流程一：啟動新專案 (Bootstrapping)

1.  開啟 TaskRails。
2.  進入 **"Project Setup"**。
3.  點擊 **"Pick Folder"** 選擇本地開發目錄。
4.  填寫 AI 設定並儲存。

### 流程二：任務規劃 (Planning)

1.  進入 **"Planner"** 或 **"Tasks"** 頁面。
2.  點擊 **"New Task"** 或使用 **"AI Brainstorm"**。
3.  輸入需求（如：「新增登入頁面」）。
4.  AI 自動生成任務描述、驗收標準 (AC) 與技術建議。
5.  將任務拖入 **"In Progress"**。

### 流程三：執行開發 (Execution)

1.  在 **Agent Lab** 選定當前任務。
2.  選擇適合的角色 (如 Frontend Engineer)。
3.  與 AI 對話：「請幫我實作這個任務的 UI」。
4.  AI 透過 MCP 讀取檔案並生成代碼。
5.  開發者在 IDE 確認變更。

### 流程四：驗收與紀錄 (Audit & Archive)

1.  測試功能完成。
2.  在 Ops Dashboard 提交 Commit。
3.  將任務移至 **"Done"**。
4.  (選用) 在 Experience Library 記錄本次開發的關鍵坑點。

---

## 5. 檔案結構說明 (File Structure)

```text
e:\Dev\desktop\taskrails\
├── src/
│   ├── components/
│   │   ├── features/       # 核心業務功能組件 (Kanban, AgentLab, Ops...)
│   │   ├── layout/         # 佈局組件 (Sidebar, Header)
│   │   └── ui/             # 基礎 UI 元件 (Buttons, Inputs)
│   ├── constants/          # 全域常數 (AI Models, Enums)
│   └── utils/              # 工具函式
├── src-tauri/
│   ├── src/
│   │   ├── commands/       # 前端可調用的 Rust 指令集
│   │   ├── mcp/            # Model Context Protocol 實作
│   │   ├── db/             # SQLite 資料庫操作
│   │   └── lib.rs          # 應用程式入口與模組註冊
│   └── tauri.conf.json     # Tauri 應用配置
├── docs/                   # 專案文檔
└── backup/                 # 舊版檔案封存
```

## 6. Rust 後端指令集 (API Reference)

以下為前端可透過 `invoke` 調用的主要指令：

- **Task**: `create_task`, `update_task`, `get_tasks`
- **System**: `open_chat_window`, `execute_ide_command`, `check_environment`
- **File**: `read_workspace_file`, `write_workspace_file`, `pick_folder`
- **AI**: `execute_ai_chat`, `get_available_skills`
- **Ops**: `log_activity`, `analyze_linter_output`

---

## 7. 開發注意事項

- **路徑處理**: 所有檔案操作務必使用 **絕對路徑**。
- **狀態同步**: 前端狀態透過 Rust 後端作為 Single Source of Truth。
- **錯誤處理**: 確保所有 Rust Result 皆正確回傳至前端並顯示 Toast 通知。
_© 2025 TaskRails. MIT License._

_© 2025 TaskRails. MIT License._
