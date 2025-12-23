# TaskRails 使用手冊 (User Manual)

歡迎使用 **TaskRails**。本手冊將引導您如何利用這個原生桌面協作器來管理您的 AI 輔助開發流程。

---

## 1. 核心概念 (Core Concepts)

TaskRails 不僅僅是一個任務看板，它是您與 AI Agent 之間的「防火牆」與「導航員」。

### 為什麼需要 TaskRails？

在使用 Cursor 或 Windsurf 等 AI 編輯器時，AI 容易在長時間對話後「迷路」（忘記初衷）或變得懶惰。TaskRails 透過以下機制解決此問題：

1.  **強制角色分工**: 開發時只專注開發，審查時只專注審查。
2.  **上下文重置 (Hard Reset)**: 每次切換角色，TaskRails 都會協助清除 AI 的短期記憶，確保它以全新的視角審視代碼。
3.  **氣閘 (Airlock)**: 在代碼合併前，強制一停一看的審核流程。

---

## 2. 介面導覽 (Interface Tour)

### 2.1 側邊欄與角色分頁 (Sidebar & Role Tabs)

位於左側的導覽列是操作核心。最頂端的三個圖示代表三種工作模式：

- **🔨 Coder (開發者模式 - Alt+1)**

  - **情境**: 撰寫功能、修復 Bug。
  - **行為**: AI 會收到積極、執行力強的指令。
  - **顏色**: 🔶 工業橘。

- **🛡️ Reviewer (審查者模式 - Alt+2)**

  - **情境**: Code Review、安全性檢查、尋找邏輯漏洞。
  - **行為**: AI 會變得嚴格、批判性強，並拒絕寫入代碼（唯讀）。
  - **顏色**: 🔴 警示紅。

- **📐 Architect (架構師模式 - Alt+3)**
  - **情境**: 規劃資料庫、分拆任務、撰寫規格。
  - **行為**: AI 關注宏觀結構，忽略實作細節。
  - **顏色**: 🔵 藍圖藍。

### 2.2 任務看板 (Mission Control)

中央區域是您的任務指揮中心，分為三欄：

- **To-Do**: 待辦事項。您可以在此創建新任務。
- **Doing**: 進行中。當您將任務拖入此區，AI 會自動獲取該任務的上下文。
- **Done**: 已完成。

### 2.3 狀態監控 (Status Widgets)

位於介面底部或角落：

- **Token Usage**: 圓形進度條顯示當前對話的 Token 用量。若變為紅色 (>90%)，建議立即重置對話。
- **MCP Status**: 顯示目前與 IDE 連線的狀態 (Stdio / SSE)。

---

## 3. 連接設定 (Integration Guide)

TaskRails 透過 **Model Context Protocol (MCP)** 與您的 IDE 溝通。

### 3.1 連接 Cursor / Trae / VS Code (Stdio 模式)

這類編輯器通常支援透過標準輸入/輸出 (Stdio) 執行 MCP Server。

1.  開啟 IDE 的設定面板。
2.  導航至 **MCP** 或 **Features > MCP Servers**。
3.  新增一個 Server：
    - **Type**: `command` (stdio)
    - **Command**: `taskrails` (若未加入 PATH，請輸入完整路徑，如 `C:\Path\To\taskrails.exe`)
    - **Args**: `mcp-stdio`

### 3.2 連接 Google Antigravity

Antigravity 支援兩種連接模式，您可以根據需求選擇：

**方法 A: Stdio 模式 (推薦)**
這是在本地運行的最佳方式。

1.  在代理面板點擊「...」選單，選擇 **Manage MCP Servers**。
2.  點擊 **View raw config** 開啟 `mcp_config.json`。
3.  新增配置：
    ```json
    "taskrails": {
      "command": "C:\\Program Files\\TaskRails\\taskrails.exe",
      "args": ["mcp-stdio"]
    }
    ```

**方法 B: SSE 模式**
若您需要遠端連接。

1.  TaskRails 啟動後，確認 SSE Server 已運行於 `localhost:4567`。
2.  在 Antigravity 的 MCP Toolbox 中，輸入 Server URL：`http://localhost:4567/sse`。

---

## 4. 氣閘流程 (The Airlock Workflow)

當 AI 完成了一段代碼並請求驗收時，會觸發氣閘機制：

1.  **鎖定**: TaskRails 介面會被一個全域遮罩覆蓋，暫停所有非必要的互動。
2.  **檢視 (Diff View)**: 畫面中央會顯示 AI 提議的變更 (Diff)。
3.  **決策**:
    - **批准 (Approve)**: 任務移動至 Done，允許 AI 繼續。
    - **駁回 (Reject)**: 任務退回 To-Do/Doing，並強迫 AI 修改。

---

## 5. 常見問題 (Troubleshooting)

**Q: 為什麼我看不到 Token 數據？**
A: 請確認您的 IDE 是否有正確發送 `sampling/createMessage` 或相關 API 調用。部分舊版 IDE 可能未完全支援 MCP 的 Sampling 功能。

**Q: "Hard Reset" 是如何運作的？**
A: TaskRails 嘗試呼叫 IDE 的指令 (如 `workbench.action.clearEditorHistory`)。若 IDE 不支援，它會注入一段特殊的 System Prompt (`--- SYSTEM RESET ---`) 來「催眠」AI 忽略之前的對話。

**Q: 修改設定後需要重啟嗎？**
A: 大部分設定 (如語言、主題) 即時生效。但修改 **MCP Port** 或 **Server Mode** 需要重啟應用程式。
