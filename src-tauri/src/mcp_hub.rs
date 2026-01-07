// ============ MCP Hub - Bidirectional Control System ============
// Enables TaskRails to communicate with AI IDE agents via MCP protocol

use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use tauri::State;

// ============ Types ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpCommand {
    pub id: String,
    pub action: String, // "execute_task", "read_file", "write_file", "query_status"
    pub payload: serde_json::Value,
    pub created_at: String,
    pub status: String, // "pending", "dispatched", "completed", "failed"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResult {
    pub command_id: String,
    pub status: String, // "success", "error", "pending"
    pub output: String,
    pub artifacts: Option<Vec<String>>,
    pub completed_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpHubState {
    pub connected: bool,
    pub last_heartbeat: Option<String>,
    pub pending_commands: usize,
    pub completed_commands: usize,
}

// ============ MCP Hub Manager ============

pub struct McpHub {
    command_queue: Arc<Mutex<VecDeque<McpCommand>>>,
    result_queue: Arc<Mutex<VecDeque<McpResult>>>,
    is_connected: Arc<Mutex<bool>>,
}

impl McpHub {
    pub fn new() -> Self {
        McpHub {
            command_queue: Arc::new(Mutex::new(VecDeque::new())),
            result_queue: Arc::new(Mutex::new(VecDeque::new())),
            is_connected: Arc::new(Mutex::new(false)),
        }
    }

    pub fn enqueue_command(&self, command: McpCommand) -> Result<(), String> {
        let mut queue = self.command_queue.lock().map_err(|e| e.to_string())?;
        queue.push_back(command);
        Ok(())
    }

    pub fn dequeue_command(&self) -> Result<Option<McpCommand>, String> {
        let mut queue = self.command_queue.lock().map_err(|e| e.to_string())?;
        Ok(queue.pop_front())
    }

    pub fn peek_commands(&self, limit: usize) -> Result<Vec<McpCommand>, String> {
        let queue = self.command_queue.lock().map_err(|e| e.to_string())?;
        Ok(queue.iter().take(limit).cloned().collect())
    }

    pub fn push_result(&self, result: McpResult) -> Result<(), String> {
        let mut queue = self.result_queue.lock().map_err(|e| e.to_string())?;
        queue.push_back(result);
        Ok(())
    }

    pub fn get_results(&self, limit: usize) -> Result<Vec<McpResult>, String> {
        let queue = self.result_queue.lock().map_err(|e| e.to_string())?;
        Ok(queue.iter().take(limit).cloned().collect())
    }

    pub fn set_connected(&self, connected: bool) -> Result<(), String> {
        let mut state = self.is_connected.lock().map_err(|e| e.to_string())?;
        *state = connected;
        Ok(())
    }

    pub fn is_connected(&self) -> Result<bool, String> {
        let state = self.is_connected.lock().map_err(|e| e.to_string())?;
        Ok(*state)
    }

    pub fn get_state(&self) -> Result<McpHubState, String> {
        let connected = self.is_connected()?;
        let pending = self.command_queue.lock().map_err(|e| e.to_string())?.len();
        let completed = self.result_queue.lock().map_err(|e| e.to_string())?.len();

        Ok(McpHubState {
            connected,
            last_heartbeat: Some(Utc::now().to_rfc3339()),
            pending_commands: pending,
            completed_commands: completed,
        })
    }
}

impl Default for McpHub {
    fn default() -> Self {
        Self::new()
    }
}

// ============ Tauri State Wrapper ============

pub struct McpHubWrapper(pub Arc<McpHub>);

// ============ Tauri Commands ============

/// Enqueue a new command to be sent to AI IDE
#[tauri::command]
pub fn mcp_enqueue_command(
    hub: State<'_, McpHubWrapper>,
    action: String,
    payload: serde_json::Value,
) -> Result<String, String> {
    let id = format!("cmd-{}", Utc::now().timestamp_millis());
    let command = McpCommand {
        id: id.clone(),
        action,
        payload,
        created_at: Utc::now().to_rfc3339(),
        status: "pending".to_string(),
    };
    hub.0.enqueue_command(command)?;
    Ok(id)
}

/// Get pending commands for AI IDE to fetch (MCP endpoint)
#[tauri::command]
pub fn mcp_get_pending_commands(
    hub: State<'_, McpHubWrapper>,
    limit: Option<usize>,
) -> Result<Vec<McpCommand>, String> {
    hub.0.peek_commands(limit.unwrap_or(10))
}

/// AI IDE acknowledges command and removes it from queue
#[tauri::command]
pub fn mcp_acknowledge_command(
    hub: State<'_, McpHubWrapper>,
) -> Result<Option<McpCommand>, String> {
    hub.0.dequeue_command()
}

/// AI IDE reports task result back to TaskRails
#[tauri::command]
pub fn mcp_report_result(
    hub: State<'_, McpHubWrapper>,
    command_id: String,
    status: String,
    output: String,
    artifacts: Option<Vec<String>>,
) -> Result<(), String> {
    let result = McpResult {
        command_id,
        status,
        output,
        artifacts,
        completed_at: Utc::now().to_rfc3339(),
    };
    hub.0.push_result(result)
}

/// Get results from completed commands
#[tauri::command]
pub fn mcp_get_results(
    hub: State<'_, McpHubWrapper>,
    limit: Option<usize>,
) -> Result<Vec<McpResult>, String> {
    hub.0.get_results(limit.unwrap_or(50))
}

/// Get MCP Hub connection state
#[tauri::command]
pub fn mcp_get_state(hub: State<'_, McpHubWrapper>) -> Result<McpHubState, String> {
    hub.0.get_state()
}

/// Set MCP connection status (called by AI IDE heartbeat)
#[tauri::command]
pub fn mcp_set_connected(hub: State<'_, McpHubWrapper>, connected: bool) -> Result<(), String> {
    hub.0.set_connected(connected)
}

/// Dispatch a task to AI IDE - combines creating command and storing context
#[tauri::command]
pub fn mcp_dispatch_task(
    hub: State<'_, McpHubWrapper>,
    task_id: String,
    title: String,
    description: String,
    agent_context: Option<serde_json::Value>,
) -> Result<String, String> {
    let payload = serde_json::json!({
        "task_id": task_id,
        "title": title,
        "description": description,
        "agent_context": agent_context,
        "timestamp": Utc::now().to_rfc3339()
    });

    let id = format!("task-{}", Utc::now().timestamp_millis());
    let command = McpCommand {
        id: id.clone(),
        action: "execute_task".to_string(),
        payload,
        created_at: Utc::now().to_rfc3339(),
        status: "pending".to_string(),
    };
    hub.0.enqueue_command(command)?;

    println!("[MCP Hub] Dispatched task: {} - {}", id, title);
    Ok(id)
}
