# TASK: 工程區域功能實作清單

## 階段 1: 問題追蹤 (Issue Tracking)

- [x] **TSK-ENG-01**: 在 `EngineeringPage` 中實作 `IssueView` 組件。
- [x] **TSK-ENG-02**: 實作從全域 `tasks` 中過濾出 `Bug` 標籤的邏輯。
- [x] **TSK-ENG-03**: 介面優化：顯示 Issue 的優先級、階段與當前負責人。

## 階段 2: 系統日誌 (System History)

- [x] **TSK-LOG-01**: 修改 Rust 後端 `db.rs`，建立 `system_logs` 資料表。
- [x] **TSK-LOG-02**: 實作 `log_event` Tauri 指令，記錄操作名稱、時間與細節。
- [x] **TSK-LOG-03**: 在前端 `EngineeringPage` 整合日誌讀取並顯示於 `history` 頁面。

## 階段 3: 反饋系統 (Feedback System)

- [x] **TSK-UI-01**: 建立 `Toast` 全域通知組件。
- [x] **TSK-UI-02**: 在主要動作觸發點（IDE 指令、導入、導出、重置）整合 Toast 呼叫。

---

## 執行細節 (Implementation Strategy)

1. **資料定義**: `system_logs` 欄位包含 `id`, `event_type`, `message`, `timestamp`.
2. **組件複用**: `IssueView` 樣式將參考 `MissionsPage` 的表格設計以保持一致性。
