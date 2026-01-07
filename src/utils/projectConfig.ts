// 專案配置資料結構
export interface ProjectConfig {
    // 必填項目
    projectName: string;
    projectGoal: string;
    techStack: string[];
    features: string[];
    
    // 選填項目
    dataStructure?: string;
    designSpec?: string;
    engineeringRules?: string;
    
    // 生成的內容
    generatedAgents?: GeneratedAgent[];
    generatedDiagrams?: GeneratedDiagram[];
    generatedTasks?: GeneratedTask[];
}

export interface GeneratedAgent {
    id: string;
    name: string;
    role: string;
    skills: string[];
    systemPrompt: string;
}

export interface GeneratedDiagram {
    id: string;
    name: string;
    type: 'flowchart' | 'sequence' | 'class' | 'er' | 'state' | 'gantt';
    code: string;
}

export interface GeneratedTask {
    id: string;
    title: string;
    description: string;
    phase: string;
    priority: string;
    status: 'todo' | 'doing' | 'done';
}

// 完整性檢查結果
export interface CompletenessCheck {
    isComplete: boolean;
    progress: number; // 0-100
    items: {
        name: string;
        required: boolean;
        completed: boolean;
        value?: string;
    }[];
    missingRequired: string[];
}

// 輔助函數：檢查團隊是否完整 (必須有 PM 和架構師)
function checkTeamComplete(agents?: GeneratedAgent[]): boolean {
    if (!agents || agents.length < 2) return false;
    
    const roles = agents.map(a => a.role.toLowerCase() + ' ' + a.name.toLowerCase());
    const hasPM = roles.some(r => 
        r.includes('pm') || r.includes('project manager') || r.includes('專案經理') || r.includes('經理')
    );
    const hasArchitect = roles.some(r => 
        r.includes('architect') || r.includes('架構師') || r.includes('架構') || r.includes('planner') || r.includes('規劃')
    );
    
    return hasPM && hasArchitect;
}

// 輔助函數：取得團隊狀態描述
function getTeamStatusValue(agents?: GeneratedAgent[]): string {
    if (!agents || agents.length === 0) return '未召集';
    
    const roles = agents.map(a => a.role.toLowerCase() + ' ' + a.name.toLowerCase());
    const hasPM = roles.some(r => 
        r.includes('pm') || r.includes('project manager') || r.includes('專案經理') || r.includes('經理')
    );
    const hasArchitect = roles.some(r => 
        r.includes('architect') || r.includes('架構師') || r.includes('架構') || r.includes('planner') || r.includes('規劃')
    );
    
    const missing: string[] = [];
    if (!hasPM) missing.push('PM');
    if (!hasArchitect) missing.push('架構師');
    
    if (missing.length > 0) {
        return `${agents.length} 位專家 (缺少: ${missing.join(', ')})`;
    }
    return `${agents.length} 位專家 ✓`;
}

// 必要圖表類型
const REQUIRED_DIAGRAM_TYPES = ['architecture', 'pert', 'sequence', 'gantt'];

// 輔助函數：檢查圖表是否完整 (必須有 4 種類型)
function checkDiagramsComplete(diagrams?: GeneratedDiagram[]): boolean {
    if (!diagrams || diagrams.length < 4) return false;
    
    const diagramNames = diagrams.map(d => (d.name + ' ' + d.type + ' ' + d.id).toLowerCase());
    
    const hasArch = diagramNames.some(n => n.includes('arch') || n.includes('架構') || n.includes('系統'));
    const hasPert = diagramNames.some(n => n.includes('pert') || n.includes('網路'));
    const hasSequence = diagramNames.some(n => n.includes('sequence') || n.includes('時序') || n.includes('序列'));
    const hasGantt = diagramNames.some(n => n.includes('gantt') || n.includes('甘特'));
    
    return hasArch && hasPert && hasSequence && hasGantt;
}

// 輔助函數：取得圖表狀態描述
function getDiagramsStatusValue(diagrams?: GeneratedDiagram[]): string {
    if (!diagrams || diagrams.length === 0) return '未生成';
    
    const diagramNames = diagrams.map(d => (d.name + ' ' + d.type + ' ' + d.id).toLowerCase());
    
    const hasArch = diagramNames.some(n => n.includes('arch') || n.includes('架構') || n.includes('系統'));
    const hasPert = diagramNames.some(n => n.includes('pert') || n.includes('網路'));
    const hasSequence = diagramNames.some(n => n.includes('sequence') || n.includes('時序') || n.includes('序列'));
    const hasGantt = diagramNames.some(n => n.includes('gantt') || n.includes('甘特'));
    
    const missing: string[] = [];
    if (!hasArch) missing.push('架構圖');
    if (!hasPert) missing.push('PERT');
    if (!hasSequence) missing.push('序列圖');
    if (!hasGantt) missing.push('甘特圖');
    
    if (missing.length > 0) {
        return `${diagrams.length} 張 (缺少: ${missing.join(', ')})`;
    }
    return `${diagrams.length} 張圖表 ✓`;
}

// 檢查專案配置完整性
export function checkProjectCompleteness(config: ProjectConfig): CompletenessCheck {
    const items = [
        {
            name: '專案名稱',
            required: true,
            completed: !!config.projectName && config.projectName.trim().length > 0,
            value: config.projectName
        },
        {
            name: '專案目標',
            required: true,
            completed: !!config.projectGoal && config.projectGoal.trim().length >= 10,
            value: config.projectGoal?.slice(0, 30) + (config.projectGoal?.length > 30 ? '...' : '')
        },
        {
            name: '技術棧',
            required: true,
            completed: config.techStack && config.techStack.length > 0,
            value: config.techStack?.join(', ')
        },
        {
            name: '功能清單',
            required: true,
            completed: config.features && config.features.length > 0,
            value: `${config.features?.length || 0} 項功能`
        },
        {
            name: '資料結構',
            required: true,
            completed: !!config.dataStructure && config.dataStructure.trim().length > 0,
            value: config.dataStructure ? '已定義' : '未設定'
        },
        {
            name: '設計規範',
            required: true,
            completed: !!config.designSpec && config.designSpec.trim().length > 0,
            value: config.designSpec ? '已定義' : '未設定'
        },
        {
            name: '工程規則',
            required: true,
            completed: !!config.engineeringRules && config.engineeringRules.trim().length > 0,
            value: config.engineeringRules ? '已定義' : '未設定'
        },
        {
            name: '召集團隊 (PM + 架構師)',
            required: true,
            completed: checkTeamComplete(config.generatedAgents),
            value: getTeamStatusValue(config.generatedAgents)
        },
        {
            name: '工作流 (4 張圖表)',
            required: true,
            completed: checkDiagramsComplete(config.generatedDiagrams),
            value: getDiagramsStatusValue(config.generatedDiagrams)
        }
    ];

    const requiredItems = items.filter(i => i.required);
    const completedRequired = requiredItems.filter(i => i.completed);
    const missingRequired = requiredItems.filter(i => !i.completed).map(i => i.name);
    
    const progress = Math.round((completedRequired.length / requiredItems.length) * 100);
    const isComplete = missingRequired.length === 0;

    return {
        isComplete,
        progress,
        items,
        missingRequired
    };
}

// 標記語法對應表
const TAG_MAPPING: Record<string, keyof ProjectConfig> = {
    '專案名稱': 'projectName',
    '專案目標': 'projectGoal',
    '技術棧': 'techStack',
    '功能清單': 'features',
    '資料結構': 'dataStructure',
    '設計規範': 'designSpec',
    '工程規則': 'engineeringRules'
};

// 解析 AI 回應中的專案配置（使用標記語法）
// 格式：/專案名稱/*手機音訊測試* 或 /技術棧/*React*, *Node.js*, *PostgreSQL*
export function parseProjectConfigFromAI(aiResponse: string): Partial<ProjectConfig> {
    const config: Partial<ProjectConfig> = {};

    // 1. 解析標記語法：/標籤/*內容*
    // 支援格式：
    //   /專案名稱/*手機音訊測試*
    //   /技術棧/*React*, *Node.js*, *MongoDB*
    //   /功能/*錄音功能*, *播放功能*, *分享功能*
    
    for (const [chineseTag, configKey] of Object.entries(TAG_MAPPING)) {
        // 匹配 /標籤/*內容* 格式（內容可以有多個）
        const tagPattern = new RegExp(`/${chineseTag}/\\*([^*]+)\\*`, 'g');
        const matches = aiResponse.matchAll(tagPattern);
        
        for (const match of matches) {
            const value = match[1].trim();
            
            // 對於陣列類型的欄位
            if (configKey === 'techStack' || configKey === 'features') {
                // 查找同一行內的所有 *xxx* 項目
                const lineMatch = aiResponse.match(new RegExp(`/${chineseTag}/([^\n]+)`));
                if (lineMatch) {
                    const items = lineMatch[1].match(/\*([^*]+)\*/g);
                    if (items) {
                        const values = items.map(item => item.replace(/\*/g, '').trim()).filter(v => v);
                        if (configKey === 'techStack') {
                            config.techStack = values;
                        } else {
                            config.features = values;
                        }
                    }
                }
            } else {
                // 單值欄位
                (config as any)[configKey] = value;
            }
        }
    }
    
    // 2. 解析 JSON 區塊（作為備選或補充）
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[1]);
            
            // 補充或覆蓋 JSON 解析結果
            if (parsed.projectName || parsed.name) config.projectName = config.projectName || parsed.projectName || parsed.name;
            if (parsed.projectGoal || parsed.goal || parsed.overview) config.projectGoal = config.projectGoal || parsed.projectGoal || parsed.goal || parsed.overview;
            
            if (parsed.techStack?.length || parsed.tech?.length) {
                config.techStack = config.techStack?.length ? config.techStack : (parsed.techStack || parsed.tech);
            }
            if (parsed.features?.length) {
                config.features = config.features?.length ? config.features : parsed.features;
            }
            
            if (parsed.dataStructure) config.dataStructure = config.dataStructure || parsed.dataStructure;
            if (parsed.designSpec || parsed.design) config.designSpec = config.designSpec || parsed.designSpec || parsed.design;
            if (parsed.engineeringRules || parsed.rules) config.engineeringRules = config.engineeringRules || parsed.engineeringRules || parsed.rules;
            
            // 處理 Agent 解析，確保所有必填欄位都有預設值
            if (parsed.agents && Array.isArray(parsed.agents)) {
                config.generatedAgents = parsed.agents.map((a: any) => ({
                    id: a.id || `agent-${Math.random().toString(36).substr(2, 5)}`,
                    name: a.name || '新成員',
                    role: a.role || '專家顧問',
                    skills: Array.isArray(a.skills) ? a.skills : [],
                    systemPrompt: a.systemPrompt || `你是 ${a.name || '專家顧問'}，專精於 ${a.role || '目前專案需求'}。`
                }));
            }
            
            if (parsed.diagrams) config.generatedDiagrams = parsed.diagrams;
            if (parsed.tasks) config.generatedTasks = parsed.tasks;
        } catch (e) {
            console.error('Failed to parse AI JSON response:', e);
        }
    }

    // 3. 簡單文字解析備案（優化正則以支援不同格式）
    if (!config.projectName) {
        // 匹配 專案名稱、專案、名稱、Project Name、Project
        const nameMatch = aiResponse.match(/(?:專案名稱|專案|名稱|Project Name|Project)[：:]\s*([^\n#/*]+)/i);
        if (nameMatch) config.projectName = nameMatch[1].trim();
    }

    if (!config.projectGoal) {
        // 匹配 專案目標、目標、專案核心、Project Goal、Goal
        const goalMatch = aiResponse.match(/(?:專案目標|目標|專案核心|Project Goal|Goal)[：:]\s*([^\n#/*]+)/i);
        if (goalMatch) config.projectGoal = goalMatch[1].trim();
    }

    return config;
}

// 語言選項 (擴展支援更多語言)
export type Language = 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP' | 'es-ES' | 'fr-FR' | 'de-DE';

// Re-export from centralized AI prompts module for backward compatibility
export { getProjectSetupSystemPrompt } from './ai-prompts';

// 預設配置
export function getDefaultProjectConfig(): ProjectConfig {
    return {
        projectName: '',
        projectGoal: '',
        techStack: [],
        features: [],
        dataStructure: '',
        designSpec: '',
        engineeringRules: '',
        generatedAgents: [],
        generatedDiagrams: [],
        generatedTasks: []
    };
}
