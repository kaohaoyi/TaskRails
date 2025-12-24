use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillDefinition {
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub dependencies: Vec<String>,
    pub prompt_layer: String,
}

pub struct SkillLoader;

impl SkillLoader {
    /// Load all skills from .meta/skills directory in workspace
    pub fn load_skills(workspace_root: &str) -> Vec<SkillDefinition> {
        let skills_dir = PathBuf::from(workspace_root).join(".meta").join("skills");
        let mut skills = Vec::new();

        if let Ok(entries) = fs::read_dir(skills_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("json") {
                    if let Ok(content) = fs::read_to_string(&path) {
                        if let Ok(skill) = serde_json::from_str::<SkillDefinition>(&content) {
                            skills.push(skill);
                        }
                    }
                }
            }
        }
        skills
    }

    /// Resolve skills by name (simple linear search for MVP)
    pub fn resolve_skills(workspace_root: &str, skill_names: &[String]) -> Vec<SkillDefinition> {
        let all_skills = Self::load_skills(workspace_root);
        all_skills
            .into_iter()
            .filter(|s| skill_names.contains(&s.name))
            .collect()
    }
}
