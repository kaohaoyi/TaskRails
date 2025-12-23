pub mod sse;
pub mod stdio;
pub mod token_monitor;

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub method: String,
    pub params: Option<serde_json::Value>,
    pub id: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub result: Option<serde_json::Value>,
    pub error: Option<JsonRpcError>,
    pub id: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

pub async fn handle_mcp_request(req: JsonRpcRequest, handle: &tauri::AppHandle) -> JsonRpcResponse {
    match req.method.as_str() {
        "initialize" => JsonRpcResponse {
            jsonrpc: "2.0".to_string(),
            result: Some(json!({
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {},
                    "resources": {},
                    "prompts": {}
                },
                "serverInfo": {
                    "name": "TaskRails",
                    "version": "2.0.0"
                }
            })),
            error: None,
            id: req.id,
        },
        "listTools" | "tools/list" => JsonRpcResponse {
            jsonrpc: "2.0".to_string(),
            result: Some(json!({
                "tools": [
                    {
                        "name": "get_context",
                        "description": "獲取目前專案的上下文、當前角色與任務進度。",
                        "inputSchema": {
                            "type": "object",
                            "properties": {}
                        }
                    },
                    {
                        "name": "update_mission",
                        "description": "更新特定任務的狀態或進度描述。",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "task_id": { "type": "string" },
                                "status": { "type": "string", "enum": ["todo", "doing", "done"] },
                                "comment": { "type": "string" }
                            },
                            "required": ["task_id", "status"]
                        }
                    }
                ]
            })),
            error: None,
            id: req.id,
        },
        "callTool" | "tools/call" => {
            if let Some(params) = req.params {
                let tool_name = params
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default();
                let _args = params.get("arguments").cloned().unwrap_or(json!({}));

                match tool_name {
                    "get_context" => {
                        let state_manager = handle.state::<crate::state_machine::StateManager>();
                        let current_role = state_manager.get_state();

                        let db_state = handle.state::<crate::db::DbState>();
                        let tasks = crate::commands::get_tasks(db_state).unwrap_or_default();

                        JsonRpcResponse {
                            jsonrpc: "2.0".to_string(),
                            result: Some(json!({
                                "content": [
                                    {
                                        "type": "text",
                                        "text": format!("目前角色: {:?}\n當前任務數量: {}", current_role, tasks.len())
                                    }
                                ]
                            })),
                            error: None,
                            id: req.id,
                        }
                    }
                    "update_mission" => JsonRpcResponse {
                        jsonrpc: "2.0".to_string(),
                        result: Some(json!({
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Task updated (Mock)"
                                }
                            ]
                        })),
                        error: None,
                        id: req.id,
                    },
                    _ => JsonRpcResponse {
                        jsonrpc: "2.0".to_string(),
                        result: None,
                        error: Some(JsonRpcError {
                            code: -32602,
                            message: format!("Tool not found: {}", tool_name),
                            data: None,
                        }),
                        id: req.id,
                    },
                }
            } else {
                JsonRpcResponse {
                    jsonrpc: "2.0".to_string(),
                    result: None,
                    error: Some(JsonRpcError {
                        code: -32602,
                        message: "Missing parameters for callTool".to_string(),
                        data: None,
                    }),
                    id: req.id,
                }
            }
        }
        _ => JsonRpcResponse {
            jsonrpc: "2.0".to_string(),
            result: None,
            error: Some(JsonRpcError {
                code: -32601,
                message: format!("Method not found: {}", req.method),
                data: None,
            }),
            id: req.id,
        },
    }
}
