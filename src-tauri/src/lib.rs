// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub mod commands;
mod config;
pub mod db;
mod git_ops;
pub mod mcp;
pub mod memory_bank;
pub mod satellite;
mod sentinel;
mod state_machine;
pub mod utils;

use state_machine::StateManager;
use tauri::Manager;

pub fn run_mcp_stdio() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();
            let db_state = db::init(&handle).expect("Failed to init DB");
            app.manage(db_state);
            app.manage(StateManager::new());

            let handle_for_stdio = handle.clone();
            tauri::async_runtime::spawn(async move {
                mcp::stdio::start_stdio_server(handle_for_stdio).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running mcp-stdio");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(StateManager::new())
        .setup(|app| {
            let db_state = db::init(app.handle())?;

            // Check if there's a saved workspace path and switch to project DB
            {
                let conn = db_state.conn.lock().unwrap();
                let result: Option<String> = conn
                    .query_row(
                        "SELECT value FROM settings WHERE key = 'workspace_path'",
                        [],
                        |row| row.get(0),
                    )
                    .ok();

                if let Some(workspace_path) = result {
                    if std::path::Path::new(&workspace_path).exists() {
                        drop(conn); // Release lock before switching
                        if let Err(e) = db::switch_project(&db_state, &workspace_path) {
                            eprintln!("[App] Failed to load project DB: {}", e);
                        } else {
                            println!("[App] Loaded project database from: {}", workspace_path);
                        }
                    }
                }
            }

            app.manage(db_state);

            let handle = app.handle().clone();
            // Spawn MCP SSE Server
            tauri::async_runtime::spawn(async move {
                mcp::sse::start_sse_server(handle).await;
            });

            // Spawn Satellite Server (Actix System)
            std::thread::spawn(move || {
                let sys = actix_rt::System::new();
                match sys.block_on(async move { satellite::start_server(".".to_string()).await }) {
                    Ok(_) => println!("[Satellite] Server stopped gracefully"),
                    Err(e) => eprintln!("[Satellite] Server error: {}", e),
                }
                // sys.run() is handled by block_on for the future,
                // but actix-web usually requires sys.run() for the arbiter.
                // start_server calls .run().await which blocks.
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            // Task Commands
            commands::get_tasks,
            commands::create_task,
            commands::update_task,
            commands::delete_task,
            commands::delete_all_tasks,
            commands::update_task_status,
            // Role Commands
            commands::get_roles,
            commands::create_role,
            commands::update_role,
            commands::delete_role,
            // State Commands
            commands::set_role,
            // Settings & Workspace Commands
            commands::get_setting,
            commands::set_setting,
            commands::pick_folder,
            commands::write_workspace_file,
            commands::read_workspace_file,
            commands::save_md_file,
            commands::execute_ide_command,
            commands::log_activity,
            commands::get_activity,
            commands::execute_ai_chat,
            commands::get_project_spec,
            commands::update_project_spec,
            commands::open_chat_window,
            commands::get_available_skills,
            commands::check_environment,
            commands::analyze_linter_output,
            // Experience Commands
            commands::log_experience,
            commands::search_experiences,
            // Memory Bank Commands
            commands::get_memory_list,
            commands::get_memory,
            commands::update_memory,
            // Vibe Core Commands
            commands::check_local_llm_connection,
            commands::refine_prompt,
            commands::sync_active_tasks,
            // Project Switching
            commands::switch_project,
            commands::get_current_workspace
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
