use std::{ collections::HashMap};
use serde::{Deserialize, Serialize};
use tokio::{sync::mpsc::{UnboundedSender, UnboundedReceiver}};
use uuid::Uuid;


#[derive(Clone)]
pub struct SessionConnection {
    id: u32,
    sender: UnboundedSender<SessionEvent>,
}

impl SessionConnection {
   pub fn new(id: u32, sender: UnboundedSender<SessionEvent>) -> SessionConnection {
        SessionConnection {
           id, sender
        }
    }
}
pub struct MoveRectangleCommand {
    uuid: String,
    diff_x: f32,
    diff_y: f32,
}

impl MoveRectangleCommand {
    pub fn new(uuid: String,  diff_x: f32,
        diff_y: f32) -> MoveRectangleCommand {
        MoveRectangleCommand {
          uuid, diff_x, diff_y
        }
    }
}

#[derive(Clone)]
pub struct RectangleMovedEvent {
    pub uuid: String,
    pub diff_x: f32,
    pub diff_y: f32,
}

impl RectangleMovedEvent {
    pub fn new(uuid: String,  diff_x: f32,
        diff_y: f32) -> RectangleMovedEvent {
            RectangleMovedEvent {
          uuid, diff_x, diff_y
        }
    }
}

#[derive(Clone)]
pub struct FullStateSentEventConnection {
    pub id: u32,
}

#[derive(Clone)]
pub struct FullStateSentEvent {
    pub connections: HashMap<u32, FullStateSentEventConnection>,
    pub rectangles: HashMap<String, Rectangle>,
}

impl FullStateSentEvent {
    pub fn new(connections: HashMap<u32, FullStateSentEventConnection>, rectangles: HashMap<String, Rectangle>) -> FullStateSentEvent {
        FullStateSentEvent {
            connections, rectangles
        }
    }
}

pub enum SessionCommand {
    Join(SessionConnection),
    Disconnect(u32),
    MoveRectangle(MoveRectangleCommand)
}

#[derive(Clone)]
pub enum SessionEvent {
    ClientConnected(u32),
    ClientDisconnected(u32),
    FullStateSent(FullStateSentEvent),
    RectangleMoved(RectangleMovedEvent)
}

#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub struct Rectangle {
    uuid: String,
    width: u32,
    height: u32,
    left: f32,
    top: f32,
}

impl Rectangle {
    fn new(uuid: String, width: u32, height: u32, left: f32, top: f32) -> Rectangle {
        Rectangle {
            uuid,
            width,
            height,
            left,
            top,
        }
    }

    fn move_by(&mut self, dx: f32, dy: f32) {
        self.left = (self.left as f32 + dx) as f32;
        self.top = (self.top as f32 + dy) as f32;
    }
}


#[derive(Clone)]
pub struct SessionState {
    connections: HashMap<u32, SessionConnection>,
    rectangles: HashMap<String, Rectangle>,
}

impl SessionState {
    pub fn new() -> Self {
        let initial_rectangle = Rectangle::new(Uuid::new_v4().to_string(), 100, 100, 100.0, 100.0);
        let mut rectangles = HashMap::new();

        rectangles.insert(initial_rectangle.uuid.clone(), initial_rectangle);

        Self {
            connections: HashMap::new(),
            rectangles,
        }
    }

    fn connect_client(&mut self, connection: SessionConnection) -> SessionEvent {
        let id = connection.id;
        self.connections.insert(connection.id, connection);
        SessionEvent::ClientConnected(id)
    }

    fn disconnect_client(&mut self, id: u32) -> SessionEvent {
        self.connections.remove(&id);
        SessionEvent::ClientDisconnected(id)
    }

    fn request_state(&self) -> SessionEvent {
        let connections = HashMap::from_iter(self.connections.iter().map(|(key, _)| (key.clone(), FullStateSentEventConnection {id: key.clone()})));
        SessionEvent::FullStateSent(FullStateSentEvent::new(connections, self.rectangles.clone()))
    }

    fn move_rectangle(&mut self, uuid: String, dx: f32, dy: f32) -> SessionEvent {
        let rectangle = self.rectangles.get_mut(&uuid).unwrap();
        rectangle.move_by(dx, dy);
        println!("Rectangle {} moved, new position is {} {}", uuid, rectangle.left, rectangle.top);
        SessionEvent::RectangleMoved(RectangleMovedEvent::new(uuid, dx, dy))
    }
}

pub async fn start_session(mut session_command_receiver: UnboundedReceiver<SessionCommand>) {
    let mut session_state : SessionState = SessionState::new();

    fn dispatch_event(event: SessionEvent, connections: &HashMap<u32, SessionConnection>) {
        for (_, connection) in connections {
            let _ = connection.sender.send(event.clone());
        }
    }

    while let Some(command) = session_command_receiver.recv().await {
        match command {
            SessionCommand::Join(connection) => {
                let event = session_state.connect_client(connection);
                dispatch_event(event, &session_state.connections);
                let full_state_event = session_state.request_state();
                dispatch_event(full_state_event, &session_state.connections)
            }
            SessionCommand::Disconnect(id) => {
                let event = session_state.disconnect_client(id);
                dispatch_event(event, &session_state.connections);
            }
            SessionCommand::MoveRectangle(command) => {
                let event = session_state.move_rectangle(command.uuid,command.diff_x, command.diff_y);
                dispatch_event(event, &session_state.connections);
            }
        }
    }
}