use crate::db::DbState;
use rusqlite;
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

#[tauri::command]
pub fn sync_active_tasks(
    db_state: State<'_, DbState>,
    tasks: Vec<TaskData>,
) -> Result<usize, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    sync_tasks_logic(&conn, tasks).map_err(|e| e.to_string())
}

pub fn sync_tasks_logic(
    conn: &rusqlite::Connection,
    tasks: Vec<TaskData>,
) -> Result<usize, rusqlite::Error> {
    let mut updated_count = 0;
    for task in tasks {
        // Check if task exists and has changed
        let existing: Option<(String, Option<String>, String)> = conn
            .query_row(
                "SELECT title, description, status FROM tasks WHERE id = ?1",
                [&task.id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .ok();

        if let Some((existing_title, existing_desc, existing_status)) = existing {
            let new_desc = task.description.clone().unwrap_or_default();
            let old_desc = existing_desc.unwrap_or_default();

            if existing_title == task.title
                && old_desc == new_desc
                && existing_status == task.status
            {
                continue;
            }

            conn.execute(
                "UPDATE tasks SET title = ?1, description = ?2, status = ?3, updated_at = CURRENT_TIMESTAMP WHERE id = ?4",
                rusqlite::params![task.title, task.description, task.status, task.id],
            )?;
            updated_count += 1;
        } else {
            conn.execute(
                "INSERT INTO tasks (id, title, description, status, phase, priority) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                rusqlite::params![
                    task.id,
                    task.title,
                    task.description,
                    task.status,
                    task.phase.unwrap_or_else(|| "PHASE 1".to_string()),
                    task.priority.unwrap_or_else(|| "3".to_string()),
                ],
            )?;
            updated_count += 1;
        }
    }
    Ok(updated_count)
}
