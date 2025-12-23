# TaskRails (原生桌面 AI 協作編排器)

![TaskRails Logo](./LOGO.png)

> **"Coding on Rails."** - 防止 AI 幻覺與權限越界的中樞神經系統。

TaskRails 是一個專為 Windows 優化的原生桌面應用程式，旨在透過 **Model Context Protocol (MCP)** 充當 IDE 與 AI Agent 之間的中樞神經。它強制執行「開發 -> 審查 -> 驗收」的標準作業程序 (SOP)，並提供嚴格的 Context 隔離與氣閘 (Airlock) 機制。

---

## 🚀 核心價值 (Core Values)

- **🛡️ 氣閘機制 (Airlock Protocol)**: 強制在「開發」與「審查」階段之間進行人工介入。AI 請求合併代碼時，必須經過您的明確批准。
- **🧠 上下文隔離 (Context Isolation)**: 獨創的 **Hard Reset** 技術。當切換角色（如從 Coder 切換到 Reviewer）時，強制清除 IDE 的記憶與歷史，防止 AI 偷懶或產生幻覺。
- **🎭 角色導向 (Role-Based)**: 內建三種專屬角色模式，一鍵切換上下文與系統提示詞 (System Prompt)。
- **🔌 雙模 MCP 引擎**: 同時支援 **Stdio** (適用於 Cursor, Trae) 與 **SSE** (適用於 Antigravity) 協議，相容市面上主流 AI 編輯器。

## 🛠️ 功能特色 (Features)

- **⚡ Native Performance**: 基於 **Tauri v2** 與 **Rust** 打造，輕量、快速、低資源佔用。
- **📊 Kanban Mission Control**: 內建看板 (To-Do, Doing, Done)，將開發流程可視化。
- **💎 Token Monitor**: 實時監控 Prompt Token 用量，避免意外的 API 費用暴漲。
- **🎨 Cyber-Industrial UI**: 專為開發者設計的賽博工業風介面，支援 Windows 原生視窗特效。

## 📦 安裝與設定 (Installation)

### 先決條件 (Prerequisites)

- **OS**: Windows 10 / 11
- **Runtime**: [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (Windows 內建)
- **Build Tools** (僅開發需要): Rust, Node.js (v18+)

### 開發環境建置 (Development Setup)

1.  **Clone 專案**

    ```bash
    git clone https://github.com/your-repo/taskrails.git
    cd taskrails
    ```

2.  **安裝依賴**

    ```bash
    npm install
    ```

3.  **啟動開發伺服器**
    ```bash
    npm run tauri dev
    ```

## 🎮 使用指南 (Quick Start)

### 角色切換 (Role Switch)

使用側邊欄頂部的分頁或快捷鍵快速切換模式：

| 角色             | 快捷鍵    | 用途               | 代表色  |
| :--------------- | :-------- | :----------------- | :------ |
| **🔨 Coder**     | `Alt + 1` | 撰寫代碼、執行任務 | 🔶 橘色 |
| **🛡️ Reviewer**  | `Alt + 2` | 代碼審查、尋找 Bug | 🔴 紅色 |
| **📐 Architect** | `Alt + 3` | 系統設計、規劃架構 | 🔵 藍色 |

### 連接您的 IDE

TaskRails 啟動後會自動運行 MCP Server。

- **Cursor / Trae**: 在設定中加入 `taskrails mcp-stdio` 指令。
- **Antigravity**: 支援 **Stdio** (推薦) 或 **SSE**。
  - Stdio: 在 `mcp_config.json` 設定 command。
  - SSE: 連接 `http://localhost:4567/sse`。

## 🏗️ 技術堆疊 (Tech Stack)

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend (Core)**: Rust, Tauri v2, Tokio, Rusqlite
- **Protocol**: Model Context Protocol (MCP) - Stdio & SSE

## 📄 授權 (License)

MIT License
