use crate::mcp::JsonRpcRequest;
use tokio::io::{stdin, stdout, AsyncBufReadExt, AsyncWriteExt, BufReader};

pub async fn start_stdio_server(handle: tauri::AppHandle) {
    let stdin = stdin();
    let mut reader = BufReader::new(stdin);
    let mut stdout = stdout();
    let mut line = String::new();

    eprintln!("MCP Stdio Server started");

    loop {
        line.clear();
        match reader.read_line(&mut line).await {
            Ok(0) => break, // EOF
            Ok(_) => {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }

                if let Ok(req) = serde_json::from_str::<JsonRpcRequest>(trimmed) {
                    let response = crate::mcp::handle_mcp_request(req, &handle).await;
                    let response_json = serde_json::to_string(&response).unwrap();

                    if let Err(e) = stdout
                        .write_all(format!("{}\n", response_json).as_bytes())
                        .await
                    {
                        eprintln!("Failed to write to stdout: {}", e);
                        break;
                    }
                    let _ = stdout.flush().await;
                } else {
                    eprintln!("Invalid JSON-RPC request received: {}", trimmed);
                }
            }
            Err(e) => {
                eprintln!("Error reading from stdin: {}", e);
                break;
            }
        }
    }
}
