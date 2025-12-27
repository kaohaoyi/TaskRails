use crate::mcp::JsonRpcRequest;
use axum::{
    response::sse::{Event, Sse},
    routing::{get, post},
    Json, Router,
};
use futures::stream::Stream;
use std::{convert::Infallible, net::SocketAddr, sync::Arc};
use tauri::Manager;
use tokio::sync::broadcast;

#[derive(Clone)]
pub struct ServerState {
    pub handle: tauri::AppHandle,
    pub tx: Arc<broadcast::Sender<String>>,
}

pub async fn start_sse_server(handle: tauri::AppHandle) {
    let (tx, _rx) = broadcast::channel(100);
    let tx = Arc::new(tx);

    // Manage state for other parts of the app
    handle.manage(ServerState {
        handle: handle.clone(),
        tx: tx.clone(),
    });

    let state = ServerState { handle, tx };

    let app = Router::new()
        .route("/sse", get(sse_handler))
        .route("/messages", post(message_handler))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 4567));
    println!("MCP SSE Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn sse_handler(
    axum::extract::State(state): axum::extract::State<ServerState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    use futures::stream::StreamExt;
    use tokio_stream::wrappers::BroadcastStream;

    let rx = state.tx.subscribe();
    let stream = BroadcastStream::new(rx).map(|msg| match msg {
        Ok(msg) => Ok(Event::default().data(msg)),
        Err(_) => Ok(Event::default().comment("missed message")),
    });

    Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default())
}

async fn message_handler(
    axum::extract::State(state): axum::extract::State<ServerState>,
    Json(payload): Json<JsonRpcRequest>,
) -> Json<serde_json::Value> {
    println!("Received MCP Request (SSE): {:?}", payload.method);

    let response_opt = crate::mcp::handle_mcp_request(payload, &state.handle).await;

    if let Some(response) = response_opt {
        Json(serde_json::to_value(response).unwrap())
    } else {
        // For notifications or ignored requests, return generic success (null or empty)
        Json(serde_json::Value::Null)
    }
}
