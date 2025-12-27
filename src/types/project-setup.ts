import { ProjectConfig } from '../utils/projectConfig';

export interface Message {
    role: 'assistant' | 'user' | 'system';
    content: string;
}

export interface SavedProject {
    name: string;
    path: string;           // localStorage ID
    workspacePath: string;  // 實際資料夾路徑
    lastModified: number;
}

export interface CompletenessCheck {
    isComplete: boolean;
    progress: number;
    items: string[];
    missingRequired: string[];
}
