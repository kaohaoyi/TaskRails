# ALIGNMENT: TaskRails UI Foundation & Core Setup

**Task Name**: `TaskRails_UI_Foundation`
**Date**: 2025-12-17
**Version**: 1.0

## 1. 核心目標 (Core Objectives)

根據 @[TaskRails 開發總藍圖.md] 與 @[TaskRails UI 功能地圖.md]，本階段專注於建立 TaskRails 的 **基礎建設** 與 **UI 框架**，並確保視覺風格符合 `UIsample` 中的工業/賽博龐克美學。

### **關鍵產出 (Key Deliverables)**

1.  **專案初始化**: 建立 Tauri v2 + React + TypeScript + Tailwind CSS 專案結構。
2.  **UI 基礎架構**:
    - **Design System**: 移植 `UIsample/code.html` 的色票 (Orange Primary)、字體 (Rajdhani/Noto Sans TC) 與全域樣式 (Scanlines, Custom Scrollbar)。
    - **Custom Titlebar**: Windows 原生風格自定義標題列，整合 ICON。
    - **Responsive Layout**: 側邊欄 (含 Role Tabs) + 主內容區 + 底部 Log 面板。
3.  **核心元件初步實作**:
    - **Role Tabs**: 實作 Coder/Reviewer/Architect 切換邏輯 (UI 層)。
    - **Asset Integration**: 正確引入 `ICON.png` 與 `LOGO.png`。

## 2. 邊界定義 (Boundaries)

### **✅ In Scope (本次範疇)**

- 前端工程: React 元件開發、Tailwind 設定、RWD 布局。
- Tauri 設定: 基礎 `tauri.conf.json` 配置 (視窗裝飾、透明度)。
- 靜態展示: 透過 Mock Data 驗證 UI 互動與 RWD 效果。

### **❌ Out of Scope (非本次範疇)**

- Rust Core Logic: 尚未實作 MCP Server、State Machine 與真實檔案 I/O。
- Database: 尚未連接 SQLite。
- 真實 AI 串接: 僅做介面，不接真實 LLM。

## 3. 風險評估 (Risk Assessment)

- **字體載入**: 需確保 Google Fonts 在本地或離線環境的載入策略 (Phase 1 先用 CDN，後續需下載)。
- **Windows 視窗拖曳**: 自定義標題列需正確處理 `data-tauri-drag-region` 以避免無法移動視窗。
- **Asset 尺寸**: `ICON.png` 與 `LOGO.png` 需確認在不同解析度下的顯示效果。

## 4. UI/UX 規範 (Design Spec)

- **Theme**: Dark Mode Default (Industrial/Cyberpunk).
- **Primary Color**: `#E88225` (Orange).
- **Fonts**:
  - Display: `Rajdhani`
  - Content: `Noto Sans TC`
  - Code: `Roboto Mono`
- **Aesthetics**: 參考 `UIsample`，包含 Scanlines 效果、霓虹光暈 (Neon Glow)、銳利邊角 (Sharp/Small Radius)。
