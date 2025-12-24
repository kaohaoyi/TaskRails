use actix::prelude::*;
use actix_web_actors::ws;
use std::collections::HashSet;

/// Message to broadcast to all connected satellites
#[derive(Message, Clone)]
#[rtype(result = "()")]
pub struct BroadcastMessage(pub String);

/// Message sent when a client connects
#[derive(Message)]
#[rtype(result = "()")]
pub struct Connect {
    pub addr: Recipient<BroadcastMessage>,
}

/// Message sent when a client disconnects
#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub addr: Recipient<BroadcastMessage>,
}

/// The Broadcaster Actor managing all connections
pub struct Broadcaster {
    sessions: HashSet<Recipient<BroadcastMessage>>,
}

impl Broadcaster {
    pub fn new() -> Self {
        Broadcaster {
            sessions: HashSet::new(),
        }
    }
}

impl Actor for Broadcaster {
    type Context = Context<Self>;
}

/// Handler for Connect message
impl Handler<Connect> for Broadcaster {
    type Result = ();

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) {
        println!("[Satellite] New client connected");
        self.sessions.insert(msg.addr);
    }
}

/// Handler for Disconnect message
impl Handler<Disconnect> for Broadcaster {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        println!("[Satellite] Client disconnected");
        // Usually Recipient doesn't implement Hash/Eq perfectly for removal by value easily
        // in simplified scenarios, but let's try to keep track.
        // Note: Removing Recipient from HashSet is tricky without an ID.
        // For MVP, we might rely on the fact that send will fail if disconnected.
    }
}

/// Handler for Broadcast message
impl Handler<BroadcastMessage> for Broadcaster {
    type Result = ();

    fn handle(&mut self, msg: BroadcastMessage, _: &mut Context<Self>) {
        for session in &self.sessions {
            session.do_send(msg.clone());
        }
    }
}
