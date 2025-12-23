export const ja_JP = {
  common: {
    appName: "TaskRails",
    version: "v2.0",
    importMd: "MDをインポート",
    exportMd: "MDをエクスポート",
    deleteAll: "すべて削除",
    deleteAllConfirm: "すべてのタスクを削除してもよろしいですか？この操作は取り消せません。",
    importConfirm: "{count}個のタスクが見つかりました。現在のリストを置き換えますか？",
    noTasksFound: "有効なタスクが見つかりませんでした。フォーマットを確認してください。"
  },
  sidebar: {
    main: "メイン機能",
    roleSettings: "ロール設定",
    kanban: "カンバンボード",
    missions: "ミッションリスト",
    engineering: "エンジニアリング",
    issues: "課題管理",
    commits: "コミット履歴",
    history: "操作履歴",
    specs: "設計仕様書",
    admin: "管理者",
    system_op: "システム操作",
  },
  specs: {
    title: "プロジェクト設計仕様書",
    subtitle: "// 仕様・要件定義センター //",
    generateAi: "AIで仕様を自動生成",
    injectTasks: "カンバンへ書き出し",
    selectCategory: "プロジェクト種別を選択",
    categories: {
        web: "Webアプリ",
        desktop: "デスクトップアプリ",
        esp: "ハードウェア/ファームウェア (ESP32)",
        backend: "バックエンド/API",
        mobile: "モバイルアプリ",
        game: "ゲーム開発",
        web3: "ブロックチェーン/Web3",
        bot: "ボット/自動化",
        ml: "機械学習/AIデータ",
        extension: "ブラウザ拡張機能"
    },
    aiChat: {
        title: "仕様策定AIコンサルタント",
        placeholder: "開発したいソフトウェアや機能について説明してください...",
        startConsulting: "テクニカルコンサル開始",
        stopConsulting: "コンサル停止",
        applySpec: "合意事項を仕様書に反映",
        aiThinking: "AIがアーキテクチャを設計中...",
        welcome: "こんにちは！私はあなたのテクニカルアーキテクトです。開発したいものについて教えてください。質問を通じて仕様書の完成をお手伝いします。"
    },
    placeholders: {
        name: "プロジェクト名",
        overview: "プロジェクト概要と目標...",
        techStack: "技術スタック (Frontend, Backend, DB...)",
        dataStructure: "データ構造の定義...",
        features: "コア機能リスト (Phase 1/2順)...",
        design: "ガイドライン (配色, レイアウト...)",
        rules: "プロジェクト文書ルール..."
    },
    toast: {
        generated: "AI仕様書が生成されました",
        injected: "{count}個のタスクをカンバンにインポートしました",
        apiKeyRequired: "設定でAI APIキーを配置してください"
    }
  },
  roleSettings: {
    title: "タスクロール設定",
    subtitle: "AIエージェントと共同作業者のロールを管理",
    defaultRoles: "デフォルトロール",
    customRoles: "カスタムロール",
    addRole: "ロールを追加",
    roleName: "ロール名",
    agentName: "エージェント名",
    roleType: "タイプ",
    typeAI: "AIエージェント",
    typeHuman: "共同作業者",
    save: "保存",
    delete: "削除",
    noCustomRoles: "カスタムロールはまだありません"
  },
  roles: {
    coder: "開発者",
    reviewer: "レビュアー",
    architect: "アーキテクト",
    all: "全メンバー"
  },
  tags: {
    general: "一般",
    feature: "機能",
    bug: "バグ",
    enhancement: "改善",
    documentation: "ドキュメント",
    design: "デザイン"
  },
  kanban: {
    title: "プロジェクトダッシュボード",
    subtitle: "// システムステータス：正常 //",
    searchPlaceholder: "タスクを検索...",
    newTask: "新規タスク",
    columns: {
        todo: "未着手",
        doing: "着手中",
        done: "完了"
    },
    taskModal: {
        titlePlaceholder: "タスク名...",
        descPlaceholder: "Markdownで説明を記述...",
        phase: "フェーズ",
        priority: "優先度",
        tag: "タグ",
        created: "作成日",
        assignee: "担当者",
        unassigned: "未割り当て",
        delete: "削除",
        cancel: "キャンセル",
        save: "変更を保存",
        rework: "リワーク",
        reworkDesc: "内容を未着手にコピー戻し",
        completed: "完了済み",
        reworked: "リワーク済み",
        enterNumber: "数値を入力",
        sortOrder: "表示順 (低=高優先)"
    }
  },
  missions: {
    title: "タスクリスト",
    subtitle: "// 全タスク一覧 //",
    stats: {
      todo: "未着手",
      doing: "着手中",
      done: "完了",
      reworked: "リワーク"
    },
    search: "タスクID、タイトル、説明で検索...",
    taskCount: "件のタスク",
    noTasks: "タスクがありません",
    noMatch: "一致するタスクが見つかりません"
  },
  engineering: {
    title: "エンジニアリングエリア",
    ideControl: "AI IDE コマンドコントロールセンター",
    debug: "DEBUG実行",
    build: "BUILD実行",
    runApp: "アプリ起動",
    commandSent: "AI IDEにコマンドを送信しました：",
    proposal: {
        issues: "課題管理案：タスクシステムとバグ報告を統合し、コード変更とIssue IDを自動リンク。",
        commits: "コミット履歴案：Gitツリーを視覚化し、コミットをクリックしてタスクとコード変更の詳細を確認。",
        history: "操作履歴案：システムのコア操作とAIの変更履歴を記録し、コードのロールバックをサポート。"
    }
  },
  settings: {
    title: "システム設定",
    subtitle: "コアコンソール /// PREFERENCES_V2",
    general: {
        title: "一般設定",
        language: "表示言語",
        languageDesc: "システムの主要な表示言語を選択します。",
        profile: "ユーザープロファイル",
        profileDesc: "現在のアクティブなワークスペース設定によって管理されます。",
        adminAccess: "管理者権限",
        workspace: "プロジェクトワークスペース",
        workspaceDesc: "ローカルディレクトリの .taskrails ファイルとタスクを同期します。",
        pickFolder: "フォルダを選択",
        workspaceLinked: "リンク済み",
        notLinked: "未リンク"
    },
    protocols: {
        title: "接続プロトコル",
        broadcast: "IDブロードキャスト",
        broadcastDesc: "MCPを介して接続されたエージェントに役割の変更を自動的にアナウンスします。",
        airlock: "ハードリセット (エアロック)",
        airlockDesc: "コンテキスト切り替え時にIDE履歴を強制的に消去します。",
        comingSoon: "近日公開"
    },
    ai: {
        title: "AIサービスプロバイダー",
        provider: "プロバイダー",
        apiKey: "APIキー",
        model: "モデル",
        endpoint: "カスタムエンドポイント (任意)",
        saveSuccess: "AI設定を保存しました",
        saveError: "AI設定の保存に失敗しました",
        delete: "キーを削除",
        storedKeys: "保存済みキー",
        noKeys: "保存されたキーはありません",
        providers: {
            openrouter: "OpenRouter (推奨)",
            openai: "OpenAI",
            anthropic: "Anthropic",
            google: "Google Gemini",
            xai: "xAI Grok",
            together: "Together AI",
            huggingface: "Hugging Face",
            deepseek: "DeepSeek",
            ollama: "Ollama (ローカル)",
            custom: "カスタム (OpenAI互換)"
        }
    }
  },
  airlock: {
    title: "エアロック制御 // コードレビュープロトコル",
    status: {
        pending: "承認待ち",
        usage: "トークン使用量",
        risk: "リスク"
    },
    actions: {
        reject: "拒否",
        approve: "変更を承認"
    }
  }
};
