// use tiktoken_rs::cl100k_base; // Commented out until cargo is available to fetch
use std::sync::atomic::{AtomicUsize, Ordering};
// use std::sync::Arc;

#[allow(dead_code)]
pub struct TokenMonitor {
    pub total_input_tokens: AtomicUsize,
    pub total_output_tokens: AtomicUsize,
    // tokenizer: CoreBPE,
}

#[allow(dead_code)]
impl TokenMonitor {
    pub fn new() -> Self {
        Self {
            total_input_tokens: AtomicUsize::new(0),
            total_output_tokens: AtomicUsize::new(0),
            // tokenizer: cl100k_base().unwrap(),
        }
    }

    pub fn count_tokens(&self, text: &str) -> usize {
        // Placeholder estimation until tiktoken-rs is compiled
        // 1 token ~= 4 chars
        text.len() / 4

        // Real implementation:
        // self.tokenizer.encode_with_special_tokens(text).len()
    }

    pub fn add_input(&self, text: &str) {
        let count = self.count_tokens(text);
        self.total_input_tokens.fetch_add(count, Ordering::Relaxed);
    }

    pub fn add_output(&self, text: &str) {
        let count = self.count_tokens(text);
        self.total_output_tokens.fetch_add(count, Ordering::Relaxed);
    }

    pub fn get_usage(&self) -> (usize, usize) {
        (
            self.total_input_tokens.load(Ordering::Relaxed),
            self.total_output_tokens.load(Ordering::Relaxed),
        )
    }
}
