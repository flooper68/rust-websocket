use std::time::Duration;

use tokio::{net::{TcpListener}, time::sleep};
use futures_util::{StreamExt, SinkExt};
use tokio_tungstenite::tungstenite::Message;

const PORT: &str = "6464";

#[tokio::main]
async fn main() {
    let addr = format!("0.0.0.0:{}", PORT);


    let listener = TcpListener::bind(&addr)
    .await
    .expect("Listening to TCP failed.");



    println!("Listening on: {}", addr);

    // A counter to use as client ids.
    let mut id = 0;

    // Accept new clients.
    while let Ok((stream, peer)) = listener.accept().await {
        match tokio_tungstenite::accept_async(stream).await {
            Err(e) => println!("Websocket connection error : {}", e),
            Ok(ws_stream) => {
                println!("New Connection : {}", peer);
                id += 1;
                let (mut sender, mut receiver) = ws_stream.split();

                while(true) {
                    sleep(Duration::from_millis(1000)).await;
                    let _ = sender.send(Message::Text("Hello world".to_string())).await;
                    println!("Hello world send!");
                }

            }
        }
    }
}