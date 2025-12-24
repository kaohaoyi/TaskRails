// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod commands;
mod db;
mod git_ops;
mod mcp;
mod satellite;
mod sentinel;
mod state_machine;
mod utils;

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
            app.manage(db_state);

            let handle = app.handle().clone();
            // Spawn MCP SSE Server
            tauri::async_runtime::spawn(async move {
                mcp::sse::start_sse_server(handle).await;
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
            commands::open_chat_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
