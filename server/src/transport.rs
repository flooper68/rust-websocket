use std::collections::HashMap;

use crate::session::{SessionEvent, SessionCommand, MoveRectangleCommand, Rectangle};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct ClientConnectedMessage {
    id: u32,
}

#[derive(Serialize, Deserialize)]
struct ClientDisconnectedMessage {
    id: u32,
}

#[derive(Serialize, Deserialize)]
struct FullStateSentMessageConnection {
   id: u32
}

#[derive(Serialize, Deserialize)]
struct FullStateSentMessage {
    connections: HashMap<u32, FullStateSentMessageConnection>,
    rectangles: HashMap<String, Rectangle>,
}

#[derive(Serialize, Deserialize)]
struct RectangleMovedMessage {
    uuid: String,
    diff_x: f32,
    diff_y: f32,
}

#[derive(Debug, Deserialize)]
pub struct MoveRectangleMessage {
   pub uuid: String,
   pub diff_x: f32,
   pub diff_y: f32,
}

fn encode_message(message_type: &str, message: &str) -> String {
    let message = [message_type.to_string(), ";".to_string(), message.to_string()].join("");
    message
}

pub fn translate_event_to_ws(event: SessionEvent) -> String {
    match event {
        SessionEvent::ClientConnected(id) => {
            let client_connected = ClientConnectedMessage { id };
            let j = serde_json::to_string(&client_connected).unwrap();
            encode_message("ClientConnected", &j)
        }
        SessionEvent::FullStateSent(state) => {
            let message = FullStateSentMessage { rectangles: state.rectangles, connections: HashMap::from_iter(state.connections.iter().map(|(key, value)| (key.clone(), FullStateSentMessageConnection {id: value.id})))};
            let serialized = serde_json::to_string(&message).unwrap();
            encode_message("StateSent", &serialized)
        }
        SessionEvent::ClientDisconnected(id) => {
            let client_disconnected = ClientDisconnectedMessage { id };
            let j = serde_json::to_string(&client_disconnected).unwrap();
            encode_message("ClientDisconnected", &j)
        }
        SessionEvent::RectangleMoved(event) => {
            let object = RectangleMovedMessage { uuid: event.uuid, diff_x: event.diff_x, diff_y: event.diff_y };
            let serialized = serde_json::to_string(&object).unwrap();
            encode_message("RectangleMoved", &serialized)
        }
    }
}


pub fn translate_ws_to_command(message: String) -> SessionCommand {
    let parts = message.split(";").collect::<Vec<&str>>();
    let kind = parts[0];

    println!("received a messge {}", kind);

    match kind {
        "MoveRectangle" => {
            println!("Parsing MoveRectangle {}", message);
            let move_rectangle: MoveRectangleMessage = serde_json::from_str(parts[1]).unwrap();
            let command = SessionCommand::MoveRectangle(MoveRectangleCommand::new(move_rectangle.uuid, move_rectangle.diff_x, move_rectangle.diff_y));
            command
        }
        _ => panic!("Unknown command")
    }
}
