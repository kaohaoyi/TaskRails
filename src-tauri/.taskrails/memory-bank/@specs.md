根據您提供的專案結構和技術棧，以下是優化過的 Markdown 格式專案說明書：

# 專案說明書

## 專案概述
本專案是一個跨平台應用開發項目，使用了 Node.js/JavaScript、Rust、Tauri、TypeScript 和 Vite 等技術棧。該應用的主要功能包括任務管理、角色切換、通知提示和人工智能聊天窗口等。

## 技術架構
### 前端框架
- **React**: 用於构建用户界面。
- **TypeScript**: 提供強型類型檢查，提高開發效率。
- **Vite**: 快速的開發服務器和构建工具。

### 后端框架
- **Rust**: 用于高性能的後端服務。
- **Tauri**: 用於創建跨平台桌面應用。

## 核心模組
1. **任務管理**
   - `src/api/db.ts`: 定義了數據庫操作接口，包括任務和角色的獲取及創建。
2. **角色切換**
   - `src/components/common/RoleTabs.tsx`: 提供了角色選擇組件。
3. **通知提示**
   - `src/components/common/Toast.tsx`: 用於顯示通知消息。
4. **人工智能聊天窗口**
   - `src/components/features/AiChatWindow.tsx`: 處理人工智能聊天會話。

## 資料結構
- `DbTask` 和 `DbRole` 接口定義了數據庫中任務和角色的結構。
- `ToastItem` 接口定義了通知消息的格式。

## 開發指南
### 安裝依賴
1. 確保 Node.js 和 Rust 已安裝。
2. 克隆專案並進入專案目錄：
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```
3. 安裝前端依賴：
   ```bash
   npm install
   ```
4. 安装后端依賴（Rust）：
   ```bash
   cargo build --release
   ```

### 執行專案
1. 運行前端開發服務器：
   ```bash
   npm run dev
   ```
2. 運行後端服務：
   ```bash
   cargo run
   ```

### 編譯和打包
1. 專案編譯：
   ```bash
   npm run build
   cargo build --release
   ```
2. 打包成可執行文件：
   ```bash
   tauri build
   ```

希望這份說明書能幫助開發者快速了解並上手本專案。