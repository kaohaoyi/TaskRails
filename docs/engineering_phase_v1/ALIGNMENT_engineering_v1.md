# ALIGNMENT: 工程區域功能實作 (Engineering Phase V1)

## 1. 目標 (Objective)

正式啟動「工程區域」的核心功能開發，將原本的靜態建議方案轉化為可互動的功能模組，並強化系統的回饋機制。

## 2. 範疇 (Scope)

- **問題追蹤整合**: 實作 `EngineeringPage (issues)`，動態顯示所有標籤為 `Bug` 的任務。
- **操作日誌系統**: 實作後端日誌記錄與前端 `EngineeringPage (history)` 顯示。
- **全域通知系統**: 實作 Toast UI，對重要操作（IDE 指令、刪除、同步）提供即時回饋。

## 3. 非目標 (Out of Scope)

- 真正的 Git 分支解析（整合 `commits` 頁面留待下一階段）。
- 對外部 IDE 的實際網路通訊（目前維持模擬指令發送）。

## 4. 技術堆疊 (Tech Stack)

- Frontend: React + Lucide Icons + Tailwind CSS.
- Backend: Rust + Tauri + SQLite (Rusqlite).
- State: Global App State (for tasks) + DB (for logs).
