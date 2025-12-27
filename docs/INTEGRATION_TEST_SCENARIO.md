# TaskRails Vibe Core - Integration Test Scenario

## Objective

Verify the end-to-end workflow of Vibe Core: **Setup -> Memory Bank -> Hybrid AI Refinement -> Active Mermaid Planning -> Kanban Execution**.

## Steps

### 1. Project Setup (Memory Bank Generation)

1.  Open **Project Setup Hub**.
2.  Create a "Demo Project".
3.  Fill in simple details:
    - **Goal:** Build a Todo App.
    - **Tech Stack:** React, Tailwind.
4.  Click **"Deploy Project"**.
5.  **Verify:** Check **Memory Bank Viewer**. Do `@specs.md` and `@tech-stack.md` exist?

### 2. Hybrid AI Refinement (Context Injection)

1.  Open **Chat Window**.
2.  Enable **Hybrid Mode** (Toggle ON).
3.  Type a fuzzy intent: _"I need a component for the todo list."_
4.  **Verify:**
    - Does Local LLM respond (via Refiner)?
    - Does the response reference the "Todo App" context (e.g. mention React/Tailwind)?
    - Does it output a structured `<final_prompt>`?

### 3. Active Mermaid Planning (Visual Architecture)

1.  Open **Planner**.
2.  Paste the following Vibe Code:
    ```mermaid
    graph TD
      A["User Input"] --> B["AddTodo Component"]:::active
      B --> C["TodoList Component"]:::active
      C --> D["Storage Service"]
    ```
3.  Click **"Commit Plan to Agents"**.

### 4. Execution (Kanban Sync)

1.  Open **Kanban Board**.
2.  **Verify:** Are tasks "AddTodo Component" and "TodoList Component" present in the **Todo** column?
