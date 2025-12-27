import { useState, useEffect, useRef } from 'react';
import { 
    Sparkles, Send, Copy, Check,
    Settings as SettingsIcon, X
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import clsx from 'clsx';
import { PROVIDER_MODELS } from '../../constants/ai-models';
import { 
    ProjectConfig, 
    parseProjectConfigFromAI,
    getProjectSetupSystemPrompt,
    getDefaultProjectConfig,
    Language
} from '../../utils/projectConfig';

import { Message } from '../../types/project-setup';

// Popup 視窗專用的聊天介面
export default function ProjectSetupPopup() {
    // Chat State - 從 localStorage 同步
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isComposing, setIsComposing] = useState(false); // IME 組合輸入狀態
    
    // Project Config State
    const [projectConfig, setProjectConfig] = useState<ProjectConfig>(getDefaultProjectConfig());
    
    // AI Settings State
    const [currentProvider, setCurrentProvider] = useState<string>('google');
    const [currentModel, setCurrentModel] = useState<string>('gemini-2.0-flash');
    const [outputLanguage, setOutputLanguage] = useState<Language>('zh-TW');
    const [availableProviders] = useState<string[]>(['google', 'openai', 'anthropic', 'ollama']);
    const [showAiSettings, setShowAiSettings] = useState(false);
    
    // Copy feedback state
    const [copiedId, setCopiedId] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // 從 localStorage 載入狀態
    useEffect(() => {
        const loadState = () => {
            try {
                const saved = localStorage.getItem('taskrails_popup_state');
                if (saved) {
                    const state = JSON.parse(saved);
                    if (state.messages) setMessages(state.messages);
                    if (state.projectConfig) setProjectConfig(state.projectConfig);
                    if (state.currentProvider) setCurrentProvider(state.currentProvider);
                    if (state.currentModel) setCurrentModel(state.currentModel);
                    if (state.outputLanguage) setOutputLanguage(state.outputLanguage);
                }
            } catch (err) {
                console.error('Failed to load popup state:', err);
            }
        };
        
        loadState();
        
        // 監聽 storage 事件以同步狀態
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'taskrails_popup_state') {
                loadState();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    // 儲存狀態到 localStorage
    useEffect(() => {
        const state = {
            messages,
            projectConfig,
            currentProvider,
            currentModel,
            outputLanguage
        };
        localStorage.setItem('taskrails_popup_state', JSON.stringify(state));
    }, [messages, projectConfig, currentProvider, currentModel, outputLanguage]);

    
    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Copy to clipboard
    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    
    // Send message to AI
    const handleSendMessage = async () => {
        if (!chatInput.trim() || isThinking) return;
        
        const userMessage = chatInput.trim();
        setChatInput('');
        
        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsThinking(true);
        
        try {
            const configContext = `
## 📊 當前專案配置狀態

| 項目 | 狀態 | 值 |
|------|------|-----|
| 專案名稱 | ${projectConfig.projectName ? '✅ 已設定' : '❌ 未設定'} | ${projectConfig.projectName || '-'} |
| 專案目標 | ${projectConfig.projectGoal ? '✅ 已設定' : '❌ 未設定'} | ${projectConfig.projectGoal?.slice(0, 30) || '-'}${projectConfig.projectGoal && projectConfig.projectGoal.length > 30 ? '...' : ''} |
| 技術棧 | ${projectConfig.techStack.length > 0 ? '✅ 已設定' : '❌ 未設定'} | ${projectConfig.techStack.join(', ') || '-'} |
| 功能清單 | ${projectConfig.features.length > 0 ? '✅ 已設定' : '❌ 未設定'} | ${projectConfig.features.length > 0 ? `${projectConfig.features.length} 項功能` : '-'} |
`;
            
            const apiMessages = [
                { role: 'system', content: getProjectSetupSystemPrompt(outputLanguage) + '\n\n' + configContext },
                ...newMessages
            ];
            
            const response = await invoke<string>('execute_ai_chat', { 
                messages: apiMessages,
                overrideProvider: currentProvider,
                overrideModel: currentModel
            });
            
            // Parse AI response for config updates
            const parsedConfig = parseProjectConfigFromAI(response);
            if (Object.keys(parsedConfig).length > 0) {
                setProjectConfig(prev => ({
                    ...prev,
                    ...parsedConfig,
                    techStack: parsedConfig.techStack?.length ? parsedConfig.techStack : prev.techStack,
                    features: parsedConfig.features?.length ? parsedConfig.features : prev.features,
                }));
            }
            
            setMessages(msgs => [...msgs, { role: 'assistant', content: response }]);
        } catch (err) {
            setMessages(msgs => [...msgs, { role: 'assistant', content: `❌ 錯誤：${err}` }]);
        } finally {
            setIsThinking(false);
        }
    };
    
    // 關閉視窗
    const handleClose = async () => {
        const window = getCurrentWindow();
        await window.close();
    };
    
    return (
        <div className="h-screen flex flex-col bg-[#0A0A0C] text-white overflow-hidden">
            {/* Header */}
            <div 
                data-tauri-drag-region 
                className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-[#0F0F12] cursor-move"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="text-primary" size={20} />
                    <h2 className="text-lg font-black uppercase tracking-wider select-text">AI 專案設定對話</h2>
                </div>
                <div className="flex items-center gap-3">
                    {/* AI Settings */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowAiSettings(!showAiSettings)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
                        >
                            <SettingsIcon size={12} />
                            {currentProvider.toUpperCase()} / {currentModel}
                        </button>
                        
                        {showAiSettings && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-[#16161A] border border-white/10 rounded-xl shadow-2xl z-50 p-4 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">AI Provider</label>
                                    <select
                                        value={currentProvider}
                                        onChange={(e) => {
                                            setCurrentProvider(e.target.value);
                                            setCurrentModel(PROVIDER_MODELS[e.target.value]?.[0] || '');
                                        }}
                                        className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                    >
                                        {availableProviders.map(p => (
                                            <option key={p} value={p}>{p.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Model</label>
                                    <select
                                        value={currentModel}
                                        onChange={(e) => setCurrentModel(e.target.value)}
                                        className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                    >
                                        {PROVIDER_MODELS[currentProvider]?.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Output Language</label>
                                    <select
                                        value={outputLanguage}
                                        onChange={(e) => setOutputLanguage(e.target.value as Language)}
                                        className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                    >
                                        <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
                                        <option value="en-US">English (US)</option>
                                        <option value="ja-JP">日本語 (Japanese)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Close Button */}
                    <button 
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        <Sparkles className="mx-auto mb-4 text-primary/50" size={48} />
                        <p className="text-lg font-bold">開始對話</p>
                        <p className="text-sm mt-2">告訴我你想做什麼專案</p>
                    </div>
                )}
                
                {messages.map((msg, i) => (
                    <div 
                        key={i}
                        className={clsx(
                            "flex group",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={clsx(
                            "max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed relative",
                            msg.role === 'user'
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-[#16161A] text-gray-300 border border-white/5 rounded-tl-none"
                        )}>
                            <p className="whitespace-pre-wrap select-text">{msg.content}</p>
                            <button
                                onClick={() => handleCopy(msg.content, `msg-${i}`)}
                                className={clsx(
                                    "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg",
                                    msg.role === 'user' 
                                        ? "-left-10 bg-white/10 hover:bg-white/20 text-white" 
                                        : "-right-10 bg-white/5 hover:bg-white/10 text-gray-400"
                                )}
                                title="複製內容"
                            >
                                {copiedId === `msg-${i}` ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                    </div>
                ))}
                
                {isThinking && (
                    <div className="flex items-center gap-3 px-4 py-3 text-primary animate-pulse border border-primary/10 rounded-xl w-fit bg-primary/5">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">分析中...</span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-[#0F0F12]">
                <div className="relative">
                    <textarea 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                            // 只有在不是 IME 組合輸入時才處理 Enter
                            if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="描述你的專案想法..."
                        className="w-full bg-[#070708] border border-white/10 rounded-xl px-4 py-3 pr-14 text-[13px] text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all resize-none"
                        rows={2}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={isThinking || !chatInput.trim()}
                        className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
