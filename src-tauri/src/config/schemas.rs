#![allow(dead_code)]
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ================================================================
// 1. Project Config (.taskrails/config/{ProjectName}.json)
// ================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectConfig {
    pub project_name: String,
    pub version: String,
    pub settings: ProjectSettings,
    pub active_roles: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectSettings {
    pub min_taskrails_version: String,
    pub allow_tag_overflow: bool,
    pub vacuum_threshold_mb: u32,
    pub enable_sse: bool,
    pub sse_port: u16,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            project_name: "MyTaskRailsProject".to_string(),
            version: "0.1.0".to_string(),
            settings: ProjectSettings {
                min_taskrails_version: "1.0.0".to_string(),
                allow_tag_overflow: false,
                vacuum_threshold_mb: 500,
                enable_sse: false,
                sse_port: 3001,
            },
            active_roles: vec![
                "role_rust_core".to_string(),
                "role_react_frontend".to_string(),
            ],
        }
    }
}

// ================================================================
// 2. Local Env Cache (.taskrails/config/local_env.json)
// ================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LocalEnv {
    #[serde(default)]
    pub node: NodeEnv,
    #[serde(default)]
    pub cargo: CargoEnv,
    #[serde(default)]
    pub docker: DockerEnv,
    pub satellite: SatelliteEnv,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct NodeEnv {
    pub path: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CargoEnv {
    pub path: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct DockerEnv {
    pub available: bool,
    pub mode: String, // "native", "wsl", "none"
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct SatelliteEnv {
    pub token: String,
    pub port: u16,
}

// ================================================================
// 3. Standard Tags (.taskrails/config/tags.json)
// ================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TagsConfig {
    pub version: String,
    pub categories: Vec<TagCategory>,
    pub aliases: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TagCategory {
    pub name: String,
    pub values: Vec<String>,
}

// ================================================================
// 4. Module Manifest ({ModuleRoot}/.meta/manifest.json)
// ================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModuleManifest {
    pub module_id: String,
    pub path: String,
    #[serde(default)]
    pub manual_description: String,
    pub domain_tags: Vec<String>,
    #[serde(default)]
    pub custom_tags: Vec<String>,
    pub status: String,
    pub last_check: String,
}
