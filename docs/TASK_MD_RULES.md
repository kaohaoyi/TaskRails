# TaskRails 任務 Markdown 匯入規則說明書

TaskRails 支援透過單一 Markdown 檔案管理整個專案的任務流程。此格式能自動解析任務的 **狀態 (Status)**、**階段 (Phase)**、**優先級 (Priority)** 與其他元數據。

## 1. 狀態標示 (Status Rules)

我們使用 checkbox 的狀態符號來定義任務目前的進度：

- **待辦事項 (TODO)**: `- [ ]`
- **進行中 (DOING)**: `- [▶]` (使用 Play 符號)
- **已完成 (DONE)**: `- [x]` (大小寫皆可)

### 範例

```markdown
- [ ] 待辦任務
- [▶] 正在進行中的任務
- [x] 已完成的任務
```

## 2. 結構與排序規則 (Structure & Sorting)

文件結構必須依循 **Phase (階段)** > **Priority (優先級)** 的層級。

### 格式語法

```markdown
**phase**{階段編號}

- [{狀態}] **priority**{優先級}-**title**{標題}-**tag**{標籤}-**role**{角色}
```

### 解析邏輯

1.  **Phase 標頭**: 使用 `**phase**` 加上數字作為大標題（例如 `**phase**1`）。該標題下方的所有任務都會自動歸類於該階段。
2.  **任務行**:
    - **狀態**: 根據 `[ ]`, `[▶]`, `[x]` 判斷。
    - **內容**: 使用連字號 `-` 分隔各欄位。
      - 第 1 欄: `**priority**` + 數字 (例如 `**priority**1`)
      - 第 2 欄: `**title**` (直接寫標題，可用 Bold 包覆)
      - 第 3 欄: `**tag**` (標籤，例如 `Feature`)
      - 第 4 欄: `**role**` (角色，例如 `coder`)

## 3. 完整範例 (Implemetation Example)

您可以直接複製以下內容並存為 `.md` 檔匯入系統：

```markdown
# Project Board Import

**phase**1

- [ ] **priority**1-**專案初始化**-**Core**-**architect**
- [ ] **priority**2-**配置 Tailwind**-**UI**-**coder**
- [▶] **priority**3-**實作登入頁面**-**Feature**-**coder**

**phase**2

- [ ] **priority**1-**API 串接**-**Backend**-**coder**
- [ ] **priority**2-**單元測試**-**QA**-**reviewer**

**phase**3

- [x] **priority**1-**需求訪談**-**General**-**pm**
```

## 4. 欄位詳細說明

| 欄位         | 說明     | 限制                                          |
| :----------- | :------- | :-------------------------------------------- |
| **Status**   | 任務狀態 | 必須為 `[ ]`, `[▶]`, 或 `[x]`                 |
| **Phase**    | 專案階段 | 格式必須為 `**phase**` + 數字                 |
| **Priority** | 優先順序 | 格式必須為 `**priority**` + 數字 (越小越優先) |
| **Title**    | 任務名稱 | 支援 Markdown 格式 (建議加粗)                 |
| **Tag**      | 分類標籤 | 簡短文字 (如 UI, DB, Bug)                     |
| **Role**     | 負責角色 | coder, reviewer, architect, all               |
