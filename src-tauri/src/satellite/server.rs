use crate::satellite::broadcaster::{BroadcastMessage, Broadcaster, Connect};
use actix::prelude::*;
use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

/// WebSocket Session Actor
pub struct SatelliteSession {
    broadcaster: Addr<Broadcaster>,
}

impl Actor for SatelliteSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        // Register self to broadcaster
        let addr = ctx.address();
        self.broadcaster.do_send(Connect {
            addr: addr.recipient(),
        });
    }

    fn stopped(&mut self, _ctx: &mut Self::Context) {
        // We could send Disconnect here, but Recipient removal is tricky without ID.
        // For now relying on do_send failure.
    }
}

/// Handle incoming WebSocket messages (Heartbeat, etc)
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for SatelliteSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Err(_) => {
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };

        match msg {
            ws::Message::Ping(msg) => ctx.pong(&msg),
            ws::Message::Pong(_) => (),
            ws::Message::Text(text) => {
                println!("[Satellite] Received: {}", text);
                // Echo back for now or handle commands
            }
            ws::Message::Close(reason) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => (),
        }
    }
}

/// Handle Broadcast messages coming from Broadcaster
impl Handler<BroadcastMessage> for SatelliteSession {
    type Result = ();

    fn handle(&mut self, msg: BroadcastMessage, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

/// WebSocket route handler
async fn ws_route(
    req: HttpRequest,
    stream: web::Payload,
    broadcaster: web::Data<Addr<Broadcaster>>,
    state: web::Data<SatelliteState>,
) -> Result<HttpResponse, Error> {
    // 1. Security Check (Token Validation)
    if !check_auth(&req, &state.token) {
        println!("[Satellite] Connection Rejected: Invalid Token");
        return Ok(HttpResponse::Unauthorized().body("Invalid Satellite Token"));
    }

    // 2. Start WebSocket
    ws::start(
        SatelliteSession {
            broadcaster: broadcaster.get_ref().clone(),
        },
        &req,
        stream,
    )
}

fn check_auth(req: &HttpRequest, expected_token: &str) -> bool {
    // Check Authorization header: "Bearer <token>"
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                return token == expected_token;
            }
        }
    }

    // Fallback: Check Query Param ?token=... (Useful for browser tests)
    let query = req.query_string();
    if query.contains(&format!("token={}", expected_token)) {
        return true;
    }

    false
}

/// Write environment config to .taskrails/config/local_env.json
fn write_local_env(port: u16, token: &str, workspace_root: &str) -> std::io::Result<()> {
    let config_dir = PathBuf::from(workspace_root)
        .join(".taskrails")
        .join("config");
    fs::create_dir_all(&config_dir)?;

    let path = config_dir.join("local_env.json");

    // Match the LocalEnv Structure
    let content = serde_json::json!({
        "node": { "path": "", "version": "" },
        "cargo": { "path": "", "version": "" },
        "docker": { "available": false, "mode": "native" },
        "satellite": {
            "token": token,
            "port": port
        }
    });

    fs::write(&path, serde_json::to_string_pretty(&content)?)?;
    println!("[Satellite] Wrote local_env.json to {:?}", path);
    Ok(())
}

struct SatelliteState {
    token: String,
}

/// Start the Satellite WebSocket Server
pub async fn start_server(workspace_root: String) -> std::io::Result<()> {
    let broadcaster = Broadcaster::new().start();
    let token = Uuid::new_v4().to_string();

    // Port hopping logic (Simplified for MVP: Try 3002, then panic if fails)
    // In production we should loop ports.
    let port = 3002;

    write_local_env(port, &token, &workspace_root)?;

    println!(
        "[Satellite] Starting WebSocket Server on 127.0.0.1:{}",
        port
    );
    println!("[Satellite] Security Token: {}", token);

    let state = web::Data::new(SatelliteState {
        token: token.clone(),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(broadcaster.clone()))
            .app_data(state.clone())
            .route("/ws", web::get().to(ws_route))
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
