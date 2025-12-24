use git2::{Repository, StatusOptions};
// use std::path::{Path, PathBuf};

#[derive(serde::Serialize, Clone)]
pub struct GitStatus {
    pub clean: bool,
    pub modified_files: Vec<String>,
    pub current_branch: String,
}

/// Initialize and check repository status
pub fn check_status(repo_path: &str) -> Result<GitStatus, String> {
    let repo =
        Repository::open(repo_path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let head = repo
        .head()
        .map_err(|_| "Detached HEAD or empty repo".to_string())?;
    let branch = head.shorthand().unwrap_or("HEAD").to_string();

    let mut opts = StatusOptions::new();
    opts.include_untracked(true);

    let statuses = repo
        .statuses(Some(&mut opts))
        .map_err(|e| format!("Failed to get statuses: {}", e))?;

    let mut modified_files = Vec::new();
    for entry in statuses.iter() {
        if let Some(path) = entry.path() {
            modified_files.push(path.to_string());
        }
    }

    Ok(GitStatus {
        clean: modified_files.is_empty(),
        modified_files,
        current_branch: branch,
    })
}

/// Perform a HARD RESET to HEAD
/// Used by Airlock protocol to discard unapproved changes
pub fn hard_reset(repo_path: &str) -> Result<(), String> {
    let repo =
        Repository::open(repo_path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let head = repo
        .head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;

    let object = head
        .peel(git2::ObjectType::Commit)
        .map_err(|e| format!("Failed to peel HEAD: {}", e))?;

    repo.reset(&object, git2::ResetType::Hard, None)
        .map_err(|e| format!("Failed to hard reset: {}", e))?;

    println!("[GitOps] Hard reset executed successfully.");
    Ok(())
}

/// Fetch remote to check connectivity (Auth Pre-flight)
pub fn preflight_fetch(repo_path: &str) -> Result<(), String> {
    let repo = Repository::open(repo_path).map_err(|e| format!("Failed to open repo: {}", e))?;

    // Look up "origin" remote
    let mut remote = repo
        .find_remote("origin")
        .map_err(|e| format!("Remote 'origin' not found: {}", e))?;

    // Dry-run fetch is tricky with git2 directly without callbacks for auth.
    // For MVP, we might try a simple connect or assume if we can open repo it's a start.
    // Proper SSH auth requires Credential callbacks which are verbose.
    // We will stub this for now, implementing a basic connection check later.
    remote
        .connect(git2::Direction::Fetch)
        .map_err(|e| format!("Failed to connect to remote: {}", e))?;

    println!("[GitOps] Pre-flight fetch connection successful.");
    Ok(())
}
