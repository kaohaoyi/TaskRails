import { useState, useEffect } from 'react';
import { Sparkles, Send, Trash2, Layout, Code, Database, ListChecks, Palette, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface SpecData {
    name: string;
    overview: string;
    techStack: string;
    dataStructure: string;
    features: string;
    design: string;
    rules: string;
}

interface SpecPageProps {
    onInjectTasks?: (features: string) => void;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function SpecPage({ onInjectTasks, onShowToast }: SpecPageProps) {
    const t = useTranslation();
    const st = t.specs;

    const [spec, setSpec] = useState<SpecData>({
        name: '',
        overview: '',
        techStack: '',
        dataStructure: '',
        features: '',
        design: '',
        rules: ''
    });

    const [category, setCategory] = useState<'web' | 'desktop' | 'esp' | 'backend' | 'mobile' | 'game' | 'web3' | 'bot' | 'ml' | 'extension'>('web');
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'assistant' | 'user', content: string }[]>([
        { role: 'assistant', content: st.aiChat.welcome }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<string>('openai');
    const [currentModel, setCurrentModel] = useState<string>('gpt-4o');
    const [availableProviders, setAvailableProviders] = useState<string[]>(['openai']);

    const providerModels: Record<string, string[]> = {
        openrouter: ['auto', 'openai/gpt-5.2-instant', 'anthropic/claude-4.5-opus', 'google/gemini-3-pro', 'deepseek/deepseek-v3.2'],
        openai: ['gpt-5.2-professional', 'gpt-5.2-thinking', 'gpt-5.2-instant', 'o3-mini', 'gpt-4o'],
        anthropic: ['claude-4.5-opus', 'claude-4.5-sonnet', 'claude-4.5-haiku'],
        google: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'],
        xai: ['grok-4.1-emotional', 'grok-4.1-fast', 'grok-2.5'],
        together: ['deepseek/deepseek-v3', 'meta-llama/Llama-4-70b-instruct', 'moonshotai/Kimi-K2-Thinking'],
        huggingface: ['mistralai/Mistral-v5-7B', 'meta-llama/Llama-4-8B-Instruct', 'google/gemma-3-9b'],
        deepseek: ['deepseek-v3.2-speciale', 'deepseek-v3.2', 'deepseek-math-v2'],
        ollama: ['llama4', 'mistral-v5', 'deepseek-v3.2', 'phi-4'],
        custom: ['openai-compatible']
    };

    useEffect(() => {
        const checkKeys = async () => {
            const available: string[] = [];
            // Ollama and Custom are usually available even without keys in settings
            available.push('ollama', 'custom'); 
            
            for (const p of Object.keys(providerModels)) {
                if (p === 'ollama' || p === 'custom') continue;
                try {
                    const key = await invoke<string | null>('get_setting', { key: `ai_api_key_${p}` });
                    if (key && key.trim().length > 0) {
                        available.push(p);
                    }
                } catch (e) {
                    console.error(`Error checking key for ${p}:`, e);
                }
            }
            setAvailableProviders(available);
            
            // Set default to first available
            const globalProvider = await invoke<string | null>('get_setting', { key: 'ai_provider' });
            if (globalProvider && available.includes(globalProvider)) {
                setCurrentProvider(globalProvider);
                const globalModel = await invoke<string | null>('get_setting', { key: 'ai_model' });
                if (globalModel) setCurrentModel(globalModel);
            } else if (available.length > 0) {
                const first = available.includes('openai') ? 'openai' : available[0];
                setCurrentProvider(first);
                setCurrentModel(providerModels[first][0]);
            }
        };
        checkKeys();
    }, []);

    const templates: Record<string, SpecData> = {
        web: {
            name: "New Web Application",
            overview: "一個基於 AI 的個人助理網頁應用，專注於垂直領域的效率提升。",
            techStack: "- Frontend: React, Vite, Tailwind CSS, Lucide Icons\n- Backend: Node.js, Express, Tauri (Desktop)\n- Database: SQLite with Rusqlite",
            dataStructure: "**User:**\n- id: UUID\n- name: String\n- settings: JSON\n\n**Task:**\n- id: String\n- title: String\n- status: Enum (todo, doing, done)",
            features: "## Phase 1: MVP\n1. 核心看板介面開發\n2. SQLite 資料庫連動\n3. 基礎任務 CRUD 功能\n\n## Phase 2: Advanced\n1. AI 自定義角色系統\n2. 專案說明書自動轉化任務\n3. 全域通知與日誌系統",
            design: "- Mode: Dark Mode default\n- Primary Color: #3B82F6 (Blue)\n- Layout: Sidebar + Main Content Area",
            rules: "- 所有 UI 組件應由 AI 生成並手動審查\n- 嚴格遵守 TypeScript 型別定義\n- 定期導出為 Markdown 備份"
        },
        desktop: {
            name: "Cross-Platform Desktop Tool",
            overview: "基於 Rust 與 Tauri 的跨平台桌面工具。",
            techStack: "- Core: Rust\n- Frontend: React / Vue\n- Native: Tauri APIs",
            dataStructure: "**Config:**\n- key: String\n- value: String",
            features: "## Phase 1: MVP\n1. 視窗架構初始化\n2. 本地文件系統連動\n\n## Phase 2: Advanced\n1. 系統托盤整合\n2. 自動更新機制",
            design: "- Window: Frameless\n- Theme: System adaptive",
            rules: "- 所有後端邏輯必須在 Rust 層實作"
        },
        esp: {
            name: "ESP32 Sensor Terminal",
            overview: "基於 ESP32 的工業遠端監測終端，具備 OTA 更新功能。",
            techStack: "- Hardware: ESP32-WROOM-32\n- Firmware: C++ (Arduino/ESP-IDF)\n- API: RESTful via WiFi\n- Tools: PlatformIO",
            dataStructure: "**SensorLog:**\n- timestamp: uint32_t\n- sensor_id: uint8_t\n- value: float\n\n**Config:**\n- ssid: String\n- password: String",
            features: "## Phase 1: MVP\n1. WiFi 連線設定功能\n2. 基礎傳感器數據採集 (I2C)\n3. HTTP 數據推送連動\n\n## Phase 2: Advanced\n1. OTA 遠端更新實作\n2. SD 卡斷網數據補發機制\n3. LED 狀態顯示定義",
            design: "- Case: 3D printed wall mount\n- Status UI: 0.96 OLED Display",
            rules: "- 嚴格限制內存洩漏，避免使用大量 String 物件\n- 每個 Loop 必須包含非阻塞 delay\n- 關鍵 API 需使用 AES 加密"
        },
        backend: {
            name: "Unified Data API Server",
            overview: "高效能微服務 API 網關，負責數據緩存與分發。",
            techStack: "- Engine: Go (Golang) / Rust\n- Cache: Redis\n- DB: PostgreSQL\n- Docker: Containerized deployment",
            dataStructure: "**RequestLog:**\n- trace_id: String\n- method: String\n- latency: int64\n\n**Member:**\n- uid: String\n- privilege: Int",
            features: "## Phase 1: MVP\n1. 路由系統開發\n2. Auth 中間件整合\n3. 基本數據回傳介面\n\n## Phase 2: Advanced\n1. Redis 緩存層優化\n2. SQL 查詢效能優化 (Indexing)\n3. 壓力測試與負載平衡預熱",
            design: "- API Style: RESTful + JSON\n- Docs: Auto-generated Swagger",
            rules: "- 測試覆蓋率必須大於 80%\n- 採用零拷貝 (Zero-copy) 數據傳輸模式\n- 所有請求需進行 Rate Limiting"
        },
        game: {
            name: "2D Cyberpunk Action Game",
            overview: "一款橫向捲軸的賽博龐克風格動作遊戲。",
            techStack: "- Engine: Unity or Phaser\n- Language: C# / TypeScript\n- Assets: Sprite Sheets",
            dataStructure: "**PlayerProfile:**\n- hp: Int\n- exp: Int\n- inventory: List",
            features: "## Phase 1: MVP\n1. 角色移動與碰撞檢測\n2. 基礎戰鬥系統 (攻擊/受擊)\n3. 地圖加載功能\n\n## Phase 2: Advanced\n1. 技能樹系統\n2. NPC 互動與對話\n3. 存檔與成就系統",
            design: "- Art: Pixel Art 16-bit\n- Palette: Neon Purple/Cyan",
            rules: "- 所有物理效果需進行幀預測"
        }
    };

    const handleInputChange = (field: keyof SpecData, value: string) => {
        setSpec(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateAI = () => {
        const selectedTemplate = templates[category] || templates.web;
        setSpec(selectedTemplate);
        onShowToast?.(st.toast.generated, 'success');
    };

    const handleInject = () => {
        if (!spec.features) {
            onShowToast?.("請先填寫功能清單", 'error');
            return;
        }
        onInjectTasks?.(spec.features);
    };

    const resetSpec = () => {
        if (confirm('確定要清空所有內容嗎？')) {
            setSpec({
                name: '',
                overview: '',
                techStack: '',
                dataStructure: '',
                features: '',
                design: '',
                rules: ''
            });
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        
        const userMsg = chatInput;
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages as any);
        setChatInput('');
        setIsThinking(true);

        try {
            // Include a system prompt for the first message to set context
            const apiMessages = [
                { 
                    role: 'system', 
                    content: `你是一個資深的系統架構師與專案開發專家。你的任務是透過對話協助使用者完善「專案說明書」。
                    請遵守以下規則：
                    1. 使用者會告訴你他們想開發什麼。
                    2. 你必須透過深入淺出的提問（每次 1-3 個問題），引導使用者思考架構、技術棧、核心功能。
                    3. 當討論接近尾聲或使用者要求生成規格時，請輸出一個包含以下欄位的 JSON 格式區塊（使用 \`\`\`json 標記）：
                       { "name": "...", "overview": "...", "techStack": "...", "dataStructure": "...", "features": "...", "design": "...", "rules": "..." }
                    4. 始終保持專業、冷靜且富有啟發性的語氣。使用繁體中文（台灣）。` 
                },
                ...newMessages
            ];

            const response = await invoke<string>('execute_ai_chat', { 
                messages: apiMessages,
                overrideProvider: currentProvider,
                overrideModel: currentModel
            });
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err) {
            console.error('AI Chat Error:', err);
            onShowToast?.(String(err), 'error');
            setMessages(prev => [...prev, { role: 'assistant', content: `抱歉，連線至 AI 服務時發生錯誤：${err}` }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleApplyChatToSpec = () => {
        // Find the last message from AI that contains a JSON block
        const lastAiMsg = [...messages].reverse().find(m => m.role === 'assistant' && (m.content.includes('```json') || m.content.includes('```')));
        if (lastAiMsg) {
            try {
                // Try multiple regex patterns to match JSON blocks
                let jsonMatch = lastAiMsg.content.match(/```json\s*([\s\S]*?)\s*```/);
                if (!jsonMatch) {
                    jsonMatch = lastAiMsg.content.match(/```\s*([\s\S]*?)\s*```/);
                }
                // Also try to find raw JSON object
                if (!jsonMatch) {
                    const rawJsonMatch = lastAiMsg.content.match(/\{[\s\S]*"name"[\s\S]*"overview"[\s\S]*\}/);
                    if (rawJsonMatch) {
                        jsonMatch = ['', rawJsonMatch[0]] as RegExpMatchArray;
                    }
                }
                
                if (jsonMatch && jsonMatch[1]) {
                    const jsonStr = jsonMatch[1].trim();
                    const parsed = JSON.parse(jsonStr);
                    
                    // Validate the parsed object has at least some expected fields
                    if (parsed && (parsed.name || parsed.overview || parsed.features)) {
                        setSpec(prev => ({ ...prev, ...parsed }));
                        onShowToast?.("已成功套用 AI 建議規格", 'success');
                        setShowChat(false);
                    } else {
                        onShowToast?.("解析成功但格式不完整，請確認 AI 回傳內容", 'info');
                    }
                } else {
                    onShowToast?.("未能在對話中找到 JSON 格式區塊", 'info');
                }
            } catch (err) {
                console.error('Failed to parse AI JSON:', err);
                onShowToast?.(`解析 AI 回傳格式失敗：${err}`, 'error');
            }
        } else {
            onShowToast?.("未能在對話中找到可生成的規格建議", 'info');
        }
    };

    const Field = ({ label, icon: Icon, field, placeholder }: { label: string, icon: any, field: keyof SpecData, placeholder: string }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Icon size={14} className="text-primary" />
                {label}
            </label>
            <textarea 
                value={spec[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#1A1A1F] border border-border-dark rounded-lg p-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-colors min-h-[100px] custom-scrollbar"
            />
        </div>
    );

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary block"></span>
                        {st.title}
                    </h1>
                    <p className="text-sm text-gray-500 pl-5 mt-1">{st.subtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowChat(!showChat)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-bold text-sm",
                            showChat ? "bg-primary text-white border-primary" : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                        )}
                    >
                        <Sparkles size={16} />
                        {st.aiChat.title}
                    </button>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="bg-[#1A1A1F] border border-border-dark rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-primary/50 cursor-pointer"
                    >
                        <option value="web">{st.categories.web}</option>
                        <option value="desktop">{st.categories.desktop}</option>
                        <option value="esp">{st.categories.esp}</option>
                        <option value="backend">{st.categories.backend}</option>
                        <option value="mobile">{st.categories.mobile}</option>
                        <option value="game">{st.categories.game}</option>
                        <option value="web3">{st.categories.web3}</option>
                        <option value="bot">{st.categories.bot}</option>
                        <option value="ml">{st.categories.ml}</option>
                        <option value="extension">{st.categories.extension}</option>
                    </select>
                    <button 
                        onClick={resetSpec}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        title="清空"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button 
                        onClick={handleGenerateAI}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg transition-all font-bold text-sm"
                    >
                        <Sparkles size={16} />
                        {st.generateAi}
                    </button>
                    <button 
                        onClick={handleInject}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg transition-all font-bold text-sm"
                    >
                        <Send size={16} />
                        {st.injectTasks}
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Editor */}
                <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">專案名稱</label>
                        <input 
                            type="text" 
                            value={spec.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder={st.placeholders.name}
                            className="w-full bg-[#141419] border border-border-dark rounded-lg p-3 text-xl font-bold text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>

                    <Field label="專案概述" icon={Layout} field="overview" placeholder={st.placeholders.overview} />
                    <Field label="技術棧" icon={Code} field="techStack" placeholder={st.placeholders.techStack} />
                    <Field label="資料結構" icon={Database} field="dataStructure" placeholder={st.placeholders.dataStructure} />
                    <Field label="核心功能清單" icon={ListChecks} field="features" placeholder={st.placeholders.features} />
                    <Field label="設計規範" icon={Palette} field="design" placeholder={st.placeholders.design} />
                    <Field label="專案文件規則" icon={ShieldCheck} field="rules" placeholder={st.placeholders.rules} />
                </div>

                {/* Preview */}
                <div className="bg-[#141419] border border-border-dark rounded-xl p-8 overflow-y-auto custom-scrollbar shadow-2xl relative">
                    <div className="absolute top-4 right-6 text-[10px] font-mono text-gray-700 tracking-widest uppercase">Preview Mode</div>
                    <div className="prose prose-invert max-w-none">
                        <h1 className="text-primary mt-0">Project Specification: {spec.name || '[Project Name]'}</h1>
                        
                        <section className="mb-8">
                            <h2 className="text-lg text-white border-b border-white/5 pb-2">1. 專案概述 (Overview)</h2>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{spec.overview || st.placeholders.overview}</p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-lg text-white border-b border-white/5 pb-2">2. 技術棧 (Tech Stack)</h2>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{spec.techStack || st.placeholders.techStack}</p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-lg text-white border-b border-white/5 pb-2">3. 資料結構 (Data Structure)</h2>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{spec.dataStructure || st.placeholders.dataStructure}</p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-lg text-white border-b border-white/5 pb-2 text-primary font-bold">4. 核心功能清單 (Core Features)</h2>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{spec.features || st.placeholders.features}</p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-lg text-white border-b border-white/5 pb-2">5. 設計規範 (Design Guidelines)</h2>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{spec.design || st.placeholders.design}</p>
                        </section>

                        <section>
                            <h2 className="text-lg text-white border-b border-white/5 pb-2">6. 專案文件規則 (Project Rules)</h2>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{spec.rules || st.placeholders.rules}</p>
                        </section>
                    </div>
                </div>
            </div>

            {/* AI Chat Drawer */}
            {showChat && (
                <div className="fixed top-0 right-0 w-[450px] h-full bg-[#0F0F13] border-l border-border-dark shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-white/5 flex flex-col gap-4 bg-primary/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Sparkles size={20} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-widest uppercase">{st.aiChat.title}</h3>
                                    <p className="text-[10px] text-primary/60 font-mono">SPEC_ARCHITECT_GPT_V4</p>
                                </div>
                            </div>
                            <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-white">
                                <Layout size={20} />
                            </button>
                        </div>

                        {/* Quick Switcher */}
                        <div className="flex items-center gap-2">
                             <select 
                                className="bg-[#1A1A1F] border border-border-dark hover:border-white/20 rounded px-2 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-primary/50 cursor-pointer transition-colors"
                                style={{ colorScheme: 'dark' }}
                                value={currentProvider}
                                onChange={(e) => {
                                    const p = e.target.value;
                                    setCurrentProvider(p);
                                    setCurrentModel(p === 'custom' ? 'openai-compatible' : providerModels[p][0]);
                                }}
                            >
                                {availableProviders.map(p => (
                                    <option key={p} value={p} className="bg-[#1A1A1F]">{p.toUpperCase()}</option>
                                ))}
                            </select>
                            <select 
                                className="bg-[#1A1A1F] border border-border-dark hover:border-white/20 rounded px-2 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-primary/50 cursor-pointer flex-1 transition-colors"
                                style={{ colorScheme: 'dark' }}
                                value={currentModel}
                                onChange={(e) => setCurrentModel(e.target.value)}
                            >
                                {providerModels[currentProvider].map(m => (
                                    <option key={m} value={m} className="bg-[#1A1A1F]">{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={clsx(
                                "flex flex-col gap-2 max-w-[85%]",
                                msg.role === 'user' ? "ml-auto items-end" : "items-start"
                            )}>
                                <div className={clsx(
                                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                    msg.role === 'user' ? "bg-primary text-white" : "bg-white/5 text-gray-300 border border-white/5"
                                )}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <span className="text-[10px] font-mono text-gray-700 uppercase">{msg.role === 'assistant' ? 'Architect' : 'User'}</span>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex items-center gap-2 text-primary/50 italic text-xs animate-pulse">
                                <Sparkles size={12} />
                                {st.aiChat.aiThinking}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <textarea 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={st.aiChat.placeholder}
                                    className="w-full bg-[#1A1A1F] border border-border-dark rounded-xl p-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_rgba(242,153,74,0.4)] transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            
                            <button 
                                onClick={handleApplyChatToSpec}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                {st.aiChat.applySpec}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
