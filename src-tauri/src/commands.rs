use crate::db::DbState;
use crate::state_machine::{AppState, StateManager};
use serde::{Deserialize, Serialize};
use tauri::State;

// ============ Task Types ============
#[derive(Debug, Serialize, Deserialize)]
pub struct TaskData {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub phase: Option<String>,
    pub priority: Option<String>,
    pub tag: Option<String>,
    pub assignee: Option<String>,
    pub is_reworked: Option<bool>,
}

// ============ Role Types ============
#[derive(Debug, Serialize, Deserialize)]
pub struct RoleData {
    pub id: String,
    pub name: String,
    pub agent_name: String,
    pub role_type: String, // 'ai' or 'human'
    pub system_prompt: Option<String>,
    pub is_default: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<ChatMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIChoice {
    message: ChatMessage,
}

#[tauri::command]
pub async fn execute_ai_chat(
    db_state: State<'_, DbState>,
    messages: Vec<ChatMessage>,
    override_provider: Option<String>,
    override_model: Option<String>,
) -> Result<String, String> {
    let provider = override_provider.unwrap_or_else(|| {
        get_setting(db_state.clone(), "ai_provider".to_string())
            .unwrap_or(None)
            .unwrap_or("openai".to_string())
    });

    let api_key = get_setting(db_state.clone(), format!("ai_api_key_{}", provider))
        .unwrap_or_default()
        .unwrap_or_default();

    let model = override_model.unwrap_or_else(|| {
        get_setting(db_state.clone(), "ai_model".to_string())
            .unwrap_or(None)
            .unwrap_or("gpt-4o".to_string())
    });

    let custom_endpoint = get_setting(db_state.clone(), "ai_endpoint".to_string())
        .unwrap_or(None)
        .unwrap_or_default();

    // Clean model name for Google (must not have models/ or google/ prefix for OpenAI shim)
    let final_model = if provider == "google" {
        model.replace("models/", "").replace("google/", "")
    } else {
        model
    };

    if api_key.is_empty() && provider != "ollama" {
        return Err("API Key is missing".to_string());
    }

    let url = match provider.as_str() {
        "openai" => "https://api.openai.com/v1/chat/completions".to_string(),
        "anthropic" => "https://api.anthropic.com/v1/messages".to_string(),
        "google" => {
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions".to_string()
        }
        "openrouter" => "https://openrouter.ai/api/v1/chat/completions".to_string(),
        "together" => "https://api.together.xyz/v1/chat/completions".to_string(),
        "xai" => "https://api.x.ai/v1/chat/completions".to_string(),
        "deepseek" => "https://api.deepseek.com/chat/completions".to_string(),
        "huggingface" => "https://api-inference.huggingface.co/v1/chat/completions".to_string(),
        "ollama" => "http://localhost:11434/v1/chat/completions".to_string(),
        "custom" => custom_endpoint.clone(),
        _ => "https://api.openai.com/v1/chat/completions".to_string(),
    };

    let client = reqwest::Client::new();
    let mut builder = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key));

    // Handle Anthropic specific headers if needed
    if provider == "anthropic" {
        builder = builder
            .header("x-api-key", &api_key)
            .header("anthropic-version", "2023-06-01");
    }

    let response = builder
        .json(&OpenAIRequest {
            model: final_model,
            messages,
        })
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        let err_text = response.text().await.unwrap_or_default();
        return Err(format!("AI Provider Error ({}): {}", url, err_text));
    }

    let res_data: OpenAIResponse = response.json().await.map_err(|e| e.to_string())?;

    if let Some(choice) = res_data.choices.first() {
        Ok(choice.message.content.clone())
    } else {
        Err("No response from AI".to_string())
    }
}

// ============ Task Commands ============
#[tauri::command]
pub fn get_tasks(db_state: State<'_, DbState>) -> Result<Vec<TaskData>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, title, description, status, phase, priority, tag, assignee, is_reworked FROM tasks ORDER BY phase, priority"
    ).map_err(|e| e.to_string())?;

    let task_iter = stmt
        .query_map([], |row| {
            Ok(TaskData {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                phase: row.get(4)?,
                priority: row.get(5)?,
                tag: row.get(6)?,
                assignee: row.get(7)?,
                is_reworked: row.get::<_, Option<i32>>(8)?.map(|v| v != 0),
            })
        })
        .map_err(|e| e.to_string())?;

    let tasks: Result<Vec<_>, _> = task_iter.collect();
    tasks.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_task(db_state: State<'_, DbState>, task: TaskData) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO tasks (id, title, description, status, phase, priority, tag, assignee, is_reworked) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        rusqlite::params![
            task.id,
            task.title,
            task.description,
            task.status,
            task.phase.unwrap_or_else(|| "PHASE 1".to_string()),
            task.priority.unwrap_or_else(|| "3".to_string()),
            task.tag,
            task.assignee,
            task.is_reworked.map(|v| if v { 1 } else { 0 }).unwrap_or(0),
        ],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_task(db_state: State<'_, DbState>, task: TaskData) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE tasks SET 
            title = ?1, 
            description = ?2, 
            status = ?3, 
            phase = ?4, 
            priority = ?5, 
            tag = ?6, 
            assignee = ?7, 
            is_reworked = ?8,
            updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?9",
        rusqlite::params![
            task.title,
            task.description,
            task.status,
            task.phase,
            task.priority,
            task.tag,
            task.assignee,
            task.is_reworked.map(|v| if v { 1 } else { 0 }),
            task.id,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_all_tasks(db_state: State<'_, DbState>) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_task(db_state: State<'_, DbState>, id: String) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_task_status(
    db_state: State<'_, DbState>,
    id: String,
    status: String,
) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE tasks SET status = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
        [&status, &id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ============ Role Commands ============
#[tauri::command]
pub fn get_roles(db_state: State<'_, DbState>) -> Result<Vec<RoleData>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, name, agent_name, role_type, system_prompt, is_default FROM roles ORDER BY is_default DESC, created_at"
    ).map_err(|e| e.to_string())?;

    let role_iter = stmt
        .query_map([], |row| {
            Ok(RoleData {
                id: row.get(0)?,
                name: row.get(1)?,
                agent_name: row.get(2)?,
                role_type: row.get(3)?,
                system_prompt: row.get(4)?,
                is_default: row.get::<_, i32>(5)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;

    let roles: Result<Vec<_>, _> = role_iter.collect();
    roles.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_role(db_state: State<'_, DbState>, role: RoleData) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO roles (id, name, agent_name, role_type, system_prompt, is_default) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            role.id,
            role.name,
            role.agent_name,
            role.role_type,
            role.system_prompt,
            if role.is_default { 1 } else { 0 },
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_role(db_state: State<'_, DbState>, role: RoleData) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE roles SET name = ?1, agent_name = ?2, role_type = ?3, system_prompt = ?4 WHERE id = ?5 AND is_default = 0",
        rusqlite::params![
            role.name,
            role.agent_name,
            role.role_type,
            role.system_prompt,
            role.id,
        ],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_role(db_state: State<'_, DbState>, id: String) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    // Only delete non-default roles
    conn.execute("DELETE FROM roles WHERE id = ?1 AND is_default = 0", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============ State Machine Commands ============
#[tauri::command]
pub fn set_role(state_manager: State<'_, StateManager>, role: String) -> Result<(), String> {
    let new_state = match role.as_str() {
        "coder" => AppState::Coder,
        "reviewer" => AppState::Reviewer,
        "architect" => AppState::Architect,
        _ => return Err("Invalid role".to_string()),
    };
    state_manager.set_state(new_state);
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
        // 沒有設定工作區，不執行動作
        Ok(())
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ActivityData {
    pub id: Option<i32>,
    pub event_type: String,
    pub message: String,
    pub user_id: Option<String>,
    pub timestamp: String,
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
