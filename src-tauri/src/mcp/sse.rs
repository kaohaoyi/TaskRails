use axum::{
    routing::{get, post},
    Router,
    response::sse::{Event, Sse},
    Json,
};
use std::{net::SocketAddr, sync::Arc, convert::Infallible};
use tokio::sync::broadcast;
use futures::stream::Stream;
use crate::mcp::JsonRpcRequest;

pub async fn start_sse_server() {
    let (tx, _rx) = broadcast::channel(100);
    let tx = Arc::new(tx);

    let app = Router::new()
        .route("/sse", get(move || sse_handler(tx.clone())))
        .route("/messages", post(message_handler));

    let addr = SocketAddr::from(([127, 0, 0, 1], 4567));
    println!("MCP SSE Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn sse_handler(tx: Arc<broadcast::Sender<String>>) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    use tokio_stream::wrappers::BroadcastStream;
    use futures::stream::StreamExt;

    let rx = tx.subscribe();
    let stream = BroadcastStream::new(rx).map(|msg| {
        match msg {
            Ok(msg) => Ok(Event::default().data(msg)),
            Err(_) => Ok(Event::default().comment("missed message")),
        }
    });

    Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default())
}

async fn message_handler(Json(payload): Json<JsonRpcRequest>) -> Json<serde_json::Value> {
    // TODO: Handle MCP Logic here
    println!("Received MCP Request: {:?}", payload);
    
    // Mock response
    Json(serde_json::json!({
        "jsonrpc": "2.0",
        "result": "ok",
        "id": payload.id
    }))
}
