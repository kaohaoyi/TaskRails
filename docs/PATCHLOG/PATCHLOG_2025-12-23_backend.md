# PATCHLOG - 2025-12-23 (後端邏輯強化)

## 1. 目標 (Target)

強化 Rust 後端邏輯，特別是 MCP (Model Context Protocol) Server 的完整實現，包括 Stdio 與 SSE 支援，以及自定義工具的整合。

## 2. 防劣化證明 (Anti-Degradation Proof)

- 保持現有的 Tauri Commands 邏輯不變。
- 所有的 MCP 邏輯將模組化，不影響現有的資料庫操作（`db.rs`）。
- 確保現有的前端調用不受影響。

## 3. Diff 預覽 (Diff Preview)

- `src-tauri/src/mcp/mod.rs`: 增加 MCP 請求派發器與工具定義。
- `src-tauri/src/mcp/sse.rs`: 整合派發器到 SSE 處理器。
- `src-tauri/src/mcp/stdio.rs`: 實現完整的 Stdin/Stdout 循環並整合派發器。
- `src-tauri/src/commands.rs`: 在 `set_role` 時觸發廣播。

## 4. 執行 TodoList

- [x] 建立 MCP 核心派發系統與工具註冊機制
- [x] 實現 `initialize` 與 `list_tools` 標準方法
- [x] 註冊 TaskRails 專屬工具：`get_context`, `update_task`
- [x] 補完 SSE Server 的動態響應邏輯
- [x] 完成 Stdio Server 的異步處理循環
- [x] 整合角色變更時的自動廣播 (Identity Broadcast)
- [x] 驗證編譯與基本通訊 (Rust 安裝完成，編譯通過 ✅)
