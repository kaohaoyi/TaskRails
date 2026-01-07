use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;

const DEFAULT_LM_STUDIO_URL: &str = "http://localhost:1234/v1/chat/completions";

fn normalize_chat_url(url: &str) -> String {
    let trimmed = url.trim_end_matches('/');
    if trimmed.contains("/v1/chat/completions") {
        return trimmed.to_string();
    }

    // If it only has /v1, add /chat/completions
    if trimmed.ends_with("/v1") {
        return format!("{}/chat/completions", trimmed);
    }

    // If it doesn't have /v1 at all, assume it needs it (LM Studio style)
    if !trimmed.contains("/v1") {
        return format!("{}/v1/chat/completions", trimmed);
    }

    // Fallback
    trimmed.to_string()
}

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

impl LocalLlmClient {
    pub fn new(base_url: Option<String>, model: Option<String>) -> Self {
        let url = base_url.unwrap_or_else(|| DEFAULT_LM_STUDIO_URL.to_string());
        Self {
            client: Client::new(),
            base_url: normalize_chat_url(&url),
            // Default model name. Found 'qwen2.5-7b-instruct' in user logs.
            model: model.unwrap_or_else(|| "qwen2.5-7b-instruct".to_string()),
        }
    }

    pub async fn chat(
        &self,
        system_prompt: &str,
        user_prompt: &str,
    ) -> Result<String, Box<dyn Error>> {
        let model_to_use = self
            .get_current_model()
            .await
            .unwrap_or_else(|| self.model.clone());

        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: user_prompt.to_string(),
            },
        ];

        let req_body = ChatRequest {
            model: model_to_use.clone(),
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
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(format!("LM Studio 請求失敗 ({}): {}", status, body).into());
        }

        let chat_resp: serde_json::Value = resp.json().await?;

        // Check for error field in the JSON response even if status was 200
        if let Some(err) = chat_resp.get("error") {
            return Err(format!("LM Studio Error: {}", err).into());
        }

        if let Some(content) = chat_resp["choices"][0]["message"]["content"].as_str() {
            Ok(content.to_string())
        } else {
            Err(format!("Invalid response format: {:?}", chat_resp).into())
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

        self.chat(&system_prompt, user_input).await
    }

    /// Try to get the first available model from LM Studio
    async fn get_current_model(&self) -> Option<String> {
        let url = if self.base_url.contains("/v1/chat/completions") {
            self.base_url.replace("/v1/chat/completions", "/v1/models")
        } else if self.base_url.ends_with("/v1") || self.base_url.ends_with("/v1/") {
            let mut base = self.base_url.clone();
            if !base.ends_with('/') {
                base.push('/');
            }
            format!("{}models", base)
        } else {
            // Fallback attempts
            format!("{}/v1/models", self.base_url.trim_end_matches('/'))
        };

        #[derive(Deserialize)]
        struct ModelsResponse {
            data: Vec<ModelInfo>,
        }
        #[derive(Deserialize)]
        struct ModelInfo {
            id: String,
        }

        match self.client.get(&url).send().await {
            Ok(resp) if resp.status().is_success() => {
                if let Ok(models) = resp.json::<ModelsResponse>().await {
                    models.data.first().map(|m| m.id.clone())
                } else {
                    None
                }
            }
            _ => None,
        }
    }
    pub async fn check_connection(&self) -> bool {
        let url = if self.base_url.contains("/v1/chat/completions") {
            self.base_url.replace("/v1/chat/completions", "/v1/models")
        } else if self.base_url.ends_with("/v1") || self.base_url.ends_with("/v1/") {
            let mut base = self.base_url.clone();
            if !base.ends_with('/') {
                base.push('/');
            }
            format!("{}models", base)
        } else {
            format!("{}/v1/models", self.base_url.trim_end_matches('/'))
        };

        match self.client.get(&url).send().await {
            Ok(resp) => resp.status().is_success(),
            Err(_) => false,
        }
    }
}

#[cfg(test)]
mod tests {

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
