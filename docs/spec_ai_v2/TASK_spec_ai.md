# Task: Interactive Spec AI Generation

## Phase 1: Foundations (COMPLETED)

- [x] **TSK-AI-01**: 在 `SettingsPage` 加入 API 配置（Provider, API Key, Model Select）。
- [x] **TSK-AI-02**: 實作後端 `execute_ai_chat` 指令，串接第三方 API (OpenRouter, OpenAI, etc.)。

## Phase 2: Chat Interface (COMPLETED)

- [x] **TSK-AI-03**: 在 `SpecPage` 側邊或浮窗實作「Spec AI 諮詢對話框」。
- [x] **TSK-AI-04**: 實作對話氣泡、Loading 狀態與 Markdown 渲染。
- [x] **TSK-AI-05**: 新增專案類別至語系檔與選單（Game, Web3, Bot...）。

## Phase 3: Consultation Logic

- [x] **TSK-AI-06**: 設計系統 Prompt 引導 AI 進行規格提問與 JSON 輸出。
- [x] **TSK-AI-07**: 實作「一鍵套用至說明書」解析 AI 回傳的 JSON 區塊。

## Next Steps

1. **測試 API 連連通性**：確保各 Provider 的路徑正確。
2. **優化 JSON 解析**：增加邊界檢核，防止 AI 輸出格式不正確時報錯。
3. **增加對話導出**：允許使用者將對話紀錄保存為 Markdown。
