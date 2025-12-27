use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

pub struct DbState {
    pub conn: Mutex<Connection>,
    pub current_workspace: Mutex<Option<String>>,
}

/// Initialize the global app database and auto-load last project
pub fn init(app_handle: &tauri::AppHandle) -> Result<DbState> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
    let db_path = app_dir.join("taskrails_global.db");

    let conn = Connection::open(&db_path)?;
    conn.execute("PRAGMA foreign_keys = ON;", [])?;

    // Ensure settings table exists in global DB
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    // Check for last workspace_path
    let last_ws: Option<String> = conn
        .query_row(
            "SELECT value FROM settings WHERE key = 'workspace_path'",
            [],
            |r| r.get(0),
        )
        .ok();

    let (active_conn, active_ws) = if let Some(ws_path) = last_ws {
        println!("[DB] Auto-loading workspace: {}", ws_path);
        // Try to initialize project DB
        match init_project_db(&ws_path) {
            Ok(p_conn) => (p_conn, Some(ws_path)),
            Err(e) => {
                println!("[DB] Failed to auto-load workspace: {}", e);
                (conn, None)
            }
        }
    } else {
        (conn, None)
    };

    Ok(DbState {
        conn: Mutex::new(active_conn),
        current_workspace: Mutex::new(active_ws),
    })
}

/// Initialize or open a project-scoped database
pub fn init_project_db(workspace_path: &str) -> Result<Connection> {
    let taskrails_dir = PathBuf::from(workspace_path).join(".taskrails");
    std::fs::create_dir_all(&taskrails_dir).ok();

    let db_path = taskrails_dir.join("project.db");
    let conn = Connection::open(&db_path)?;

    conn.execute("PRAGMA foreign_keys = ON;", [])?;
    create_project_tables(&conn)?;

    Ok(conn)
}

/// Create all project-specific tables
fn create_project_tables(conn: &Connection) -> Result<()> {
    // Settings table (for project-specific settings)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    // Tasks table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'todo',
            phase TEXT DEFAULT 'PHASE 1',
            priority TEXT DEFAULT '3',
            tag TEXT,
            assignee TEXT,
            is_reworked INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Roles table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS roles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            agent_name TEXT NOT NULL,
            role_type TEXT NOT NULL DEFAULT 'ai',
            system_prompt TEXT,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Logs table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // System activity
    conn.execute(
        "CREATE TABLE IF NOT EXISTS system_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            message TEXT NOT NULL,
            user_id TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Project spec
    conn.execute(
        "CREATE TABLE IF NOT EXISTS project_spec (
            id TEXT PRIMARY KEY,
            name TEXT,
            overview TEXT,
            tech_stack TEXT,
            data_structure TEXT,
            features TEXT,
            design TEXT,
            rules TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Experiences
    conn.execute(
        "CREATE TABLE IF NOT EXISTS experiences (
            id TEXT PRIMARY KEY,
            pattern_hash TEXT,
            content TEXT NOT NULL,
            solution TEXT,
            tags TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Chat History
    conn.execute(
        "CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Insert default roles if not exist
    let default_roles = vec![
        (
            "ai_antigravity",
            "架構師",
            "Antigravity",
            "ai",
            "你是系統架構師。專注於高層設計、模組劃分、技術選型與架構決策。",
        ),
        (
            "ai_codegen",
            "開發者",
            "CodeGen-1",
            "ai",
            "你是資深開發工程師。專注於撰寫高品質、可測試的程式碼。",
        ),
        (
            "ai_review_bot",
            "審查者",
            "ReviewBot",
            "ai",
            "你是程式碼審查專家。專注於發現潛在問題、安全漏洞、效能瓶頸。",
        ),
    ];

    for (id, name, agent_name, role_type, prompt) in default_roles {
        conn.execute(
            "INSERT OR IGNORE INTO roles (id, name, agent_name, role_type, system_prompt, is_default) VALUES (?1, ?2, ?3, ?4, ?5, 1)",
            [id, name, agent_name, role_type, prompt],
        )?;
    }

    Ok(())
}

/// Switch to a different project's database
pub fn switch_project(db_state: &DbState, workspace_path: &str) -> Result<()> {
    let new_conn = init_project_db(workspace_path)?;

    let mut conn_guard = db_state.conn.lock().unwrap();
    *conn_guard = new_conn;

    let mut ws_guard = db_state.current_workspace.lock().unwrap();
    *ws_guard = Some(workspace_path.to_string());

    Ok(())
}
