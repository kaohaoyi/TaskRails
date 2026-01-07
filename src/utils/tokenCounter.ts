/**
 * Token 計數工具
 * 用於估算訊息的 Token 數量
 */

/**
 * 估算文字的 Token 數量
 * 算法：
 * - 中文字符：每字約 1.5 tokens
 * - 英文單字：每字約 1.3 tokens
 * - 程式碼：每行約 15 tokens
 * - 特殊字符：1 token
 */
export function estimateTokens(text: string): number {
    if (!text) return 0;
    
    // 統計中文字符
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    
    // 統計英文單字
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    
    // 統計數字
    const numbers = (text.match(/\d+/g) || []).length;
    
    // 統計特殊字符（標點、符號等）
    const specialChars = (text.match(/[^\w\u4e00-\u9fa5\s]/g) || []).length;
    
    // 統計空白字符
    const whitespaces = (text.match(/\s+/g) || []).length;
    
    // 計算 Token
    const tokens = 
        chineseChars * 1.5 +  // 中文
        englishWords * 1.3 +   // 英文
        numbers * 0.5 +        // 數字
        specialChars * 0.5 +   // 特殊字符
        whitespaces * 0.1;     // 空白
    
    return Math.ceil(tokens);
}

/**
 * 計算對話歷史的總 Token 數
 */
export function calculateConversationTokens(
    messages: { role: string; content: string }[]
): number {
    if (!messages || messages.length === 0) return 0;
    
    return messages.reduce((total, msg) => {
        // 每條訊息有額外的結構開銷 (~4 tokens)
        return total + estimateTokens(msg.content) + 4;
    }, 0);
}

/**
 * 取得 Token 使用狀態顏色
 */
export function getTokenStatusColor(used: number, max: number): string {
    const percentage = (used / max) * 100;
    
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    if (percentage >= 50) return 'text-orange-400';
    return 'text-green-400';
}

/**
 * 取得進度條顏色
 */
export function getTokenProgressColor(used: number, max: number): string {
    const percentage = (used / max) * 100;
    
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-400';
    return 'bg-green-400';
}

/**
 * 格式化 Token 數量
 */
export function formatTokenCount(count: number): string {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}

/**
 * 各模型的預設上下文限制
 */
export const MODEL_CONTEXT_LIMITS: Record<string, number> = {
    // OpenAI
    'gpt-4o': 128000,
    'gpt-4o-mini': 128000,
    'o1-preview': 128000,
    'o1-mini': 128000,
    
    // Anthropic
    'claude-3-5-sonnet-20241022': 200000,
    'claude-3-opus-20240229': 200000,
    
    // Google
    'gemini-2.5-flash': 1000000,
    'gemini-1.5-pro': 2000000,
    'gemini-1.5-flash': 1000000,
    'gemini-2.0-flash-exp': 1000000,
    
    // OpenRouter
    'auto': 128000,
    'openai/gpt-4o': 128000,
    'anthropic/claude-3-5-sonnet': 200000,
    'google/gemini-pro-1.5': 2000000,
    'deepseek/deepseek-v3': 64000,
    
    // Local / Ollama
    'llama3.2': 128000,
    'mistral': 32000,
    'deepseek-v3': 64000,
    'phi4': 16000,
    'deepseek-chat': 64000,
    'deepseek-coder': 64000,
    
    // Together
    'meta-llama/Llama-3.3-70B-Instruct-Turbo': 128000,
    'deepseek-ai/DeepSeek-V3': 64000,
    
    // Huggingface
    'mistralai/Mistral-7B-v0.3': 32000,
    'meta-llama/Llama-3.2-11B-Vision-Instruct': 128000,
    
    // xAI
    'grok-beta': 131072,
    
    // Custom / Default
    'openai-compatible': 8192,
};

/**
 * 取得模型的上下文限制
 */
export function getModelContextLimit(model: string): number {
    return MODEL_CONTEXT_LIMITS[model] || 8192; // 預設 8K
}
