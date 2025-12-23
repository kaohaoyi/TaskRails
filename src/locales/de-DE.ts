export const de_DE = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "MD importieren",
    exportMd: "MD exportieren",
    deleteAll: "Alle löschen",
    deleteAllConfirm: "Sind Sie sicher, dass Sie alle Aufgaben löschen möchten? Diese Aktion kann nicht rückgänging gemacht werden.",
    importConfirm: "{count} Aufgaben gefunden. Möchten Sie die aktuelle Liste ersetzen?",
    noTasksFound: "Keine gültigen Aufgaben in der Datei gefunden, bitte Format prüfen."
  },
  sidebar: {
    main: "HAUPTMENÜ",
    roleSettings: "ROLLEN",
    kanban: "KANBAN-BOARD",
    missions: "MISSIONEN",
    engineering: "ENTWICKLUNG",
    issues: "PROBLEME",
    commits: "COMMITS",
    history: "VERLAUF",
    specs: "SPEZIFIKATIONEN",
    admin: "ADMIN",
    system_op: "SYSTEM_OP",
  },
  specs: {
    title: "Projektdesign-Spezifikationen",
    subtitle: "// Projekt-Spezifikationen & Anforderungsdefinitions-Zentrum //",
    generateAi: "KI-Smart-Generierung",
    injectTasks: "In Kanban übertragen",
    selectCategory: "Projektkategorie auswählen",
    categories: {
        web: "Web-Anwendung",
        desktop: "Desktop-App",
        esp: "Hardware/Firmware (ESP32)",
        backend: "Backend-System/API",
        mobile: "Mobile APP",
        game: "Spieleentwicklung",
        web3: "Blockchain/Web3",
        bot: "Bot/Automatisierung",
        ml: "Maschinelles Lernen/KI-Daten",
        extension: "Browser-Erweiterung"
    },
    aiChat: {
        title: "Spezifikations-KI-Berater",
        placeholder: "Beschreiben Sie die Software oder Funktion, die Sie entwickeln möchten...",
        startConsulting: "Technische Beratung starten",
        stopConsulting: "Beratung stoppen",
        applySpec: "Konsens auf Spezifikation anwenden",
        aiThinking: "KI entwirft Architektur...",
        welcome: "Hallo! Ich bin Ihr technischer Architekt. Sagen Sie mir, was Sie entwickeln möchten, und ich werde Ihnen helfen, das Spezifikationsdokument durch Fragen zu perfektionieren."
    },
    placeholders: {
        name: "Projektname",
        overview: "Projektübersicht & Ziele...",
        techStack: "Tech-Stack (Frontend, Backend, DB...)",
        dataStructure: "Datenstruktur-Definition...",
        features: "Kernfunktionsliste (Sortiert nach Phase 1/2)...",
        design: "Design-Standards (Farben, Layout...)",
        rules: "Projekt-Dokumentationsregeln..."
    },
    toast: {
        generated: "KI-Spezifikation generiert",
        injected: "{count} Aufgaben erfolgreich in Kanban übertragen",
        apiKeyRequired: "Bitte konfigurieren Sie zuerst den KI-API-Schlüssel in den Einstellungen"
    }
  },
  roleSettings: {
    title: "Aufgabenrollen-Einstellungen",
    subtitle: "KI-Agenten und Kollaborationsrollen verwalten",
    defaultRoles: "Standard-Rollen",
    customRoles: "Benutzerdefinierte Rollen",
    addRole: "Rolle hinzufügen",
    roleName: "Rollenname",
    agentName: "Agentenname",
    roleType: "Typ",
    typeAI: "KI-Agent",
    typeHuman: "Kollaborateur",
    save: "Speichern",
    delete: "Löschen",
    noCustomRoles: "Noch keine benutzerdefinierten Rollen hinzugefügt"
  },
  roles: {
    coder: "ENTWICKLER",
    reviewer: "PRÜFER",
    architect: "ARCHITEKT",
    all: "ALLE PERSONEN"
  },
  tags: {
    general: "Allgemein",
    feature: "Feature",
    bug: "Bug",
    enhancement: "Optimierung",
    documentation: "Dokumentation",
    design: "Design"
  },
  kanban: {
    title: "Projekt-Dashboard",
    subtitle: "// SYSTEMSTATUS: NORMAL //",
    searchPlaceholder: "Aufgaben suchen...",
    newTask: "NEUE AUFGABE",
    columns: {
        todo: "OFFEN",
        doing: "IN BEARBEITUNG",
        done: "ERLEDIGT"
    },
    taskModal: {
        titlePlaceholder: "Aufgabentitel...",
        descPlaceholder: "Beschreibung mit Markdown verfassen...",
        phase: "Phase",
        priority: "Priorität",
        tag: "Tag",
        created: "Erstellungsdatum",
        assignee: "Verantwortlicher",
        unassigned: "Nicht zugewiesen",
        delete: "Löschen",
        cancel: "Abbrechen",
        save: "Änderungen speichern",
        rework: "Nachbearbeitung",
        reworkDesc: "Inhalt zurück nach Offen kopieren",
        completed: "Abgeschlossen",
        reworked: "Nachbearbeitet",
        enterNumber: "Nummer eingeben",
        sortOrder: "Sortierreihenfolge (Niedrig=Hohe Priorität)"
    }
  },
  missions: {
    title: "Missionsliste",
    subtitle: "// ÜBERSICHT ALLER MISSIONEN //",
    stats: {
      todo: "OFFEN",
      doing: "IN BEARBEITUNG",
      done: "ERLEDIGT",
      reworked: "NACHBEARBEITET"
    },
    search: "Aufgaben-ID, Titel oder Beschreibung suchen...",
    taskCount: "Aufgaben",
    noTasks: "Noch keine Aufgaben",
    noMatch: "Keine übereinstimmenden Aufgaben gefunden"
  },
  engineering: {
    title: "Engineering-Bereich",
    ideControl: "KI-IDE Befehlskontrollzentrum",
    debug: "DEBUG AUSFÜHREN",
    build: "BUILD AUSFÜHREN",
    runApp: "APP AUSFÜHREN",
    commandSent: "Befehl an KI-IDE gesendet:",
    proposal: {
        issues: "Problemverfolgung: Aufgabensystem mit Fehlerberichten integrieren, Codeänderungen automatisch mit Issue-ID verknüpfen.",
        commits: "Commit-Aufzeichnungen: Git-Baum visualisieren, Commits anklicken, um Aufgaben- und Codeänderungsdetails anzuzeigen.",
        history: "Verlauf: Aufzeichnung wichtiger Systemvorgänge und KI-Änderungsverlauf, unterstützt Code-Rollbacks."
    }
  },
  settings: {
    title: "SYSTEMEINSTELLUNGEN",
    subtitle: "KERNKONSOLE /// PREFERENCES_V2",
    general: {
        title: "ALLGEMEIN",
        language: "Sprache",
        languageDesc: "Wählen Sie die primäre Anzeigesprache für das System.",
        profile: "Benutzerprofil",
        profileDesc: "Verwaltet durch die aktive Arbeitsbereichkonfiguration.",
        adminAccess: "ADMIN_ZUGRIFF",
        workspace: "Projekt-Arbeitsbereich",
        workspaceDesc: "Aufgaben mit .taskrails-Datei im lokalen Projektverzeichnis synchronisieren.",
        pickFolder: "Ordner auswählen",
        workspaceLinked: "Projekt verknüpft",
        notLinked: "Nicht verknüpft"
    },
    protocols: {
        title: "PROTOKOLLE",
        broadcast: "Identitätsübertragung",
        broadcastDesc: "Rollenänderungen automatisch über MCP an verbundene Agenten senden.",
        airlock: "Harter Reset (Schleuse)",
        airlockDesc: "Löschen des IDE-Verlaufs bei Kontextwechsel erzwingen.",
        comingSoon: "DEMNÄCHST"
    },
    ai: {
        title: "KI-Dienstanbieter",
        provider: "Anbieter",
        apiKey: "API-Schlüssel",
        model: "Modell",
        endpoint: "Benutzerdefinierter Endpunkt (Optional)",
        saveSuccess: "KI-Einstellungen gespeichert",
        saveError: "KI-Einstellungen konnten nicht gespeichert werden",
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
            ollama: "Ollama (Lokal)",
            custom: "Benutzerdefiniert (OpenAI-kompatibel)"
        }
    }
  },
  airlock: {
    title: "SCHLEUSENKONTROLLE // CODE-REVIEW-PROTOKOLL",
    status: {
        pending: "GENEHMIGUNG AUSSTEHEND",
        usage: "TOKEN-VERBRAUCH",
        risk: "RISIKO"
    },
    actions: {
        reject: "ABLEHNEN",
        approve: "ÄNDERUNGEN GENEHMIGEN"
    }
  }
};
