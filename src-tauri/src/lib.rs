// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod commands;
mod db;
mod mcp;
mod state_machine;
mod utils;

use state_machine::StateManager;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(StateManager::new())
        .setup(|app| {
            let db_state = db::init(app.handle())?;
            app.manage(db_state);

            // Spawn MCP SSE Server
            tauri::async_runtime::spawn(async {
                mcp::sse::start_sse_server().await;
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
            commands::save_md_file,
            commands::execute_ide_command,
            commands::log_activity,
            commands::get_activity,
            commands::execute_ai_chat
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
