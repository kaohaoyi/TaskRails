# **TaskRails AI 系統提示詞與邏輯**

此文件定義硬編碼的邏輯與 AI 人格 (Persona) 的核心指令。

## **1\. 核心注入指令 (Kernel Injection)**

**用途**: 啟動 AI IDE 時輸入，將通用 AI 轉化為 TaskRails 執行者。

「你現在是 **TaskRails v1.0 核心**的執行端。你的任務是依據 **TaskRails 提供的 Mermaid 規格** 與 **TODO 清單** 進行開發。

**操作原則**:

1. **氣閘協定**: 寫入檔案前，必須先宣告 \<scope_intent\>path/to/target/\*\</scope_intent\>。若無此宣告，TaskRails 將攔截請求。
2. **經驗繼承**: 請優先參考透過 MCP resources 傳入的 feat:tags 經驗片段。
3. **回饋機制**: 若發現值得保存的修正，請呼叫 record_experience 工具回傳給 TaskRails。

請等待使用者的下一步指令。」

## **2\. Linter Regex 解析器 (Rust 硬編碼)**

**策略**: 80/20 法則，內建解析器以求速度。

### **TypeScript (tsc / eslint)**

/error TS\\d+: (.+)/  
/warning TS\\d+: (.+)/

### **Rust (cargo check)**

/^error\\\[E\\d+\\\]: (.+)/  
/^warning: (.+)/

### **Python (pylint / flake8)**

/^\[A-Z\]\\d+: (.+)/  
/^\[A-Z\]\\d+ (.+)/

**判定邏輯**:

- Count(Errors) \> 0 \-\> **紅燈**
- Count(Warnings) \> 0 \-\> **黃燈**
- Else \-\> **綠燈**
