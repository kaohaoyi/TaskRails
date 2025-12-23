import { TranslationType } from "./zh-TW";

export const de_DE: TranslationType = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "MD Importieren",
    exportMd: "MD Exportieren",
    deleteAll: "Alle löschen",
    deleteAllConfirm: "Sind Sie sicher, dass Sie alle Aufgaben löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
    deleteConfirm: "Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?",
    importConfirm: "{count} Aufgaben gefunden. Möchten Sie die aktuelle Liste ersetzen?",
    noTasksFound: "Keine gültigen Aufgaben in der Datei gefunden, bitte überprüfen Sie das Format.",
    parseError: "Fehler beim Parsen der Markdown-Datei."
  },
  sidebar: {
    all: "Alle Aufgaben",
    main: "HAUPTMENÜ",
    roleSettings: "ROLLEN",
    kanban: "KANBAN BRIDGE",
    missions: "MISSIONEN",
    engineering: "ENGINEERING",
    issues: "PROBLEME",
    commits: "COMMITS",
    history: "HISTORY",
    specs: "SPEZIFIKATIONEN",
    manual: "Handbuch",
    admin: "ADMIN",
    system_op: "SYSTEM_OP",
  },
  specs: {
    title: "Projektspezifikationen",
    subtitle: "// Zentrum für Anforderungsdefinition //",
    generateAi: "KI-Spezifikation generieren",
    injectTasks: "In Kanban bereitstellen",
    selectCategory: "Kategorie wählen",
    categories: {
        web: "Web-Anwendung",
        desktop: "Desktop-Software",
        esp: "Hardware/Firmware (ESP32)",
        backend: "Backend-System/API",
        mobile: "Mobile APP",
        game: "Spieleentwicklung",
        web3: "Blockchain/Web3",
        bot: "Bot/Automatisierung",
        ml: "Maschinelles Lernen",
        extension: "Browser-Erweiterung"
    },
    aiChat: {
        title: "KI-Spezi-Berater",
        placeholder: "Beschreiben Sie die Software oder Funktionen...",
        startConsulting: "Beratung starten",
        stopConsulting: "Beratung stoppen",
        applySpec: "Konsens anwenden",
        aiThinking: "KI entwirft Architektur...",
        welcome: "Hallo! Ich bin Ihr technischer Architekt. Sagen Sie mir, was Sie entwickeln möchten, und ich helfe Ihnen bei der Spezifikation.",
        copy: "Kopieren",
        stop: "Stopp",
        systemPrompt: "System-Prompt",
        savePrompt: "Prompt speichern",
        copySuccess: "In Zwischenablage kopiert",
        defaultSystemPrompt: `Sie sind ein erfahrener Systemarchitekt und technischer Leiter. Ihre Aufgabe ist es, den Benutzer bei der Planung einer vollständigen "Technischen Projektspezifikation" von Grund auf zu unterstützen.
1. Tiefe Führung: Führen Sie den Benutzer dazu, über Architekturebenen, Tech-Stack-Auswahl, Datenbankschema und detaillierte funktionale Entwicklungsphasen (Phases) nachzudenken.
2. Sprachstandard: Verwenden Sie für die Kommunikation immer "Deutsch".
3. Ausgabestandard: Wenn die Planung ausgereift ist, schlagen Sie aktiv vor oder geben Sie direkt das folgende JSON-Format aus:
   \`\`\`json
   { 
     "name": "Projektname", 
     "overview": "Vision und Überblick", 
     "techStack": "Detaillierte Tech-Stack-Liste", 
     "dataStructure": "Datenstrukturdefinition", 
     "features": "## Phase 1...\\n## Phase 2...", 
     "design": "Designästhetik und UI-Standards", 
     "rules": "Engineering-Prinzipien und Standards" 
   }
   \`\`\``
    },
    placeholders: {
        name: "Projektname",
        overview: "Projektüberblick...",
        techStack: "Tech-Stack (Frontend, Backend, DB...)",
        dataStructure: "Datenstruktur-Definition...",
        features: "Funktionsliste (Sortiert nach Phase 1/2)...",
        design: "Design-Spezi (Farbe, Layout...)",
        rules: "Dokumentationsregeln..."
    },
    toast: {
        generated: "KI-Spezi generiert",
        injected: "{count} Aufgaben erfolgreich importiert",
        apiKeyRequired: "Bitte konfigurieren Sie zuerst den KI-API-Schlüssel"
    }
  },
  roleSettings: {
    title: "Rollen-Einstellungen",
    subtitle: "KI-Agenten und Mitarbeiter-Rollen verwalten",
    defaultRoles: "Standardrollen",
    customRoles: "Eigene Rollen",
    addRole: "Rolle hinzufügen",
    roleName: "Rollenname",
    agentName: "Agentenname",
    roleType: "Typ",
    typeAI: "KI-Agent",
    typeHuman: "Mitarbeiter",
    save: "Speichern",
    delete: "Löschen",
    noCustomRoles: "Noch keine eigenen Rollen hinzugefügt"
  },
  roles: {
    coder: "Entwickler",
    reviewer: "Prüfer",
    architect: "Architekt",
    all: "Alle Mitarbeiter"
  },
  tags: {
    general: "Allgemein",
    feature: "Funktion",
    bug: "Fehler",
    enhancement: "Optimierung",
    documentation: "Doku",
    design: "Design"
  },
  kanban: {
    title: "Projekt-Dashboard",
    subtitle: "// Systemstatus: NORMAL //",
    searchPlaceholder: "Aufgaben suchen...",
    newTask: "Neue Aufgabe",
    columns: {
        todo: "To-Do",
        doing: "In Arbeit",
        done: "Erledigt"
    },
    taskModal: {
        titlePlaceholder: "Aufgabentitel...",
        descPlaceholder: "Beschreibung mit Markdown...",
        phase: "Phase",
        priority: "Priorität",
        tag: "Tag",
        created: "Erstellt am",
        assignee: "Zuständig",
        unassigned: "Nicht zugewiesen",
        delete: "Löschen",
        cancel: "Abbrechen",
        save: "Speichern",
        rework: "Nachbearbeiten",
        reworkDesc: "Inhalt zurück zu To-Do kopieren",
        completed: "Abgeschlossen",
        reworked: "Nachbearbeitet",
        enterNumber: "Nummer eingeben",
        sortOrder: "Sortierung (Niedrig=Hohe Prio)"
    }
  },
  missions: {
    title: "Missionsliste",
    subtitle: "// Aufgabenübersicht //",
    stats: {
      todo: "To-Do",
      doing: "In Arbeit",
      done: "Erledigt",
      reworked: "Nachbearbeitet"
    },
    search: "Nach ID, Titel oder Beschreibung suchen...",
    taskCount: "Aufgaben",
    noTasks: "Noch keine Aufgaben",
    noMatch: "Keine Treffer gefunden"
  },
  engineering: {
    title: "Engineering-Bereich",
    ideControl: "KI-IDE-Kontrollzentrum",
    debug: "DEBUG AUSFÜHREN",
    build: "BUILD AUSFÜHREN",
    runApp: "APP STARTEN",
    commandSent: "Befehl an KI-IDE gesendet:",
    noIssues: "Aktuell gibt es keine als BUG markierten Aufgaben.",
    noHistory: "Noch kein Operationsverlauf vorhanden",
    commitsDeveloping: "Die Integration der Git-Commit-Historie ist in Entwicklung...",
    proposal: {
        issues: "Fehler-Tracking: Integriert Aufgabensystem mit Bug-Reports, verknüpft Code-Änderungen mit Issue-IDs.",
        commits: "Commit-Historie: Visualisiert Git-Baum, Commits anklicken für Aufgaben und Code-Details.",
        history: "Historie: Protokolliert Systemoperationen und KI-Änderungsverlauf."
    }
  },
  settings: {
    title: "System-Einstellungen",
    subtitle: "Kernkonsole /// PREFERENCES_V2",
    general: {
        title: "Allgemein",
        language: "Sprache",
        languageDesc: "Wählen Sie die Anzeigesprache.",
        profile: "Benutzerprofil",
        profileDesc: "Wird durch das aktuelle Workspace verwaltet.",
        adminAccess: "Admin-Zugriff",
        workspace: "Arbeitsbereich",
        workspaceDesc: "Synchronisiert Aufgaben mit der .taskrails-Datei.",
        pickFolder: "Ordner Wählen",
        workspaceLinked: "Projekt Verknüpft",
        notLinked: "Nicht Verknüpft"
    },
    protocols: {
        title: "Protokolle",
        broadcast: "ID-Broadcast",
        broadcastDesc: "Automatische Rollenänderungen via MCP an Agenten senden.",
        airlock: "Hard Reset (Airlock)",
        airlockDesc: "IDE-Verlauf bei Kontextwechseln löschen.",
        comingSoon: "Demnächst"
    },
    ai: {
        title: "KI-Anbieter",
        provider: "Anbieter",
        apiKey: "API-Schlüssel",
        model: "Modell",
        endpoint: "Eigener Endpunkt (Optional)",
        saveSuccess: "KI-Einstellungen gespeichert",
        saveError: "Fehler beim Speichern",
        delete: "Schlüssel löschen",
        storedKeys: "Gespeicherte Schlüssel",
        noKeys: "Noch keine Schlüssel gespeichert",
        providers: {
            openrouter: "OpenRouter (Empfohlen)",
            openai: "OpenAI",
            anthropic: "Anthropic",
            google: "Google Gemini",
            xai: "xAI Grok",
            together: "Together AI",
            huggingface: "Hugging Face",
            deepseek: "DeepSeek",
            ollama: "Ollama (Local)",
            custom: "Benutzerdefiniert"
        }
    }
  },
  airlock: {
    title: "Airlock-Steuerung // Review-Protokoll",
    status: {
        pending: "Wartet auf Freigabe",
        usage: "TOKEN-VERBRAUCH",
        risk: "RISIKO"
    },
    risks: {
        low: "Niedrig",
        medium: "Mittel",
        high: "Hoch"
    },
    actions: {
        reject: "Ablehnen",
        approve: "Änderungen bestätigen"
    }
  },
  instruction: {
    title: "Protokolle",
    subtitle: "Handbuch",
    banner: "Willkommen im TaskRails-Kontrollzentrum. Dieser Guide hilft Ihnen, Ihren Workflow mit dem KI-Architekten und Kanban zu optimieren.",
    modules: {
      objectives: {
        title: "Missionsziele",
        desc: "Das Gehirn Ihres Projekts. Chatten Sie mit dem KI-Architekten, um Tech-Stacks und Pläne zu erstellen. Pläne können direkt ins Kanban 'bereitgestellt' werden."
      },
      board: {
        title: "Missions-Board",
        desc: "Dynamisches Aufgabenmanagement. Mit Drag-and-Drop, Phasen-Sortierung und Prioritäts-Tags. KI-Aufgaben werden automatisch klassifiziert."
      },
      role: {
        title: "Rollen-Kontrolle",
        desc: "Konfigurieren Sie KI-Agenten. Legen Sie eigene System-Prompts für Entwickler oder Architekten fest."
      }
    },
    workflow: {
      title: "Standard-Workflow",
      step1: { title: "Planung starten", desc: "Gehen Sie zu Missionsziele und starten Sie die KI-Beratung." },
      step2: { title: "Spezi generieren", desc: "Klicken Sie auf 'KI-Spezi anwenden', um Felder automatisch zu füllen." },
      step3: { title: "Aufgaben ausrollen", desc: "Klicken Sie auf 'DEPLOY TO MISSION BOARD', um Karten zu erstellen." },
      step4: { title: "Entwicklung", desc: "Verwalten Sie den Status im Kanban und verfolgen Sie Änderungen in der Historie." }
    },
    advanced: {
      title: "Fortgeschrittene Taktiken",
      mcp: { title: "MCP-Unterstützung", desc: "Model Context Protocol erlaubt KI-Agenten direkten Zugriff auf den Kanban-Status." },
      lang: { title: "Mehrsprachigkeit", desc: "Volle Unterstützung für mehrsprachige Entwicklung." },
      ui: { title: "Cyberpunk UI", desc: "Reaktionsschnelles React 19 + Framer Motion Interface." },
      tip: "Gute KI-Planung ist der halbe Erfolg. Prüfen Sie ## Phase-Header vor dem Bereitstellen."
    }
  }
};
