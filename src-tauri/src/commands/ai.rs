use crate::commands::system::get_setting;
use crate::db::DbState;
use crate::utils::ai::{AiClient, AiRequest, ChatMessage};
use tauri::State;

#[tauri::command]
pub async fn execute_ai_chat(
    db_state: State<'_, DbState>,
    messages: Vec<ChatMessage>,
    override_provider: Option<String>,
    override_model: Option<String>,
) -> Result<String, String> {
    let provider = override_provider.unwrap_or_else(|| {
        get_setting(db_state.clone(), "ai_provider".to_string())
            .unwrap_or(None)
            .unwrap_or("openai".to_string())
    });

    let api_key = get_setting(db_state.clone(), format!("ai_api_key_{}", provider))
        .unwrap_or_default()
        .unwrap_or_default();

    let model = override_model.unwrap_or_else(|| {
        get_setting(db_state.clone(), "ai_model".to_string())
            .unwrap_or(None)
            .unwrap_or("gpt-4o".to_string())
    });

    let endpoint = get_setting(db_state.clone(), "ai_endpoint".to_string()).unwrap_or(None);

    // For ollama and custom, API key is optional
    if api_key.is_empty() && provider != "ollama" && provider != "custom" {
        return Err("API Key is missing".to_string());
    }

    let request = AiRequest {
        provider,
        api_key,
        model,
        messages,
        endpoint,
    };

    let client = AiClient::new();
    client.execute(request).await
}

#[tauri::command]
pub fn get_available_skills() -> Result<Vec<crate::utils::skills::SkillDefinition>, String> {
    // TODO: Get workspace root from DB or context. For now using "."
    Ok(crate::utils::skills::SkillLoader::load_skills("."))
}

// ============ Vibe Core Commands ============
#[tauri::command]
pub async fn verify_ai_connection(
    db_state: State<'_, DbState>,
    provider: String,
    model: String,
) -> Result<bool, String> {
    let api_key = get_setting(db_state.clone(), format!("ai_api_key_{}", provider))
        .unwrap_or_default()
        .unwrap_or_default();

    // For ollama and custom, API key is optional
    if api_key.is_empty() && provider != "ollama" && provider != "custom" {
        return Ok(false);
    }

    let endpoint = get_setting(db_state.clone(), "ai_endpoint".to_string()).unwrap_or(None);

    let request = AiRequest {
        provider,
        api_key,
        model,
        messages: vec![ChatMessage {
            role: "user".to_string(),
            content: "hi".to_string(),
        }],
        endpoint,
    };

    let client = AiClient::new();
    // Use a short timeout or just check if it returns anything
    match client.execute(request).await {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub async fn check_local_llm_connection(db_state: State<'_, DbState>) -> Result<bool, String> {
    let endpoint = get_setting(db_state.clone(), "ai_endpoint".to_string()).unwrap_or(None);

    let client = crate::mcp::local_llm::LocalLlmClient::new(endpoint, None);
    Ok(client.check_connection().await)
}

#[tauri::command]
pub async fn refine_prompt(
    db_state: State<'_, DbState>,
    user_intent: String,
    context: String,
) -> Result<String, String> {
    let endpoint = get_setting(db_state.clone(), "ai_endpoint".to_string()).unwrap_or(None);

    let client = crate::mcp::local_llm::LocalLlmClient::new(endpoint, None);

    let system_prompt =
        "你是一個專業的 Prompt 工程師。請根據用戶意圖和上下文，生成一個優化過的、更具體的 Prompt。";
    let prompt = format!(
        "用戶意圖: {}\n專案上下文: {}\n\n請生成優化後的 Prompt:",
        user_intent, context
    );

    client
        .chat(system_prompt, &prompt)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_chat_message(
    db_state: State<'_, DbState>,
    session_id: String,
    role: String,
    content: String,
) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO chat_history (session_id, role, content) VALUES (?1, ?2, ?3)",
        [session_id, role, content],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_chat_history(
    db_state: State<'_, DbState>,
    session_id: String,
) -> Result<Vec<ChatMessage>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT role, content FROM chat_history WHERE session_id = ?1 ORDER BY timestamp ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([session_id], |row| {
            Ok(ChatMessage {
                role: row.get(0)?,
                content: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let messages: Result<Vec<_>, _> = rows.collect();
    messages.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_chat_history(db_state: State<'_, DbState>, session_id: String) -> Result<(), String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM chat_history WHERE session_id = ?1",
        [session_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Scan project source code structure
#[tauri::command]
pub fn scan_project(
    db_state: State<'_, DbState>,
) -> Result<crate::project_scanner::ProjectScanResult, String> {
    let ws_guard = db_state.current_workspace.lock().unwrap();
    let workspace_path = ws_guard.as_ref().ok_or("No active project")?;

    crate::project_scanner::scan_project(workspace_path)
}

/// Generate project documentation using AI based on scan results
#[tauri::command]
pub async fn generate_project_docs(
    db_state: State<'_, DbState>,
    scan_result: crate::project_scanner::ProjectScanResult,
) -> Result<String, String> {
    // Generate context for AI
    let context = crate::project_scanner::generate_project_context_for_ai(&scan_result);

    // Get AI settings in a scoped block to avoid Send issues
    let (provider, model, api_key, endpoint) = {
        let conn = db_state.conn.lock().map_err(|e| e.to_string())?;

        let provider: String = conn
            .query_row(
                "SELECT value FROM settings WHERE key = 'ai_provider'",
                [],
                |r| r.get(0),
            )
            .unwrap_or_else(|_| "google".to_string());

        let model: String = conn
            .query_row(
                "SELECT value FROM settings WHERE key = 'ai_model'",
                [],
                |r| r.get(0),
            )
            .unwrap_or_else(|_| "gemini-2.0-flash".to_string());

        let api_key: Option<String> = conn
            .query_row(
                &format!(
                    "SELECT value FROM settings WHERE key = 'ai_api_key_{}'",
                    provider
                ),
                [],
                |r| r.get(0),
            )
            .ok();

        let endpoint: Option<String> = conn
            .query_row(
                "SELECT value FROM settings WHERE key = 'ai_endpoint'",
                [],
                |r| r.get(0),
            )
            .ok();

        (provider, model, api_key, endpoint)
    }; // conn is dropped here

    let Some(key) = api_key else {
        return Err(format!("未設定 {} API Key", provider));
    };

    // Build AI request
    let system_prompt = r#"你是一個頂尖資深軟體架構師。請根據提供的專案掃描結果，生成一份專業且具備高度實踐價值的「專案開發說明書」。

這份說明書必須嚴格包含以下章節：

1. **專案概述** - 說明專案定位、目標用戶與核心價值。
2. **技術架構** - 詳細列出前後端技術棧、通訊協定與系統拓樸。
3. **核心模組分析** - 
   - 深入剖析專案中的關鍵元件：任務管理系統、智能聊天視窗、編輯器控制中心。
   - **AGENT 實現細節**：描述 AGENT 的功能、實現方式及其與其他模組的交互連動。
4. **核心功能清單** - 條列式列出目前已實現與計畫中的核心功能。
5. **資料結構定義** - 描述資料庫 Schema、關鍵 JSON 結構或核心類別定義。
6. **設計規範與規範** - 說明 UI 設計語言、代碼風格與架構模式。
7. **專案文件規則** - 規範文件存放路徑、命名規則與維護流程。
8. **開發與部署指南** - 
   - **環境導入**：相依工具與版本。
   - **開發流程**：啟動測試、提交規範。
   - **測試驗證**：提供針對分析器或控制中心的測試案例範例與預期輸入/輸出。

輸出要求：
- 使用 **繁體中文 (台灣)**。
- 程式碼區塊請使用適當的標籤（Rust, TSX 等）。
- 對於 AGENT 部分，請提供示例配置或虛擬代碼幫助快速上手。
- 保持結構專業且嚴謹，不使用贅字。"#;

    let user_message = format!("請根據以下掃描結果生成專案說明書：\n\n{}", context);

    let request = AiRequest {
        provider: provider.clone(),
        api_key: key,
        model,
        messages: vec![
            ChatMessage {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: user_message,
            },
        ],
        endpoint,
    };

    let client = AiClient::new();
    let response = client.execute(request).await?;

    Ok(response)
}
