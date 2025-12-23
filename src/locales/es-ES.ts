import { TranslationType } from "./zh-TW";

export const es_ES: TranslationType = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "Importar MD",
    exportMd: "Exportar MD",
    deleteAll: "Eliminar todo",
    deleteAllConfirm: "¿Estás seguro de que quieres eliminar todas las tareas? Esta acción no se puede deshacer.",
    deleteConfirm: "¿Estás seguro de que quieres eliminar esta tarea?",
    importConfirm: "Se encontraron {count} tareas. ¿Quieres reemplazar la lista actual?",
    noTasksFound: "No se encontraron tareas válidas en el archivo. Por favor, comprueba el formato.",
    parseError: "Error al analizar el archivo Markdown."
  },
  sidebar: {
    all: "Todas las tareas",
    main: "MENÚ PRINCIPAL",
    roleSettings: "ROLES",
    kanban: "TABLERO KANBAN",
    missions: "MISIONES",
    engineering: "INGENIERÍA",
    issues: "INCIDENCIAS",
    commits: "COMMITS",
    history: "HISTORIAL",
    specs: "ESPECIFICACIONES",
    manual: "Manual",
    admin: "ADMIN",
    system_op: "OPERADOR_SISTEMA",
  },
  specs: {
    title: "Especificaciones de Diseño",
    subtitle: "// Centro de Definición de Requisitos y Especificaciones //",
    generateAi: "Generar Specs con AI",
    injectTasks: "Desplegar en Kanban",
    selectCategory: "Seleccionar Categoría",
    categories: {
        web: "Aplicación Web",
        desktop: "Software de Escritorio",
        esp: "Hardware/Firmware (ESP32)",
        backend: "Sistema Backend/API",
        mobile: "APP Móvil",
        game: "Desarrollo de Juegos",
        web3: "Blockchain/Web3",
        bot: "Bot/Automatización",
        ml: "Aprendizaje Automático/Datos",
        extension: "Extensión de Navegador"
    },
    aiChat: {
        title: "Consultor AI de Specs",
        placeholder: "Describe el software o las funciones que quieres desarrollar...",
        startConsulting: "Iniciar Consultoría Técnica",
        stopConsulting: "Detener Consultoría",
        applySpec: "Aplicar Consenso a Specs",
        aiThinking: "AI está diseñando la arquitectura...",
        welcome: "¡Hola! Soy tu arquitecto técnico. Cuéntame qué quieres desarrollar y te ayudaré a perfeccionar la especificación mediante preguntas.",
        copy: "Copiar",
        stop: "Detener",
        systemPrompt: "Prompt del Sistema",
        savePrompt: "Guardar Prompt",
        copySuccess: "Copiado al portapapeles",
        defaultSystemPrompt: `Eres un arquitecto de sistemas senior y líder técnico. Tu tarea es ayudar al usuario a planificar una "Especificación Técnica de Proyecto" completa desde cero.
1. Guía profunda: Guía al usuario para pensar en los niveles de arquitectura, la selección del stack tecnológico, el esquema de la base de datos y las fases detalladas de desarrollo funcional.
2. Estándar de idioma: Utiliza siempre el "Español" para la comunicación.
3. Estándar de salida: Cuando la planificación esté madura, sugiere activamente o genera directamente el siguiente formato JSON:
   \`\`\`json
   { 
     "name": "Nombre del Proyecto", 
     "overview": "Visión y Resumen", 
     "techStack": "Lista detallada del Stack Tecnológico", 
     "dataStructure": "Definición de estructura de datos", 
     "features": "## Phase 1...\\n## Phase 2...", 
     "design": "Estética de diseño y estándares de UI", 
     "rules": "Principios y estándares de ingeniería" 
   }
   \`\`\``
    },
    placeholders: {
        name: "Nombre del Proyecto",
        overview: "Resumen y objetivos...",
        techStack: "Stack Tecnológico (Frontend, Backend, DB...)",
        dataStructure: "Definición de Estructura de Datos...",
        features: "Lista de Funciones (Ordenadas por Fase 1/2)...",
        design: "Especificaciones de Diseño (Color, Layout...)",
        rules: "Reglas de Documentación..."
    },
    toast: {
        generated: "Spec AI Generado",
        injected: "Importadas {count} tareas al Kanban",
        apiKeyRequired: "Configure la clave API de AI en los ajustes primero"
    }
  },
  roleSettings: {
    title: "Ajustes de Roles",
    subtitle: "Gestionar Agentes AI y Roles de Colaboradores",
    defaultRoles: "Roles Predeterminados",
    customRoles: "Roles Personalizados",
    addRole: "Añadir Role",
    roleName: "Nombre del Role",
    agentName: "Nombre del Agente",
    roleType: "Tipo",
    typeAI: "Agente AI",
    typeHuman: "Colaborador",
    save: "Guardar",
    delete: "Eliminar",
    noCustomRoles: "No se han añadido roles personalizados"
  },
  roles: {
    coder: "Desarrollador",
    reviewer: "Revisor",
    architect: "Arquitecto",
    all: "Todo el Personal"
  },
  tags: {
    general: "General",
    feature: "Función",
    bug: "Bug",
    enhancement: "Mejora",
    documentation: "Docs",
    design: "Diseño"
  },
  kanban: {
    title: "Panel de Control",
    subtitle: "// Estado del Sistema: NORMAL //",
    searchPlaceholder: "Buscar tareas...",
    newTask: "Nueva Tarea",
    columns: {
        todo: "Pendiente",
        doing: "En Progreso",
        done: "Completado"
    },
    taskModal: {
        titlePlaceholder: "Título de la Tarea...",
        descPlaceholder: "Escribir descripción con Markdown...",
        phase: "Fase",
        priority: "Prioridad",
        tag: "Etiqueta",
        created: "Fecha de Creación",
        assignee: "Asignado a",
        unassigned: "Sin asignar",
        delete: "Eliminar",
        cancel: "Cancelar",
        save: "Guardar Cambios",
        rework: "Rehacer",
        reworkDesc: "Copiar contenido de nuevo a Pendiente",
        completed: "Completado",
        reworked: "Rehecho",
        enterNumber: "Ingresar número",
        sortOrder: "Orden (Menor=Mayor Prioridad)"
    }
  },
  missions: {
    title: "Lista de Misiones",
    subtitle: "// Resumen Total de Tareas //",
    stats: {
      todo: "Pendiente",
      doing: "En Progreso",
      done: "Completado",
      reworked: "Rehecho"
    },
    search: "Buscar por ID, título o descripción...",
    taskCount: "tareas",
    noTasks: "No hay tareas aún",
    noMatch: "No se encontraron tareas"
  },
  engineering: {
    title: "Área de Ingeniería",
    ideControl: "Centro de Control de Comandos AI IDE",
    debug: "EJECUTAR DEBUG",
    build: "EJECUTAR BUILD",
    runApp: "EJECUTAR APP",
    commandSent: "Comando enviado al AI IDE:",
    noIssues: "Actualmente no hay tareas marcadas como BUG.",
    noHistory: "No hay historial de operaciones aún",
    commitsDeveloping: "La integración del historial de commits de Git está en desarrollo...",
    proposal: {
        issues: "Seguimiento de Incidencias: Integra el sistema de tareas con reportes de bugs, vinculando cambios de código con IDs de incidencias.",
        commits: "Historial de Commits: Visualiza el árbol de Git, haz clic en los commits para ver tareas y detalles de cambios.",
        history: "Historial: Registra operaciones del sistema e historial de cambios de AI, soporta reversión de versiones."
    }
  },
  settings: {
    title: "Ajustes del Sistema",
    subtitle: "Consola Central /// PREFERENCES_V2",
    general: {
        title: "General",
        language: "Idioma de la Interfaz",
        languageDesc: "Seleccione el idioma principal.",
        profile: "Perfil de Usuario",
        profileDesc: "Gestionado por la configuración del espacio de trabajo.",
        adminAccess: "Acceso Admin",
        workspace: "Espacio de Trabajo",
        workspaceDesc: "Sincroniza tareas con el archivo .taskrails en tu directorio local.",
        pickFolder: "Elegir Carpeta",
        workspaceLinked: "Proyecto Vinculado",
        notLinked: "No Vinculado"
    },
    protocols: {
        title: "Protocolos de Enlace",
        broadcast: "Difusión de ID",
        broadcastDesc: "Difusión automática de cambios de rol vía MCP a agentes conectados.",
        airlock: "Reinicio Maestro (Airlock)",
        airlockDesc: "Forzar limpieza del historial del IDE durante cambios de contexto.",
        comingSoon: "Próximamente"
    },
    ai: {
        title: "Proveedor de AI",
        provider: "Proveedor",
        apiKey: "Clave API",
        model: "Modelo",
        endpoint: "Endpoint Personalizado (Opcional)",
        saveSuccess: "Ajustes de AI Guardados",
        saveError: "Error al guardar ajustes de AI",
        delete: "Eliminar Clave",
        storedKeys: "Claves Almacenadas",
        noKeys: "No hay claves almacenadas",
        providers: {
            openrouter: "OpenRouter (Recomendado)",
            openai: "OpenAI",
            anthropic: "Anthropic",
            google: "Google Gemini",
            xai: "xAI Grok",
            together: "Together AI",
            huggingface: "Hugging Face",
            deepseek: "DeepSeek",
            ollama: "Ollama (Local)",
            custom: "Personalizado"
        }
    }
  },
  airlock: {
    title: "Control Airlock // Protocolo de Revisión",
    status: {
        pending: "Esperando Aprobación",
        usage: "USO DE TOKENS",
        risk: "RIESGO"
    },
    risks: {
        low: "Bajo",
        medium: "Medio",
        high: "Alto"
    },
    actions: {
        reject: "Rechazar",
        approve: "Aprobar Cambios"
    }
  },
  instruction: {
    title: "Protocolos",
    subtitle: "Manual de Operaciones",
    banner: "Bienvenido al Centro de Control TaskRails. Esta guía te ayudará a potenciar tu flujo de desarrollo usando el Arquitecto AI y el sistema Kanban.",
    modules: {
      objectives: {
        title: "Objetivos de Misión",
        desc: "El cerebro de tu proyecto. Chatea con el Arquitecto AI para generar planes de desarrollo. Los planes se pueden 'Desplegar' al Kanban con un clic."
      },
      board: {
        title: "Tablero de Misión",
        desc: "Sistema dinámico de gestión de tareas. Permite arrastrar, ordenar fases y etiquetas de prioridad. Las tareas de AI se clasifican automáticamente."
      },
      role: {
        title: "Control de Roles",
        desc: "Configura agentes AI. Establece prompts de sistema únicos para desarrolladores o arquitectos para cambiar los modos de lógica."
      }
    },
    workflow: {
      title: "Flujo Estándar",
      step1: { title: "Iniciar Plan", desc: "Ve a Objetivos de Misión, usa Consulta AI para empezar a chatear." },
      step2: { title: "Generar Spec", desc: "Tras el consenso, haz clic en 'Aplicar Spec AI' para autocompletar los campos." },
      step3: { title: "Desplegar Tareas", desc: "Haz clic en 'DEPLOY TO MISSION BOARD' para transformar la lista en tarjetas Kanban." },
      step4: { title: "Ejecutar Dev", desc: "Gestiona estados en Kanban y sigue los cambios en el Historial de Ingeniería." }
    },
    advanced: {
      title: "Tácticas Avanzadas",
      mcp: { title: "Soporte MCP", desc: "El soporte Model Context Protocol permite a los agentes acceder directamente al estado del Kanban." },
      lang: { title: "Multilingüe", desc: "Soporte completo para contextos de desarrollo en varios idiomas." },
      ui: { title: "Cyberpunk UI", desc: "Interfaz rápida React 19 + Framer Motion que reduce la fatiga visual." },
      tip: "Recuerda, una buena planificación AI es la mitad del éxito. Antes de desplegar, verifica los encabezados ## Phase."
    }
  }
};
