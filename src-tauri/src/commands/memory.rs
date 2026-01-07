#[tauri::command]
pub fn get_memory_list(workspace: String) -> Result<Vec<String>, String> {
    crate::memory_bank::list_memories(&workspace)
}

#[tauri::command]
pub fn get_memory(
    workspace: String,
    name: String,
) -> Result<crate::memory_bank::MemoryEntry, String> {
    crate::memory_bank::read_memory(&workspace, &name)
}

#[tauri::command]
pub fn update_memory(workspace: String, name: String, content: String) -> Result<(), String> {
    crate::memory_bank::write_memory(&workspace, &name, &content)
}
#[tauri::command]
pub fn delete_memory(workspace: String, name: String) -> Result<(), String> {
    crate::memory_bank::delete_memory(&workspace, &name)
}
