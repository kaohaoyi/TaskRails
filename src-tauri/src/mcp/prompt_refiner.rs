use super::local_llm::LocalLlmClient;
use std::error::Error;

pub struct PromptRefiner {
    client: LocalLlmClient,
}

impl PromptRefiner {
    pub fn new() -> Self {
        Self {
            // Future: Load from config
            client: LocalLlmClient::new(None, None),
        }
    }

    pub async fn check_health(&self) -> bool {
        self.client.check_connection().await
    }

    pub async fn refine_user_intent(
        &self,
        user_intent: &str,
        memory_bank_context: &str,
    ) -> Result<String, Box<dyn Error>> {
        // Here we could add more logic, e.g. history management or parsing
        self.client
            .refine_prompt(user_intent, memory_bank_context)
            .await
    }
}
