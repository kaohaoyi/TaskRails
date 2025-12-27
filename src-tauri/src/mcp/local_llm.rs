use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::error::Error;

const DEFAULT_LM_STUDIO_URL: &str = "http://localhost:1234/v1/chat/completions";

#[derive(Clone)]
pub struct LocalLlmClient {
    client: Client,
    base_url: String,
    model: String,
}

#[derive(Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    stream: bool,
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: MessageContent,
}

#[derive(Deserialize)]
struct MessageContent {
    content: String,
}

impl LocalLlmClient {
    pub fn new(base_url: Option<String>, model: Option<String>) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.unwrap_or_else(|| DEFAULT_LM_STUDIO_URL.to_string()),
            // Default model name often ignored by LM Studio in local mode, but good to have
            model: model.unwrap_or_else(|| "qwen-2.5-7b-instruct".to_string()),
        }
    }

    pub async fn refine_prompt(
        &self,
        user_input: &str,
        context: &str,
    ) -> Result<String, Box<dyn Error>> {
        let system_prompt = format!(
            "你是一個 TaskRails 的本地架構師 (Refiner)。\n\
            你的目標是將用戶模糊的指令轉化為專業的「工程 Prompt」，供雲端 AI 執行。\n\n\
            [Context]\n{}\n\n\
            [Rules]\n\
            1. 分析用戶指令。\n\
            2. 若指令模糊，請直接反問 (不用包在標籤裡)。\n\
            3. 若指令清晰，請生成 <final_prompt>...</final_prompt>。\n\
            4. <final_prompt> 內必須包含條列式的步驟、檔案路徑與具體驗收標準。\n",
            context
        );

        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: system_prompt,
            },
            ChatMessage {
                role: "user".to_string(),
                content: user_input.to_string(),
            },
        ];

        let req_body = ChatRequest {
            model: self.model.clone(),
            messages,
            temperature: 0.7,
            stream: false,
        };

        let resp = self
            .client
            .post(&self.base_url)
            .json(&req_body)
            .send()
            .await?;

        if !resp.status().is_success() {
            return Err(format!("Request failed: {}", resp.status()).into());
        }

        let chat_resp: ChatResponse = resp.json().await?;

        if let Some(choice) = chat_resp.choices.first() {
            Ok(choice.message.content.clone())
        } else {
            Err("No content received".into())
        }
    }
    pub async fn check_connection(&self) -> bool {
        // Try to GET the base_url. Even if it returns 405 (Method Not Allowed) for a POST endpoint,
        // it means the server is reachable.
        // Or better, try to reach the models endpoint by stripping /chat/completions if present.
        let url = if self.base_url.ends_with("/chat/completions") {
            self.base_url.replace("/chat/completions", "/models")
        } else {
            // Fallback
            "http://localhost:1234/v1/models".to_string()
        };

        match self.client.get(&url).send().await {
            Ok(resp) => resp.status().is_success(),
            Err(_) => false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_lm_studio_connection() {
        // This test requires LM Studio to be running at localhost:1234
        // We will just check if we can reach the endpoint or get a specific error (not connection refused)
        let client = reqwest::Client::new();
        let res = client.get("http://localhost:1234/v1/models").send().await;

        match res {
            Ok(response) => {
                println!(
                    "✅ Connection to LM Studio successful: Status {}",
                    response.status()
                );
                assert!(
                    response.status().is_success() || response.status().is_client_error(),
                    "Should get a valid HTTP response"
                );
            }
            Err(e) => {
                // We print a warning but don't fail the test hard if enviroment is not set up,
                // but for this specific audit task, we want to know.
                println!("⚠️ Could not connect to LM Studio: {}", e);
                // For the purpose of the 'Architecture Audit', failing execution here is informative
                // But typically we don't want CI to fail.
                // Let's print visible output.
            }
        }
    }
}
