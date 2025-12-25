# **TaskRails 配置規格書**

此文件定義 v2.6 所有設定檔的 JSON Schema 與預設值。

## **1\. 專案配置 (Project Config)**

路徑: .taskrails/config/{ProjectName}.json  
來源: 檔名取自 package.json 的 name 欄位或根目錄名稱。  
{  
 "project_name": "TaskRails-Core",  
 "version": "1.0.0",  
 "settings": {  
 "min_taskrails_version": "1.0.0", // 防版本碎片化  
 "allow_tag_overflow": false,  
 "vacuum_threshold_mb": 500,  
 "enable_sse": false,  
 "sse_port": 3001  
 },  
 "active_roles": \[  
 "role_rust_core",  
 "role_react_frontend"  
 \]  
}

## **2\. 本地環境快取 (Local Env)**

路徑: .taskrails/config/local_env.json  
注意: 必須加入 .gitignore。  
{  
 "node": { "path": "C:\\\\Node\\\\node.exe", "version": "18.16.0" },  
 "cargo": { "path": "C:\\\\Cargo\\\\bin\\\\cargo.exe", "version": "1.70.0" },  
 "docker": { "available": true, "mode": "native" },  
 "satellite": {  
 "token": "tr_sat_7f8a9b2c3d...", // 隨機生成的認證 Token  
 "port": 34567 // WebSocket 隨機端口  
 }  
}

## **3\. 標準標籤定義 (Standard Tags)**

**路徑**: .taskrails/config/tags.json

{  
 "version": "1.0",  
 "categories": \[  
 {  
 "name": "分層",  
 "values": \["frontend", "backend", "firmware", "database", "ui"\]  
 },  
 {  
 "name": "功能",  
 "values": \["auth", "payment", "notification", "search"\]  
 }  
 \],  
 "aliases": {  
 "web-client": "frontend",  
 "server-side": "backend",  
 "repo": "database"  
 }  
}

## **4\. 模組身分證 (Module Manifest)**

**路徑**: {ModuleRoot}/.meta/manifest.json

{  
 "module_id": "mod_auth_service",  
 "path": "./src/features/auth",  
 "manual_description": "核心安全模組，需審慎審查。",  
 "domain_tags": \["backend", "auth"\],  
 "custom_tags": \["jwt", "oauth2"\],  
 "status": "stable",  
 "last_check": "2025-12-24T10:00:00Z"  
}

## **5\. 經驗日誌 Schema (SQLite)**

**路徑**: memory/experience.db

| Column       | Type     | Description                         |
| :----------- | :------- | :---------------------------------- |
| id           | INTEGER  | Primary Key                         |
| pattern_hash | TEXT     | Unique Hash                         |
| tags         | TEXT     | JSON Array \["feat:cart", "react"\] |
| solution     | TEXT     | Code Snippet                        |
| status       | TEXT     | \`'pending'                         |
| created_at   | DATETIME | Timestamp                           |
