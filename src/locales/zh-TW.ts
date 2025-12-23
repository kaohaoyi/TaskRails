export type TranslationType = typeof zh_TW;

export const zh_TW = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "匯入 MD",
    exportMd: "匯出 MD",
    deleteAll: "刪除全部",
    deleteAllConfirm: "確定要刪除所有任務嗎？此操作無法恢復。",
    deleteConfirm: "確定要刪除此任務嗎？",
    importConfirm: "探索到 {count} 個任務。是否要取代目前的清單？",
    noTasksFound: "檔案中未發現有效任務，請檢查格式。",
    parseError: "Markdown 解析失敗"
  },
  sidebar: {
    all: "全部任務",
    main: "主要功能",
    roleSettings: "角色設定",
    kanban: "任務看板",
    missions: "任務清單",
    engineering: "工程區域",
    issues: "問題追踪",
    commits: "提交記錄",
    history: "歷史記錄",
    specs: "專案說明書",
    manual: "使用手冊",
    admin: "管理員",
    system_op: "系統操作者",
  },
  specs: {
    title: "專案設計說明書",
    subtitle: "// 專案規格與需求定義中心 //",
    generateAi: "AI 智能生成規格",
    injectTasks: "佈署至任務看板",
    selectCategory: "選擇專案類型",
    categories: {
        web: "Web 應用程式",
        desktop: "電腦端軟體",
        esp: "硬體/韌體 (ESP32)",
        backend: "後端系統/API",
        mobile: "行動端 APP",
        game: "遊戲開發 (Game Dev)",
        web3: "區塊鏈/Web3",
        bot: "機器人/自動化 (Bot)",
        ml: "機器學習/AI 數據",
        extension: "瀏覽器擴充外掛"
    },
    aiChat: {
        title: "Spec AI 諮詢專家",
        placeholder: "描述您想開發的軟體類型或功能...",
        startConsulting: "開始技術諮詢",
        stopConsulting: "停止諮詢",
        applySpec: "將共識套用至說明書",
        aiThinking: "AI 正在架構中...",
        welcome: "您好！我是您的技術架構師。請告訴我您想開發什麼，我會透過提問協助您完善規格說明書。",
        copy: "複製",
        stop: "停止生成",
        systemPrompt: "系統指令 (System Prompt)",
        savePrompt: "更新指令",
        copySuccess: "已複製到剪貼簿",
        defaultSystemPrompt: `你是一個資深的系統架構師兼技術組長。你的任務是協助使用者從零開始規劃一套完整的「專案技術說明書」。
1. 深度引導：引導使用者思考架構層級、技術棧選型、資料庫 Schema、以及詳細的功能開發階段（Phases）。
2. 語言規範：必須始終使用「繁體中文（台灣）」進行溝通，術語需符合台灣軟體工程師習慣（如：程式碼、專案、變數、佈署）。
3. 輸出規範：當規劃成熟時，主動建議或直接輸出以下 JSON 格式：
   \`\`\`json
   { 
     "name": "專案名稱", 
     "overview": "願景與概述", 
     "techStack": "技術棧詳細清單", 
     "dataStructure": "資料結構定義", 
     "features": "## Phase 1...\\n## Phase 2...", 
     "design": "設計美學與 UI 規範", 
     "rules": "工程原則與規範" 
   }
   \`\`\``
    },
    placeholders: {
        name: "專案名稱",
        overview: "專案概述與目標...",
        techStack: "技術棧 (Frontend, Backend, DB...)",
        dataStructure: "資料結構定義...",
        features: "核心功能清單 (按 Phase 1/2 排序)...",
        design: "設計規範 (色調, 佈局...)",
        rules: "專案文件規則..."
    },
    toast: {
        generated: "AI 規格已生成",
        injected: "成功匯入 {count} 個任務至看板",
        apiKeyRequired: "請先在設定中配置 AI API Key"
    }
  },
  roleSettings: {
    title: "任務角色設定",
    subtitle: "管理 AI Agent 與協作者角色",
    defaultRoles: "預設角色",
    customRoles: "自訂角色",
    addRole: "新增角色",
    roleName: "角色名稱",
    agentName: "Agent 名稱",
    roleType: "類型",
    typeAI: "AI Agent",
    typeHuman: "協作者",
    save: "儲存",
    delete: "刪除",
    noCustomRoles: "尚未新增自訂角色"
  },
  roles: {
    coder: "開發者",
    reviewer: "審查者",
    architect: "架構師",
    all: "全部人員"
  },
  tags: {
    general: "一般",
    feature: "功能",
    bug: "錯誤",
    enhancement: "優化",
    documentation: "文件",
    design: "設計"
  },
  kanban: {
    title: "專案儀表板",
    subtitle: "// 系統狀態：正常 //",
    searchPlaceholder: "搜尋任務...",
    newTask: "新增任務",
    columns: {
        todo: "待辦事項",
        doing: "進行中",
        done: "已完成"
    },
    taskModal: {
        titlePlaceholder: "任務標題...",
        descPlaceholder: "使用 Markdown 撰寫描述...",
        phase: "階段",
        priority: "優先級",
        tag: "標籤",
        created: "建立日期",
        assignee: "負責人",
        unassigned: "未指派",
        delete: "刪除",
        cancel: "取消",
        save: "儲存變更",
        rework: "重工 (Rework)",
        reworkDesc: "將內容複製回待辦事項",
        completed: "已完成",
        reworked: "已重工",
        enterNumber: "輸入數字",
        sortOrder: "排序權重 (低=高優先)"
    }
  },
  missions: {
    title: "任務清單",
    subtitle: "// 全部任務總覽 //",
    stats: {
      todo: "待辦事項",
      doing: "進行中",
      done: "已完成",
      reworked: "已重工"
    },
    search: "搜尋任務 ID、標題或描述...",
    taskCount: "筆任務",
    noTasks: "尚無任務",
    noMatch: "找不到符合的任務"
  },
  engineering: {
    title: "工程區域",
    ideControl: "AI IDE 指令控制中心",
    debug: "執行 DEBUG",
    build: "執行 BUILD",
    runApp: "執行軟體",
    commandSent: "已向 AI IDE 發送指令：",
    noIssues: "目前沒有標示為 BUG 的任務。",
    noHistory: "尚無操作紀錄",
    commitsDeveloping: "Git 提交紀錄整合開發中...",
    proposal: {
        issues: "問題追踪方案：整合任務系統與 Bug 報告，自動連結程式碼變更與 Issue ID。",
        commits: "提交記錄方案：視覺化 Git 樹狀圖，點擊提交可查看對應任務與變更程式碼細節。",
        history: "歷史記錄方案：記錄系統核心操作與 AI 變更歷史，支援程式碼版本回溯與操作審查。"
    }
  },
  settings: {
    title: "系統設定",
    subtitle: "核心控制台 /// PREFERENCES_V2",
    general: {
        title: "一般設定",
        language: "介面語言",
        languageDesc: "選擇系統的主要顯示語言。",
        profile: "使用者配置文件",
        profileDesc: "由目前的工作區配置管理。",
        adminAccess: "管理員權限",
        workspace: "專案工作區",
        workspaceDesc: "將任務同步至本地專案目錄中的 .taskrails 檔案。",
        pickFolder: "選擇資料夾",
        workspaceLinked: "已聯結專案",
        notLinked: "尚未聯結"
    },
    protocols: {
        title: "連結協定",
        broadcast: "身份廣播",
        broadcastDesc: "透過 MCP 自動向已連接的 Agent 廣播角色變更。",
        airlock: "硬重置 (氣閘)",
        airlockDesc: "在切換上下文時強制清除 IDE 歷史記錄。",
        comingSoon: "敬請期待"
    },
    ai: {
        title: "AI 服務提供者",
        provider: "服務商 (Provider)",
        apiKey: "API 金鑰",
        model: "模型 (Model)",
        endpoint: "自定義端點 (Optional)",
        saveSuccess: "AI 設定已儲存",
        saveError: "儲存 AI 設定失敗",
        delete: "刪除金鑰",
        storedKeys: "已存儲的金鑰",
        noKeys: "尚未存儲任何金鑰",
        providers: {
            openrouter: "OpenRouter (推薦)",
            openai: "OpenAI",
            anthropic: "Anthropic",
            google: "Google Gemini",
            xai: "xAI Grok",
            together: "Together AI",
            huggingface: "Hugging Face",
            deepseek: "DeepSeek (深度求索)",
            ollama: "Ollama (本地模型)",
            custom: "自定義 (OpenAI 相容)"
        }
    }
  },
  airlock: {
    title: "氣閘控制 // 代碼審查協定",
    status: {
        pending: "等待批准",
        usage: "TOKEN 使用量",
        risk: "風險"
    },
    risks: {
        low: "低",
        medium: "中",
        high: "高"
    },
    actions: {
        reject: "拒絕",
        approve: "批准變更"
    }
  },
  instruction: {
    title: "使用協定",
    subtitle: "Usage Protocols",
    banner: "歡迎進入 TaskRails 指令中心。本手冊將引導您如何利用 AI 架構師與看板系統，極致提升您的開發工作流。",
    modules: {
      objectives: {
        title: "Mission Objectives",
        desc: "專案的核心大腦。在這裡與 AI 架構師對話，生成完整的技術棧與開發計畫。生成的計畫可一鍵「部署」至任務看板。"
      },
      board: {
        title: "Mission Board",
        desc: "動態任務管理系統。採用拖放式設計，支援階段排序與優先級標註。所有從 AI 生成的任務都會自動歸類到相應階段。"
      },
      role: {
        title: "Role Control",
        desc: "配置不同的 AI 代理人。您可以為開發者、審查者或架構師設定不同的系統指令，切換 AI 的思維模式。"
      }
    },
    workflow: {
      title: "標準工作流",
      step1: { title: "啟動規劃", desc: "進入 Mission Objectives 頁面，使用 AI Consult 與 AI 開始對話。" },
      step2: { title: "生成規格", desc: "當對話完成後，點擊「套用 AI 規格」，系統會自動填入所有開發欄位。" },
      step3: { title: "部署任務", desc: "點擊「DEPLOY TO MISSION BOARD」，將 Markdown 功能清單轉化為看板卡片。" },
      step4: { title: "執行開發", desc: "在看板中管理任務狀態，並透過 Engineering History 追蹤所有更動。" }
    },
    advanced: {
      title: "進階策略",
      mcp: { title: "MCP 整合支援", desc: "支援 Model Context Protocol，讓 AI 代理人能直接存取看板狀態與資料庫內容。" },
      lang: { title: "多語言支援", desc: "完整支援多國語言開發語境，確保與 AI 的溝通無障礙。" },
      ui: { title: "Cyberpunk UI", desc: "極速響應的 React 19 + Framer Motion 動態介面，減少視覺疲勞。" },
      tip: "「記住，好的 AI 規劃是成功的一半。在部署任務前，務必確認功能清單中的 ## Phase 標題是否正確，這將直接決定看板的分段方式。」"
    }
  }
};
