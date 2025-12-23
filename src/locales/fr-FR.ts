import { TranslationType } from "./zh-TW";

export const fr_FR: TranslationType = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "Importer MD",
    exportMd: "Exporter MD",
    deleteAll: "Tout supprimer",
    deleteAllConfirm: "Êtes-vous sûr de vouloir supprimer toutes les tâches ? Cette action est irréversible.",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette tâche ?",
    importConfirm: "{count} tâches trouvées. Voulez-vous remplacer la liste actuelle ?",
    noTasksFound: "Aucune tâche valide trouvée dans le fichier, veuillez vérifier le format.",
    parseError: "Échec de l'analyse du fichier Markdown."
  },
  sidebar: {
    all: "Toutes les tâches",
    main: "PRINCIPAL",
    roleSettings: "RÔLES",
    kanban: "BRIDGE KANBAN",
    missions: "MISSIONS",
    engineering: "INGÉNIERIE",
    issues: "PROBLÈMES",
    commits: "COMMITS",
    history: "HISTORIQUE",
    specs: "SPÉCIFICATIONS",
    manual: "Manuel",
    admin: "ADMIN",
    system_op: "SYSTEM_OP",
  },
  specs: {
    title: "Spécifications de Conception",
    subtitle: "// Centre de Définition des Besoins et Spécifications //",
    generateAi: "Générer les Specs via l'IA",
    injectTasks: "Déployer sur Kanban",
    selectCategory: "Sélectionner la Catégorie",
    categories: {
        web: "Application Web",
        desktop: "Logiciel de Bureau",
        esp: "Matériel/Firmware (ESP32)",
        backend: "Système Backend/API",
        mobile: "Application Mobile",
        game: "Développement de Jeux",
        web3: "Blockchain/Web3",
        bot: "Bot/Automatisation",
        ml: "Machine Learning/Données",
        extension: "Extension de Navigateur"
    },
    aiChat: {
        title: "Consultant IA en Spécifications",
        placeholder: "Décrivez le logiciel ou les fonctions que vous voulez développer...",
        startConsulting: "Lancer le Conseil Technique",
        stopConsulting: "Arrêter le Conseil",
        applySpec: "Appliquer le Consensus aux Specs",
        aiThinking: "L'IA conçoit l'architecture...",
        welcome: "Bonjour ! Je suis votre architecte technique. Dites-moi ce que vous souhaitez développer, et je vous aiderai à affiner les spécifications via des questions.",
        copy: "Copier",
        stop: "Arrêter",
        systemPrompt: "Prompt Système",
        savePrompt: "Sauvegarder le Prompt",
        copySuccess: "Copié dans le presse-papiers",
        defaultSystemPrompt: `Vous êtes un architecte système senior et un responsable technique. Votre tâche est d'aider l'utilisateur à planifier une "Spécification technique de projet" complète à partir de zéro.
1. Guidage approfondi : Guidez l'utilisateur à réfléchir aux niveaux d'architecture, à la sélection de la pile technique, au schéma de la base de données et aux phases détaillées du développement fonctionnel.
2. Norme linguistique : Utilisez toujours le "Français" pour la communication.
3. Norme de sortie : Lorsque la planification est mûre, suggérez activement ou produisez directement le format JSON suivant :
   \`\`\`json
   { 
     "name": "Nom du projet", 
     "overview": "Vision et aperçu", 
     "techStack": "Liste détaillée de la pile technique", 
     "dataStructure": "Définition de la structure des données", 
     "features": "## Phase 1...\\n## Phase 2...", 
     "design": "Esthétique de conception et normes d'interface utilisateur", 
     "rules": "Principes et normes d'ingénierie" 
   }
   \`\`\``
    },
    placeholders: {
        name: "Nom du Projet",
        overview: "Résumé et objectifs...",
        techStack: "Stack Tech (Frontend, Backend, DB...)",
        dataStructure: "Définition de la Structure de Données...",
        features: "Liste des Fonctions (Triée par Phase 1/2)...",
        design: "Specs de Design (Couleur, Mise en page...)",
        rules: "Règles de Documentation..."
    },
    toast: {
        generated: "Spec IA Générée",
        injected: "{count} tâches importées avec succès",
        apiKeyRequired: "Veuillez d'abord configurer la clé API IA dans les paramètres"
    }
  },
  roleSettings: {
    title: "Paramètres des Rôles",
    subtitle: "Gérer les Agents IA et les Rôles de Collaborateurs",
    defaultRoles: "Rôles par Défaut",
    customRoles: "Rôles Personnalisés",
    addRole: "Ajouter un Rôle",
    roleName: "Nom du Rôle",
    agentName: "Nom de l'Agent",
    roleType: "Type",
    typeAI: "Agent IA",
    typeHuman: "Collaborateur",
    save: "Sauvegarder",
    delete: "Supprimer",
    noCustomRoles: "Aucun rôle personnalisé ajouté"
  },
  roles: {
    coder: "Développeur",
    reviewer: "Réviseur",
    architect: "Architecte",
    all: "Tout le Personnel"
  },
  tags: {
    general: "Général",
    feature: "Fonction",
    bug: "Bug",
    enhancement: "Amélioration",
    documentation: "Docs",
    design: "Design"
  },
  kanban: {
    title: "Tableau de Bord",
    subtitle: "// État du Système : NORMAL //",
    searchPlaceholder: "Rechercher des tâches...",
    newTask: "Nouvelle Tâche",
    columns: {
        todo: "À faire",
        doing: "En cours",
        done: "Terminé"
    },
    taskModal: {
        titlePlaceholder: "Titre de la tâche...",
        descPlaceholder: "Description en Markdown...",
        phase: "Phase",
        priority: "Priorité",
        tag: "Tag",
        created: "Date de création",
        assignee: "Assigné à",
        unassigned: "Non assigné",
        delete: "Supprimer",
        cancel: "Annuler",
        save: "Enregistrer",
        rework: "Retravailler",
        reworkDesc: "Copier le contenu vers 'À faire'",
        completed: "Terminé",
        reworked: "Retravaillé",
        enterNumber: "Entrer un nombre",
        sortOrder: "Ordre (Bas=Haute Priorité)"
    }
  },
  missions: {
    title: "Liste des Missions",
    subtitle: "// Aperçu Global des Tâches //",
    stats: {
      todo: "À faire",
      doing: "En cours",
      done: "Terminé",
      reworked: "Retravaillé"
    },
    search: "Recherche par ID, titre ou description...",
    taskCount: "tâches",
    noTasks: "Aucune tâche pour le moment",
    noMatch: "Aucune correspondance trouvée"
  },
  engineering: {
    title: "Zone d'Ingénierie",
    ideControl: "Centre de Contrôle des Commandes IA IDE",
    debug: "EXÉCUTER DEBUG",
    build: "EXÉCUTER BUILD",
    runApp: "LANCER L'APP",
    commandSent: "Commande envoyée à l'IA IDE :",
    noIssues: "Il n'y a actuellement aucune tâche marquée comme BUG.",
    noHistory: "Aucun historique d'opérations pour le moment",
    commitsDeveloping: "L'intégration de l'historique des commits Git est en cours de développement...",
    proposal: {
        issues: "Suivi des Problèmes : Intègre le système de tâches aux rapports de bugs, liant les changements de code aux IDs de problèmes.",
        commits: "Historique des Commits : Visualise l'arbre Git, cliquez sur les commits pour voir les tâches et les détails.",
        history: "Historique : Enregistre les opérations système et l'historique IA, supporte le retour en arrière."
    }
  },
  settings: {
    title: "Paramètres Système",
    subtitle: "Console Centrale /// PREFERENCES_V2",
    general: {
        title: "Général",
        language: "Langue de l'interface",
        languageDesc: "Sélectionnez la langue principale.",
        profile: "Profil Utilisateur",
        profileDesc: "Géré par le profil de l'espace de travail.",
        adminAccess: "Accès Admin",
        workspace: "Espace de Travail",
        workspaceDesc: "Synchronise les tâches avec le fichier .taskrails local.",
        pickFolder: "Choisir un dossier",
        workspaceLinked: "Projet lié",
        notLinked: "Non lié"
    },
    protocols: {
        title: "Protocoles de Liaison",
        broadcast: "Diffusion d'ID",
        broadcastDesc: "Diffusion auto des changements via MCP aux agents connectés.",
        airlock: "Réinitialisation (Airlock)",
        airlockDesc: "Effacer l'historique de l'IDE lors des changements de contexte.",
        comingSoon: "Bientôt disponible"
    },
    ai: {
        title: "Fournisseur d'IA",
        provider: "Fournisseur",
        apiKey: "Clé API",
        model: "Modèle",
        endpoint: "Endpoint Perso (Optionnel)",
        saveSuccess: "Paramètres IA sauvegardés",
        saveError: "Échec de sauvegarde",
        delete: "Supprimer",
        storedKeys: "Clés stockées",
        noKeys: "Aucune clé stockée",
        providers: {
            openrouter: "OpenRouter (Recommandé)",
            openai: "OpenAI",
            anthropic: "Anthropic",
            google: "Google Gemini",
            xai: "xAI Grok",
            together: "Together AI",
            huggingface: "Hugging Face",
            deepseek: "DeepSeek",
            ollama: "Ollama (Local)",
            custom: "Personnalisé"
        }
    }
  },
  airlock: {
    title: "Contrôle Airlock // Protocole de Revue",
    status: {
        pending: "En attente",
        usage: "USAGE TOKEN",
        risk: "RISQUE"
    },
    risks: {
        low: "Bas",
        medium: "Moyen",
        high: "Élevé"
    },
    actions: {
        reject: "Rejeter",
        approve: "Approuver"
    }
  },
  instruction: {
    title: "Protocoles",
    subtitle: "Manuel Opérationnel",
    banner: "Bienvenue au Centre de Contrôle TaskRails. Ce guide vous aidera à booster votre flux de développement avec l'Architecte IA et le Kanban.",
    modules: {
      objectives: {
        title: "Objectifs de Mission",
        desc: "Le cerveau de votre projet. Chattez avec l'IA pour générer des plans de dév. Les plans peuvent être déployés en un clic sur le Kanban."
      },
      board: {
        title: "Tableau de Mission",
        desc: "Gestion dynamique des tâches. Drag-and-drop, phases et priorités. Les tâches IA sont classées automatiquement."
      },
      role: {
        title: "Contrôle des Rôles",
        desc: "Configurez les agents IA. Paramétrez des prompts uniques pour chaque type d'agent afin de changer leur logique."
      }
    },
    workflow: {
      title: "Flux Standard",
      step1: { title: "Planification", desc: "Allez dans Objectifs de Mission pour commencer à discuter avec l'IA." },
      step2: { title: "Génération Spec", desc: "Après consensus, appliquez la spec IA pour remplir les champs automatiquement." },
      step3: { title: "Déploiement", desc: "Cliquez sur 'DEPLOY TO MISSION BOARD' pour transformer la liste en cartes Kanban." },
      step4: { title: "Exécution", desc: "Gérez les statuts dans le Kanban et suivez les changements dans l'Historique." }
    },
    advanced: {
      title: "Tactiques Avancées",
      mcp: { title: "Support MCP", desc: "Le Model Context Protocol permet aux agents IA d'accéder directement à l'état du Kanban." },
      lang: { title: "Multilingue", desc: "Support complet pour les contextes de développement en plusieurs langues." },
      ui: { title: "Cyberpunk UI", desc: "Interface React 19 + Framer Motion ultra-réactive pour réduire la fatigue visuelle." },
      tip: "Rappel : une bonne planification IA facilite le succès. Vérifiez les titres ## Phase avant de déployer."
    }
  }
};
