# TaskRails 開發任務清單 (基於 Master Spec v1.0)

## Phase 1: 基礎建設與 UI (Foundation & UI) [已完成]

- [x] **TaskRails_UI_Foundation**
  - [x] **1. 專案初始化**
    - [x] 執行 `npm create tauri-app` (React/TS)。
    - [x] 安裝前端依賴 (Tailwind, Lucide, clsx)。
    - [x] 安裝/驗證 Rust 依賴 (`tauri-plugin-shell` 等)。
  - [x] **2. 資源與設定**
    - [x] 將 `ICON.png` 和 `LOGO.png` 放置於 `src-tauri/icons` 或公開資源目錄。
    - [x] 設定 `tauri.conf.json` (1280x800, 無邊框, 陰影)。
    - [x] 設定 `tailwind.config.js` (工業賽博龐克主題)。
    - [x] 設定 `index.css` (掃描線, 捲軸)。
  - [x] **3. 佈局實作**
    - [x] `Titlebar` (Windows 控制, 拖曳)。
    - [x] `Sidebar` (Role Tabs, User Profile)。
    - [x] `RoleTabs` (UI 切換邏輯)。
    - [x] `App` (Grid Layout)。
  - [x] **4. 核心元件**
    - [x] `Dashboard` / `Kanban` 佔位網格。
    - [x] `LogPanel` (底部面板)。
    - [x] 整合 Logo。
  - [x] **5. 驗證**
    - [x] 建置驗證 (`npm run build`)。

## Phase 2: MCP 核心與資料 (Core Engine & Data) [目前階段]

- [ ] **TaskRails_Core_Engine**
  - [/] **1. Rust 後端基礎**
    - [x] 設定 `src-tauri/Cargo.toml` 依賴 (tokio, serde, rusqlite, warp/axum)。
    - [x] 建立模組結構 (`mcp`, `database`, `state`, `utils`)。
  - [x] **2. SQLite 資料庫整合**
    - [x] 實作 `DatabaseManager` (初始化, Migration)。
    - [x] 定義 Schema: `Tasks`, `Settings`, `Logs`。
  - [/] **3. 雙模 MCP Server (Dual-Mode)**
    - [x] 實作 **Stdio Channel** (JSON-RPC over Stdin/Stdout)。
    - [x] 實作 **SSE Channel** (HTTP Server at localhost:4567)。
  - [x] **4. 資源與狀態管理**
    - [x] 整合 `tiktoken-rs` 實作 Token 計算 Middleware (基礎實作完成)。
    - [x] 實作狀態機 (`Idle`, `Coder`, `Reviewer`, `Airlock`)。

## Phase 3: 進階前端與整合 (Advanced UI & Integration)

- [/] **TaskRails_Advanced_UI**
  - [x] **1. 前後端串接**
    - [x] 透過 Tauri Command 呼叫 Rust 後端 (Get Tasks, Switch Role).
    - [ ] 監聽 Rust 事件 (Log Stream, Token Usage - Pending Integration).
  - [x] **2. 看板功能 (Kanban)**
    - [x] 實作 Drag & Drop (dnd-kit).
    - [x] 任務 CRUD (Frontend Mock Ready).
    - [x] **UI 重構**: 工業賽博龐克風格 (Panels/Toolbar/Glow).
  - [x] **3. 氣閘機制 (Airlock)**
    - [x] 實作全域遮罩模態窗 (Global Overlay).
    - [x] 實作 Diff View (文字比對 Mock).
  - [x] **4. 設定與 CLI**
    - [x] 實作設定頁面 (Card List Style).
    - [x] 實作 `trs` CLI Alias (基礎結構已建立 - utils/cli.rs).
  - [x] **5. 鍵盤快捷鍵**
    - [x] 綁定 Alt+1/2/3 切換角色.

## Phase 4: 打包發布 (Release)

- [x] **設定 WiX/NSIS 打包參數** (tauri.conf.json updated).
- [x] **建立 GitHub Actions CI/CD** (workflow/build.yml created).
- [x] **License**: MIT License 檔案已建立。
- [ ] **Release**: 執行版本標記與推送。
