# TaskRails 系統架構與開發指南 (Architecture & Development Guide)

本文件概述 **TaskRails** 的技術架構、目錄結構與開發流程，旨在協助新進開發者快速上手。

---

## 1. 系統概觀 (System Overview)

TaskRails 採用 **Tauri v2** 框架，結合了 Web 前端的靈活性與 Rust 後端的效能。

### 1.1 高層架構圖

```mermaid
graph TD
    User[使用者] --> UI[Frontend (React/TS)]
    UI -- IPC Commands --> Core[Rust Core (Tauri)]

    subgraph "Rust Backend"
        Core --> DB[(SQLite Database)]
        Core --> MCP_Stdio[MCP Server (Stdio)]
        Core --> MCP_SSE[MCP Server (SSE)]
        Core --> State[State Machine]
        Core --> Token[Tiktoken Middleware]
    end

    MCP_Stdio <--> IDE_A[IDE: Cursor/Trae]
    MCP_Stdio <--> IDE_Antigravity[IDE: Antigravity (Stdio Mode)]
    MCP_SSE <--> IDE_Web[Web IDEs / Antigravity (Remote)]
```

### 1.2 核心元件

1.  **Host Application (Tauri)**: 負責視窗管理、系統托盤、原生 API 呼叫。
2.  **Frontend (React)**: 負責 UI 呈現、看板邏輯、氣閘互動。
3.  **MCP Engine (Rust)**: 核心業務邏輯，實作 Model Context Protocol，處理 IDE 請求。
4.  **Database (Rusqlite)**: 本地儲存所有任務、設定與日誌。

---

## 2. 目錄結構 (Directory Structure)

```text
taskrails/
├── src/                # 前端原始碼 (React)
│   ├── components/     # UI 元件 (Kanban, Sidebar, Airlock)
│   ├── hooks/          # Custom React Hooks
│   ├── store/          # 狀態管理 (Zustand/Context)
│   ├── styles/         # Tailwind 設定與 Global CSS
│   ├── App.tsx         # 主程式入口
│   └── main.tsx        # React 渲染入口
├── src-tauri/          # 後端原始碼 (Rust)
│   ├── src/
│   │   ├── commands/   # Tauri Commands (前端呼叫的 API)
│   │   ├── database/   # SQLite 連線與 Migration
│   │   ├── mcp/        # MCP Server 實作 (Stdio & SSE)
│   │   ├── state/      # 全域狀態 (AppState, Coder/Reviewer Mode)
│   │   ├── utils/      # 輔助工具 (Token Counting)
│   │   ├── lib.rs      # Library 入口
│   │   └── main.rs     # Binary 入口
│   ├── Cargo.toml      # Rust 依賴設定
│   └── tauri.conf.json # Tauri 專案設定
├── docs/               # 專案文件 (Manual, Architecture)
├── public/             # 靜態資源 (Images, Fonts)
└── package.json        # 前端依賴與腳本
```

---

## 3. 雙模 MCP 引擎 (Dual-Mode MCP Engine)

為了最大化相容性，TaskRails 實作了兩種 MCP 傳輸層：

### 3.1 Stdio Channel

- **用途**: 支援基於 Process 的 IDE (如 Cursor, VS Code, **Google Antigravity**)。
- **實作**: 監聽 `stdin` 的 JSON-RPC 訊息，並將回應寫入 `stdout`。
- **注意**: 在此模式下，`println!` 會破壞通訊協議，必須使用 `eprintln!` 進行日誌輸出。
- **Windows 相容性**: 需特別注意換行符 (`\r\n` vs `\n`) 的處理，確保 JSON 解析正確。

### 3.2 SSE Channel (Server-Sent Events)

- **用途**: 支援遠端或 Web-based 的 IDE。
- **實作**: 使用 `warp` 或 `axum` 框架在 `localhost:4567` 啟動 HTTP Server。
- **Endpoint**: `/sse` 用於建立連線，`/message` 用於發送請求。

---

## 4. 關鍵機制詳解 (Key Mechanisms)

### 4.1 狀態機 (State Machine)

系統狀態流轉由 Rust 枚舉 `TaskState` 控制：

- `Idle`: 閒置中。
- `CoderWorking`: 開發者模式，允許寫入。
- `ReviewerWorking`: 審查模式，唯讀。
- `AirlockWait`: 等待使用者批准 (Block Tool Calls)。

### 4.2 Token 監控 (Token Monitor)

使用 `tiktoken-rs` 庫。

- **Middleware**: 攔截所有進出的 MCP 訊息 (Resources, Prompts, RPC)。
- **計算**: 將文本轉為 Token 數並累加。
- **警報**: 當累積量超過閾值 (預設 80%)，透過 Tauri Event 通知前端顯示警告。

---

## 5. 開發流程 (Development Workflow)

1.  **環境**

    - 確保安裝 Node.js (v18+) 與 Rust (Stable)。
    - VS Code 建議安裝 `rust-analyzer` 與 `Tauri` 插件。

2.  **指令**

    - `npm run tauri dev`: 同時啟動前端與後端開發模式。
    - `npm run tauri build`: 編譯生產版本 (自動生成 .msi/.exe)。

3.  **除錯**
    - 前端: 使用瀏覽器開發者工具 (F12)。
    - 後端: 查看終端機輸出的 `eprintln!` 日誌。

---

## 6. 未來規劃 (Roadmap)

- **Phase 1**: Windows 基礎版 (目前階段)。
- **Phase 2**: 完整 MCP 支援 (含 Resources, Sampling)。
- **Phase 3**: macOS / Linux 移植。
- **Phase 4**: 雲端同步與團隊協作功能。
