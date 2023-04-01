
use tokio::{net::TcpListener, sync::mpsc};
use crate::connection::handle_connection;

mod session;
mod transport;
mod connection;

const PORT: &str = "6464";

#[tokio::main]
async fn main() {
    let (command_sender, command_receiver) = mpsc::unbounded_channel::<session::SessionCommand>();

    tokio::task::spawn(session::start_session(command_receiver));

    let addr = format!("0.0.0.0:{}", PORT);

    let listener = TcpListener::bind(&addr).await.expect("Listening to TCP failed.");

    println!("Listening on: {}", addr);

    let mut connection_id = 1;

    // Accept new clients.
    while let Ok((stream, peer)) = listener.accept().await {
        match tokio_tungstenite::accept_async(stream).await {
            Err(e) => println!("Websocket connection error : {}", e),
            Ok(ws_stream) => {
                println!("New Connection : {}", peer);
                tokio::task::spawn(handle_connection(ws_stream, command_sender.clone(),connection_id));
                connection_id = connection_id + 1;
            }
        }
    }
}