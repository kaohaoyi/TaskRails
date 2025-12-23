import { ShieldAlert, X, Check, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface AirlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
}

export default function AirlockModal({ isOpen, onClose, onApprove, onReject }: AirlockModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) setVisible(true);
        else setTimeout(() => setVisible(false), 300); // Wait for exit animation
    }, [isOpen]);

    if (!visible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${isOpen ? "backdrop-blur-md bg-black/80" : "backdrop-blur-none bg-black/0 pointer-events-none"}`}>
            {/* Red Alert Overlay Effect */}
            <div className={`absolute inset-0 border-[20px] border-red-500/10 pointer-events-none transition-opacity duration-500 ${isOpen ? "opacity-100 animate-pulse" : "opacity-0"}`}></div>

            <div className={`w-[90vw] h-[85vh] bg-background-dark border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-10 opacity-0"}`}>
                
                {/* Header */}
                <div className="h-14 border-b border-red-900/30 bg-red-950/20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3 text-red-500">
                        <ShieldAlert size={24} />
                        <span className="font-mono text-lg font-bold tracking-widest uppercase">氣閘控制 // 代碼審查協定</span>
                    </div>
                    <button onClick={onClose} className="text-red-500/50 hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Diff View (Mock) */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="bg-[#111] border-b border-border-dark px-4 py-2 font-mono text-sm text-gray-400 flex items-center gap-4">
                        <span className="text-white">src-tauri/src/lib.rs</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">MODIFIED</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed">
                        {/* Mock Diff Lines */}
                        <div className="text-gray-500 select-none">@@ -15,6 +15,12 @@</div>
                        <div className="text-gray-400">{'     tauri::Builder::default()'}</div>
                        <div className="text-gray-400">{'         .setup(|app| {'}</div>
                        <div className="text-red-400 bg-red-900/10">-{'            let db_state = db::init(app.handle())?;'}</div>
                        <div className="text-green-400 bg-green-900/10">+{'            let db_state = db::init(app.handle())?;'}</div>
                        <div className="text-green-400 bg-green-900/10">+{'            app.manage(db_state);'}</div>
                        <div className="text-green-400 bg-green-900/10">+</div>
                        <div className="text-green-400 bg-green-900/10">+{'            // Spawn MCP SSE Server'}</div>
                        <div className="text-green-400 bg-green-900/10">+{'            tauri::async_runtime::spawn(async {'}</div>
                        <div className="text-green-400 bg-green-900/10">+{'                mcp::sse::start_sse_server().await;'}</div>
                        <div className="text-green-400 bg-green-900/10">+{'            });'}</div>
                        <div className="text-gray-400">{'             Ok(())'}</div>
                        <div className="text-gray-400">{'         })'}</div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="h-20 border-t border-border-dark bg-background-dark flex items-center justify-end px-6 gap-4">
                    <div className="mr-auto text-xs font-mono text-gray-500">
                        等待批准 • TOKEN 使用量: 1240 TOKENS • 風險: 中
                    </div>
                    
                    <button onClick={onReject} className="flex items-center gap-2 px-6 py-3 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors font-bold tracking-wider">
                        <XCircle size={18} />
                        拒絕
                    </button>
                    <button onClick={onApprove} className="flex items-center gap-2 px-8 py-3 rounded bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-colors font-bold tracking-wider">
                        <Check size={18} />
                        批准變更
                    </button>
                </div>
            </div>
        </div>
    );
}
