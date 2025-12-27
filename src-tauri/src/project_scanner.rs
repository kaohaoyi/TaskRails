use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

/// 專案結構掃描結果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectScanResult {
    pub total_files: usize,
    pub total_lines: usize,
    pub file_tree: Vec<FileNode>,
    pub tech_stack: Vec<String>,
    pub entry_points: Vec<String>,
    pub key_files: Vec<KeyFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileNode {
    pub path: String,
    pub name: String,
    pub is_dir: bool,
    pub extension: Option<String>,
    pub size: u64,
    pub children: Vec<FileNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyFile {
    pub path: String,
    pub file_type: String,
    pub summary: String,
    pub line_count: usize,
}

/// 掃描專案目錄結構
pub fn scan_project(workspace_path: &str) -> Result<ProjectScanResult, String> {
    let path = Path::new(workspace_path);
    if !path.exists() {
        return Err("工作區路徑不存在".to_string());
    }

    let mut total_files = 0;
    let mut total_lines = 0;
    let mut tech_stack = Vec::new();
    let mut entry_points = Vec::new();
    let mut key_files = Vec::new();

    // 忽略的目錄
    let ignore_dirs = vec![
        "node_modules",
        "target",
        "dist",
        "build",
        ".git",
        "__pycache__",
        ".next",
        ".nuxt",
        "vendor",
        ".taskrails",
        ".vscode",
        ".idea",
    ];

    // 關鍵檔案類型
    let key_extensions = vec![
        "rs", "ts", "tsx", "js", "jsx", "py", "go", "java", "cpp", "c", "h",
    ];

    // 偵測技術棧的檔案
    let tech_indicators: Vec<(&str, &str)> = vec![
        ("package.json", "Node.js/JavaScript"),
        ("Cargo.toml", "Rust"),
        ("requirements.txt", "Python"),
        ("pyproject.toml", "Python"),
        ("go.mod", "Go"),
        ("pom.xml", "Java/Maven"),
        ("build.gradle", "Java/Gradle"),
        ("Gemfile", "Ruby"),
        ("composer.json", "PHP"),
        ("CMakeLists.txt", "C/C++"),
        ("tsconfig.json", "TypeScript"),
        ("vite.config.ts", "Vite"),
        ("next.config.js", "Next.js"),
        ("tauri.conf.json", "Tauri"),
    ];

    // 入口點檔案
    let entry_indicators = vec![
        "main.rs",
        "main.py",
        "main.go",
        "main.ts",
        "main.tsx",
        "index.ts",
        "index.tsx",
        "index.js",
        "App.tsx",
        "App.ts",
        "lib.rs",
        "mod.rs",
    ];

    for entry in WalkDir::new(path)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !ignore_dirs.iter().any(|d| name == *d)
        })
        .filter_map(|e| e.ok())
    {
        let entry_path = entry.path();
        let relative_path = entry_path.strip_prefix(path).unwrap_or(entry_path);
        let file_name = entry_path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        if entry_path.is_file() {
            total_files += 1;

            // 偵測技術棧
            for (indicator, tech) in &tech_indicators {
                if file_name == *indicator && !tech_stack.contains(&tech.to_string()) {
                    tech_stack.push(tech.to_string());
                }
            }

            // 偵測入口點
            if entry_indicators.contains(&file_name.as_str()) {
                entry_points.push(relative_path.to_string_lossy().to_string());
            }

            // 統計關鍵檔案
            if let Some(ext) = entry_path.extension() {
                let ext_str = ext.to_string_lossy().to_string();
                if key_extensions.contains(&ext_str.as_str()) {
                    if let Ok(content) = fs::read_to_string(entry_path) {
                        let line_count = content.lines().count();
                        total_lines += line_count;

                        // 只記錄重要檔案（超過 20 行）
                        if line_count > 20 {
                            let summary = extract_file_summary(&content, &ext_str);
                            key_files.push(KeyFile {
                                path: relative_path.to_string_lossy().to_string(),
                                file_type: ext_str.clone(),
                                summary,
                                line_count,
                            });
                        }
                    }
                }
            }
        }
    }

    // 建立檔案樹（只到第二層）
    let file_tree = build_file_tree(path, 2, &ignore_dirs);

    Ok(ProjectScanResult {
        total_files,
        total_lines,
        file_tree,
        tech_stack,
        entry_points,
        key_files,
    })
}

/// 從檔案內容提取摘要
fn extract_file_summary(content: &str, ext: &str) -> String {
    let lines: Vec<&str> = content.lines().collect();

    // 嘗試提取模組/函數定義
    let mut summary_parts = Vec::new();

    match ext {
        "rs" => {
            // Rust: 提取 pub fn, pub struct, pub enum
            for line in &lines {
                if line.trim().starts_with("pub fn ")
                    || line.trim().starts_with("pub struct ")
                    || line.trim().starts_with("pub enum ")
                    || line.trim().starts_with("pub mod ")
                {
                    let clean = line.trim().split('{').next().unwrap_or(line).trim();
                    if clean.len() < 100 {
                        summary_parts.push(clean.to_string());
                    }
                }
                if summary_parts.len() >= 5 {
                    break;
                }
            }
        }
        "ts" | "tsx" | "js" | "jsx" => {
            // TypeScript/JavaScript: 提取 export, function, class
            for line in &lines {
                let trimmed = line.trim();
                if trimmed.starts_with("export ")
                    || trimmed.starts_with("function ")
                    || trimmed.starts_with("class ")
                    || trimmed.starts_with("interface ")
                    || trimmed.starts_with("const ") && trimmed.contains("=")
                {
                    let clean = trimmed.split('{').next().unwrap_or(trimmed).trim();
                    if clean.len() < 100 && !summary_parts.contains(&clean.to_string()) {
                        summary_parts.push(clean.to_string());
                    }
                }
                if summary_parts.len() >= 5 {
                    break;
                }
            }
        }
        "py" => {
            // Python: 提取 def, class
            for line in &lines {
                let trimmed = line.trim();
                if trimmed.starts_with("def ") || trimmed.starts_with("class ") {
                    let clean = trimmed.split(':').next().unwrap_or(trimmed).trim();
                    if clean.len() < 100 {
                        summary_parts.push(clean.to_string());
                    }
                }
                if summary_parts.len() >= 5 {
                    break;
                }
            }
        }
        _ => {}
    }

    if summary_parts.is_empty() {
        // 取前幾行非空行作為摘要
        lines
            .iter()
            .filter(|l| {
                !l.trim().is_empty() && !l.trim().starts_with("//") && !l.trim().starts_with("#")
            })
            .take(3)
            .map(|l| l.trim())
            .collect::<Vec<_>>()
            .join(" | ")
    } else {
        summary_parts.join("; ")
    }
}

/// 建立檔案樹
fn build_file_tree(path: &Path, max_depth: usize, ignore_dirs: &[&str]) -> Vec<FileNode> {
    let mut nodes = Vec::new();

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.filter_map(|e| e.ok()) {
            let entry_path = entry.path();
            let name = entry_path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();

            // 忽略隱藏檔案和指定目錄
            if name.starts_with('.') || ignore_dirs.contains(&name.as_str()) {
                continue;
            }

            let is_dir = entry_path.is_dir();
            let extension = if is_dir {
                None
            } else {
                entry_path
                    .extension()
                    .map(|e| e.to_string_lossy().to_string())
            };

            let size = if is_dir {
                0
            } else {
                fs::metadata(&entry_path).map(|m| m.len()).unwrap_or(0)
            };

            let children = if is_dir && max_depth > 1 {
                build_file_tree(&entry_path, max_depth - 1, ignore_dirs)
            } else {
                Vec::new()
            };

            nodes.push(FileNode {
                path: entry_path.to_string_lossy().to_string(),
                name,
                is_dir,
                extension,
                size,
                children,
            });
        }
    }

    // 排序：目錄優先，然後按名稱
    nodes.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    nodes
}

/// 生成 AI 提示詞用的專案上下文
pub fn generate_project_context_for_ai(scan_result: &ProjectScanResult) -> String {
    let mut context = String::new();

    context.push_str("# 專案分析報告\n\n");

    context.push_str(&format!("## 統計資訊\n"));
    context.push_str(&format!("- 總檔案數: {}\n", scan_result.total_files));
    context.push_str(&format!("- 總程式碼行數: {}\n", scan_result.total_lines));
    context.push_str("\n");

    context.push_str("## 技術棧\n");
    for tech in &scan_result.tech_stack {
        context.push_str(&format!("- {}\n", tech));
    }
    context.push_str("\n");

    context.push_str("## 入口點\n");
    for entry in &scan_result.entry_points {
        context.push_str(&format!("- {}\n", entry));
    }
    context.push_str("\n");

    context.push_str("## 關鍵檔案\n");
    for file in scan_result.key_files.iter().take(20) {
        context.push_str(&format!("### {}\n", file.path));
        context.push_str(&format!("- 類型: {}\n", file.file_type));
        context.push_str(&format!("- 行數: {}\n", file.line_count));
        context.push_str(&format!("- 摘要: {}\n\n", file.summary));
    }

    context
}
