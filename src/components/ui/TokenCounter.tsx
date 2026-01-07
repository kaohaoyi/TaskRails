import { 
    calculateConversationTokens, 
    getModelContextLimit, 
    formatTokenCount, 
    getTokenStatusColor,
    getTokenProgressColor 
} from '../../utils/tokenCounter';
import { RotateCcw } from 'lucide-react';

interface TokenCounterProps {
    messages: { role: string; content: string }[];
    model: string;
    onNewChat?: () => void;
    showNewChatButton?: boolean;
}

/**
 * Token 計數器元件
 * 顯示當前對話的 Token 使用量和上限
 */
export function TokenCounter({ 
    messages, 
    model, 
    onNewChat,
    showNewChatButton = true 
}: TokenCounterProps) {
    const usedTokens = calculateConversationTokens(messages);
    const maxTokens = getModelContextLimit(model);
    const percentage = Math.min((usedTokens / maxTokens) * 100, 100);
    
    const statusColor = getTokenStatusColor(usedTokens, maxTokens);
    const progressColor = getTokenProgressColor(usedTokens, maxTokens);

    return (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-black/30 rounded-lg border border-white/5">
            {/* Token 計數 */}
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Tokens:</span>
                <span className={`text-[10px] font-mono font-bold ${statusColor}`}>
                    {formatTokenCount(usedTokens)}
                </span>
                <span className="text-[10px] text-gray-600">/</span>
                <span className="text-[10px] font-mono text-gray-500">
                    {formatTokenCount(maxTokens)}
                </span>
            </div>
            
            {/* 進度條 */}
            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${progressColor} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            
            {/* 百分比 */}
            <span className={`text-[9px] font-mono ${statusColor}`}>
                {percentage.toFixed(0)}%
            </span>
            
            {/* 新對話按鈕 */}
            {showNewChatButton && onNewChat && (
                <button
                    onClick={onNewChat}
                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all ml-1"
                    title="開啟新對話 (清除歷史)"
                >
                    <RotateCcw size={12} />
                </button>
            )}
        </div>
    );
}

/**
 * 簡化版 Token 計數器 (用於空間有限的地方)
 */
export function TokenCounterCompact({ 
    messages, 
    model,
    onNewChat
}: Omit<TokenCounterProps, 'showNewChatButton'>) {
    const usedTokens = calculateConversationTokens(messages);
    const maxTokens = getModelContextLimit(model);
    const percentage = Math.min((usedTokens / maxTokens) * 100, 100);
    
    const statusColor = getTokenStatusColor(usedTokens, maxTokens);
    const progressColor = getTokenProgressColor(usedTokens, maxTokens);

    return (
        <div className="flex items-center gap-2">
            {/* 進度條 */}
            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${progressColor} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            
            {/* Token 數 */}
            <span className={`text-[9px] font-mono ${statusColor}`}>
                {formatTokenCount(usedTokens)}
            </span>
            
            {/* 新對話按鈕 */}
            {onNewChat && (
                <button
                    onClick={onNewChat}
                    className="p-1 text-gray-600 hover:text-primary hover:bg-primary/10 rounded transition-all"
                    title="新對話"
                >
                    <RotateCcw size={10} />
                </button>
            )}
        </div>
    );
}
