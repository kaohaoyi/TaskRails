use regex::Regex;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub enum EnvironmentType {
    Native,
    Container,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LintError {
    pub file: String,
    pub line: usize,
    pub message: String,
    pub severity: String, // error, warning
}

pub struct Sentinel;

impl Sentinel {
    /// Check if running inside a container
    pub fn check_environment() -> EnvironmentType {
        if Path::new("/.dockerenv").exists() {
            return EnvironmentType::Container;
        }
        // Fallback check for cgroup (more robust linux check)
        if let Ok(content) = std::fs::read_to_string("/proc/1/cgroup") {
            if content.contains("docker") || content.contains("kubepods") {
                return EnvironmentType::Container;
            }
        }
        EnvironmentType::Native
    }

    /// Parse typical linter output (e.g., eslint, pylint, cargo check)
    /// This is a simplified regex-based parser
    pub fn parse_linter_output(output: &str, format: &str) -> Vec<LintError> {
        let mut errors = Vec::new();

        // Example: "src/main.rs:10:5: error: something wrong"
        // TypeScript: "src/App.tsx(10,5): error TS2304: Cannot find name..."
        let re_str = match format {
            "rust" => r"^(.+):(\d+):(\d+):\s+(error|warning):\s+(.+)$",
            "typescript" => r"^(.+)\((\d+),(\d+)\):\s+(error|warning)\s+\w+:\s+(.+)$",
            "python" => r"^(.+):(\d+):\s+(.+)$", // Simplified pylint
            _ => return errors,
        };

        if let Ok(re) = Regex::new(re_str) {
            for line in output.lines() {
                if let Some(caps) = re.captures(line) {
                    let file = caps.get(1).map_or("", |m| m.as_str()).to_string();
                    let line_num: usize =
                        caps.get(2).map_or("0", |m| m.as_str()).parse().unwrap_or(0);
                    let severity = if format == "python" {
                        "warning".to_string()
                    } else {
                        caps.get(4).map_or("error", |m| m.as_str()).to_string()
                    };
                    let message = if format == "python" {
                        caps.get(3)
                    } else {
                        caps.get(5)
                    }
                    .map_or("", |m| m.as_str())
                    .to_string();

                    errors.push(LintError {
                        file,
                        line: line_num,
                        severity,
                        message,
                    });
                }
            }
        }

        errors
    }
}
