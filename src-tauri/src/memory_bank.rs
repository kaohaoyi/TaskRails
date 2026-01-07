#![allow(dead_code)]
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// [目的] 記憶銀行條目結構
/// [欄位] name: 檔案名稱 (不含 @), content: 內容, path: 完整路徑
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryEntry {
    pub name: String,
    pub content: String,
    pub path: String,
}

/// [目的] 取得 Memory Bank 的根目錄路徑
fn get_memory_bank_path(workspace_root: &str) -> PathBuf {
    PathBuf::from(workspace_root)
        .join(".taskrails")
        .join("memory-bank")
}

/// [目的] 讀取指定的記憶檔案
/// [輸入] workspace_root: 工作區根目錄, name: 檔案名稱 (e.g., "architecture")
/// [輸出] Result<MemoryEntry, String>
pub fn read_memory(workspace_root: &str, name: &str) -> Result<MemoryEntry, String> {
    let file_name = format!("@{}.md", name);
    let path = get_memory_bank_path(workspace_root).join(&file_name);

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read memory file {}: {}", file_name, e))?;

    Ok(MemoryEntry {
        name: name.to_string(),
        content,
        path: path.to_string_lossy().to_string(),
    })
}

/// [目的] 寫入記憶檔案
/// [輸入] workspace_root: 工作區根目錄, name: 檔案名稱, content: 內容
/// [輸出] Result<(), String>
pub fn write_memory(workspace_root: &str, name: &str, content: &str) -> Result<(), String> {
    let file_name = format!("@{}.md", name);
    let dir = get_memory_bank_path(workspace_root);

    // 確保目錄存在
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create memory-bank dir: {}", e))?;

    let path = dir.join(&file_name);
    fs::write(&path, content).map_err(|e| format!("Failed to write memory file: {}", e))?;

    println!("[MemoryBank] Updated: {:?}", path);
    Ok(())
}

/// [目的] 列出所有記憶檔案
/// [輸入] workspace_root: 工作區根目錄
/// [輸出] Result<Vec<String>, String> - 檔案名稱列表
pub fn list_memories(workspace_root: &str) -> Result<Vec<String>, String> {
    let dir = get_memory_bank_path(workspace_root);

    if !dir.exists() {
        return Ok(vec![]);
    }

    let entries =
        fs::read_dir(&dir).map_err(|e| format!("Failed to read memory-bank dir: {}", e))?;

    let names: Vec<String> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map(|ext| ext == "md").unwrap_or(false))
        .filter_map(|e| {
            e.file_name()
                .to_string_lossy()
                .strip_prefix('@')
                .and_then(|s| s.strip_suffix(".md"))
                .map(|s| s.to_string())
        })
        .collect();

    Ok(names)
}
/// [目的] 刪除記憶檔案
/// [輸入] workspace_root: 工作區根目錄, name: 檔案名稱
/// [輸出] Result<(), String>
pub fn delete_memory(workspace_root: &str, name: &str) -> Result<(), String> {
    let file_name = format!("@{}.md", name);
    let path = get_memory_bank_path(workspace_root).join(&file_name);

    if path.exists() {
        fs::remove_file(&path).map_err(|e| format!("無法刪除檔案 {}: {}", file_name, e))?;
        println!("[MemoryBank] Deleted: {:?}", path);
        Ok(())
    } else {
        Err(format!("檔案不存在: {}", file_name))
    }
}
