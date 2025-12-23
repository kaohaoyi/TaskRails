# ALIGNMENT: 互動式 AI 規格生成系統 (Interactive Spec AI)

## 1. 核心目標 (Core Objective)

將原本單向的「按鈕生成」升級為雙向的「對話式諮詢」。AI 將扮演「資深系統架構師」的角色，透過對話引導用戶完善專案規格，最終自動填充至說明書欄位。

## 2. 交互流程 (Dialogue Flow)

1. **建立連結**: 用戶在設定中配置 OpenAI/Anthropic/Local LLM API Key。
2. **啟動對談**: 用戶告知想做的專案類型（例如：一個遊戲）。
3. **引導提問**: AI 根據類別提出 3-5 個關鍵問題（如：是 2D 還是 3D？需要多人連線嗎？）。
4. **生成與細化**: 獲取答案後，生成規格草案，用戶可對特定區塊要求 AI 修改。
5. **套用結果**: 將對話最終達成的共識一鍵填入 `SpecPage` 的六大區塊。

## 3. 擴充專案類別 (Expanded Categories)

除了現有的，將新增以下類別：

- **遊戲開發 (Game Dev)**: Unity, Unreal, Phaser.
- **瀏覽器插件 (Extensions)**: Chrome/Firefox Extensions.
- **區塊鏈/Web3 (Smart Contracts)**: Solidity, Solana.
- **自動化機器人 (Bots)**: Discord, Telegram, Crawler.
- **數據與 AI (Data Science)**: ML Models, Data Pipelines.

## 4. 技術考量 (Technical Considerations)

- **串流輸出 (Streaming)**: 提升對話體驗。
- **上下文管理 (Context)**: 確保對話聚焦於規格定義。
- **安全性**: API Key 必須保留在本地（Rust DbState 或 .env）。
