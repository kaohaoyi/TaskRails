# PATCHLOG: 2026-01-05 Fix Local AI Endpoint

## 1. 目標 (Objective)

修正本地 AI (Local LLM) 無法連接到非 localhost 地址（如 `192.168.0.144`）的問題，並實作真正的連線檢查。

## 2. 防劣化證明 (Anti-Degradation Proof)

- 保留現有的 `LocalLlmClient` 介面，僅修改內部實作以支援動態 URL。
- `check_local_llm_connection` 將從原本的 Mock (`true`) 改為實際的 HTTP 探測。
- 若 `ai_endpoint` 未設定，將回退到預設的 `http://localhost:1234/v1/chat/completions` 以確保向後相容。

## 3. 修改內容預覽 (Diff Preview)

- `src-tauri/src/mcp/local_llm.rs`:
  - 調整 `get_current_model` 和 `check_connection` 的 URL 處理邏輯。
- `src-tauri/src/commands/ai.rs`:
  - `check_local_llm_connection`: 讀取設定檔中的 `ai_endpoint` 並執行連線測試。
  - `refine_prompt`: 注入設定檔中的 `ai_endpoint` 到 `LocalLlmClient`。

## 4. 執行 TodoList (Execution TodoList)

- [x] 修改 `src-tauri/src/mcp/local_llm.rs` 以加強動態 URL 處理。
- [x] 修改 `src-tauri/src/commands/ai.rs` 中的 `check_local_llm_connection` 實作。
- [x] 修改 `src-tauri/src/commands/ai.rs` 中的 `refine_prompt` 以注入端點。
- [ ] 驗證編譯是否通過。
