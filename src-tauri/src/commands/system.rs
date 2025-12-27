use crate::db::DbState;
use crate::state_machine::{AppState, StateManager};
use rusqlite;
use tauri::State;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ActivityData {
    pub id: Option<i32>,
    pub event_type: String,
    pub message: String,
    pub user_id: Option<String>,
    pub timestamp: String,
}

// ============ State Machine Commands ============
#[tauri::command]
pub fn set_role(
    state_manager: State<'_, StateManager>,
    sse_state: State<'_, crate::mcp::sse::ServerState>,
    role: String,
) -> Result<(), String> {
    let new_state = match role.as_str() {
        "coder" => AppState::Coder,
        "reviewer" => AppState::Reviewer,
        "architect" => AppState::Architect,
        _ => return Err("Invalid role".to_string()),
    };
    state_manager.set_state(new_state);

    // Broadcast to MCP Clients
    let _ = sse_state.tx.send(
        serde_json::json!({
            "jsonrpc": "2.0",
            "method": "notifications/identityChange",
            "params": {
                "role": role
            }
        })
        .to_string(),
    );

    Ok(())
}

#[tauri::command]
pub async fn save_md_file(content: String, filename: String) -> Result<(), String> {
    use std::io::Write;

    let path = rfd::AsyncFileDialog::new()
        .set_file_name(&filename)
        .add_filter("Markdown", &["md"])
        .save_file()
        .await;

    if let Some(file_handle) = path {
        let mut file = std::fs::File::create(file_handle.path())
            .map_err(|e| format!("無法建立檔案: {}", e))?;
        file.write_all(content.as_bytes())
            .map_err(|e| format!("無法寫入檔案: {}", e))?;
        Ok(())
    } else {
        Ok(())
    }
}

#[tauri::command]
pub fn get_setting(db_state: State<'_, DbState>, key: String) -> Result<Option<String>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM settings WHERE key = ?1")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([&key]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        Ok(Some(row.get(0).map_err(|e| e.to_string())?))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn set_setting(db_state: State<'_, DbState>, key: String, value: String) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
        [&key, &value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn pick_folder() -> Result<Option<String>, String> {
    let path = rfd::AsyncFileDialog::new().pick_folder().await;

    Ok(path.map(|p| p.path().to_string_lossy().to_string()))
}

#[tauri::command]
pub fn write_workspace_file(db_state: State<'_, DbState>, content: String) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM settings WHERE key = 'workspace_path'")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let workspace_path: String = row.get(0).map_err(|e| e.to_string())?;
        let path = std::path::Path::new(&workspace_path).join(".taskrails");

        use std::io::Write;
        let mut file = std::fs::File::create(path)
            .map_err(|e| format!("無法在工作區建立 .taskrails: {}", e))?;
        file.write_all(content.as_bytes())
            .map_err(|e| format!("無法寫入 .taskrails: {}", e))?;
        Ok(())
    } else {
        Ok(())
    }
}

#[tauri::command]
pub fn read_workspace_file(db_state: State<'_, DbState>) -> Result<Option<String>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM settings WHERE key = 'workspace_path'")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let workspace_path: String = row.get(0).map_err(|e| e.to_string())?;
        let path = std::path::Path::new(&workspace_path).join(".taskrails");

        if path.exists() {
            let content =
                std::fs::read_to_string(path).map_err(|e| format!("無法讀取 .taskrails: {}", e))?;
            Ok(Some(content))
        } else {
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

// ============ Sentinel Commands ============
#[tauri::command]
pub fn check_environment() -> crate::sentinel::EnvironmentType {
    crate::sentinel::Sentinel::check_environment()
}

#[tauri::command]
pub fn analyze_linter_output(output: String, format: String) -> Vec<crate::sentinel::LintError> {
    crate::sentinel::Sentinel::parse_linter_output(&output, &format)
}

#[tauri::command]
pub fn log_activity(
    db_state: tauri::State<'_, DbState>,
    event_type: String,
    message: String,
) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO system_activity (event_type, message) VALUES (?1, ?2)",
        [event_type, message],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_activity(db_state: tauri::State<'_, DbState>) -> Result<Vec<ActivityData>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, event_type, message, user_id, timestamp FROM system_activity ORDER BY timestamp DESC LIMIT 100")
        .map_err(|e| e.to_string())?;

    let activity_iter = stmt
        .query_map([], |row| {
            Ok(ActivityData {
                id: row.get(0)?,
                event_type: row.get(1)?,
                message: row.get(2)?,
                user_id: row.get(3)?,
                timestamp: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let activities: Result<Vec<_>, _> = activity_iter.collect();
    activities.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn execute_ide_command(
    db_state: tauri::State<'_, DbState>,
    cmd_type: String,
) -> Result<String, String> {
    println!("[IDE_COMMAND] Executing: {}", cmd_type);

    // Log the activity
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO system_activity (event_type, message) VALUES ('IDE_CONTROL', ?1)",
        [format!("Executed {} command", cmd_type)],
    )
    .map_err(|e| e.to_string())?;

    Ok(format!("Command '{}' sent to AI IDE", cmd_type))
}

#[tauri::command]
pub async fn open_chat_window(app: tauri::AppHandle) -> Result<(), String> {
    use tauri::Manager;

    // Check if window already exists
    if let Some(window) = app.get_webview_window("ai-chat") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }

    // Create new window if not exists
    let url = tauri::WebviewUrl::App("/chat".into());
    tauri::WebviewWindowBuilder::new(&app, "ai-chat", url)
        .title("Architect AI")
        .inner_size(1000.0, 800.0)
        .min_inner_size(500.0, 600.0)
        .resizable(true)
        .visible(true)
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Switch to a different project's database
/// This is called when user selects a new workspace folder
#[tauri::command]
pub fn switch_project(
    app_handle: tauri::AppHandle,
    db_state: State<'_, DbState>,
    workspace_path: String,
) -> Result<String, String> {
    crate::db::switch_project(&db_state, &workspace_path)
        .map_err(|e| format!("Failed to switch project: {}", e))?;

    // Also save to global settings
    {
        let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('workspace_path', ?1)",
            [&workspace_path],
        )
        .map_err(|e| e.to_string())?;
    }

    // Notify frontend to reload data
    use tauri::Emitter;
    let _ = app_handle.emit("project-switched", &workspace_path);

    Ok(format!("Switched to project: {}", workspace_path))
}

/// Get current workspace info
#[tauri::command]
pub fn get_current_workspace(db_state: State<'_, DbState>) -> Result<Option<String>, String> {
    let ws_guard = db_state.current_workspace.lock().unwrap();
    Ok(ws_guard.clone())
}
