import { useState, useEffect } from 'react';
import { Bot, Send, Copy, Trash2, ExternalLink, RefreshCw, Check, Sparkles } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import clsx from 'clsx';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

const SESSION_ID = 'aiide_control_center';

export default function AiIdeControlCenter() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { 
            role: 'assistant', 
            content: '歡迎使用 AI IDE 控制台！\n\n這裡是您與 AI IDE Agent 溝通的橋樑。\n\n📋 **使用流程：**\n1. 在這裡描述您的開發需求\n2. AI 會協助您釐清規格與架構\n3. 點擊「Transfer to IDE」將討論結果傳給 IDE Agent\n4. 在 VS Code / Cursor 中對 Agent 說 "Read active context" 即可接續', 
            timestamp: Date.now() 
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

    // Check Local LLM / MCP connection and Load history on mount
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const connected = await invoke<boolean>('check_local_llm_connection');
                setConnectionStatus(connected ? 'connected' : 'disconnected');
            } catch {
                setConnectionStatus('disconnected');
            }
        };

        const loadHistory = async () => {
            try {
                const history = await invoke<any[]>('get_chat_history', { sessionId: SESSION_ID });
                if (history && history.length > 0) {
                    setMessages(history.map(m => ({
                        role: m.role as any,
                        content: m.content,
                        timestamp: Date.now()
                    })));
                } else {
                    // Reset to default if no history
                    setMessages([{ 
                        role: 'assistant', 
                        content: '歡迎使用 AI IDE 控制台！...', 
                        timestamp: Date.now() 
                    }]);
                }
            } catch (e) {
                console.error("Failed to load chat history:", e);
            }
        };

        checkConnection();
        loadHistory();

        // Listen for internal project switching
        const unlisten = listen('project-switched', () => {
             console.log("[AIIDE] Project switched, reloading history...");
             loadHistory();
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;
        
        const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            // Save user message to DB
            await invoke('save_chat_message', { sessionId: SESSION_ID, role: 'user', content: input });

            // Build context from existing messages
            let context = "";
            try {
                const files = await invoke<string[]>('get_memory_list', { workspace: '.' });
                if (files && files.length > 0) {
                    for (const file of files) {
                        if (['specs', 'tech-stack', 'architecture', 'active_context'].includes(file)) {
                            const entry = await invoke<{content: string}>('get_memory', { workspace: '.', name: file });
                            context += `\n=== @${file}.md ===\n${entry.content}\n`;
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not load memory bank:", e);
            }

            // Fallback to project spec
            if (!context.trim()) {
                const spec = await invoke<any>('get_project_spec').catch(() => null);
                context = spec ? `Project: ${spec.name}\nTech Stack: ${spec.tech_stack}\n` : "";
            }

            const response = await invoke<string>('refine_prompt', { 
                userIntent: input,
                context 
            });

            // Save assistant message to DB
            await invoke('save_chat_message', { sessionId: SESSION_ID, role: 'assistant', content: response });

            const botMsg: ChatMessage = { role: 'assistant', content: response, timestamp: Date.now() };
            setMessages(prev => [...prev, botMsg]);
        } catch (err: any) {
            const errMsg: ChatMessage = { role: 'assistant', content: `錯誤：${err}`, timestamp: Date.now() };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleTransferToIde = async () => {
        try {
            const contextMarkdown = messages
                .filter(m => m.role !== 'system')
                .map(m => `## ${m.role === 'user' ? 'User' : 'AI Assistant'}\n${m.content}`)
                .join('\n\n---\n\n');
            
            const fileContent = `# AI IDE Control Center - Context Transfer
Timestamp: ${new Date().toISOString()}

---

${contextMarkdown}

---

**接下來，請在您的 IDE 中對 AI Agent 說：**
> "Read @active_context.md and continue the development based on this discussion."
`;

            await invoke('update_memory', {
                workspace: '.',
                name: 'active_context',
                content: fileContent
            });

            // Auto-copy instruction to clipboard for easy pasting into Cursor
            const instruction = 'Read @active_context.md and continue the development based on this discussion.';
            await navigator.clipboard.writeText(instruction);

            alert('✅ Context transferred to @active_context.md\n\n指令已自動複製到剪貼簿！\n請在您的 AI IDE 中直接貼上並執行即可。');
        } catch (e) {
            console.error(e);
            alert('❌ Failed to transfer context');
        }
    };

    const handleCopy = async (content: string, idx: number) => {
        await navigator.clipboard.writeText(content);
        setCopiedId(idx);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleClearChat = async () => {
        if (confirm('確定要清除所有對話紀錄嗎？')) {
            try {
                await invoke('clear_chat_history', { sessionId: SESSION_ID });
                setMessages([{ 
                    role: 'assistant', 
                    content: '對話已清除。請開始新的討論。', 
                    timestamp: Date.now() 
                }]);
            } catch (e) {
                console.error("Failed to clear chat history:", e);
                alert("清除失敗");
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Bot className="text-primary" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-wider">AI IDE 控制台</h1>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                            Bridge to Your AI IDE Agent
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Connection Status */}
                    <div className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                        connectionStatus === 'connected' 
                            ? "bg-green-500/10 text-green-400 border-green-500/20" 
                            : connectionStatus === 'checking'
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                        <div className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            connectionStatus === 'connected' ? "bg-green-400 animate-pulse" : connectionStatus === 'checking' ? "bg-yellow-400 animate-pulse" : "bg-red-400"
                        )} />
                        {connectionStatus === 'connected' ? 'LLM Connected' : connectionStatus === 'checking' ? 'Checking...' : 'Disconnected'}
                    </div>

                    {/* Transfer Button */}
                    <button 
                        onClick={handleTransferToIde}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <ExternalLink size={14} /> Transfer to IDE
                    </button>

                    {/* Clear Chat */}
                    <button 
                        onClick={handleClearChat}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Clear Chat"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div 
                        key={i}
                        className={clsx(
                            "flex group",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={clsx(
                            "max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed relative",
                            msg.role === 'user'
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-[#16161A] text-gray-300 border border-white/5 rounded-tl-none"
                        )}>
                            <p className="whitespace-pre-wrap select-text">{msg.content}</p>
                            <button
                                onClick={() => handleCopy(msg.content, i)}
                                className={clsx(
                                    "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg",
                                    msg.role === 'user' 
                                        ? "-left-10 bg-white/10 hover:bg-white/20 text-white" 
                                        : "-right-10 bg-white/5 hover:bg-white/10 text-gray-400"
                                )}
                                title="複製內容"
                            >
                                {copiedId === i ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-[#16161A] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3">
                            <Sparkles size={14} className="text-primary animate-pulse" />
                            <span className="text-[13px] text-gray-400">AI 正在思考...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-[#0F0F12]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="描述您的開發需求... (Shift+Enter 換行)"
                        className="w-full bg-[#16161A] text-white rounded-xl px-4 py-3 pr-14 text-[13px] border border-white/5 focus:border-primary/50 outline-none resize-none h-[60px] custom-scrollbar transition-all placeholder:text-gray-600"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-lg shadow-primary/20"
                    >
                        {isThinking ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-2 px-1">
                    💡 討論完成後，點擊右上角「Transfer to IDE」將上下文傳給您的 IDE Agent
                </p>
            </div>
        </div>
    );
}
