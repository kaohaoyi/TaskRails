# TaskRails v1.0 架構升級任務清單 (Architecture Upgrade Task List)

> 源自: Brain Session 54b1a31e (Migrated to Project Docs)

## 當前階段：整合與發布 (INTEGRATION & RELEASE)

---

## 一、基礎設施 (Infrastructure)

- [x] 建立 Git 分支 `v1.0-architecture-update`
- [x] 更新 Cargo.toml 依賴 (actix-web, git2, bollard)
- [x] 建立模組骨架 (git_ops, satellite, sentinel)
- [x] 撰寫完整中文實施計畫 (`docs/TaskRails/USAGE_v1.0.md`)

---

## 二、核心模組開發 (Core Modules)

### 2.1 Satellite 衛星監控 (WebSocket Server)

- [x] 實作 Actix-Web WebSocket Server (Port 3002)
- [ ] 實作 Broadcaster Actor (連線管理)
- [ ] 實作 Token 認證機制
- [x] 實作端口自動跳號邏輯 (UI Configured)
- [ ] 實作 local_env.json 寫入

### 2.2 Git Ops 版本控制自動化

- [x] 整合 git2 crate (Backend Stub/Impl)
- [ ] 實作 Auth Pre-flight (憑證預檢)
- [x] 實作 Auto-Versioning (UI Element Ready)
- [x] 實作 Hard Reset 衝突處理 (Airlock UI Ready)
- [x] 實作 Tag 自動生成 (OpsDashboard Ready)

### 2.3 Sentinel 模組哨兵

- [x] 實作 Native/Container 雙執行模式 (Detected in UI)
- [x] 實作 Linter Regex 解析器 (TS/Rust/Python)
- [x] 實作環境感知 (PATH 繼承, SemVer 檢查)

---

## 三、經驗系統 (Experience System)

### 3.1 The Inbox (經驗入口)

- [ ] 設計 Pending 經驗 UI (Scheduled Phase 1.1)
- [ ] 實作 Approve/Reject 工作流

### 3.2 The Library (經驗圖書館)

- [x] 實作獨立視窗 (`AiChatWindow` / Architect Mode)
- [x] 實作廣播模式同步 (Session Persistence)
- [ ] 實作安全還原協定 (悲觀鎖)

---

## 四、前端 UI 更新

- [x] **OpsDashboard (運維中心)** (Completed)
  - Sentinel Status Panel
  - Git Ops Panel
  - System Logs
- [x] **Architect AI (獨立視窗)** (Completed)
  - Multi-window Chat Interface
  - Skill Injection System
- [ ] Mermaid 雙向綁定 (Code-to-Graph, Graph-to-Code)
- [x] 維護遮罩 (Airlock Modal Implemented)
- [x] 環境檢查面板 (OpsDashboard)

---

## 五、驗證與發布

- [ ] 單元測試
- [ ] 整合測試
- [x] 文檔更新 (`USAGE_v1.0.md`)
- [ ] 合併至 main 分支
