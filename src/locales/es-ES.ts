export const es_ES = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "Importar MD",
    exportMd: "Exportar MD",
    deleteAll: "Eliminar Todo",
    deleteAllConfirm: "¿Está seguro de que desea eliminar todas las tareas? Esta acción no se puede deshacer.",
    importConfirm: "Se encontraron {count} tareas. ¿Desea reemplazar la lista actual?",
    noTasksFound: "No se encontraron tareas válidas en el archivo, por favor verifique el formato."
  },
  sidebar: {
    main: "PRINCIPAL",
    roleSettings: "ROLES",
    kanban: "TABLERO KANBAN",
    missions: "MISIONES",
    engineering: "INGENIERÍA",
    issues: "INCIDENCIAS",
    commits: "COMMITS",
    history: "HISTORIAL",
    specs: "ESPECIFICACIONES",
    admin: "ADMIN",
    system_op: "OPERADOR_SISTEMA",
  },
  specs: {
    title: "Especificaciones de Diseño",
    subtitle: "// Centro de Definición de Requisitos y Especificaciones //",
    generateAi: "Generar Especificaciones con IA",
    injectTasks: "Inyectar al Kanban",
    selectCategory: "Seleccionar Categoría del Proyecto",
    categories: {
        web: "Aplicación Web",
        desktop: "Aplicación de Escritorio",
        esp: "Hardware/Firmware (ESP32)",
        backend: "Sistema Backend/API",
        mobile: "APP Móvil",
        game: "Desarrollo de Juegos",
        web3: "Blockchain/Web3",
        bot: "Bot/Automatización",
        ml: "Machine Learning/Datos IA",
        extension: "Extensión de Navegador"
    },
    aiChat: {
        title: "Consultor de IA para Specs",
        placeholder: "Describa el software o función que desea desarrollar...",
        startConsulting: "Iniciar Consultoría Técnica",
        stopConsulting: "Detener Consultoría",
        applySpec: "Aplicar Consenso a Specs",
        aiThinking: "La IA está diseñando la arquitectura...",
        welcome: "¡Hola! Soy su arquitecto técnico. Cuénteme qué desea desarrollar y le ayudaré a perfeccionar el documento de especificaciones mediante preguntas."
    },
    placeholders: {
        name: "Nombre del Proyecto",
        overview: "Resumen y Objetivos del Proyecto...",
        techStack: "Stack Tecnológico (Frontend, Backend, DB...)",
        dataStructure: "Definición de Estructura de Datos...",
        features: "Lista de Funciones Principales (Fase 1/2)...",
        design: "Estándares de Diseño (Colores, Layout...)",
        rules: "Reglas de Documentación del Proyecto..."
    },
    toast: {
        generated: "Especificaciones Generadas por IA",
        injected: "Se inyectaron {count} tareas con éxito al Kanban",
        apiKeyRequired: "Configure primero la API Key de IA en la configuración"
    }
  },
  roleSettings: {
    title: "Ajustes de Roles de Tarea",
    subtitle: "Gestionar Agentes de IA y Roles de Colaboradores",
    defaultRoles: "Roles por Defecto",
    customRoles: "Roles Personalizados",
    addRole: "Añadir Rol",
    roleName: "Nombre del Rol",
    agentName: "Nombre del Agente",
    roleType: "Tipo",
    typeAI: "Agente de IA",
    typeHuman: "Colaborador",
    save: "Guardar",
    delete: "Eliminar",
    noCustomRoles: "No se han añadido roles personalizados todavía"
  },
  roles: {
    coder: "DESARROLLADOR",
    reviewer: "REVISOR",
    architect: "ARQUITECTO",
    all: "TODO EL PERSONAL"
  },
  tags: {
    general: "General",
    feature: "Función",
    bug: "Bug",
    enhancement: "Mejora",
    documentation: "Documentación",
    design: "Diseño"
  },
  kanban: {
    title: "Panel del Proyecto",
    subtitle: "// ESTADO DEL SISTEMA: NORMAL //",
    searchPlaceholder: "Buscar tareas...",
    newTask: "NUEVA TAREA",
    columns: {
        todo: "PENDIENTE",
        doing: "EN PROGRESO",
        done: "COMPLETADO"
    },
    taskModal: {
        titlePlaceholder: "Título de la tarea...",
        descPlaceholder: "Escribir descripción usando Markdown...",
        phase: "Fase",
        priority: "Prioridad",
        tag: "Etiqueta",
        created: "Fecha de Creación",
        assignee: "Asignado a",
        unassigned: "Sin asignar",
        delete: "Eliminar",
        cancel: "Cancelar",
        save: "Guardar Cambios",
        rework: "Retrabajo",
        reworkDesc: "Copiar contenido de nuevo a Pendiente",
        completed: "Completado",
        reworked: "Retrabajado",
        enterNumber: "Introducir número",
        sortOrder: "Orden de clasificación (Bajo=Alta Prioridad)"
    }
  },
  missions: {
    title: "Lista de Misiones",
    subtitle: "// RESUMEN DE TODAS LAS MISIONES //",
    stats: {
      todo: "PENDIENTE",
      doing: "EN PROGRESO",
      done: "COMPLETADO",
      reworked: "RETRABAJADO"
    },
    search: "Buscar ID de Tarea, Título o Descripción...",
    taskCount: "tareas",
    noTasks: "Aún no hay tareas",
    noMatch: "No se encontraron tareas coincidentes"
  },
  engineering: {
    title: "Área de Ingeniería",
    ideControl: "Centro de Control de Comandos IA IDE",
    debug: "EJECUTAR DEBUG",
    build: "EJECUTAR BUILD",
    runApp: "EJECUTAR APP",
    commandSent: "Comando enviado al IA IDE:",
    proposal: {
        issues: "Seguimiento de Incidencias: Integrar sistema de tareas con informes de bugs, vincular cambios de código con ID de Issue.",
        commits: "Registros de Commit: Visualizar árbol de Git, clic en commits para ver detalles de tareas y cambios.",
        history: "Historial: Registrar operaciones del sistema y cambios de IA, soporta reversión de código."
    }
  },
  settings: {
    title: "CONFIGURACIÓN DEL SISTEMA",
    subtitle: "CONSOLA CENTRAL /// PREFERENCES_V2",
    general: {
        title: "GENERAL",
        language: "Idioma de la Interfaz",
        languageDesc: "Seleccione el idioma principal para el sistema.",
        profile: "Perfil de Usuario",
        profileDesc: "Gestionado por la configuración del espacio de trabajo activo.",
        adminAccess: "ACCESO_ADMIN",
        workspace: "Espacio de Trabajo",
        workspaceDesc: "Sincronizar tareas con el archivo .taskrails en el directorio local.",
        pickFolder: "Elegir Carpeta",
        workspaceLinked: "Proyecto Vinculado",
        notLinked: "No Vinculado"
    },
    protocols: {
        title: "PROTOCOLOS",
        broadcast: "Transmisión de Identidad",
        broadcastDesc: "Anunciar automáticamente cambios de rol a agentes conectados vía MCP.",
        airlock: "Reinicio Forzado (Airlock)",
        airlockDesc: "Forzar borrado del historial del IDE al cambiar de contexto.",
        comingSoon: "PRÓXIMAMENTE"
    },
    ai: {
        title: "Proveedor de Servicios de IA",
        provider: "Proveedor",
        apiKey: "Clave API",
        model: "Modelo",
        endpoint: "Endpoint Personalizado (Opcional)",
        saveSuccess: "Configuración de IA guardada",
        saveError: "Error al guardar configuración de IA",
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
            custom: "Personalizado (Compatible con OpenAI)"
        }
    }
  },
  airlock: {
    title: "CONTROL DE AIRLOCK // PROTOCOLO DE REVISIÓN",
    status: {
        pending: "PENDIENTE DE APROBACIÓN",
        usage: "USO DE TOKENS",
        risk: "RIESGO"
    },
    actions: {
        reject: "RECHAZAR",
        approve: "APROBAR CAMBIOS"
    }
  }
};
