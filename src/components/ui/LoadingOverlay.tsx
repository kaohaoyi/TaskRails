import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
    subMessage?: string;
    showTimer?: boolean;
}

/**
 * LoadingOverlay - 全域載入覆蓋層元件
 * 
 * 用於長時間操作時顯示載入狀態，包含：
 * - 旋轉動畫
 * - 主要訊息
 * - 子訊息（可選）
 * - 已等待時間計時器（可選）
 */
export function LoadingOverlay({ 
    isVisible, 
    message = '處理中...', 
    subMessage,
    showTimer = true 
}: LoadingOverlayProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // 計時器
    useEffect(() => {
        if (!isVisible) {
            setElapsedSeconds(0);
            return;
        }

        const interval = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isVisible]);

    // 格式化時間顯示
    const formatTime = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds} 秒`;
        }
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} 分 ${secs} 秒`;
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-[#16161A] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[280px]">
                {/* 旋轉動畫 */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse" />
                    <Loader2 
                        size={32} 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-spin"
                    />
                </div>

                {/* 主要訊息 */}
                <div className="text-center">
                    <p className="text-white font-bold text-sm uppercase tracking-wider">
                        {message}
                    </p>
                    {subMessage && (
                        <p className="text-gray-500 text-xs mt-1">
                            {subMessage}
                        </p>
                    )}
                </div>

                {/* 計時器 */}
                {showTimer && (
                    <div className="flex items-center gap-2 text-gray-600 text-[10px] font-mono">
                        <span>已等待</span>
                        <span className="text-primary font-bold tabular-nums">
                            {formatTime(elapsedSeconds)}
                        </span>
                        {elapsedSeconds >= 30 && (
                            <span className="text-yellow-500 animate-pulse">
                                (較長時間)
                            </span>
                        )}
                    </div>
                )}

                {/* 超時警告 */}
                {elapsedSeconds >= 60 && (
                    <p className="text-yellow-500/80 text-[10px] text-center max-w-[200px]">
                        處理時間較長，請耐心等待或檢查 AI 服務狀態
                    </p>
                )}
            </div>
        </div>
    );
}

export default LoadingOverlay;
