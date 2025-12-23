# ALIGNMENT: 專案設計說明書系統 (Project Spec System)

## 1. 核心目標 (Core Objective)

提供一個無需編程背景也能輕鬆建立專業「專案說明書」的工具，並將說明書內容自動轉化為 TaskRails 可追蹤的任務卡片。

## 2. 核心功能 (Key Features)

- **結構化模板**: 支援 Overview, Tech Stack, Data Structure, Core Features, Design Guidelines, Rules。
- **AI 智能生成**: 根據用戶選擇的類別（如 ESP32、Web App、Mobile）自動生成規格草案。
- **任務自動同步 (Task Injection)**:
  - 解析說明書中的 `Phase` 區段。
  - 自動提取清單項目並寫入資料庫成為任務。
- **左側選單整合**: 將其提升為系統一級功能入口。

## 3. 實作邏輯 (Implementation Logic)

1. **編輯器**: 使用分塊編輯器，確保不懂程式的用戶也能按部就班填寫。
2. **AI 生成器**: 提供預設的 Prompt 模板，當用戶選擇類別後，生成符合結構的 Markdown 內容。
3. **解析器**: 專門的 Markdown Parser 提取 `## 4. 核心功能清單` 下的項目並生成 Task 實例。

## 4. 成功準則 (Success Criteria)

- 點擊「生成任務」後，看板應立即出現 Phase 1/2 的所有卡片。
- 介面字體與其他頁面完全一致（無 font-mono）。
