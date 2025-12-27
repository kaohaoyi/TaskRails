import { useState } from 'react';
import clsx from 'clsx';
import { Send, Sparkles, Copy, Check } from 'lucide-react';
import { Message } from '../../../types/project-setup';

interface ChatInterfaceProps {
    messages: Message[];
    isThinking: boolean;
    onSendMessage: (content: string) => void | Promise<void>;
    messagesEndRef: any;
}

export function ChatInterface({
    messages,
    isThinking,
    onSendMessage,
    messagesEndRef
}: ChatInterfaceProps) {
    const [chatInput, setChatInput] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const handleSend = async () => {
        if (!chatInput.trim() || isThinking) return;
        const msg = chatInput;
        setChatInput(''); // Clear immediately
        await onSendMessage(msg);
    };

    const MessageBubble = ({ msg, index }: { msg: Message, index: number }) => (
        <div 
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
                    onClick={() => handleCopy(msg.content, `msg-${index}`)}
                    className={clsx(
                        "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg",
                        msg.role === 'user' 
                            ? "-left-10 bg-white/10 hover:bg-white/20 text-white" 
                            : "-right-10 bg-white/5 hover:bg-white/10 text-gray-400"
                    )}
                    title="複製內容"
                >
                    {copiedId === `msg-${index}` ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} index={i} />
                ))}
                
                {isThinking && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-[#16161A] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3">
                            <Sparkles size={14} className="text-primary animate-pulse" />
                            <span className="text-[13px] text-gray-400">AI 正在思考...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-[#1C1C1E] bg-[#0A0A0C]">
                <div className="relative">
                    <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        placeholder="描述你想做的專案..."
                        className="w-full bg-[#16161A] text-white rounded-xl px-4 py-3 pr-12 text-[13px] border border-white/5 focus:border-primary/50 outline-none resize-none h-[50px] custom-scrollbar focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-600"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!chatInput.trim() || isThinking}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-lg shadow-primary/20"
                    >
                        {isThinking ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={14} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
