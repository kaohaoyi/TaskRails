# **Taskrails Vibe Core: 技術規格與架構設計書 v1.1**

## **1\. 專案概述 (Executive Summary)**

本專案旨在為 Taskrails 構建一個 AI 輔佐編程核心 (Vibe Core)。區別於傳統的 Copilot，本系統採用 「規劃驅動 (Plan-Driven)」 與 「混合運算 (Hybrid AI)」 架構。  
核心目標是利用低成本的本地 AI (Local AI) 作為「指令中繼站」，協助用戶完善規劃與 Prompt，再交由高智商的雲端 AI (Cloud AI) 執行最終編碼，從而大幅降低 Token 成本並提升代碼精準度。

## **2\. 系統架構 (System Architecture)**

### **2.1 混合 AI 模型 (Hybrid AI Model)**

- **Local Layer (大腦皮層)**:
  - **模型**: Qwen 2.5 Coder (7B/14B) via LM Studio。
  - **職責**: 上下文組裝、Prompt 優化、用戶意圖澄清、Token 預算控制。
  - **特性**: 零邊際成本、高隱私、低延遲。
- **Cloud Layer (前額葉)**:
  - **模型**: Claude 3.5 Sonnet / GPT-4o。
  - **職責**: 複雜邏輯推理、最終代碼生成、架構重構。
  - **整合方式**: 透過 IDE (Cursor/VS Code) 插件 API 或 MCP 協定。

### **2.2 核心組件 (Core Components)**

1. **Active Mermaid Engine**:
   - 將 .mmd 流程圖視為「可執行的原始碼」。
   - 自動解析 :::active 節點並觸發對應任務。
2. **Memory Bank (FileSystem)**:
   - specs.md (需求)、architecture.md (規範)、tech-stack.md (技術棧)。
   - 作為所有 Agent 的唯一真理來源 (Single Source of Truth)。
3. **Command Relay GUI (指令中繼站)**:
   - 用戶與 Local AI 協作的圖形介面。
   - 負責攔截模糊指令，轉化為工程級 Prompt 後再放行。

## **3\. 數據流 (Data Flow)**

sequenceDiagram  
 participant User as 用戶 (PM)  
 participant GUI as 指令中繼站 (GUI)  
 participant Local as 本地 AI (Qwen)  
 participant Engine as 核心引擎  
 participant Cloud as 雲端 IDE (Claude)

    Note over User, Local: 階段一：規劃與優化 (免 Token)
    User-\>\>GUI: 輸入口語指令 ("幫我加個登入")
    GUI-\>\>Local: 傳送指令 \+ Memory Bank 上下文
    Local-\>\>Local: 分析架構影響、檢查規範
    Local--\>\>GUI: 反問/確認 ("需要 JWT 嗎？")
    User-\>\>GUI: 回覆確認
    Local-\>\>GUI: 生成 \<final\_prompt\> (工程級指令)

    Note over User, Cloud: 階段二：執行 (消耗 Token)
    User-\>\>GUI: 點擊 \[確認並執行\]
    GUI-\>\>Cloud: 發送 \<final\_prompt\>
    Cloud-\>\>Cloud: 執行編碼任務
    Cloud--\>\>Engine: 回報執行結果 (Logs/Diff)
    Engine-\>\>GUI: 顯示 Cloud 回應
    Engine-\>\>Engine: 更新 Mermaid 狀態 (Active \-\> Done)

## **4\. 模組設計細節**

### **4.1 Prompt Refiner (提示詞優化器)**

- **輸入**: 當前 Mermaid 節點描述 \+ Memory Bank 摘要 \+ 用戶對話歷史。
- **輸出**: 包含 \<final_prompt\> 標籤的結構化文本。
- **系統提示詞策略**: 強制 AI 扮演「架構師」，在生成 Prompt 前必須檢查 architecture.md 中的限制條件（如：禁止單體文件）。

### **4.2 Mermaid Parser**

- 使用 Regex 解析 id\[label\]:::active 語法。
- 支援子圖 (Subgraph) 上下文隔離，避免 Token 汙染。

## **5\. 擴充性規劃**

- **IDE 雙向整合**: 未來 GUI 應透過 WebSocket 或 Local File Watcher 實時顯示 IDE 內部的 AI 思考過程 (Thought Chain)。
- **自動化測試**: Cloud Agent 完成任務後，應自動觸發本地測試腳本，測試通過才推進 Mermaid 節點。
