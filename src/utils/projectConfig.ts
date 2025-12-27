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
    type: 'flowchart' | 'sequence' | 'class' | 'er' | 'state';
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
            // 合併 JSON 解析結果（不覆蓋標記語法的結果）
            return {
                projectName: config.projectName || parsed.projectName || parsed.name,
                projectGoal: config.projectGoal || parsed.projectGoal || parsed.goal || parsed.overview,
                techStack: config.techStack?.length ? config.techStack : (parsed.techStack || parsed.tech || []),
                features: config.features?.length ? config.features : (parsed.features || []),
                dataStructure: config.dataStructure || parsed.dataStructure,
                designSpec: config.designSpec || parsed.designSpec || parsed.design,
                engineeringRules: config.engineeringRules || parsed.engineeringRules || parsed.rules,
                generatedAgents: parsed.agents,
                generatedDiagrams: parsed.diagrams,
                generatedTasks: parsed.tasks
            };
        } catch (e) {
            console.error('Failed to parse AI JSON response:', e);
        }
    }

    // 3. 簡單文字解析備案（舊格式兼容）
    if (!config.projectName) {
        const nameMatch = aiResponse.match(/專案名稱[：:]\s*(.+)/);
        if (nameMatch) config.projectName = nameMatch[1].trim();
    }

    if (!config.projectGoal) {
        const goalMatch = aiResponse.match(/專案目標[：:]\s*(.+)/);
        if (goalMatch) config.projectGoal = goalMatch[1].trim();
    }

    return config;
}

// 語言選項
export type Language = 'zh-TW' | 'en-US' | 'ja-JP';

// 生成專案設定 System Prompt (VIBE CODING 風格)
// 生成專案設定 System Prompt (VIBE CODING 風格)
export function getProjectSetupSystemPrompt(language: Language = 'zh-TW'): string {
    const isChinese = language === 'zh-TW';
    
    // 語言指示
    const languageInstruction = language === 'en-US' 
        ? "Language: English (US). Communication must be in English unless clarifying specific user terms."
        : language === 'ja-JP'
            ? "Language: Japanese (Business Standard). Use polite and professional Japanese."
            : "語言：繁體中文（台灣）。請使用台灣在地化術語。";

    const mermaidRules = isChinese 
        ? `## 🎨 Mermaid 圖表規則（極重要 - 必須遵守）

**核心規則：所有包含中文的標籤都必須用雙引號包裹！**

1. **節點標籤（最重要）**：中文標籤必須用雙引號
   - ❌ 錯誤：\`A[麥克風輸入]\`
   - ❌ 錯誤：\`B[數位訊號處理 (DSP)]\`
   - ✅ 正確：\`A["麥克風輸入"]\`
   - ✅ 正確：\`B["數位訊號處理"]\`

2. **subgraph 名稱**：必須用雙引號
   - ❌ 錯誤：\`subgraph 用戶端\`
   - ✅ 正確：\`subgraph "用戶端"\`

3. **連接標籤**：中文說明必須用雙引號
   - ❌ 錯誤：\`A -->|發送資料| B\`
   - ✅ 正確：\`A -->|"發送資料"| B\`

4. **避免括號**：不要在標籤中使用英文括號，改用中文描述
   - ❌ 錯誤：\`A["DSP (FFT)"]\`
   - ✅ 正確：\`A["數位訊號處理模組"]\`

### Mermaid 範例（正確格式）
\\\`\\\`\\\`mermaid
graph TD
    subgraph "用戶端"
        A["手機應用"]
        B["網頁應用"]
    end
    subgraph "後端服務"
        C["API 伺服器"]
        D["資料庫"]
    end
    A -->|"API 請求"| C
    B -->|"API 請求"| C
    C -->|"讀寫"| D
\\\`\\\`\\\``
        : `## 🎨 Mermaid Diagram Rules (CRITICAL - MUST FOLLOW)

**Core Rule: ALL node labels MUST be wrapped in double quotes!**

1. **Node Labels (Most Important)**: ALL labels MUST use double quotes
   - ❌ Wrong: \`A[Mobile App]\`
   - ❌ Wrong: \`B[DSP (FFT/dB)]\`
   - ✅ Correct: \`A["Mobile App"]\`
   - ✅ Correct: \`B["DSP Module"]\`

2. **Subgraph Names**: MUST use double quotes
   - ❌ Wrong: \`subgraph Client Side\`
   - ✅ Correct: \`subgraph "Client Side"\`

3. **Link Labels**: MUST use double quotes
   - ❌ Wrong: \`A -->|Send Data| B\`
   - ✅ Correct: \`A -->|"Send Data"| B\`

4. **Avoid Parentheses**: Do NOT use parentheses inside labels
   - ❌ Wrong: \`A["DSP (FFT)"]\`
   - ✅ Correct: \`A["DSP Module"]\`

### Mermaid Example (Correct Format)
\\\`\\\`\\\`mermaid
graph TD
    subgraph "Client Side"
        A["Mobile App"]
        B["Web App"]
    end
    subgraph "Backend Services"
        C["API Server"]
        D["Database"]
    end
    A -->|"API Request"| C
    B -->|"API Request"| C
    C -->|"Read Write"| D
\\\`\\\`\\\``;

    return `<identity>
${languageInstruction}
You are TaskRails' **Project Setup Architect**, a fusion of "AI System Architect + Product Planner + Cognitive Science Mentor".

**Target Audience**: Idea-to-Product creators, indie developers, technical teams.
**Work Mode**: Deep Thinking enabled for systematic requirements analysis and planning.
**Goal**: Transform vague ideas into complete project plans, enabling AI adoption and development.
</identity>

<core_mission>
Your task is to facilitate the "Idea -> Structure -> Solution -> Action" cognitive transformation:
1.  **Requirement Understanding**: Identify explicit needs, implicit needs, and underlying intent.
2.  **Structured Design**: Convert ideas into executable project configurations.
3.  **Asset Generation**: Generate usable Agents, Diagrams, and Task Lists.
</core_mission>

<input_parsing>
When a user describes "what I want to do", analyze it on three levels:
1.  **Intent Recognition**: Explicit needs (features), Implicit needs (tech challenges), Underlying intent (learning/commercial).
2.  **Keyword Extraction**: Core feature keywords, suitable tech stack, relevant open-source tools.
</input_parsing>

<output_protocol>
### ⭐ Mark Syntax (MANDATORY)
You **MUST** use the following specific tags to record confirmed configuration items. The system parses these automatically.
**IMPORTANT**: The tag names (e.g., /專案名稱/) MUST be in Chinese exactly as shown, regardless of your output language.

| Mark Syntax | Description | Example |
|---|---|---|
| /專案名稱/*xxx* | Project Name | /專案名稱/*SmartRecorder* |
| /專案目標/*xxx* | Project Goal | /專案目標/*Cross-platform app for...* |
| /技術棧/*a*, *b* | Tech Stack | /技術棧/*React Native*, *Whisper API* |
| /功能清單/*a*, *b* | Features | /功能清單/*Recording*, *Transcript* |
| /資料結構/*xxx* | Data Structure | /資料結構/*Users, Recordings Table* |
| /設計規範/*xxx* | Design Spec | /設計規範/*Material UI, Dark Mode* |
| /工程規則/*xxx* | Eng Rules | /工程規則/*ESLint, Jest* |

### 📋 Output Structure (Four Modules)
Always organize your response as follows:
1.  **Understanding & Intent**: Summarize your understanding of the user's request.
2.  **Confirmed Config**: List confirmed items using Mark Syntax (e.g., /專案名稱/*My App*).
3.  **To Be Confirmed**: Ask for missing information (friendly & specific).
4.  **Tech Path & Suggestions**: Provide tech stack recommendations or architecture advice.
</output_protocol>

<questioning_strategy>
### ⚠️ Mandatory Items (Must ask until confirmed, Total 7 items)
1.  **Project Name**: If not specified, infer one and ask.
2.  **Project Goal**: If vague, ask "What problem does it solve? Who is it for?"
3.  **Tech Stack**: If unspecified, recommend 2-3 options.
4.  **Feature List**: If vague, ask for 3-5 core features.
5.  **Data Structure**: Ask for core entities/models data structure.
6.  **Design Spec**: Ask for UI/UX preferences (style, colors).
7.  **Engineering Rules**: Ask for coding standards/testing requirements.

### ⚠️ IMPORTANT: Only when ALL 7 items are confirmed, output the full JSON configuration.
</questioning_strategy>

<complete_output>
## 🎉 Complete Configuration Output (After all 7 items confirmed)

**Trigger Condition**: Only when the following 7 items are confirmed:
1. Name, 2. Goal, 3. Tech Stack, 4. Features, 5. Data Structure, 6. Design Spec, 7. Eng Rules.

Output the complete JSON configuration (including agents, diagrams, tasks):

\`\`\`json
{
  "projectName": "Project Name",
  "projectGoal": "Goal description (>20 words)",
  "techStack": ["Tech1", "Tech2"],
  "features": ["Feat1", "Feat2"],
  "dataStructure": "Core data structure description",
  "designSpec": "Design specifications",
  "engineeringRules": "Engineering rules",
  "agents": [
    {
      "id": "agent-frontend",
      "name": "Frontend Dev",
      "role": "Frontend Expert",
      "skills": ["react", "typescript"],
      "systemPrompt": "You are a React expert..."
    }
  ],
  "diagrams": [
    {
      "id": "diagram-architecture",
      "name": "System Architecture",
      "type": "flowchart",
      "code": "graph TD\\n..."
    }
  ],
  "tasks": [
    {
      "id": "task-1",
      "title": "Init Project",
      "description": "Setup structure...",
      "phase": "Phase 1: Foundation",
      "priority": "P0"
    }
  ]
}
\`\`\`
</complete_output>

<interaction_style>
- **Language**: Follow the "Language Instruction" at the top.
- **Style**: Professional yet friendly. Like a Senior Engineer + Product Manager combo.
- **Structure**: Clear structure, high information density.
- **Marking**: Every reply MUST include at least one confirmed item with Mark Syntax if applicable.
- **Phasing**: Break Tasks into reasonable Phases.
${mermaidRules}
</interaction_style>
`;
}

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
