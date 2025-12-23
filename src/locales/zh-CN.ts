import { TranslationType } from "./zh-TW";

export const zh_CN: TranslationType = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "导入 MD",
    exportMd: "导出 MD",
    deleteAll: "删除全部",
    deleteAllConfirm: "确定要删除所有任务吗？此操作无法恢复。",
    deleteConfirm: "确定要删除此任务吗？",
    importConfirm: "探索到 {count} 个任务。是否要取代目前的清单？",
    noTasksFound: "檔案中未发现有效任务，请检查格式。",
    parseError: "Markdown 解析失败"
  },
  sidebar: {
    all: "全部任务",
    main: "主要功能",
    roleSettings: "角色设定",
    kanban: "任务看板",
    missions: "任务清单",
    engineering: "工程区域",
    issues: "问题追踪",
    commits: "提交记录",
    history: "历史记录",
    specs: "项目说明书",
    manual: "使用手册",
    admin: "管理员",
    system_op: "系统操作者",
  },
  specs: {
    title: "项目设计说明书",
    subtitle: "// 项目规格与需求定义中心 //",
    generateAi: "AI 智能生成规格",
    injectTasks: "倒入任务看板",
    selectCategory: "选择项目类型",
    categories: {
        web: "Web 应用程序",
        desktop: "电脑端程序",
        esp: "硬件/固ema (ESP32)",
        backend: "后端系统/API",
        mobile: "移动端 APP",
        game: "游戏开发 (Game Dev)",
        web3: "区块链/Web3",
        bot: "机器人/自动化 (Bot)",
        ml: "机器学习/AI 数据",
        extension: "浏览器扩充插件"
    },
    aiChat: {
        title: "Spec AI 咨询专家",
        placeholder: "描述您想开发的软件类型或功能...",
        startConsulting: "开始技术咨询",
        stopConsulting: "停止咨询",
        applySpec: "将共识套用至说明书",
        aiThinking: "AI 正在架构中...",
        welcome: "您好！我是您的技术架构师。请告诉我您想开发什么，我会通过提問协助您完善规格说明书。",
        copy: "复制",
        stop: "停止生成",
        systemPrompt: "系统指令 (System Prompt)",
        savePrompt: "更新指令",
        copySuccess: "已复制到剪贴板",
        defaultSystemPrompt: `你是一个资深的系统架构师兼技术组长。你的任务是协助使用者从零开始规划一套完整的「项目技术说明书」。
1. 深度引导：引导使用者思考架构层级、技术栈选型、数据库 Schema、以及详细的功能开发阶段（Phases）。
2. 语言规范：必须始终使用「简体中文」进行沟通。
3. 输出规范：当规划成熟时，主动建议或直接输出以下 JSON 格式：
   \`\`\`json
   { 
     "name": "项目名称", 
     "overview": "愿景与概述", 
     "techStack": "技术栈详细清单", 
     "dataStructure": "数据结构定义", 
     "features": "## Phase 1...\\n## Phase 2...", 
     "design": "设计美学与 UI 规范", 
     "rules": "工程原则与规范" 
   }
   \`\`\``
    },
    placeholders: {
        name: "项目名称",
        overview: "项目概述与目标...",
        techStack: "技术栈 (Frontend, Backend, DB...)",
        dataStructure: "数据结构定义...",
        features: "核心功能清单 (按 Phase 1/2 排序)...",
        design: "设计规范 (色调, 布局...)",
        rules: "项目文件规则..."
    },
    toast: {
        generated: "AI 规格已生成",
        injected: "成功导入 {count} 个任务至看板",
        apiKeyRequired: "请先在设置中配置 AI API Key"
    }
  },
  roleSettings: {
    title: "任务角色设定",
    subtitle: "管理 AI Agent 与协作者角色",
    defaultRoles: "预设角色",
    customRoles: "自订角色",
    addRole: "新增角色",
    roleName: "角色名称",
    agentName: "Agent 名称",
    roleType: "类型",
    typeAI: "AI Agent",
    typeHuman: "协作者",
    save: "储存",
    delete: "删除",
    noCustomRoles: "尚未新增自订角色"
  },
  roles: {
    coder: "开发者",
    reviewer: "审查者",
    architect: "架构师",
    all: "全部人员"
  },
  tags: {
    general: "一般",
    feature: "功能",
    bug: "错误",
    enhancement: "优化",
    documentation: "文件",
    design: "设计"
  },
  kanban: {
    title: "项目仪表板",
    subtitle: "// 系统状态：正常 //",
    searchPlaceholder: "搜索任务...",
    newTask: "新增任务",
    columns: {
        todo: "待办事项",
        doing: "进行中",
        done: "已完成"
    },
    taskModal: {
        titlePlaceholder: "任务标题...",
        descPlaceholder: "使用 Markdown 撰写描述...",
        phase: "阶段",
        priority: "优先级",
        tag: "标签",
        created: "建立日期",
        assignee: "负责人",
        unassigned: "未指派",
        delete: "删除",
        cancel: "取消",
        save: "储存变更",
        rework: "重工 (Rework)",
        reworkDesc: "将内容复制回待办事项",
        completed: "已完成",
        reworked: "已重工",
        enterNumber: "输入数字",
        sortOrder: "排序权重 (低=高優先)"
    }
  },
  missions: {
    title: "任务清单",
    subtitle: "// 全部任务总览 //",
    stats: {
      todo: "待办事项",
      doing: "进行中",
      done: "已完成",
      reworked: "已重工"
    },
    search: "搜索任务 ID、标题或描述...",
    taskCount: "笔任务",
    noTasks: "尚无任务",
    noMatch: "找不到符合的任务"
  },
  engineering: {
    title: "工程区域",
    ideControl: "AI IDE 指令控制中心",
    debug: "执行 DEBUG",
    build: "执行 BUILD",
    runApp: "执行软件",
    commandSent: "已向 AI IDE 发送指令：",
    noIssues: "目前没有标示为 BUG 的任务。",
    noHistory: "尚无操作纪录",
    commitsDeveloping: "Git 提交纪录整合开发中...",
    proposal: {
        issues: "问题追踪方案：整合任务系统与 Bug 报告，自动连结代码变更与 Issue ID。",
        commits: "提交纪录方案：视觉化 Git 樹状图，点击提交可查看对应任务与变更代码细节。",
        history: "历史纪录方案：记录系统核心操作与 AI 变更历史，支援代码版本回溯與操作審查。"
    }
  },
  settings: {
    title: "系统设置",
    subtitle: "核心控制台 /// PREFERENCES_V2",
    general: {
        title: "一般设置",
        language: "界面语言",
        languageDesc: "选择系统的主要显示语言。",
        profile: "用户配置文件",
        profileDesc: "由目前的工作区配置管理。",
        adminAccess: "管理员权限",
        workspace: "项目工作区",
        workspaceDesc: "将任务同步至本地项目目录中的 .taskrails 檔案。",
        pickFolder: "选择资料夾",
        workspaceLinked: "已联结项目",
        notLinked: "尚未联结"
    },
    protocols: {
        title: "连接协议",
        broadcast: "身份广播",
        broadcastDesc: "通过 MCP 自动向已连接的 Agent 广播角色变更。",
        airlock: "硬重置 (气闸)",
        airlockDesc: "在切换上下文时强制清除 IDE 历史记录。",
        comingSoon: "敬请期待"
    },
    ai: {
        title: "AI 服务提供者",
        provider: "服务商 (Provider)",
        apiKey: "API 金钥",
        model: "模型 (Model)",
        endpoint: "自定义端點 (Optional)",
        saveSuccess: "AI 设定已储存",
        saveError: "储存 AI 设定失败",
        delete: "删除金钥",
        storedKeys: "已存储的金钥",
        noKeys: "尚未存储任何金钥",
        providers: {
            openrouter: "OpenRouter (推荐)",
            openai: "OpenAI",
            anthropic: "Anthropic",
            google: "Google Gemini",
            xai: "xAI Grok",
            together: "Together AI",
            huggingface: "Hugging Face",
            deepseek: "DeepSeek (深度求索)",
            ollama: "Ollama (本地模型)",
            custom: "自定义 (OpenAI 兼容)"
        }
    }
  },
  airlock: {
    title: "气闸控制 // 代码审查协议",
    status: {
        pending: "等待批准",
        usage: "TOKEN 使用量",
        risk: "风险"
    },
    risks: {
        low: "低",
        medium: "中",
        high: "高"
    },
    actions: {
        reject: "拒绝",
        approve: "批准变更"
    }
  },
  instruction: {
    title: "使用协议",
    subtitle: "Usage Protocols",
    banner: "欢迎进入 TaskRails 指令中心。本手册将引导您如何利用 AI 架构师与看板系统，极致提升您的开发工作流。",
    modules: {
      objectives: {
        title: "Mission Objectives",
        desc: "项目的核心大脑。在这里与 AI 架构师对话，生成完整的技术栈与开发计划。生成的计划可一键「部署」至任务看板。"
      },
      board: {
        title: "Mission Board",
        desc: "动态任务管理系统。采用拖放式设计，支援阶段排序与优先级标注。所有从 AI 生成的任务都会自动归类到相应阶段。"
      },
      role: {
        title: "Role Control",
        desc: "配置不同的 AI 代理人。您可以为开发者、审查者或架构师设定不同的系统指令，切换 AI 的思维模式。"
      }
    },
    workflow: {
      title: "标准工作流",
      step1: { title: "启动规划", desc: "进入 Mission Objectives 页面，使用 AI Consult 与 AI 开始对话。" },
      step2: { title: "生成规格", desc: "当对话完成后，点击「套用 AI 規格」，系统会自动填入所有开发字段。" },
      step3: { title: "部署任务", desc: "点击「DEPLOY TO MISSION BOARD」，将 Markdown 功能清单转化为看板卡片。" },
      step4: { title: "执行开发", desc: "在看板中管理任务状态，并通过 Engineering History 追踪所有更动。" }
    },
    advanced: {
      title: "进阶策略",
      mcp: { title: "MCP 整合支援", desc: "支援 Model Context Protocol，让 AI 代理人能直接存取看板状态与数据库内容。" },
      lang: { title: "多语言支援", desc: "完整支援多国语言开发语境，确保与 AI 的沟通无障碍。" },
      ui: { title: "Cyberpunk UI", desc: "极速响应的 React 19 + Framer Motion 动态界面，减少视觉疲勞。" },
      tip: "「记住，好的 AI 规划是成功的一半。在部署任务前，务必确认功能清单中的 ## Phase 标题是否正确，这将直接决定看板的分段方式。」"
    }
  }
};
