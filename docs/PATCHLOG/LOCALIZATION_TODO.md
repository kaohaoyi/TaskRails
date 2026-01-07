# 本地化任務清單 (Localization TODO)

> 建立日期：2026-01-06
> 狀態：進行中

## ✅ 已完成

### Locales 檔案更新

- [x] `zh-TW.ts` - 添加 `common.yes/no`, `mdExport`, `mdImport`, `projectConfig`, `aiPrompts`
- [x] `en-US.ts` - 同上
- [x] `ja-JP.ts` - 同上
- [x] `zh-CN.ts` - 同上
- [x] `de-DE.ts` - 同上
- [x] `es-ES.ts` - 同上
- [x] `fr-FR.ts` - 同上

### 工具檔案更新

- [x] `utils/mdExport.ts` - 添加 `MdExportTranslations` 介面，函數接受翻譯參數
- [x] `utils/mdImport.ts` - 擴展 `statusMap` 支援多語言狀態映射
- [x] `utils/ai-prompts.ts` - 使用 locales 的 `aiPrompts.projectAnalyzer.placeholders`

---

## ⏳ 待處理

### 優先級 1 (關鍵檔案)

- [ ] `App.tsx` - `handleInjectTasksFromSpec` 中的 AI 提示和 Toast 訊息
- [ ] `components/features/ProjectAnalyzer.tsx` - Toast 訊息、載入文字
- [ ] `components/features/SpecPage.tsx` - UI 字串

### 優先級 2 (UI 元件)

- [ ] `components/ui/LoadingOverlay.tsx` - 載入訊息
- [ ] `components/ui/TokenCounter.tsx` - 顯示文字
- [ ] `components/layout/Sidebar.tsx` - 導航文字（部分已使用 useTranslation）

### 優先級 3 (功能元件)

- [ ] `components/features/KanbanBoard.tsx`
- [ ] `components/features/TaskList.tsx`
- [ ] `components/features/TaskDetailModal.tsx`
- [ ] `components/features/MissionsPage.tsx`
- [ ] `components/features/RoleSettingsPage.tsx`
- [ ] `components/features/SettingsPage.tsx`
- [ ] `components/features/EngineeringPage.tsx`
- [ ] `components/features/Planner.tsx`
- [ ] `components/features/AiChatWindow.tsx`
- [ ] `components/features/AiIdeControlCenter.tsx`
- [ ] `components/features/AgentLab.tsx`
- [ ] `components/features/FileExplorer.tsx`
- [ ] `components/features/MemoryBankViewer.tsx`

### 優先級 4 (專案設定子元件)

- [ ] `components/features/project-setup/ChatInterface.tsx`
- [ ] `components/features/project-setup/ConfigPanel.tsx`
- [ ] `components/features/project-setup/AgentList.tsx`
- [ ] `components/features/project-setup/AgentEditModal.tsx`
- [ ] `components/features/project-setup/AiSettingsDropdown.tsx`
- [ ] `components/features/project-setup/hooks/useProjectChat.ts`
- [ ] `components/features/project-setup/hooks/useProjectActions.ts`

### 優先級 5 (Hub 元件)

- [ ] `components/features/ProjectSetupHub.tsx`
- [ ] `components/features/ProjectSetupPopup.tsx`

### 優先級 6 (類型和配置)

- [ ] `utils/projectConfig.ts` - 狀態描述文字（較複雜，需要傳入翻譯參數）
- [ ] `types/project-setup.ts` - 類型註釋（僅影響開發者）

### 優先級 7 (註釋 - 僅開發者可見)

- [ ] `utils/tokenCounter.ts` - 中文註釋（不影響用戶）

---

## 📋 本地化模式指南

### React 元件 (使用 Hook)

```tsx
import { useTranslation } from "../hooks/useTranslation";

function MyComponent() {
  const { t } = useTranslation();
  return <div>{t.common.appName}</div>;
}
```

### 工具函數 (傳入翻譯)

```typescript
export interface MyTranslations {
  label: string;
}

export function myFunction(translations: MyTranslations) {
  console.log(translations.label);
}
```

### 呼叫工具函數 (從元件)

```tsx
import { useTranslation } from "../hooks/useTranslation";
import { myFunction } from "../utils/myUtil";

function MyComponent() {
  const { t } = useTranslation();

  const handleClick = () => {
    myFunction(t.mySection);
  };
}
```
