export const fr_FR = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "Importer MD",
    exportMd: "Exporter MD",
    deleteAll: "Tout supprimer",
    deleteAllConfirm: "Êtes-vous sûr de vouloir supprimer toutes les tâches ? Cette action est irréversible.",
    importConfirm: "{count} tâches trouvées. Voulez-vous remplacer la liste actuelle ?",
    noTasksFound: "Aucune tâche valide trouvée dans le fichier, veuillez vérifier le format."
  },
  sidebar: {
    main: "PRINCIPAL",
    roleSettings: "RÔLES",
    kanban: "TABLEAU KANBAN",
    missions: "MISSIONS",
    engineering: "INGÉNIERIE",
    issues: "PROBLÈMES",
    commits: "COMMITS",
    history: "HISTORIQUE",
    specs: "SPÉCIFICATIONS",
    admin: "ADMIN",
    system_op: "OPÉRATEUR_SYSTÈME",
  },
  specs: {
    title: "Spécifications de Design",
    subtitle: "// Centre de Définition des Besoins et Spécifications //",
    generateAi: "Générer Spécifications via IA",
    injectTasks: "Injecter au Kanban",
    selectCategory: "Sélectionner une Catégorie",
    categories: {
        web: "Application Web",
        desktop: "Application Bureau",
        esp: "Matériel/Firmware (ESP32)",
        backend: "Système Backend/API",
        mobile: "Application Mobile",
        game: "Développement de Jeux",
        web3: "Blockchain/Web3",
        bot: "Bot/Automatisation",
        ml: "Machine Learning/Données IA",
        extension: "Extension Navigateur"
    },
    aiChat: {
        title: "Consultant IA Spécifications",
        placeholder: "Décrivez le logiciel ou la fonctionnalité que vous souhaitez développer...",
        startConsulting: "Lancer le Conseil Technique",
        stopConsulting: "Arrêter le Conseil",
        applySpec: "Appliquer le Consensus aux Specs",
        aiThinking: "L'IA conçoit l'architecture...",
        welcome: "Bonjour ! Je suis votre architecte technique. Dites-moi ce que vous souhaitez développer, et je vous aiderai à perfectionner le document de spécifications via des questions."
    },
    placeholders: {
        name: "Nom du Projet",
        overview: "Aperçu et Objectifs du Projet...",
        techStack: "Stack Technique (Frontend, Backend, DB...)",
        dataStructure: "Définition de la Structure des Données...",
        features: "Liste des Fonctionnalités (Phase 1/2)...",
        design: "Normes de Design (Couleurs, Mise en page...)",
        rules: "Règles de Documentation du Projet..."
    },
    toast: {
        generated: "Spécifications IA Générées",
        injected: "{count} tâches injectées avec succès au Kanban",
        apiKeyRequired: "Veuillez configurer la clé API IA dans les paramètres"
    }
  },
  roleSettings: {
    title: "Paramètres des Rôles",
    subtitle: "Gérer les Agents IA et les Rôles des Collaborateurs",
    defaultRoles: "Rôles par Défaut",
    customRoles: "Rôles Personnalisés",
    addRole: "Ajouter un Rôle",
    roleName: "Nom du Rôle",
    agentName: "Nom de l'Agent",
    roleType: "Type",
    typeAI: "Agent IA",
    typeHuman: "Collaborateur",
    save: "Enregistrer",
    delete: "Supprimer",
    noCustomRoles: "Aucun rôle personnalisé ajouté pour le moment"
  },
  roles: {
    coder: "DÉVELOPPEUR",
    reviewer: "RÉVISEUR",
    architect: "ARCHITECTE",
    all: "TOUT LE PERSONNEL"
  },
  tags: {
    general: "Général",
    feature: "Fonctionnalité",
    bug: "Bug",
    enhancement: "Optimisation",
    documentation: "Documentation",
    design: "Design"
  },
  kanban: {
    title: "Tableau du Projet",
    subtitle: "// ÉTAT DU SYSTÈME : NORMAL //",
    searchPlaceholder: "Rechercher des tâches...",
    newTask: "NOUVELLE TÂCHE",
    columns: {
        todo: "À FAIRE",
        doing: "EN COURS",
        done: "TERMINÉ"
    },
    taskModal: {
        titlePlaceholder: "Titre de la tâche...",
        descPlaceholder: "Écrire la description en Markdown...",
        phase: "Phase",
        priority: "Priorité",
        tag: "Tag",
        created: "Date de Création",
        assignee: "Assigné à",
        unassigned: "Non assigné",
        delete: "Supprimer",
        cancel: "Annuler",
        save: "Enregistrer les Changements",
        rework: "Reprise",
        reworkDesc: "Copier le contenu vers À Faire",
        completed: "Terminé",
        reworked: "Repris",
        enterNumber: "Entrer un nombre",
        sortOrder: "Ordre de tri (Bas=Haute Priorité)"
    }
  },
  missions: {
    title: "Liste des Missions",
    subtitle: "// APERÇU DE TOUTES LES MISSIONS //",
    stats: {
      todo: "À FAIRE",
      doing: "EN COURS",
      done: "TERMINÉ",
      reworked: "REPRIS"
    },
    search: "Rechercher ID, Titre ou Description...",
    taskCount: "tâches",
    noTasks: "Aucune tâche pour le moment",
    noMatch: "Aucune tâche correspondante trouvée"
  },
  engineering: {
    title: "Espace Ingénierie",
    ideControl: "Centre de Contrôle des Commandes IA IDE",
    debug: "LANCER DEBUG",
    build: "LANCER BUILD",
    runApp: "LANCER APP",
    commandSent: "Commande envoyée à l'IA IDE :",
    proposal: {
        issues: "Suivi des Problèmes : Intégrer le système de tâches aux rapports de bugs, lier auto les changements de code à l'ID Issue.",
        commits: "Registres de Commit : Visualiser l'arbre Git, cliquer sur les commits pour voir les détails des tâches et changements.",
        history: "Historique : Enregistrer les opérations système et l'historique des changements IA, supporte le retour en arrière."
    }
  },
  settings: {
    title: "PARAMÈTRES SYSTÈME",
    subtitle: "CONSOLE CENTRALE /// PREFERENCES_V2",
    general: {
        title: "GÉNÉRAL",
        language: "Langue de l'interface",
        languageDesc: "Sélectionnez la langue d'affichage principale du système.",
        profile: "Profil Utilisateur",
        profileDesc: "Géré par la configuration de l'espace de travail actif.",
        adminAccess: "ACCÈS_ADMIN",
        workspace: "Espace de Travail",
        workspaceDesc: "Synchroniser les tâches avec le fichier .taskrails dans le répertoire local.",
        pickFolder: "Choisir un Dossier",
        workspaceLinked: "Projet Lié",
        notLinked: "Non Lié"
    },
    protocols: {
        title: "PROTOCOLES",
        broadcast: "Diffusion d'Identité",
        broadcastDesc: "Annoncer automatiquement les changements de rôle aux agents connectés via MCP.",
        airlock: "Réinitialisation Forcée (Sas)",
        airlockDesc: "Effacer l'historique de l'IDE lors du changement de contexte.",
        comingSoon: "BIENTÔT DISPONIBLE"
    },
    ai: {
        title: "Fournisseur de Services IA",
        provider: "Fournisseur",
        apiKey: "Clé API",
        model: "Modèle",
        endpoint: "Endpoint Personnalisé (Optionnel)",
        saveSuccess: "Paramètres IA enregistrés",
        saveError: "Erreur lors de l'enregistrement des paramètres IA",
        delete: "Supprimer la Clé",
        storedKeys: "Clés Stockées",
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
            custom: "Personnalisé (Compatible OpenAI)"
        }
    }
  },
  airlock: {
    title: "CONTRÔLE DU SAS // PROTOCOLE DE RÉVISION",
    status: {
        pending: "EN ATTENTE D'APPROBATION",
        usage: "UTILISATION JETONS",
        risk: "RISQUE"
    },
    actions: {
        reject: "REJETER",
        approve: "APPROUVER CHANGEMENTS"
    }
  }
};
