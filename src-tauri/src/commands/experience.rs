use crate::db::DbState;
use rusqlite;
use serde::{Deserialize, Serialize};
use serde_json;
use tauri::State;
use uuid;

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
