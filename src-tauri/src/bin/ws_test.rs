use taskrails_lib::satellite::start_server;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    println!("[Standalone Test] Starting Satellite Server...");
    start_server("..".to_string()).await
}
