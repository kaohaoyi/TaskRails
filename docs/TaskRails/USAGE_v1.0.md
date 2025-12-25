# TaskRails v1.0 操作手冊 (User Manual)

歡迎使用 **TaskRails v1.0**。這是一套專為 AI 協作開發設計的原生桌面編排器。本手冊將引導您熟悉全新的 v1.0 架構、介面操作以及標準開發流程。

---

## 1. 核心介面導覽 (Interface Guide)

TaskRails 的介面設計採用「賽博龐克工業風 (Cyber-Industrial)」，強調資訊的高密度與操作的直覺性。

### 1.1 側邊導航欄 (Sidebar)

位於畫面左側，分為三大區域：

- **MANAGEMENT (管理區)**

  - **Manual**: 內建使用說明文件。
  - **Specs (規格書)**: 專案需求管理核心。可貼上 Markdown 格式的需求文件，並支援**「一鍵注入 (Inject to Kanban)」**功能，將條列式需求自動轉化為看板任務。
  - **Role Settings**: AI 角色配置。在此定義 Coder, Reviewer 等角色的 System Prompt 與權限。
  - **Kanban (看板)**: 專案執行的主戰場，視覺化管理任務狀態。
  - **Missions (清單)**: 任務的條列式視圖，適合快速瀏覽與批量操作。
  - **AI Architect**: 開啟獨立的 AI 顧問視窗（支援多螢幕）。

- **ENGINEERING (工程區)**

  - **Issues**: (即將推出) 問題追蹤整合。
  - **Commits / History**: Git 提交紀錄與專案歷史視覺化。

- **OPERATIONS (運維區)**
  - **Ops Center**: **[v1.0 新增]** 中央運維儀表板。不可忽視的核心區域。

### 1.2 運維中心 (Ops Center)

這是 v1.0 的最大亮點，整合了 Sentinel 監控與 Git Ops：

- **Sentinel Status**: 顯示當前環境健康度 (Native/Container) 與 Linter 狀態。
- **Git Operations**:
  - **Version Control**: 點擊 `Patch` 或 `Minor` 按鈕可快速升級版本號。
  - **Danger Zone**: 提供 `Hard Reset` 按鈕，用於緊急狀況下捨棄所有未提交變更，恢復系統至乾淨狀態（請謹慎使用）。
- **System Logs**: 右下角即時預覽系統後台日誌 (WebSocket, Sentinel events)。

### 1.3 Architect AI (獨立視窗)

點擊 Sidebar 的 "AI Architect" 會開啟一個全新的原生視窗：

- **獨立運作**: 可拖曳至第二螢幕，邊寫程式邊諮詢，不佔用主介面空間。
- **Persistent Session**: 對話紀錄自動保存。左側 Sidebar 可切換不同對話。
- **Skill Injection**: 點擊設定圖示，可勾選 "Active Skills" (如 Rust Expert, React Master)，動態增強 AI 能力。

---

## 2. 標準作業流程 (Standard Workflow)

遵循此流程可發揮 TaskRails 的最大效能：

### Step 1: 規格定義 (Define)

1.  進入 **Specs** 頁面。
2.  貼上您的專案需求說明 (Markdown 格式)。
3.  點擊下方 **"Inject Tasks to Kanban"**。系統會自動解析標題與清單，將其轉換為看板上的任務卡片。

### Step 2: 任務編排 (Plan)

1.  進入 **Kanban** 頁面。
2.  您會看到剛導入的任務位於 `TODO` 欄位。
3.  依據優先級 (Priority) 上下拖曳排序卡片。
4.  為任務分配對應的 AI 角色 (如指派給 Coder)。

### Step 3: 執行與開發 (Execute)

1.  將任務卡片由 `TODO` 拖曳至 `DOING`。
2.  **開啟 AI Architect 視窗**，將任務內容複製給 AI，開始進行代碼生成或討論。
3.  利用 AI 的建議在 IDE (Cursor/VSCode) 中實作功能。

### Step 4: 審查與測試 (Review)

1.  功能完成後，將任務拖曳至 `DONE`。
2.  若需 AI 協助 Code Review，可切換 AI 角色或使用相關 Skill。

### Step 5: 版本發布 (Release)

1.  進入 **Ops Center**。
2.  確認 Sentinel 狀態為 `SECURE` (無嚴重 Linter 錯誤)。
3.  確認 Git 狀態乾淨 (Clean)。
4.  點擊 `Patch` 進行版本號升級與標記。

---

## 3. 情境教學：建立一個新功能 (Tutorial)

**情境**：我們要為 App 增加一個「登入頁面」。

1.  **寫規格**:

    - 在 **Specs** 頁面輸入：

      ```markdown
      ## Phase 1: Authentication

      - 實作登入介面 UI
      - 整合 OAuth 登入邏輯
      ```

    - 點擊 **Inject**。

2.  **確認任務**:

    - 回到 **Kanban**，看到兩張新卡片：「實作登入介面 UI」與「整合 OAuth 登入邏輯」。

3.  **開始工作**:

    - 把「實作登入介面 UI」拉到 `DOING`。
    - 打開 **AI Architect**，輸入：「請幫我設計一個賽博龐克風格的登入頁面，使用 Tailwind CSS。」

4.  **實作**:

    - 將 AI 產生的代碼貼入專案 `src/pages/Login.tsx`。

5.  **提交**:
    - 完成後，去 **Ops Center** 看一下 Sentinel 是否有報錯。
    - 沒問題的話，任務卡片拉到 `DONE`。
    - (選擇性) 在 Ops Center 點擊 `Patch` 升級版本到 v1.0.1。

---

**TaskRails v1.0 - Coding on Rails.**
賦予您 AI 工程化思維的中樞神經系統。

---

## 4. v1.0 Orchestrator 新增功能 (New Features)

### 4.1 AI 輔助規格與角色建立 (AI-Assisted Creation)

TaskRails v1.0 支援利用 AI 來協助您撰寫規格書與定義角色。

- **Specs (規格書)**:

  - 點擊右上角的 **"AI_CONSULT"** 按鈕，開啟 AI 對話視窗。
  - 輸入如：「請幫我為一個 E-commerce App 草擬一份規格書，包含使用者認證與購物車功能」。
  - 將 AI 生成的 Markdown 複製回 Specs 編輯器即可。

- **Role Settings (角色設定)**:
  - 在新增角色時，點擊 System Prompt 標籤旁的 **"AI Suggest"** 按鈕。
  - AI 將協助您撰寫專業的 Role Prompt (如：「你是資深 Rust 工程師，專注於記憶體安全...」)。

### 4.2 Agent Lab (複合 Agent 實驗室)

v1.0 引入了「複合式 Agent (Composite Agent)」概念，讓您能針對特定任務組裝專屬的 AI 人格。

**使用流程**:

1.  **選擇角色 (Base Role)**: 點擊 `Architect` (架構規劃), `Coder` (實作), 或 `Reviewer` (審查)。
2.  **選擇技能 (Atomic Skills)**: 點擊 `Rust Expert`, `React Master` 等技能卡片。
3.  **繼承經驗 (Experience Tags)**: 輸入 `feat:auth` 或 `feat:ui`，讓 AI 繼承過去相關任務的經驗 (Memory)。
4.  **初始化 (Initialize)**: 點擊下方按鈕。系統會生成一段高強度的 System Prompt 並注入到 Architect AI 視窗中。

### 4.3 Planner (工作流可視化)

為了更好地規劃架構，我們整合了 Mermaid.js 渲染引擎。

**界面導覽**:

- **模板庫 (Templates)**: 點擊頂部的下拉選單，可快速載入 `Flowchart`, `Sequence`, `Class`, `State`, `ER Diagram` 等常用模板。
- **左側 (Editor)**: 輸入 Mermaid 語法 (如 `graph TD; A-->B;` )。
- **右側 (Preview)**: 即時顯示渲染後的流程圖或架構圖。
- **Inject to Context**: 將目前的圖表架構發送給 AI，讓它理解整體設計。

### 4.4 Knowledge Base (經驗知識庫)

經驗知識庫 (Experience System) 是 TaskRails v1.0 的「大腦」，用於儲存與檢索組織內的技術方案與 Pattern。

**功能介紹**:

- **Search (搜尋)**: 在上方搜尋列輸入關鍵字 (如 `auth`, `redis`, `error handling`)，即時檢索過去儲存的解決方案。
- **Log Experience (錄入經驗)**:
  - 遇到值得記錄的技術難點或優秀的 Pattern 時，點擊 **"+ LOG EXPERIENCE"**。
  - **Context**: 描述問題情境。
  - **Solution**: 貼上解決方案的代碼片段。
  - **Tags**: 輸入標籤 (e.g., `rust`, `websocket`) 以利未來檢索。
- **視覺化**: 支援語法高亮的代碼顯示與標籤過濾。
