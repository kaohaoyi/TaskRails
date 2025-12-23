# **TaskRails UI 功能地圖 (UI Functional Map)**

版本: 2.0 (Role Tabs Added)  
適用平台: Windows 10/11 (Tauri v2)  
用途: UI/UX 設計與 Wireframe 繪製依據

## **1\. 視窗框架 (Window Frame)**

### **1.1 自定義標題列 (Custom Titlebar)**

* **位置**: 視窗頂部 (Height: 32px)  
* **元件**:  
  * **App Icon**: 16x16px，位於最左側。  
  * **App Title**: 文字 "TaskRails"。  
  * **Current Mode Badge**: 顯示當前模式文字 (e.g., "🔨 Coder Mode")，隨角色變色。  
  * **Drag Region**: 空白區域。  
  * **Window Controls**: Min/Max/Close。

### **1.2 系統托盤 (System Tray)**

* **右鍵選單**: Show, Status, Quick Role Switch (Submenu), Quit。

## **2\. 側邊導覽 (Sidebar)**

### **2.0 角色切換面板 (Global Role Tabs) \- NEW**

* **位置**: 側邊欄最頂部 (Logo 下方)，高度固定。  
* **樣式**: 分段式控制器 (Segmented Control) 或 實體 Tab 造型。  
* **分頁項目 (Tabs)**:  
  * **\[1\] Coder (開發)**:  
    * Icon: 🔨 (Hammer)  
    * Color: **Orange** (Primary)  
    * Hotkey: Alt \+ 1  
  * **\[2\] Reviewer (審核)**:  
    * Icon: 🛡️ (Shield)  
    * Color: **Red/Purple** (Alert)  
    * Hotkey: Alt \+ 2  
  * **\[3\] Architect (架構)**:  
    * Icon: 📐 (Ruler)  
    * Color: **Blue** (Info)  
    * Hotkey: Alt \+ 3  
* **互動行為**:  
  * Click:  
    1. 觸發 MCP hard\_reset。  
    2. 注入對應角色的 System Prompt。  
    3. UI 主題色微調 (例如邊框變色) 以提示當前狀態。

### **2.1 導覽選單 (Main Navigation)**

* **位置**: 角色面板下方。  
* **項目**: Mission Control, Global Rules, Team & Agents, Settings。

### **2.2 狀態監控 (Status Monitor)**

* Token Usage Widget, MCP Server Status, Log Stream Toggle。

### **2.3 使用者資訊 (User Profile)**

* Avatar, Username。

## **3\. 任務控制台 (Mission Control / Kanban)**

### **3.1 頂部工具列 (Toolbar)**

* **元件**:  
  * Filter Input: 搜尋框。  
  * View Switch: 看板/列表。  
  * New Task Button: 顏色隨當前 Role Tab 改變。

### **3.2 看板欄位 (Columns)**

* 3 欄 (To-Do, Doing, Done)。  
* **Doing 欄位特效**: 邊框顏色隨 Role Tab 改變 (橘/紅/藍)。

### **3.3 任務卡片 (Task Card)**

* ID, Title, Tags, Avatars (Assignee/Reviewer)。  
* Context Menu: Edit, Move, Delete.

## **4\. 任務詳情模態窗 (Task Detail Modal)**

* **區塊 A: 規格定義**: Title, Desc, Scope, Constraints, AI Spec Gen.  
* **區塊 B: 角色指派**: Assignee, Reviewer, Settings.  
* **區塊 C: 歷程**: Activity Log.  
* **動作**: Save, Start Mission.

## **5\. 氣閘審核窗 (Airlock Modal)**

* **觸發**: AI 請求審查時。  
* **視覺**: 紅色/橘色邊框，全域遮罩。  
* **元件**: Header, Request Summary, Diff Viewer.  
* **動作**: Reject, Approve.

## **6\. 設定頁面 (Settings)**

### **6.1 一般 (General)**

* Language, Theme.

### **6.2 AI 與 MCP (AI & MCP)**

* Identity Broadcast (Toggle).  
* Token Threshold (Slider).  
* MCP Port (Input).  
* **Role Configuration**: 自定義 Coder/Reviewer 的 Prompt 模板。

## **7\. 底部日誌面板 (Log Stream Panel)**

* JSON-RPC 訊息流 (IN/OUT)。