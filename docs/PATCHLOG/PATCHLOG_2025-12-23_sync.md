# PATCHLOG - 2025-12-23 (檔案同步機制開發)

## 1. 目標 (Target)

實現與優化工作區檔案同步機制，讓專案狀態（任務、角色、系統上下文）能自動同步到本地工作區的 `.taskrails` 隱藏檔中，並支援雙向同步。

## 2. 防劣化證明 (Anti-Degradation Proof)

- 現有的 `db Api` 與 SQLite 儲存不變，檔案同步作為輔助持久化。
- 確保在未設定工作區路徑時不會報錯。
- 保持現有 Markdown 導出格式的解析相容性。

## 3. Diff 預覽 (Diff Preview)

- `src-tauri/src/commands.rs`: 新增 `read_workspace_file` 命令。
- `src/utils/mdExport.ts`: 強化導出邏輯，整合 Role 與 System 資訊，支援分段導出。
- `src/utils/mdImport.ts`: 增加分段解析邏輯，支援從 `.taskrails` 還原完整專案狀態。
- `src/App.tsx`: 整合全自動檔案同步機制，並在開啟工作區時進行狀態檢查。

## 4. 執行 TodoList

- [x] 後端：實現 `read_workspace_file` 命令
- [x] 工具類：升級 `generateTaskMarkdown` 支援全域專案導出格式
- [x] 工具類：升級 `parseTaskMarkdown` 支援分段解析還原
- [x] 前端：優化 `App.tsx` 的同步 Effect，包含 Role 的同步
- [x] 前端：實作開啟工作區時的「初始化同步」檢查
- [x] 驗證：確保雙向同步邏輯與效能優化 (Hash 檢查)
