import { useState, useEffect } from 'react';
import { Sparkles, Send, Trash2, Copy, Square, Settings as SettingsIcon, MessageSquarePlus, History, Save, ToggleLeft, ToggleRight, Bot } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';
import { PROVIDER_MODELS } from '../../constants/ai-models';

interface ChatSession {
    id: string;
    title: string;
    timestamp: number;
    messages: { role: 'assistant' | 'user', content: string }[];
}

interface SkillDefinition {
    name: string;
    description: string;
    prompt_layer: string;
}

export default function AiChatWindow() {
    const t = useTranslation();
    const st = t.specs;

    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'assistant' | 'user', content: string }[]>([
        { role: 'assistant', content: st.aiChat.welcome }
    ]);
    
    // History State
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(true);

    const [isThinking, setIsThinking] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<string>('openai');
    const [currentModel, setCurrentModel] = useState<string>('gpt-4o');
    const [availableProviders, setAvailableProviders] = useState<string[]>(['openai', 'google', 'anthropic']);
    const [systemPrompt, setSystemPrompt] = useState<string>(st.aiChat.defaultSystemPrompt);
    const [showPromptEdit, setShowPromptEdit] = useState(false);
    
    // Skills State
    const [availableSkills, setAvailableSkills] = useState<SkillDefinition[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);



    // Initial Load
    useEffect(() => {
        const load = async () => {
             // Load Chat History
            try {
                const savedSessions = localStorage.getItem('taskrails_ai_sessions');
                if (savedSessions) {
                    setSessions(JSON.parse(savedSessions));
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
            }
            // Load Skills
            try {
                const skills = await invoke<SkillDefinition[]>('get_available_skills');
                setAvailableSkills(skills);
            } catch (err) {
                console.error('Failed to load skills:', err);
            }
        };
        load();
    }, []);

    // Provider & Settings Load
    useEffect(() => {
        const checkKeys = async () => {
            const available: string[] = [];
            available.push('ollama', 'custom'); 
            
            for (const p of Object.keys(PROVIDER_MODELS)) {
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
            
            const globalProvider = await invoke<string | null>('get_setting', { key: 'ai_provider' });
             if (globalProvider && available.includes(globalProvider)) {
                setCurrentProvider(globalProvider);
                const globalModel = await invoke<string | null>('get_setting', { key: 'ai_model' });
                const supportedModels = PROVIDER_MODELS[globalProvider] || [];
                if (globalModel && supportedModels.includes(globalModel)) {
                    setCurrentModel(globalModel);
                } else if (supportedModels.length > 0) {
                    setCurrentModel(supportedModels[0]);
                }
            } else if (available.length > 0) {
                const first = available.includes('google') ? 'google' : available.includes('openai') ? 'openai' : available[0];
                setCurrentProvider(first);
                setCurrentModel(PROVIDER_MODELS[first][0]);
            }
            
            const customPrompt = await invoke<string | null>('get_setting', { key: 'ai_system_prompt' });
            if (customPrompt) setSystemPrompt(customPrompt);
        };
        checkKeys();
    }, []);

    // Save Sessions to LocalStorage
    useEffect(() => {
        localStorage.setItem('taskrails_ai_sessions', JSON.stringify(sessions));
    }, [sessions]);


    // Chat Functions
    const createNewSession = () => {
        const newId = Date.now().toString();
        const newSession: ChatSession = {
            id: newId,
            title: 'New Chat',
            timestamp: Date.now(),
            messages: [{ role: 'assistant', content: st.aiChat.welcome }]
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        setMessages(newSession.messages as any);
    };

    const deleteSession = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this chat log?')) {
            setSessions(prev => prev.filter(s => s.id !== id));
            if (currentSessionId === id) {
                setCurrentSessionId(null);
                setMessages([{ role: 'assistant', content: st.aiChat.welcome }]);
            }
        }
    };

    const loadSession = (session: ChatSession) => {
        setCurrentSessionId(session.id);
        setMessages(session.messages as any);
    };

    const updateCurrentSession = (newMsgs: typeof messages) => {
        if (!currentSessionId) {
            // First message of a "temporary" session -> create real session
            const newId = Date.now().toString();
            // Generate title from first user message
            const firstUserMsg = newMsgs.find(m => m.role === 'user');
            const title = firstUserMsg ? firstUserMsg.content.slice(0, 20) : 'New Chat';
            
            const newSession: ChatSession = {
                id: newId,
                title,
                timestamp: Date.now(),
                messages: newMsgs as any
            };
            setSessions(prev => [newSession, ...prev]);
            setCurrentSessionId(newId);
        } else {
            // Update existing
            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    // Update title if it's the default one and we have a user message
                    let title = s.title;
                    if (s.title === '新對話' || s.title === 'New Chat') {
                         const firstUserMsg = newMsgs.find(m => m.role === 'user');
                         if (firstUserMsg) title = firstUserMsg.content.slice(0, 20);
                    }
                    return { ...s, messages: newMsgs as any, title };
                }
                return s;
            }));
        }
    };

    const [isHybridMode, setIsHybridMode] = useState(true);
    const [localLlmConnected, setLocalLlmConnected] = useState<boolean | null>(null);

    useEffect(() => {
        if (isHybridMode) {
            invoke<boolean>('check_local_llm_connection')
                .then(setLocalLlmConnected)
                .catch(() => setLocalLlmConnected(false));
        }
    }, [isHybridMode]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isThinking) return;
        
        const userMsg = chatInput;
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages as any);
        updateCurrentSession(newMessages as any);

        setChatInput('');
        setIsThinking(true);

        try {
            let response: string;

            if (isHybridMode) {
                // Local Architect Flow
                if (localLlmConnected === false) {
                     response = "錯誤：無法連接到 Local LLM (LM Studio)。請確認服務已在 localhost:1234 啟動，或切換回 Direct Mode。";
                } else {
                    // Fetch Memory Bank Context (Vibe Core Phase 2)
                    let context = "";
                    const workspace = "."; 
                    
                    try {
                        // Priority 1: Load from Memory Bank
                        const files = await invoke<string[]>('get_memory_list', { workspace });
                        if (files && files.length > 0) {
                            for (const file of files) {
                                // Only load key architectural files to save tokens
                                if (['specs', 'tech-stack', 'architecture'].includes(file)) {
                                    const entry = await invoke<{content: string}>('get_memory', { workspace, name: file });
                                    context += `\n=== @${file}.md ===\n${entry.content}\n`;
                                }
                            }
                        }
                    } catch (e) {
                         console.warn("Could not load memory bank:", e);
                    }
                    
                    // Priority 2: Fallback to partial Db Spec
                    if (!context.trim()) {
                         const spec = await invoke<any>('get_project_spec').catch(() => null);
                         context = spec ? `Project: ${spec.name}\nTech Stack: ${spec.tech_stack}\n` : "No specific project context loaded.";
                    }
                    
                    response = await invoke<string>('refine_prompt', { 
                        userIntent: userMsg,
                        context 
                    });
                }
            } else {
                // Cloud Executor Flow (Original)
                let finalSystemPrompt = systemPrompt;
                if (selectedSkills.length > 0) {
                    const skillPrompts = availableSkills
                        .filter(s => selectedSkills.includes(s.name))
                        .map(s => `[Skill: ${s.name}]\n${s.prompt_layer}`)
                        .join('\n\n');
                    finalSystemPrompt += `\n\n=== ACTIVATED SKILLS ===\n${skillPrompts}`;
                }
    
                const apiMessages = [
                    { role: 'system', content: finalSystemPrompt },
                    ...newMessages
                ];
    
                response = await invoke<string>('execute_ai_chat', { 
                    messages: apiMessages,
                    overrideProvider: currentProvider,
                    overrideModel: currentModel
                });
            }
            
            setIsThinking(prev => {
                if (prev) {
                    setMessages(msgs => {
                        if (msgs.length > 0 && msgs[msgs.length - 1].content === response) return msgs;
                        const updated = [...msgs, { role: 'assistant', content: response }];
                        updateCurrentSession(updated as any);
                        return updated as any;
                    });
                }
                return false;
            });
        } catch (err) {
            setIsThinking(prev => {
                if (prev) {
                    const errMsg = `錯誤：${err}`;
                    setMessages(msgs => {
                         const updated = [...msgs, { role: 'assistant', content: errMsg }];
                         updateCurrentSession(updated as any);
                         return updated as any;
                    });
                }
                return false;
            });
        }
    };

    const handleStopGeneration = () => {
        setIsThinking(false);
    };

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    const handleSaveSystemPrompt = async () => {
        try {
            await invoke('set_setting', { key: 'ai_system_prompt', value: systemPrompt });
            setShowPromptEdit(false);
        } catch (err) {
            console.error('Failed to save prompt', err);
        }
    };

    return (
        <div className="h-screen w-screen flex bg-[#0A0A0C] text-white overflow-hidden">
            {/* Sidebar: History */}
            {showHistory && (
                <div className="w-64 bg-[#0D0D0F] border-r border-white/5 flex flex-col shrink-0 transition-all">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between draggable-region">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">HISTORY</span>
                        <button 
                            onClick={createNewSession}
                            className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                            title="New Chat"
                        >
                            <MessageSquarePlus size={16} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {sessions.map(s => (
                            <div 
                                key={s.id}
                                onClick={() => loadSession(s)}
                                className={clsx(
                                    "p-3 rounded-xl cursor-pointer text-xs transition-colors group relative",
                                    currentSessionId === s.id ? "bg-white/10 text-white" : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                )}
                            >
                                <div className="font-bold truncate pr-6">{s.title || 'Untitled'}</div>
                                <div className="text-[10px] opacity-50 mt-1">{new Date(s.timestamp).toLocaleDateString()}</div>
                                <button 
                                    onClick={(e) => deleteSession(s.id, e)}
                                    className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 hover:text-red-500 p-1"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0C]">
                 {/* Window Header */}
                <div data-tauri-drag-region className="h-10 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between px-4 select-none cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-3 pointer-events-none">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <Sparkles size={12} className="text-primary" /> Architect_AI
                        </span>
                    </div>
                    <button onClick={() => setShowHistory(!showHistory)} className="text-gray-500 hover:text-white" title="Toggle History">
                        <History size={14} />
                    </button>
                    {/* Native window controls are handled by OS/Tauri decorating usually, 
                        or we can add custom minimize/close if decoration is false */}
                </div>

                {/* Settings & Config Bar */}
                <div className="px-6 py-2 bg-black/20 border-b border-white/5 flex gap-4 items-center shrink-0">
                        <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">PROVIDER:</span>
                        <select 
                            value={currentProvider}
                            onChange={(e) => {
                                const p = e.target.value;
                                setCurrentProvider(p);
                                setCurrentModel(PROVIDER_MODELS[p][0]);
                            }}
                            className="bg-transparent text-[10px] font-black text-gray-300 uppercase tracking-widest focus:outline-none cursor-pointer appearance-none hover:text-primary transition-colors"
                        >
                            {availableProviders.map(p => <option key={p} value={p} className="bg-[#0A0A0C]">{p.toUpperCase()}</option>)}
                        </select>
                        </div>
                        <div className="w-px h-3 bg-white/5 opacity-50"></div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Hybrid:</span>
                            <button 
                                onClick={() => setIsHybridMode(!isHybridMode)}
                                className={clsx(
                                    "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors",
                                    isHybridMode ? "text-primary" : "text-gray-500"
                                )}
                            >
                                {isHybridMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                <span className={localLlmConnected === false && isHybridMode ? "text-red-500" : ""}>
                                    {isHybridMode ? "ON" : "OFF"}
                                </span>
                            </button>
                        </div>

                        <div className="w-px h-3 bg-white/5 opacity-50"></div>
                        <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">MODEL:</span>
                        <select 
                            value={currentModel}
                            onChange={(e) => setCurrentModel(e.target.value)}
                            className="bg-transparent text-[10px] font-black text-primary uppercase tracking-widest focus:outline-none cursor-pointer appearance-none hover:text-white transition-colors"
                        >
                            {PROVIDER_MODELS[currentProvider]?.map(m => <option key={m} value={m} className="bg-[#0A0A0C]">{m}</option>)}
                        </select>
                        </div>
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        const context = messages.map(m => `## ${m.role === 'user' ? 'User' : 'Assistant'}\n${m.content}`).join('\n\n');
                                        const fileContent = `# AI Chat Context Transfer\nTimestamp: ${new Date().toISOString()}\n\n${context}`;
                                        
                                        await invoke('update_memory', {
                                            workspace: '.',
                                            name: 'active_context',
                                            content: fileContent
                                        });
                                        
                                        alert("Context transferred to @active_context.md. Your AI IDE Agent can now read this.");
                                    } catch (e) {
                                        console.error(e);
                                        alert("Failed to transfer context");
                                    }
                                }}
                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/70 hover:text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded transition-all"
                                title="Write chat history to @active_context.md for IDE Agent"
                            >
                                <Bot size={12} /> Transfer to IDE
                            </button>
                        </div>

                        <button onClick={() => setShowPromptEdit(!showPromptEdit)} className="text-gray-500 hover:text-primary"><SettingsIcon size={12} /></button>
                </div>
                
                 {/* Prompt Editor */}
                 {showPromptEdit && (
                    <div className="px-6 py-4 bg-[#111115] border-b border-white/5 animate-in slide-in-from-top duration-300 shrink-0">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">AI PERSONA & RULES (SYSTEM PROMPT)</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            if(confirm('Reset system prompt to default?')) {
                                                setSystemPrompt(st.aiChat.defaultSystemPrompt);
                                            }
                                        }}
                                        className="text-[10px] flex items-center gap-1 text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
                                    >
                                        RESET DEFAULT
                                    </button>
                                    <button onClick={handleSaveSystemPrompt} className="text-[10px] flex items-center gap-1 text-primary hover:text-white"><Save size={10} /> SAVE</button>
                                </div>
                            </div>
                            <textarea 
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="w-full bg-[#070708] border border-white/10 rounded-lg p-3 text-xs text-gray-400 font-mono leading-relaxed focus:outline-none focus:border-primary/30 min-h-[80px]"
                            />
                        </div>
                        
                        {/* Skills Selection */}
                        <div className="mt-4 border-t border-white/5 pt-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">ACTIVE SKILLS (AGENT CAPABILITIES)</label>
                            <div className="flex flex-wrap gap-2">
                                {availableSkills.map(skill => (
                                    <button
                                        key={skill.name}
                                        onClick={() => {
                                            setSelectedSkills(prev => 
                                                prev.includes(skill.name) 
                                                    ? prev.filter(n => n !== skill.name)
                                                    : [...prev, skill.name]
                                            );
                                        }}
                                        className={clsx(
                                            "text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1",
                                            selectedSkills.includes(skill.name) 
                                                ? "bg-primary/20 border-primary text-primary font-bold" 
                                                : "bg-white/5 border-transparent text-gray-500 hover:text-gray-300"
                                        )}
                                        title={skill.description}
                                    >
                                        <div className={clsx("w-1.5 h-1.5 rounded-full", selectedSkills.includes(skill.name) ? "bg-primary" : "bg-gray-600")} />
                                        {skill.name}
                                    </button>
                                ))}
                                {availableSkills.length === 0 && <span className="text-[10px] text-gray-700 italic">No skills files found in .meta/skills</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0A0A0C]">
                    {messages.map((msg, i) => (
                        <div key={i} className={clsx(
                            "flex flex-col gap-1",
                            msg.role === 'user' ? "items-end" : "items-start"
                        )}>
                            <div className={clsx(
                                "max-w-[90%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm relative group select-text selection:bg-primary/30 selection:text-white",
                                msg.role === 'user' 
                                    ? "bg-primary text-white font-bold rounded-tr-none" 
                                    : "bg-[#16161A] text-gray-300 border border-white/5 rounded-tl-none font-medium"
                            )}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <button 
                                    onClick={() => handleCopyMessage(msg.content)}
                                    className={clsx(
                                        "absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10",
                                        msg.role === 'user' ? "-left-8 text-white/50" : "-right-8 text-gray-500"
                                    )}
                                    title={st.aiChat.copy}
                                >
                                    <Copy size={12} />
                                </button>
                            </div>
                            <span className="text-[9px] font-black font-mono text-gray-700 uppercase tracking-widest opacity-40 px-1">
                                  {msg.role === 'assistant' ? 'AI' : 'YOU'}
                            </span>
                        </div>
                    ))}
                     {isThinking && (
                        <div className="flex items-center gap-3 px-4 py-3 text-primary animate-pulse border border-primary/10 rounded-xl w-fit bg-primary/5">
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest italic">THINKING</span>
                            <button onClick={handleStopGeneration}><Square size={10} fill="currentColor" /></button>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#0F0F12] border-t border-white/5 shrink-0">
                     <div className="relative">
                        <textarea 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            placeholder={st.aiChat.placeholder}
                            className="w-full bg-[#070708] border border-white/10 rounded-xl px-4 py-3 pr-14 text-[13px] text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all resize-y shadow-inner custom-scrollbar"
                            style={{ minHeight: '50px', maxHeight: '300px' }}
                        />
                        <button 
                            onClick={handleSendMessage}
                            className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all"
                        >
                            <Send size={18} />
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
}
