import { TranslationType } from "./zh-TW";

export const en_US: TranslationType = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "Import MD",
    exportMd: "Export MD",
    deleteAll: "Delete All",
    deleteAllConfirm: "Are you sure you want to delete all tasks? This action cannot be undone.",
    deleteConfirm: "Are you sure you want to delete this task?",
    importConfirm: "Found {count} tasks. Do you want to replace the current list?",
    noTasksFound: "No valid tasks found in the file, please check the format.",
    parseError: "Failed to parse Markdown file."
  },
  sidebar: {
    all: "All Tasks",
    main: "MAIN",
    roleSettings: "ROLES",
    kanban: "KANBAN BRIDGE",
    missions: "MISSIONS",
    engineering: "ENGINEERING",
    issues: "ISSUES",
    commits: "COMMITS",
    history: "HISTORY",
    specs: "SPECIFICATIONS",
    manual: "Manual",
    admin: "ADMIN",
    system_op: "SYSTEM_OP",
  },
  specs: {
    title: "Project Design Specifications",
    subtitle: "// Project Spec & Requirement Definition Center //",
    generateAi: "AI Smart Generate Spec",
    injectTasks: "Deploy to Kanban",
    selectCategory: "Select Project Category",
    categories: {
        web: "Web Application",
        desktop: "Desktop Software",
        esp: "Hardware/Firmware (ESP32)",
        backend: "Backend System/API",
        mobile: "Mobile APP",
        game: "Game Development",
        web3: "Blockchain/Web3",
        bot: "Bot/Automation",
        ml: "Machine Learning/AI Data",
        extension: "Browser Extension"
    },
    aiChat: {
        title: "Spec AI Consultant",
        placeholder: "Describe the software type or features you want to develop...",
        startConsulting: "Start Technical Consulting",
        stopConsulting: "Stop Consulting",
        applySpec: "Apply Consensus to Specs",
        aiThinking: "AI is architecting...",
        welcome: "Hello! I am your technical architect. Please tell me what you want to develop, and I will assist you in perfecting the specification document through questions.",
        copy: "Copy",
        stop: "Stop",
        systemPrompt: "System Prompt",
        savePrompt: "Save Prompt",
        copySuccess: "Copied to clipboard",
        defaultSystemPrompt: `You are a senior system architect and technical lead. Your task is to assist the user in planning a complete "Project Technical Specification" from scratch.
1. Deep Guidance: Guide the user to think about architecture levels, tech stack selection, database schema, and detailed functional development phases.
2. Language Standard: Always use "English" for communication.
3. Output Standard: When the planning is mature, actively suggest or directly output the following JSON format:
   \`\`\`json
   { 
     "name": "Project Name", 
     "overview": "Vision and Overview", 
     "techStack": "Detailed Tech Stack List", 
     "dataStructure": "Data Structure Definition", 
     "features": "## Phase 1...\\n## Phase 2...", 
     "design": "Design Aesthetics and UI Standards", 
     "rules": "Engineering Principles and Standards" 
   }
   \`\`\``
    },
    placeholders: {
        name: "Project Name",
        overview: "Project overview and objectives...",
        techStack: "Tech Stack (Frontend, Backend, DB...)",
        dataStructure: "Data Structure Definition...",
        features: "Core Feature List (Sorted by Phase 1/2)...",
        design: "Design Spec (Color, Layout...)",
        rules: "Project Documentation Rules..."
    },
    toast: {
        generated: "AI Spec Generated",
        injected: "Successfully imported {count} tasks to Kanban",
        apiKeyRequired: "Please configure AI API Key in settings first"
    }
  },
  roleSettings: {
    title: "Task Role Settings",
    subtitle: "Manage AI Agents and Collaborator Roles",
    defaultRoles: "Default Roles",
    customRoles: "Custom Roles",
    addRole: "Add Role",
    roleName: "Role Name",
    agentName: "Agent Name",
    roleType: "Type",
    typeAI: "AI Agent",
    typeHuman: "Collaborator",
    save: "Save",
    delete: "Delete",
    noCustomRoles: "No custom roles added yet"
  },
  roles: {
    coder: "Developer",
    reviewer: "Reviewer",
    architect: "Architect",
    all: "All Personnel"
  },
  tags: {
    general: "General",
    feature: "Feature",
    bug: "Bug",
    enhancement: "Enhancement",
    documentation: "Docs",
    design: "Design"
  },
  kanban: {
    title: "Project Dashboard",
    subtitle: "// System Status: NORMAL //",
    searchPlaceholder: "Search tasks...",
    newTask: "New Task",
    columns: {
        todo: "To-Do",
        doing: "In Progress",
        done: "Completed"
    },
    taskModal: {
        titlePlaceholder: "Task Title...",
        descPlaceholder: "Write description with Markdown...",
        phase: "Phase",
        priority: "Priority",
        tag: "Tag",
        created: "Created Date",
        assignee: "Assignee",
        unassigned: "Unassigned",
        delete: "Delete",
        cancel: "Cancel",
        save: "Save Changes",
        rework: "Rework",
        reworkDesc: "Copy content back to To-Do",
        completed: "Completed",
        reworked: "Reworked",
        enterNumber: "Enter Number",
        sortOrder: "Sort Order (Low=High Priority)"
    }
  },
  missions: {
    title: "Mission List",
    subtitle: "// Total Task Overview //",
    stats: {
      todo: "To-Do",
      doing: "In Progress",
      done: "Completed",
      reworked: "Reworked"
    },
    search: "Search Task ID, title or description...",
    taskCount: "tasks",
    noTasks: "No tasks yet",
    noMatch: "No matching tasks found"
  },
  engineering: {
    title: "Engineering Area",
    ideControl: "AI IDE Command Control Center",
    debug: "RUN DEBUG",
    build: "RUN BUILD",
    runApp: "RUN APP",
    commandSent: "Command sent to AI IDE:",
    noIssues: "Currently no tasks marked as BUG.",
    noHistory: "No operational history yet",
    commitsDeveloping: "Git commit history integration under development...",
    proposal: {
        issues: "Issue Tracking: Integrate task system with bug reports, auto-linking code changes with Issue IDs.",
        commits: "Commit History: Visualize Git tree, click commits to view associated tasks and code diffs.",
        history: "History: Record system core operations and AI change history, support version rollback and audit."
    }
  },
  settings: {
    title: "System Settings",
    subtitle: "Core Console /// PREFERENCES_V2",
    general: {
        title: "General",
        language: "UI Language",
        languageDesc: "Select the primary display language.",
        profile: "User Profile",
        profileDesc: "Managed by current workspace config.",
        adminAccess: "Admin Access",
        workspace: "Project Workspace",
        workspaceDesc: "Sync tasks to the .taskrails file in your local project directory.",
        pickFolder: "Pick Folder",
        workspaceLinked: "Project Linked",
        notLinked: "Not Linked"
    },
    protocols: {
        title: "Link Protocols",
        broadcast: "ID Broadcast",
        broadcastDesc: "Auto-broadcast role changes via MCP to connected agents.",
        airlock: "Hard Reset (Airlock)",
        airlockDesc: "Forcibly clear IDE history during context switches.",
        comingSoon: "Coming Soon"
    },
    ai: {
        title: "AI Service Provider",
        provider: "Provider",
        apiKey: "API Key",
        model: "Model",
        endpoint: "Custom Endpoint (Optional)",
        saveSuccess: "AI Settings Saved",
        saveError: "Failed to save AI settings",
        delete: "Delete Key",
        storedKeys: "Stored Keys",
        noKeys: "No keys stored yet",
        providers: {
            openrouter: "OpenRouter (Recommended)",
            openai: "OpenAI",
            anthropic: "Anthropic",
            google: "Google Gemini",
            xai: "xAI Grok",
            together: "Together AI",
            huggingface: "Hugging Face",
            deepseek: "DeepSeek",
            ollama: "Ollama (Local)",
            custom: "Custom (OpenAI Compatible)"
        }
    }
  },
  airlock: {
    title: "Airlock Control // Code Review Protocol",
    status: {
        pending: "Awaiting Approval",
        usage: "TOKEN USAGE",
        risk: "RISK"
    },
    risks: {
        low: "Low",
        medium: "Medium",
        high: "High"
    },
    actions: {
        reject: "Reject",
        approve: "Approve Changes"
    }
  },
  instruction: {
    title: "Usage Protocols",
    subtitle: "Operational Manual",
    banner: "Welcome to TaskRails Command Center. This guide will help you extreme boost your development workflow using AI Architect and Kanban system.",
    modules: {
      objectives: {
        title: "Mission Objectives",
        desc: "The core brain of your project. Chat with AI Architect to generate full tech stack and dev plans. Plans can be 'Deployed' to Kanban with one click."
      },
      board: {
        title: "Mission Board",
        desc: "Dynamic task management system. Features drag-and-drop, phase sorting, and priority tags. AI-generated tasks are auto-classified into phases."
      },
      role: {
        title: "Role Control",
        desc: "Configure different AI agents. Set unique system prompts for developers, reviewers or architects to switch AI logic modes."
      }
    },
    workflow: {
      title: "Standard Workflow",
      step1: { title: "Start Planning", desc: "Go to Mission Objectives, use AI Consult to start chatting with AI." },
      step2: { title: "Generate Spec", desc: "After consensus, click 'Apply AI Spec' to auto-fill all project fields." },
      step3: { title: "Deploy Tasks", desc: "Click 'DEPLOY TO MISSION BOARD' to transform Markdown list into Kanban cards." },
      step4: { title: "Execute Dev", desc: "Manage task status in Kanban and track all changes via Engineering History." }
    },
    advanced: {
      title: "Advanced Tactics",
      mcp: { title: "MCP Support", desc: "Model Context Protocol support allows AI agents to directly access Kanban state and DB content." },
      lang: { title: "Multi-language", desc: "Full support for multilingual dev contexts ensuring seamless AI communication." },
      ui: { title: "Cyberpunk UI", desc: "Fast-responsive React 19 + Framer Motion interface reduces visual fatigue." },
      tip: "Remember, good AI planning is half the success. Before deploying tasks, ensure ## Phase headers are correct to define Kanban sections."
    }
  }
};
