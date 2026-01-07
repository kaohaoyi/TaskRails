# TaskRails (原生桌面 AI 協作編排器)

![TaskRails Cover](./docs/assets/cover.png)

> **"Coding on Rails."** —— 賦予 AI 工程化思維的中樞神經系統。

TaskRails 是一個專為 Windows 優化的原生桌面應用程式，專注於 **AI 驅動的專案管理**與**上下文編排**。它不僅是一個看板工具，更是連接您、IDE 與 AI Agent 之間的橋樑，透過 **Model Context Protocol (MCP)** 與**多視窗 AI 協作介面**，實現真正的「人機共生」開發流程。

---

## 🚀 核心升級 (Latest Highlights)

### 🤖 Architect AI Chat (獨立多螢幕視窗)

不再受限於單一螢幕！全新的 **Architect AI** 聊天介面現已升級為**獨立原生視窗**。

- **多螢幕支援 (Multi-Monitor)**：將 AI 顧問拖曳至第二螢幕，邊看代碼邊諮詢，實現無縫多工。
- **持久化記憶 (Persistent Sessions)**：自動儲存對話歷史，隨時回溯關鍵決策。
- **自定義 AI 人格 (Custom Persona)**：可隨時調整 System Prompt，讓 AI 變身為嚴厲的 Code Reviewer 或溫柔的教學導師。
- **原生體驗**：支援拖曳、縮放與現代化玻璃質感介面。

### 📋 Spec-To-Task (規格驅動開發)

將文字需求轉化為可執行任務。

- 在 **SPEC** 頁面貼上專案需求或 Markdown 規格書。
- 自動解析並**一鍵注入 (Inject)** 任務至看板，確保開發目標與需求文檔 100% 對齊。

---

## �️ 功能全覽 (Features)

### 1. 專案管理中樞 (Project Hub)

- **看板系統 (Kanban)**：拖曳式 To-Do / Doing / Done 管理，支援任務優先級與標籤。
- **雙向同步 (Sync)**：數據同時儲存於本地 SQLite 資料庫與專案根目錄的 `.taskrails` json 檔案，方便版控與團隊協作。
- **任務重工機制 (Rework Protocol)**：標記「重工」任務，自動保留舊紀錄並生成新任務，完整追蹤修正歷程。

### 2. MCP 整合 (Context Orchestrator)

- **角色切換 (Role Switching)**：內建 Coder, Reviewer, Architect 三種角色，切換時自動淨化 IDE 上下文 (Context Clearing)。
- **氣閘機制 (Airlock)**：關鍵操作（如刪除大量代碼）需經過人類批准，防止 AI 暴走。
- **雙協議支援**：同時支援 **Stdio** (Cursor/Trae) 與 **SSE** (Antigravity/Windsurf)。

### 3. 工程儀表板 (Engineering Dashboard)

- **Git Commit 追蹤**：視覺化 Commit 歷史與變更。
- **Issue 整合**：(即將推出) 直接在 App 內管理 GitHub Issues。

---

## 🏗️ 技術堆疊 (Tech Stack)

應用程式基於現代化高效能技術構建：

- **Core**: [Rust](https://www.rust-lang.org/) + [Tauri v2](https://v2.tauri.app/) (提供極致效能與原生 OS 交互)
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Cyber-Industrial Design System)
- **Database**: SQLite (透過 `rusqlite` 與 `Deadpool` 進行連接池管理)
- **AI Integration**: 整合 Google Gemini, OpenAI, Claude 等多模型 API。

---

## 📦 安裝與啟動 (Installation)

### 開發環境 (Development)

確保您已安裝 **Rust**, **Node.js (v18+)** 與 **WebView2**。

1.  **Clone 專案**

    ```bash
    git clone https://github.com/your-repo/taskrails.git
    cd taskrails
    ```

2.  **安裝依賴**

    ```bash
    npm install
    ```

3.  **啟動開發模式**
    ```bash
    # 確保 Rust cargo 在環境變數中
    npm run tauri dev
    ```

### 生產構建 (Build)

```bash
npm run tauri build
```

產出的 `.exe` 或 `.msi` 檔案將位於 `src-tauri/target/release/bundle`。

---

## 🎮 快捷鍵指南 (Shortcuts)

| 範圍     | 快捷鍵          | 功能                             |
| :------- | :-------------- | :------------------------------- |
| **全局** | `Alt + 1`       | 切換至 Coder 模式 (專注開發)     |
| **全局** | `Alt + 2`       | 切換至 Reviewer 模式 (代碼審查)  |
| **全局** | `Alt + 3`       | 切換至 Architect 模式 (架構規劃) |
| **聊天** | `Shift + Enter` | 換行 (不發送)                    |
| **聊天** | `Enter`         | 發送訊息                         |

---

## 🏗️ 技術細節與架構

關於 TaskRails 的詳細系統架構、技術堆疊與 API 指令，請參閱：
👉 **[SYSTEM_SPEC.md](./docs/SYSTEM_SPEC.md)**

## 📖 使用指南

初次使用或設定新專案，請參閱：
👉 **[USER_GUIDE.md](./docs/USER_GUIDE.md)**

---

## 📄 授權 (License)

MIT License © 2026 Antigravity Agent
