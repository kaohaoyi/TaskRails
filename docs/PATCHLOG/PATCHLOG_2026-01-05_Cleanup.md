# PATCHLOG - 2026-01-05 - Docs Cleanup

## Goal

Organize `docs/` folder, consolidate documentation to the latest version, and delete unnecessary files.

## Root Cause / Rationale

The documentation folder has accumulated many temporary task-specific files and multiple versions of system documentation, leading to confusion about which is the source of truth.

## Execution TodoList

- [x] Create `SYSTEM_SPEC.md` from `TaskRails_V1.1_Documentation.md`.
- [x] Merge `ARCHITECTURE.md` details into `SYSTEM_SPEC.md`.
- [x] Create `USER_GUIDE.md` from `MANUAL.md` and `USER_GUIDE_PROJECT_SETUP.md`.
- [x] Delete outdated files: `ARCHITECTURE.md`, `MANUAL.md`, `ARCH_UPGRADE_TASK_v1.0.md`, `CURRENT_TASKS.md`, `INTEGRATION_TEST_RESULTS.md`, `INTEGRATION_TEST_SCENARIO.md`, `GIT_WORKFLOW_GUIDE.md`.
- [x] Delete outdated directories: `engineering_phase_v1`, `spec_ai_v2`, `spec_system_v1`, `TaskRails`, `TaskRails_UI_Foundation`.
- [x] Update `README.md` links.

## Anti-Degradation Proof

- All useful technical and user-facing information is preserved in `SYSTEM_SPEC.md` and `USER_GUIDE.md`.
- Only completed/outdated task logs and old test results are deleted.
