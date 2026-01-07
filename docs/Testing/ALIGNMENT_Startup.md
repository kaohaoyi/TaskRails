# ALIGNMENT - Startup Procedure Testing

## Goal

Verify that the application's development environment is correctly configured and can start without errors.

## Scope

- Check Rust environment (cargo).
- Check Node.js environment (npm).
- Verify frontend build (vite).
- Verify backend build (tauri/cargo).

## Plan

1. Run `cargo check` in `src-tauri`.
2. Run `npm install` (if items missing, but they seem to be there).
3. Attempt `npm run tauri dev` and monitor for immediate failures.
