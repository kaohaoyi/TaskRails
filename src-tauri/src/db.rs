use rusqlite::{Connection, Result};
use std::sync::Mutex;
use tauri::Manager;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

pub fn init(app_handle: &tauri::AppHandle) -> Result<DbState> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
    let db_path = app_dir.join("taskrails.db");

    let conn = Connection::open(db_path)?;

    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON;", [])?;

    // Create Tables
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    // Tasks table with full schema
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

    // Roles table for custom AI agents and collaborators
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

    // System activity logs for Engineering History
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

    // Insert sample tasks if not exist
    /*
    let sample_tasks = vec![
        ...
    ];

    for (id, title, description, status, phase, priority, tag, assignee) in sample_tasks {
        conn.execute(
            "INSERT OR IGNORE INTO tasks (id, title, description, status, phase, priority, tag, assignee) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            rusqlite::params![id, title, description, status, phase, priority, tag, assignee],
        )?;
    }
    */

    Ok(DbState {
        conn: Mutex::new(conn),
    })
}
