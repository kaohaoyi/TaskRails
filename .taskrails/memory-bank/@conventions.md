# 編碼規範 (@conventions.md)

> **Last Updated**: 2025-12-24

## 命名規範

| 類型          | 格式       | 範例                   |
| ------------- | ---------- | ---------------------- |
| 組件          | PascalCase | `MemoryBankViewer.tsx` |
| 函數          | camelCase  | `fetchExperiences()`   |
| Rust Struct   | PascalCase | `MemoryEntry`          |
| Rust Function | snake_case | `read_memory()`        |

## 註解規範 (遵循 GEMINI.md)

- 解釋邏輯的註解使用 **繁體中文**。
- 關鍵函數須包含 `[目的]`, `[輸入]`, `[輸出]`。

## Git Commit 格式

```
<type>(<scope>): <subject>

feat: 新功能
fix: 修復
docs: 文檔
refactor: 重構
test: 測試
```
