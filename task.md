# TaskRails v1.0 - Orchestrator Evolution

> **Source Of Truth**: `UPDATADEVDOC/taskrails_v2_6_architecture_manual_zh_tw.md` (Content Updated to v1.0)
> **Status**: Pivot to Orchestrator Model (Coding on Rails)

## Phase 1: 核心重構 (Core Refactoring) [Active]

- [x] **New Navigation Structure (Sidebar)**
  - [x] 分離 **Orchestration** (Agent Lab, Planner) 與 **Execution** (Kanban, Missions)。
  - [x] 重新定義 Sidebar 類別與圖示。
- [x] **Agent Lab (Composite Agent)**
  - [x] 實作角色選擇 (Role Selection)。
  - [x] 實作原子技能選擇 (Atomic Skills)。
  - [x] 實作經驗標籤繼承 (Experience Inheritance UI)。
- [x] **Planner (Workflow Visualizer)**
  - [x] 實作 Mermaid 編輯器介面。
  - [x] 實作即時預覽 Mockup。
  - [x] **Next**: 整合實際 Mermaid 渲染引擎 (npm install mermaid)。

## Phase 2: 運維與連接 (Ops & Connect)

- [x] **Ops Center Upgrade (Sentinel)**
  - [x] **Backend: Configuration Engine** (Rust Structs for ProjectConfig, LocalEnv, Tags)
- [x] **Backend: Satellite Security** (Token Generation & WebSocket Validation)
- [ ] **Verify: End-to-End Test** (Requires Rust Environment)
- [x] **Experience System Backend**
  - [x] 建立 experiences table (SQLite).
  - [x] 實作 `log_experience` 與 `search_experiences` 命令.
  - [x] 前端介面整合 (Phase 4) - ExperienceLibrary.tsx added.

## Phase 3: 經驗系統 (Experience System)

- [x] 建立 Experience 模組前端 (Knowledge Base - ExperienceLibrary.tsx).
- [x] 實作 SQLite 經驗存儲 (experiences table).
- [x] 實作 AI 查詢經驗邏輯 (RAG lite - LIKE search).
- [x] 實作 Pending Experience 列表 (Integrate in Knowledge Base UI).

## Phase 4: Release

- [x] 確保所有 v2.6 功能在 v1.0 版本號下正常運作 (邏輯檢查與 UI 編譯通過).
- [ ] End-to-End Runtime Test (Pending Rust Env).
