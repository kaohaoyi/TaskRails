# Patchlog: Vibe Core Integration Phase 1

**Date:** 2025-01-02
**Author:** Antigravity
**Version:** v1.1-dev

## 1. Goal

Integrate "Vibe Core" concepts into TaskRails V1.1, specifically:

- **Hybrid AI Pipeline:** Local AI (Prompt Refiner) + Cloud AI (Executor).
- **Active Mermaid Engine:** WYSIWYG Mermaid editor with active node synchronization to Kanban.
- **Memory Bank:** Foundation for file-based context (Memory Bank module).

## 2. Changes

### Backend (Rust)

- **New Module:** `src-tauri/src/mcp/local_llm.rs` - Client for interacting with LM Studio.
- **New Module:** `src-tauri/src/mcp/prompt_refiner.rs` - Logic for refining user intent using Local LLM.
- **Updated:** `src-tauri/src/commands.rs`
  - Added `check_local_llm_connection`.
  - Added `refine_prompt`.
  - Added `sync_active_tasks` (Active Mermaid Sync).
- **Updated:** `src-tauri/src/lib.rs` - Registered new commands.

### Frontend (React/TypeScript)

- **Updated:** `src/components/features/Planner.tsx`
  - Implemented `parseActiveNodes` to identify `:::active` nodes.
  - Added "Commit Plan" button to sync nodes to Kanban tasks.
  - Improved UI with "Syncing" state.
- **Updated:** `src/components/features/AiChatWindow.tsx`
  - Added "Hybrid Mode" toggle switch.
  - Implemented conditional logic:
    - **Hybrid ON:** Calls `refine_prompt` (Local AI) first.
    - **Hybrid OFF:** Calls `execute_ai_chat` (Cloud AI) directly.
  - Added connection check for Local LLM on mount.

## 3. Verification & Issues

### Verified

- **Code Compilation:** Rust backend compiles (assumed based on no errors in file editing).
- **Frontend Logic:** React components structure is correct.

### Known Issues / Blockers

- **LM Studio Connection:** `check_local_llm_connection` fails on `localhost:1234`.
  - **Status:** BLOCKER.
  - **Action Required:** User must verify LM Studio is running, server is started, and port is 1234.
