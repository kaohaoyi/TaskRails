# **TaskRails v1.0: 賽博工業協作編排器架構藍圖 (Cyber-Industrial Orchestrator)**

版本: 1.0.0  
狀態: 核准開發 (Approved for Development)  
最後更新: 2025-12-24  
前身: 取代舊版 README.md，作為單一真理來源 (SSOT)。  
**"Coding on Rails."** —— 將 AI 從聊天機器人轉型為精確調度的工業模組。

## **1\. 執行摘要 (Executive Summary)**

TaskRails v1.0 徹底重構了人機協作模式。我們不再試圖取代 IDE，而是成為連接您、IDE (如 Antigravity/Cursor) 與 AI Agent 之間的中樞神經系統。

### **核心定位 (Positioning)**

- **TaskRails (教練/Orchestrator)**：
  - **大腦**: 規劃架構 (Mermaid)、管理記憶 (Experience DB)。
  - **裁判**: 定義邊界 (Sentinel)、執行氣閘 (Airlock)。
  - **管家**: 自動化版本控制 (Git Ops) 與環境檢查。
  - **職責**: **不直接寫碼**，而是提供 Context 與約束。
- **AI IDE (選手/Executor)**：
  - **手腳**: 執行實際代碼生成與編輯。
  - **工具**: 首選 **Antigravity**，支援 **Vibecoding (CLI)**。
  - **職責**: 依據 TaskRails 的規格進行開發。

## **2\. 系統架構 (System Architecture)**

### **2.1 複合式 Agent 模型 (Composite Agent)**

不再依賴單一 System Prompt。Agent 是動態組裝的實體：

$$\\text{活躍 Agent} \= \\text{基礎職位 (Role)} \+ \\text{原子技能 (Skills)} \+ \\text{經驗遺傳 (Experience)}$$

- **原子技能**: 單次任務最多 5 個。透過 .meta/skills/\*.json 交換狀態 (黑板模式)。
- **經驗遺傳**: 透過 **功能標籤 (Feature Tags)** (如 feat:cart) 實現跨專案的智慧繼承。

### **2.2 模組哨兵 (Module Sentinel)**

新一代的檔案總管，關注模組健康度而非檔案列表。

- **執行模式**:
  - **Native**: 直接調用本機 PATH。
  - **Container**: 優先連接長駐 Docker 容器 (解決 Linter 延遲)。
- **環境感知**: 自動繼承 Shell PATH，執行 SemVer 檢查，處理 Host/Container 路徑映射。
- **Linter**: 內建 80/20 法則 Regex 解析器 (TS/Rust/Python)。

### **2.3 流程可視化器 (Workflow Visualizer)**

- **Mermaid 雙向綁定**:
  - Code-to-Graph: 即時渲染。
  - Graph-to-Code: 右鍵新增節點 (MVP)。
- **AI Refinement**: 架構師人格自動修補邏輯漏洞。

### **2.4 多 Agent 協作協定 (MACP)**

- **機制**: Agent 間 **不共享對話歷史**。
- **交接**: 前端 Agent 寫入 api_contract.json \-\> 氣閘批准 \-\> 系統 Hard Reset \-\> 後端 Agent 讀取 JSON 接手。

### **2.5 衛星監控 (TaskRails Satellite)**

VS Code Extension，提供 IDE 內的即時回饋。

- **通訊架構 (WebSocket Server)**:
  - **技術**: 在 Rust 後端使用 **actix-web** 建立輕量級 WS Server (與 Tauri 共存)。
  - **廣播器 (Broadcaster)**: 採用 **Actor 模型**。每個 WebSocket 連線是一個 Actor，Broadcaster 維護 Recipient 列表，負責跨執行緒訊息推送。
  - **端口策略**: 預設嘗試 3002，若佔用則**隨機跳號**並寫入 local_env.json。
- **連線韌性 (Resilience)**:
  - **指數退避 (Exponential Backoff)**: Satellite 端必須實作重連機制 (1s \-\> 2s \-\> 4s...)，防止服務雪崩。
- **安全性 (Auth)**:
  - **Token**: TaskRails 啟動時生成隨機 Token，寫入 local_env.json。Satellite 需帶上此 Token 驗證。
- **功能**: 狀態列顯示燈號、右鍵 Save as Experience 回傳經驗。

### **2.6 經驗治理 (The Inbox)**

- **入口**: 防止垃圾代碼污染。
- **規則**: 新經驗預設 Pending，**嚴禁** Agent 使用。
- **動作**: 清洗 (Scrubbing) \-\> 核准 (Approve) / 駁回 (Reject)。

### **2.7 經驗圖書館 (The Library)**

已核准經驗的長期維護中心。

- **UI 佈局**: **獨立視窗**。
  - _通訊_: **廣播模式 (Broadcast)**。透過 Event Bus 同步狀態。
  - **維護遮罩 (Overlay)**: 當 MCP 暫停時，顯示全螢幕 Spinner \+ 文字，阻擋操作。
- **檢索**: 支援 **標籤 (Tags)** \+ **描述關鍵字** 搜尋。
- **編輯策略**: **直接覆蓋 (Overwrite)** \+ **快照載入 (Snapshot)**。
- 還原安全協定 (Restore Safety Protocol):  
  採用 應用層悲觀鎖 (Pessimistic Locking)：
  1. **鎖定 (Lock)**: 設定 is_paused \= true。MCP 拒絕所有外部寫入 (Return 503)。
  2. **快照 (Pre-Snapshot)**: 自動備份當前 DB。
  3. **斷線 (Disconnect)**: 關閉 SQLite 連線。
  4. **替換 (Replace)**: 覆蓋 DB 檔案。
  5. **重啟 (Relaunch)**: 強制重啟 Process。

### **2.8 版本控制與發布 (Git Ops)**

整合 Git 與 SemVer，將發布流程自動化。

- **Git 整合 (rust-git2)**:
  - **技術**: 引入 git2 crate (開啟 ssh feature)。
  - **認證預檢 (Auth Pre-flight)**: 在 **環境握手** 階段執行 git fetch \--dry-run。若失敗，停用 Git Ops。
- **自動版本號 (Auto-Versioning)**:
  - **多源同步**: 同時更新 package.json/Cargo.toml 與 TaskRails Config。
  - **提交**: 自動生成 chore(release): bump version to x.y.z Commit。
  - **標籤**: 自動加上 v 前綴 (e.g., v1.2.3)。
- **衝突處理 (Conflict Handling)**:
  - **策略**: **Hard Reset**。
  - **行為**: 若 Merge 發生衝突，TaskRails 立即執行 git reset \--hard HEAD 放棄合併，並彈窗提示使用者回 IDE 解決。這確保了系統狀態的絕對乾淨。
- **進階選項**:
  - **Bypass Hooks**: 提供 \--no-verify 選項跳過 pre-commit hooks。

## **3\. 資料與儲存策略 (混合制)**

| 元件             | 儲存方式 | 路徑                                    | 理由                                             |
| :--------------- | :------- | :-------------------------------------- | :----------------------------------------------- |
| **專案配置**     | JSON     | .taskrails/config/{ProjectName}.json    | 團隊同步。包含 min_taskrails_version 欄位。      |
| **本地環境快取** | JSON     | .taskrails/config/local_env.json        | **GitIgnore**。存有 Satellite Token 與 WS Port。 |
| **模組元數據**   | JSON     | .meta/manifest.json                     | 緊隨代碼，Git 版控。                             |
| **經驗日誌**     | SQLite   | memory/experience.db                    | 本地高效查詢。                                   |
| **自動備份**     | SQLite   | backups/exp\_{YYYYMMDD_HHmm}\_{Size}.db | 啟動時自動備份，啟動時清理舊檔。                 |

### **Schema 自動遷移 (Auto-migration)**

- **機制**: 啟動時檢查 PRAGMA user_version。
- **防禦性程式設計**: 若 Migration 失敗，系統 **自動回滾 (Rollback)** 並 **鎖死 App (Panic Mode)**，顯示錯誤日誌。

## **4\. 邊界協議 (Boundary Protocols)**

### **4.1 氣閘 (Airlock)**

- **主動攔截**: MCP 檢查 \<scope_intent\>。
- **被動防禦**: File Watcher 監控變更。
- **CLI 回饋**: 輸出 ANSI 紅字警報，並強制中斷 Tool Call。

### **4.2 標籤治理**

- **硬性限制**: 每個模組最多 5 個自定義標籤。
- **別名系統**: UI 顯示 web-client (別名)，底層儲存 frontend (標準名)。

## **5\. 技術堆疊 (Tech Stack)**

- **Core**: Rust \+ Tauri v2
  - **Docker**: bollard
  - **Git**: git2 (feature: ssh)
  - **WS Server**: actix-web \+ actix-ws (Actor Model)
  - **DB**: rusqlite
- **Frontend**: React 19, Tailwind CSS, Monaco Editor。
- **Protocol**: MCP (Stdio / SSE 雙模)。
- **Satellite**: VS Code Extension (TypeScript, WebSocket Client)。

## **6\. 開發路線圖 (Phase 1 MVP)**

1. **Docker Client**: Windows Pipe 連線, Volume 自動掛載。
2. **哨兵 UI**: 實作別名 Tooltip 與環境檢查面板。
3. **經驗系統**:
   - **Inbox**: 審核介面。
   - **Library**: 獨立視窗 \+ 廣播通訊 \+ 安全還原。
4. **Git Ops**:
   - git2 整合、認證預檢、**Hard Reset 衝突中斷**。
   - 版本同步 (Multi-file Bump \+ **v-prefix Tag**)。
5. **Satellite**:
   - actix-web WebSocket Server (Broadcaster Actor)。
   - Extension 狀態列顯示 \+ **Exponential Backoff 重連**。

### **Phase 2 (Future)**

- **經驗分享**: JSON 匯出/匯入。
- **雲端同步**: 經驗庫上雲。

## **7\. 標準作業程序 (SOP)**

1. **指令啟動 (Kernel Injection)**
   - 在 AI IDE (Antigravity) 輸入 Prompt 連結 TaskRails。
2. **環境握手 (Handshake)**
   - **檢查**: Native/Docker 環境、**Git 憑證預檢**。
   - **動作**: Schema Migration、備份清理。
   - **連線**: 啟動 WebSocket Server (Random Port)，生成 Token。
3. **Agent 組裝**
   - 選擇職位與技能，載入 feat:tags 經驗快照。
4. **規劃 (Mermaid)**
   - 繪製/生成流程圖，TaskRails 自動掛載至 IDE Context。
5. **編碼 (Coding @ IDE)**
   - 使用者在 IDE 開發，TaskRails 哨兵監控邊界。
6. **交接 (Handoff)**
   - 前端完成 \-\> 氣閘批准 \-\> Hard Reset \-\> 後端接手。
7. **驗收 (Verification)**
   - 哨兵確認 Linter 綠燈。
8. **回饋 (Feedback Loop)**
   - **逆向同步**: IDE 右鍵 Save as Experience \-\> Inbox。
9. **園藝 (Gardening)**
   - **Inbox**: 每日清洗 Pending 經驗。
   - **Git Release**:
     1. 檢查 Git 狀態 (無衝突)。
     2. UI 點擊 Bump Minor (更新 package.json & Config)。
     3. 勾選 Bypass Hooks (可選)。
     4. 確認 Commit (chore(release): bump...) & Tag (v...) & Push。
