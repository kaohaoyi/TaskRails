# MCP 雙向控制系統設計文檔

> 建立日期：2026-01-07
> 狀態：設計中

## 📌 目標

實現 TaskRails AI Agent 與 AI IDE (Cursor/VS Code) 之間的完整雙向控制，包括：

1. **一鍵發送任務** - Agent 的 goals/tasks 直接傳給 AI IDE 執行
2. **MCP stdio 雙向控制** - 直接發送指令、接收結果
3. **任務佇列系統** - 排隊、狀態追蹤、自動執行

---

## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                      TaskRails (Tauri)                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │   AI Agents      │  │   Task Queue     │  │  MCP Hub   │ │
│  │  (goals/tasks)   │──│  (pending/done)  │──│ (control)  │ │
│  └──────────────────┘  └──────────────────┘  └─────┬──────┘ │
└────────────────────────────────────────────────────┼────────┘
                                                     │
                    ┌────────────────────────────────┘
                    │ MCP Protocol (stdio/SSE)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI IDE (Cursor/VS Code)                   │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │   MCP Client     │──│   AI Agent       │                 │
│  │ (read commands)  │  │ (execute tasks)  │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Feature 1: 一鍵發送任務給 AI IDE

### 設計

- 在 RoleSettingsPage 為每個 Agent 添加「發送任務」按鈕
- 點擊後將 Agent 的 `systemPrompt`, `goals`, `tasks` 寫入 `@active_context.md`
- 格式化為 AI IDE 可執行的指令

### 資料結構

```json
{
  "version": "1.0",
  "type": "agent_dispatch",
  "agent": {
    "id": "agent-1",
    "name": "Python Backend Engineer",
    "role": "後端開發",
    "systemPrompt": "你是...",
    "goals": ["目標1", "目標2"],
    "tasks": [
      {
        "id": "task-1",
        "title": "任務標題",
        "description": "描述",
        "status": "pending"
      }
    ]
  },
  "instructions": "請根據上述 Agent 設定，依序執行 tasks 列表中的任務...",
  "timestamp": "2026-01-07T08:20:00Z"
}
```

---

## 📋 Feature 2: MCP stdio 雙向控制

### MCP Hub 架構

```rust
// src-tauri/src/mcp_hub.rs

pub struct McpHub {
    // 待發送給 AI IDE 的指令佇列
    command_queue: Arc<Mutex<VecDeque<McpCommand>>>,

    // 從 AI IDE 接收的結果
    result_queue: Arc<Mutex<VecDeque<McpResult>>>,

    // 連線狀態
    connection_status: Arc<AtomicBool>,
}

pub struct McpCommand {
    id: String,
    action: String,        // "execute_task", "read_file", "write_file"
    payload: JsonValue,
    created_at: DateTime<Utc>,
}

pub struct McpResult {
    command_id: String,
    status: String,        // "success", "error", "pending"
    output: String,
    completed_at: DateTime<Utc>,
}
```

### MCP 通訊協定

```
TaskRails → AI IDE:
  - execute_task { task_id, title, description, agent_context }
  - query_status { task_id }
  - cancel_task { task_id }

AI IDE → TaskRails:
  - task_started { task_id }
  - task_progress { task_id, percent, message }
  - task_completed { task_id, output, artifacts }
  - task_failed { task_id, error }
```

---

## 📋 Feature 3: 任務佇列系統

### 資料結構

```typescript
interface TaskQueueItem {
  id: string;
  agentId: string;
  agentName: string;
  taskIndex: number;
  title: string;
  description: string;
  status: "queued" | "dispatched" | "running" | "completed" | "failed";
  priority: number;
  createdAt: Date;
  dispatchedAt?: Date;
  completedAt?: Date;
  result?: string;
  error?: string;
}

interface TaskQueue {
  items: TaskQueueItem[];
  currentlyRunning: string | null;
  autoDispatch: boolean; // 自動派發下一個任務
}
```

### UI 元件

- 新增 `TaskQueuePanel.tsx` - 顯示任務佇列
- 支援拖拽排序
- 顯示執行狀態
- 手動/自動執行模式切換

---

## 🎯 實施計劃

### Phase 1: 一鍵發送任務 (今天)

- [ ] 修改 RoleSettingsPage 添加「發送任務」按鈕
- [ ] 創建 `dispatch_agent_to_ide` Rust command
- [ ] 將 Agent 資料格式化寫入 `@active_context.md`

### Phase 2: 任務佇列 UI (後續)

- [ ] 創建 TaskQueuePanel.tsx
- [ ] 實現 task_queue 資料庫表
- [ ] 添加到 Sidebar

### Phase 3: MCP 雙向控制 (進階)

- [ ] 創建 mcp_hub.rs 模組
- [ ] 實現 MCP stdio 伺服器
- [ ] 與 Cursor MCP Client 整合

---

## 📎 參考資料

- [Model Context Protocol Spec](https://modelcontextprotocol.io)
- [Cursor MCP Integration](https://docs.cursor.com/mcp)
