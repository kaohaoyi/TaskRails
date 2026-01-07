# ALIGNMENT - Docs Organization and Consolidation

## 1. Goal

- Clean up the `docs/` folder.
- Consolidate functional documentation into the latest version.
- Remove outdated/temporary task files.

## 2. Scope

### Core Documentation (Keep & Organize)

- `TaskRails_V1.1_Documentation.md` -> Rename to `SYSTEM_SPEC.md` (The "Latest Version")
- `MANUAL.md` -> Keep as User Manual.
- `ARCHITECTURE.md` -> Merge relevant parts into `SYSTEM_SPEC.md` or keep as technical deep dive.
- `USER_GUIDE_PROJECT_SETUP.md` -> Good for onboarding, keep.
- `DEVELOPMENT_AGENT_GUIDE.md` -> Relevant for AI-agent workflow, keep.
- `MCP_CONFIG_GUIDE.json` -> Keep.
- `VIBE_CORE_*` -> Keep (Diagrams).
- `TASK_MD_RULES.md` -> Keep (Reference for task formatting).

### Directories/Files to Delete (Outdated/Task-Specific)

- `ARCH_UPGRADE_TASK_v1.0.md` (Older version)
- `CURRENT_TASKS.md` (Completed)
- `INTEGRATION_TEST_RESULTS.md` (Old results)
- `INTEGRATION_TEST_SCENARIO.md` (Old scenario)
- `GIT_WORKFLOW_GUIDE.md` (Basic git info, maybe redundant)
- `engineering_phase_v1/`
- `spec_ai_v2/`
- `spec_system_v1/`
- `TaskRails/`
- `TaskRails_UI_Foundation/`

### Operational Folders (Keep)

- `PATCHLOG/`
- `STATUS/`

## 3. Action Plan

1. Create `docs/SYSTEM_SPEC.md` based on `TaskRails_V1.1_Documentation.md`.
2. Ensure `SYSTEM_SPEC.md` contains the technical stack, core modules, and API reference.
3. Organize remaining useful files into `docs/core/`, `docs/user/`, etc. (Or just keep them at root if preferred, but user wants "organized").
4. Delete the identified outdated files/folders.

## 4. Non-Goals

- Modifying actual source code.
- Changing the `.taskrails` configuration.
