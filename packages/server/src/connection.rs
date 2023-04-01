use tokio::{net::{TcpStream},sync::mpsc::{self, UnboundedReceiver}};
use futures_util::{StreamExt, stream::{ SplitStream, SplitSink}, SinkExt};
use tokio_tungstenite::{WebSocketStream, tungstenite::Message};

use crate::session::{SessionEvent, self};
use crate::transport::{translate_event_to_ws, translate_ws_to_command};

async fn listen_to_ws_messages(mut receiver: SplitStream<WebSocketStream<TcpStream>>, command_sender: mpsc::UnboundedSender<session::SessionCommand>, connection_id: u32 ) {
    while let Some(msg) = receiver.next().await {
        if let Ok(msg) = msg {
            if msg.is_binary() {
                println!("Received binary message");
            } else if msg.is_text() {
                let command = translate_ws_to_command(msg.to_string());
                let _ = command_sender.send(command);
            } else if msg.is_close() {
                break;
            }
        } else {
            break;
        }
    }
    // When we break, we disconnect.
    let _ = command_sender.send(session::SessionCommand::Disconnect(connection_id));
}

async fn proxy_session_events(mut sender: SplitSink<WebSocketStream<TcpStream>, Message>, mut stream_receiver: UnboundedReceiver::<SessionEvent>) {
    while let Some(event) = stream_receiver.recv().await {
        println!("Received event from session");
        let message = translate_event_to_ws(event);
        println!("{}", message);
        let _ = sender.send(Message::text(message)).await;
    }
}

pub async fn handle_connection(ws_stream: WebSocketStream<TcpStream>, session_command_sender: mpsc::UnboundedSender<session::SessionCommand>, connection_id: u32) {
    let (sender, receiver) = ws_stream.split();
    let (session_event_sender, session_event_receiver) = mpsc::unbounded_channel::<SessionEvent>();

   let _ = session_command_sender.send(session::SessionCommand::Join(session::SessionConnection::new(connection_id, session_event_sender)));

   tokio::spawn( listen_to_ws_messages(receiver, session_command_sender, connection_id) );
   tokio::spawn( proxy_session_events(sender, session_event_receiver));
}
