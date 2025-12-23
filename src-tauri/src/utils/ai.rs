use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AiRequest {
    pub provider: String,
    pub api_key: String,
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub endpoint: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenAICompatibleRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnthropicRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,
    pub max_tokens: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
}

// ============ Google Native Types ============
#[derive(Debug, Serialize, Deserialize)]
pub struct GoogleRequest {
    pub contents: Vec<GoogleContent>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "systemInstruction")]
    pub system_instruction: Option<GoogleContent>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GoogleContent {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    pub parts: Vec<GooglePart>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GooglePart {
    pub text: String,
}

pub struct AiClient {
    client: reqwest::Client,
}

impl AiClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
        }
    }

    pub async fn execute(&self, req: AiRequest) -> Result<String, String> {
        match req.provider.as_str() {
            "anthropic" => self.execute_anthropic(req).await,
            "google" => self.execute_google(req).await,
            _ => self.execute_openai_compatible(req).await,
        }
    }

    async fn execute_openai_compatible(&self, req: AiRequest) -> Result<String, String> {
        let url = if req.provider == "custom" {
            req.endpoint
                .clone()
                .unwrap_or_else(|| "https://api.openai.com/v1/chat/completions".to_string())
        } else {
            match req.provider.as_str() {
                "openai" => "https://api.openai.com/v1/chat/completions".to_string(),
                "openrouter" => "https://openrouter.ai/api/v1/chat/completions".to_string(),
                "together" => "https://api.together.xyz/v1/chat/completions".to_string(),
                "xai" => "https://api.x.ai/v1/chat/completions".to_string(),
                "deepseek" => "https://api.deepseek.com/chat/completions".to_string(),
                "huggingface" => {
                    "https://api-inference.huggingface.co/v1/chat/completions".to_string()
                }
                "ollama" => "http://localhost:11434/v1/chat/completions".to_string(),
                _ => "https://api.openai.com/v1/chat/completions".to_string(),
            }
        };

        let body = OpenAICompatibleRequest {
            model: req.model,
            messages: req.messages,
            temperature: Some(0.7),
            max_tokens: Some(4096),
        };

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", req.api_key))
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            let err_text = response.text().await.unwrap_or_default();
            return Err(format!("AI Provider Error: {}", err_text));
        }

        let res_json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

        // Extract content from choices[0].message.content
        res_json["choices"][0]["message"]["content"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| format!("Invalid response format: {:?}", res_json))
    }

    async fn execute_anthropic(&self, req: AiRequest) -> Result<String, String> {
        let url = "https://api.anthropic.com/v1/messages";

        // Anthropic requires system prompt to be separate from messages
        let mut system_prompt = None;
        let mut filtered_messages = Vec::new();

        for msg in req.messages {
            if msg.role == "system" {
                system_prompt = Some(msg.content);
            } else {
                filtered_messages.push(msg);
            }
        }

        let body = AnthropicRequest {
            model: req.model,
            messages: filtered_messages,
            system: system_prompt,
            max_tokens: 4096,
            temperature: Some(0.7),
        };

        let response = self
            .client
            .post(url)
            .header("x-api-key", &req.api_key)
            .header("anthropic-version", "2023-06-01")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Anthropic request failed: {}", e))?;

        if !response.status().is_success() {
            let err_text = response.text().await.unwrap_or_default();
            return Err(format!("Anthropic Error: {}", err_text));
        }

        let res_json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

        // Anthropic response format: content[0].text
        res_json["content"][0]["text"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| format!("Invalid Anthropic response: {:?}", res_json))
    }

    async fn execute_google(&self, req: AiRequest) -> Result<String, String> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            req.model, req.api_key
        );

        let mut system_instruction = None;
        let mut contents = Vec::new();

        for msg in req.messages {
            if msg.role == "system" {
                system_instruction = Some(GoogleContent {
                    role: None, // System instruction doesn't need role
                    parts: vec![GooglePart { text: msg.content }],
                });
            } else {
                let role = if msg.role == "user" {
                    "user".to_string()
                } else {
                    "model".to_string()
                };
                contents.push(GoogleContent {
                    role: Some(role),
                    parts: vec![GooglePart { text: msg.content }],
                });
            }
        }

        let body = GoogleRequest {
            contents,
            system_instruction,
        };

        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Google request failed: {}", e))?;

        if !response.status().is_success() {
            let err_text = response.text().await.unwrap_or_default();
            return Err(format!("Google API Error: {}", err_text));
        }

        let res_json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

        // Google response format: candidates[0].content.parts[0].text
        res_json["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| format!("Invalid Google response: {:?}", res_json))
    }
}
