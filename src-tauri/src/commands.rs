use crate::db::DbState;
use crate::state_machine::{AppState, StateManager};
use crate::utils::ai::{AiClient, AiRequest, ChatMessage};
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

#[derive(Debug, Serialize, Deserialize)]
pub struct SpecData {
    pub id: String,
    pub name: Option<String>,
    pub overview: Option<String>,
    pub tech_stack: Option<String>,
    pub data_structure: Option<String>,
    pub features: Option<String>,
    pub design: Option<String>,
    pub rules: Option<String>,
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

    let endpoint = get_setting(db_state.clone(), "ai_endpoint".to_string()).unwrap_or(None);

    if api_key.is_empty() && provider != "ollama" {
        return Err("API Key is missing".to_string());
    }

    let request = AiRequest {
        provider,
        api_key,
        model,
        messages,
        endpoint,
    };

    let client = AiClient::new();
    client.execute(request).await
}

#[tauri::command]
pub fn get_available_skills() -> Result<Vec<crate::utils::skills::SkillDefinition>, String> {
    // TODO: Get workspace root from DB or context. For now using "."
    Ok(crate::utils::skills::SkillLoader::load_skills("."))
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

    // 先檢查任務是否已存在
    let existing: Option<(String, Option<String>, String)> = conn
        .query_row(
            "SELECT title, description, status FROM tasks WHERE id = ?1",
            [&task.id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .ok();

    if let Some((existing_title, existing_desc, existing_status)) = existing {
        // 任務已存在，比較內容是否相同
        let new_desc = task.description.clone().unwrap_or_default();
        let old_desc = existing_desc.unwrap_or_default();

        if existing_title == task.title && old_desc == new_desc && existing_status == task.status {
            // 內容相同，跳過更新
            return Ok(());
        }

        // 內容不同，更新任務
        conn.execute(
            "UPDATE tasks SET title = ?1, description = ?2, status = ?3, phase = ?4, 
             priority = ?5, tag = ?6, assignee = ?7, is_reworked = ?8, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?9",
            rusqlite::params![
                task.title,
                task.description,
                task.status,
                task.phase.unwrap_or_else(|| "PHASE 1".to_string()),
                task.priority.unwrap_or_else(|| "3".to_string()),
                task.tag,
                task.assignee,
                task.is_reworked.map(|v| if v { 1 } else { 0 }).unwrap_or(0),
                task.id,
            ],
        ).map_err(|e| e.to_string())?;
    } else {
        // 任務不存在，新增
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
    }

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

// ============ Spec Commands ============
#[tauri::command]
pub fn get_project_spec(db_state: State<'_, DbState>) -> Result<Option<SpecData>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, overview, tech_stack, data_structure, features, design, rules FROM project_spec WHERE id = 'default'")
        .map_err(|e| e.to_string())?;

    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        Ok(Some(SpecData {
            id: row.get(0).map_err(|e| e.to_string())?,
            name: row.get(1).map_err(|e| e.to_string())?,
            overview: row.get(2).map_err(|e| e.to_string())?,
            tech_stack: row.get(3).map_err(|e| e.to_string())?,
            data_structure: row.get(4).map_err(|e| e.to_string())?,
            features: row.get(5).map_err(|e| e.to_string())?,
            design: row.get(6).map_err(|e| e.to_string())?,
            rules: row.get(7).map_err(|e| e.to_string())?,
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn update_project_spec(db_state: State<'_, DbState>, spec: SpecData) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO project_spec (id, name, overview, tech_stack, data_structure, features, design, rules, updated_at) 
         VALUES ('default', ?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)",
        rusqlite::params![
            spec.name,
            spec.overview,
            spec.tech_stack,
            spec.data_structure,
            spec.features,
            spec.design,
            spec.rules,
        ],
    ).map_err(|e| e.to_string())?;
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

// ============ Experience System Commands (Phase 3) ============

#[derive(Debug, Serialize, Deserialize)]
pub struct ExperienceData {
    pub id: String,
    pub content: String,
    pub solution: Option<String>,
    pub tags: Vec<String>,
    pub status: String,
}

#[tauri::command]
pub fn log_experience(
    db_state: State<'_, DbState>,
    content: String,
    solution: String,
    tags: Vec<String>,
) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;

    // Generate ID and Tags JSON
    let id = format!("exp_{}", uuid::Uuid::new_v4());
    let tags_json = serde_json::to_string(&tags).unwrap_or("[]".to_string());

    conn.execute(
        "INSERT INTO experiences (id, content, solution, tags, status) VALUES (?1, ?2, ?3, ?4, 'pending')",
        rusqlite::params![id, content, solution, tags_json],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn search_experiences(
    db_state: State<'_, DbState>,
    query: String,
) -> Result<Vec<ExperienceData>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;

    // Simple RAG-lite: LIKE search on content or tags
    let mut stmt = conn
        .prepare(
            "SELECT id, content, solution, tags, status FROM experiences 
         WHERE content LIKE ?1 OR tags LIKE ?1 OR solution LIKE ?1
         ORDER BY created_at DESC LIMIT 20",
        )
        .map_err(|e| e.to_string())?;

    let search_term = format!("%{}%", query);

    let rows = stmt
        .query_map([&search_term], |row| {
            let tags_str: String = row.get(3)?;
            Ok(ExperienceData {
                id: row.get(0)?,
                content: row.get(1)?,
                solution: row.get(2)?,
                tags: serde_json::from_str(&tags_str).unwrap_or_default(),
                status: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let results: Result<Vec<_>, _> = rows.collect();
    results.map_err(|e| e.to_string())
}

// ============ Memory Bank Commands ============

#[tauri::command]
pub fn get_memory_list(workspace: String) -> Result<Vec<String>, String> {
    crate::memory_bank::list_memories(&workspace)
}

#[tauri::command]
pub fn get_memory(
    workspace: String,
    name: String,
) -> Result<crate::memory_bank::MemoryEntry, String> {
    crate::memory_bank::read_memory(&workspace, &name)
}

#[tauri::command]
pub fn update_memory(workspace: String, name: String, content: String) -> Result<(), String> {
    crate::memory_bank::write_memory(&workspace, &name, &content)
}
