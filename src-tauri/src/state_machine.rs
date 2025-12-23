use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AppState {
    Idle,
    Coder,
    Reviewer,
    Architect,
    Airlock,
}

impl Default for AppState {
    fn default() -> Self {
        Self::Idle
    }
}

pub struct StateManager {
    pub current_state: std::sync::Mutex<AppState>,
}

impl StateManager {
    pub fn new() -> Self {
        Self {
            current_state: std::sync::Mutex::new(AppState::default()),
        }
    }

    pub fn set_state(&self, new_state: AppState) {
        let mut state = self.current_state.lock().unwrap();
        *state = new_state;
    }
    
    pub fn get_state(&self) -> AppState {
        *self.current_state.lock().unwrap()
    }
}
