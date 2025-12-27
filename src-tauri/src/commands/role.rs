use crate::db::DbState;
use rusqlite;
use serde::{Deserialize, Serialize};
use tauri::State;

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
