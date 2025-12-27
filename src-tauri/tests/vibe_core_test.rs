#[cfg(test)]
mod tests {
    // Import from the library crate
    // use rusqlite::Connection;
    use std::fs;
    // use std::path::Path;
    // use taskrails_lib::commands::{self, sync_tasks_logic, TaskData};
    use taskrails_lib::mcp::prompt_refiner::PromptRefiner;
    use taskrails_lib::memory_bank;

    #[tokio::test]
    async fn test_vibe_core_memory_bank() {
        println!("=== TEST: Memory Bank I/O ===");
        let temp_workspace = ".test_workspace";
        let _ = fs::remove_dir_all(temp_workspace);

        // 1. Write Memory
        let content = "# Vibe Core Spec\nTest Content";
        let res = memory_bank::write_memory(temp_workspace, "test-spec", content);
        assert!(res.is_ok(), "Failed to write memory");

        // 2. Read Memory
        let read = memory_bank::read_memory(temp_workspace, "test-spec");
        assert!(read.is_ok(), "Failed to read memory");
        assert_eq!(read.unwrap().content, content, "Content mismatch");

        // Cleanup
        let _ = fs::remove_dir_all(temp_workspace);
        println!("✅ Memory Bank Test Passed");
    }

    #[tokio::test]
    async fn test_local_llm_refiner() {
        println!("=== TEST: Local AI Refiner ===");
        let refiner = PromptRefiner::new();
        let healthy = refiner.check_health().await;

        if healthy {
            let res = refiner
                .refine_user_intent("Add a login button", "Context: React App")
                .await;
            if let Err(e) = res {
                println!("❌ Refiner Error: {:?}", e);
                panic!("Refiner failed to respond");
            }
            let response = res.unwrap();
            println!(
                "Refiner Response (Preview): {}",
                response.chars().take(100).collect::<String>()
            );
            assert!(response.len() > 0);
            println!("✅ Local AI Test Passed");
        } else {
            println!("⚠️ OUTPUT: LM Studio not connected (Skipping logic test)");
            // We don't fail the test to avoid breaking CI if server is down,
            // but for this manual verify it prints the warning.
        }
    }

    /*
    #[test]
    fn test_active_mermaid_sync() {
        println!("=== TEST: Active Mermaid Sync ===");

        // 1. Setup In-Memory DB
        let conn = Connection::open_in_memory().unwrap();

        // Create schema matches db.rs
        conn.execute(
            "CREATE TABLE tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'todo',
                phase TEXT DEFAULT 'PHASE 1',
                priority TEXT DEFAULT '3',
                tag TEXT,
                assignee TEXT,
                is_reworked INTEGER DEFAULT 0,
                created_at DATETIME,
                updated_at DATETIME
            )",
            [],
        )
        .unwrap();

        // 2. Prepare Task Data
        let tasks = vec![
            TaskData {
                id: "A".to_string(),
                title: "Login Component".to_string(),
                description: Some("From Mermaid".to_string()),
                status: "todo".to_string(),
                phase: Some("Phase 1".to_string()),
                priority: Some("3".to_string()),
                tag: Some("Mermaid".to_string()),
                assignee: None,
                created_at: None,
                updated_at: None,
            },
            TaskData {
                id: "B".to_string(),
                title: "API Service".to_string(),
                description: Some("From Mermaid".to_string()),
                status: "todo".to_string(),
                phase: None,
                priority: None,
                tag: Some("Mermaid".to_string()),
                assignee: None,
                created_at: None,
                updated_at: None,
            },
        ];

        // 3. Exec Sync Logic
        let count = sync_tasks_logic(&conn, tasks).expect("Sync logic failed");
        assert_eq!(count, 2, "Should insert 2 new tasks");

        // 4. Verify DB Content
        let mut stmt = conn.prepare("SELECT id, title FROM tasks").unwrap();
        let rows = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .unwrap();

        let results: Vec<(String, String)> = rows.map(|r| r.unwrap()).collect();
        assert_eq!(results.len(), 2);
        println!("Inserted Tasks: {:?}", results);

        // 5. Test Upsert (Idempotency) - Should not insert duplicates
        let tasks_retry = vec![TaskData {
            id: "A".to_string(),
            title: "Login Component".to_string(),
            description: None,
            status: "todo".to_string(),
            phase: None,
            priority: None,
            tag: None,
            assignee: None,
            created_at: None,
            updated_at: None,
        }];
        let count_retry = sync_tasks_logic(&conn, tasks_retry).expect("Retry sync failed");
        assert_eq!(count_retry, 0, "Should not insert existing task");

        println!("✅ Active Mermaid Sync Test Passed");
    }
    */
}
