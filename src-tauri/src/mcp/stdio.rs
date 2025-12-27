use crate::mcp::JsonRpcRequest;
use serde_json::json;
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

                eprintln!("[DEBUG] Received: {}", trimmed);

                match serde_json::from_str::<JsonRpcRequest>(trimmed) {
                    Ok(req) => {
                        let response_opt = crate::mcp::handle_mcp_request(req, &handle).await;

                        if let Some(response) = response_opt {
                            let response_json = serde_json::to_string(&response).unwrap();

                            if let Err(e) = stdout
                                .write_all(format!("{}\n", response_json).as_bytes())
                                .await
                            {
                                eprintln!("Failed to write to stdout: {}", e);
                                break;
                            }
                            let _ = stdout.flush().await;
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to parse JSON: {} | Input: {}", e, trimmed);
                        // Try to extract ID if possible to reply with error
                        let id = if let Ok(val) = serde_json::from_str::<serde_json::Value>(trimmed)
                        {
                            val.get("id").cloned()
                        } else {
                            None
                        };

                        let err_resp = json!({
                            "jsonrpc": "2.0",
                            "error": {
                                "code": -32700,
                                "message": "Parse error"
                            },
                            "id": id
                        });
                        let _ = stdout.write_all(format!("{}\n", err_resp).as_bytes()).await;
                        let _ = stdout.flush().await;
                    }
                }
            }
            Err(e) => {
                eprintln!("Error reading from stdin: {}", e);
                break;
            }
        }
    }
}
