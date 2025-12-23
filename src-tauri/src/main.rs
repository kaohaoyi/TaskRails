// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.iter().any(|arg| arg == "mcp-stdio") {
        taskrails_lib::run_mcp_stdio();
    } else {
        taskrails_lib::run();
    }
}
