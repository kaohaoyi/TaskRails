import { useState, useEffect, useRef } from 'react';
import { Network, Save, Layers, AlertCircle, Maximize2, X, ChevronLeft, ChevronRight, Plus, Trash2, RotateCcw } from 'lucide-react';
import mermaid from 'mermaid';
import clsx from 'clsx';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Initialize Mermaid globally
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter',
});
// 自動修復 Mermaid 語法：為所有標籤添加雙引號，移除問題字符
function fixMermaidLabels(code: string): string {
    let fixed = code;
    
    // 1. 修復方括號節點標籤：A[Label] -> A["Label"]
    // 匹配 [內容] 但內容不是以雙引號開頭
    fixed = fixed.replace(/\[([^\]"]+)\]/g, (match, content) => {
        // 如果已經有引號則跳過
        if (content.startsWith('"') && content.endsWith('"')) return match;
        // 移除問題括號並清理
        const cleaned = content.trim().replace(/\s*\([^)]*\)\s*/g, ' ').trim();
        return `["${cleaned}"]`;
    });
    
    // 2. 修復圓角節點：A(Label) -> A("Label")
    // 注意：只處理節點名後面的圓括號，不處理 subgraph 等關鍵字
    fixed = fixed.replace(/(\w)\(([^)"]+)\)(?!\s*\{)/g, (match, id, content) => {
        if (content.startsWith('"') && content.endsWith('"')) return match;
        const cleaned = content.trim().replace(/\s*\([^)]*\)\s*/g, ' ').trim();
        return `${id}("${cleaned}")`;
    });
    
    // 3. 修復菱形節點：A{Label} -> A{"Label"}
    fixed = fixed.replace(/(\w)\{([^}"]+)\}/g, (match, id, content) => {
        if (content.startsWith('"') && content.endsWith('"')) return match;
        const cleaned = content.trim().replace(/\s*\([^)]*\)\s*/g, ' ').trim();
        return `${id}{"${cleaned}"}`;
    });
    
    // 4. 修復連接標籤：-->|Label| -> -->|"Label"|
    fixed = fixed.replace(/-->\|([^"|]+)\|/g, (match, content) => {
        if (content.startsWith('"') && content.endsWith('"')) return match;
        const cleaned = content.trim();
        return `-->|"${cleaned}"|`;
    });
    
    // 5. 修復帶箭頭標籤的其他形式：-. label .-> 
    fixed = fixed.replace(/-\.([^.]+)\.->/g, (match, content) => {
        const cleaned = content.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) return match;
        return `-.${cleaned}.->`;
    });
    
    // 6. 修復 subgraph 名稱：subgraph Name -> subgraph "Name"
    fixed = fixed.replace(/subgraph\s+([^\n"]+)$/gm, (match, content) => {
        const trimmed = content.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
        // 移除括號
        const cleaned = trimmed.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
        return `subgraph "${cleaned}"`;
    });
    
    // 7. 修復雙連線標籤：-- Label --> -> -- "Label" -->
    fixed = fixed.replace(/--\s+([^->\n]+)\s+-->/g, (match, content) => {
        const cleaned = content.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) return match;
        return `-- "${cleaned}" -->`;
    });
    
    return fixed;
}

// 圖表資料結構
interface DiagramData {
    id: string;
    name: string;
    type: 'flowchart' | 'sequence' | 'class' | 'er' | 'state';
    code: string;
}

// 預設圖表（AI 分發時會替換這些）
const DEFAULT_DIAGRAMS: DiagramData[] = [
    {
        id: 'flow-1',
        name: '系統架構圖',
        type: 'flowchart',
        code: `graph TD
    A[Start] --> B{Is it safe?}
    B -- Yes --> C[Proceed]
    B -- No --> D[Stop]
    style A fill:#0A0A0C,stroke:#333,stroke-width:2px
    style B fill:#0A0A0C,stroke:#333,stroke-width:2px
    style C fill:#0f0,stroke:#333,stroke-width:2px,color:#000
    style D fill:#f00,stroke:#333,stroke-width:2px,color:#fff`
    }
];

// 解析 Active 節點
function parseActiveNodes(code: string) {
    const nodes: { id: string; text: string; assignee?: string }[] = [];
    // Regex matches: ID, optional ["Label"], :::active, optional _Assignee
    // Examples: A:::active, A["Label"]:::active, A:::active_codegen
    const regex = /([a-zA-Z0-9_-]+)(?:\s*\[['"]?(.*?)['"]?\])?\s*:::active(?:_([a-zA-Z0-9_]+))?/g;
    let match;
    while ((match = regex.exec(code)) !== null) {
        nodes.push({
            id: match[1],
            text: match[2] || match[1], // Use ID if label is missing
            assignee: match[3] ? `ai_${match[3]}` : undefined // Default prefix ai_ if agent specified
        });
    }
    return nodes;
}

export default function Planner() {
    // 支援多張圖表
    const [diagrams, setDiagrams] = useState<DiagramData[]>(DEFAULT_DIAGRAMS);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const popupContainerRef = useRef<HTMLDivElement>(null);

    // 從 localStorage 載入 AI 分發的圖表
    useEffect(() => {
        const savedDiagrams = localStorage.getItem('taskrails_planner_diagrams');
        if (savedDiagrams) {
            try {
                const parsed = JSON.parse(savedDiagrams);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setDiagrams(parsed);
                }
            } catch (e) {
                console.error("Failed to load diagrams:", e);
            }
        }

        // Listen for diagrams distributed from ProjectAnalyzer
        const unlisten = listen('diagrams-distributed', (event: any) => {
            const { diagrams: newDiagrams } = event.payload;
            if (Array.isArray(newDiagrams) && newDiagrams.length > 0) {
                console.log('[Planner] Received distributed diagrams:', newDiagrams);
                setDiagrams(newDiagrams as DiagramData[]);
                setActiveTabIndex(0);
            }
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    // 當前編輯的圖表
    const currentDiagram = diagrams[activeTabIndex] || diagrams[0];

    // 更新當前圖表的程式碼
    const updateCurrentCode = (newCode: string) => {
        setDiagrams(prev => prev.map((d, i) => 
            i === activeTabIndex ? { ...d, code: newCode } : d
        ));
    };

    const handleCommitPlan = async () => {
        setIsSyncing(true);
        try {
            const activeNodes = parseActiveNodes(currentDiagram.code);
            if (activeNodes.length === 0) {
                window.alert("No active nodes found! Tag nodes with :::active or :::active_agent to sync.");
                setIsSyncing(false);
                return;
            }
            
            // 1. Fetch current spec
            const currentSpec = await invoke<any>('get_project_spec');
            
            // 2. Generate Markdown
            const planMarkdown = activeNodes.map(node => {
                const assigneeStr = node.assignee ? ` @${node.assignee}` : '';
                return `- ${node.text}${assigneeStr}`;
            }).join('\n');

            const newSection = `\n\n## Plan: ${currentDiagram.name}\n${planMarkdown}`;

            // 3. Update Spec (Features section)
            // Ensure we handle the SpecData structure correctly (snake_case vs camelCase mapping if any)
            // The backend update_project_spec expects the struct as defined in Rust.
            const updatedSpec = {
                id: 'default',
                name: currentSpec?.name || '',
                overview: currentSpec?.overview || '',
                tech_stack: currentSpec?.tech_stack || currentSpec?.techStack || '',
                data_structure: currentSpec?.data_structure || '',
                features: (currentSpec?.features || '') + newSection, // Append
                design: currentSpec?.design || '',
                rules: currentSpec?.rules || ''
            };

            await invoke('update_project_spec', { spec: updatedSpec });

            window.alert(`Successfully appended ${activeNodes.length} items to Project Specs (Objectives).\nPlease go into the Spec Map to review and turn them into real tasks.`);
        } catch (e: any) {
            console.error("Sync failed:", e);
            window.alert(`Failed to update specs: ${e.message || e}`);
        } finally {
            setIsSyncing(false);
        }
    };

    // 渲染 Mermaid 圖表 (keep existing)
    useEffect(() => {
        const render = async (container: HTMLDivElement | null, code: string) => {
            if (!container) return;
            try {
                // setError(null); // Keep handling
                // 自動修復 Mermaid 標籤
                const fixedCode = fixMermaidLabels(code);
                const id = 'mermaid-svg-' + Math.random().toString(36).substring(7);
                await mermaid.parse(fixedCode);
                const { svg } = await mermaid.render(id, fixedCode);
                container.innerHTML = svg;
                setError(null);
            } catch (err: any) {
                console.error("Mermaid error:", err);
                setError(err.message || 'Syntax Error in Mermaid Code');
            }
        };

        const timeout = setTimeout(() => {
            render(containerRef.current, currentDiagram.code);
            if (isPopupOpen && popupContainerRef.current) {
                render(popupContainerRef.current, currentDiagram.code);
            }
        }, 500);
        
        return () => clearTimeout(timeout);
    }, [currentDiagram.code, isPopupOpen]);

    // 開啟獨立視窗
    // 新增圖表
    const addDiagram = () => {
        const newDiagram: DiagramData = {
            id: `flow-${Date.now()}`,
            name: `新圖表 ${diagrams.length + 1}`,
            type: 'flowchart',
            code: `graph TD
    A["開始"] --> B{"判斷點"}
    B -- "是" --> C["執行"]:::active
    B -- "否" --> D["結束"]`
        };
        setDiagrams(prev => [...prev, newDiagram]);
        setActiveTabIndex(diagrams.length);
        localStorage.setItem('taskrails_planner_diagrams', JSON.stringify([...diagrams, newDiagram]));
    };

    // 刪除當前圖表
    const deleteDiagram = () => {
        if (!confirm(`確定要刪除「${currentDiagram.name}」嗎？`)) return;
        
        if (diagrams.length <= 1) {
            // 刪除最後一個圖表時，重置為預設
            setDiagrams(DEFAULT_DIAGRAMS);
            setActiveTabIndex(0);
            localStorage.removeItem('taskrails_planner_diagrams');
            return;
        }
        
        const newDiagrams = diagrams.filter((_, i) => i !== activeTabIndex);
        setDiagrams(newDiagrams);
        setActiveTabIndex(Math.max(0, activeTabIndex - 1));
        localStorage.setItem('taskrails_planner_diagrams', JSON.stringify(newDiagrams));
    };

    // 重置所有圖表
    const resetDiagrams = () => {
        if (!confirm("確定要重置所有圖表嗎？這將清除所有自訂圖表。")) return;
        setDiagrams(DEFAULT_DIAGRAMS);
        setActiveTabIndex(0);
        localStorage.removeItem('taskrails_planner_diagrams');
    };

    const openPopupWindow = () => {
        setIsPopupOpen(true);
    };

    // Tab 元件
    const TabBar = ({ className }: { className?: string }) => (
        <div className={clsx("flex items-center gap-1 overflow-x-auto", className)}>
            {diagrams.map((diagram, index) => (
                <button
                    key={diagram.id}
                    onClick={() => setActiveTabIndex(index)}
                    className={clsx(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                        index === activeTabIndex
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                    )}
                >
                    {diagram.name}
                </button>
            ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Network className="text-primary" /> 
                        Workflow Visualizer
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-wider">
                        Mermaid Logic Planner & Architecture Graph
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* 新增圖表 */}
                    <button 
                        onClick={addDiagram}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg border border-green-500/20 text-[10px] font-bold uppercase transition-colors"
                        title="新增圖表"
                    >
                        <Plus size={14} /> 新增
                    </button>
                    {/* 刪除當前圖表 */}
                    <button 
                        onClick={deleteDiagram}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 text-[10px] font-bold uppercase transition-colors"
                        title="刪除當前圖表"
                    >
                        <Trash2 size={14} /> 刪除
                    </button>
                    {/* 重置 */}
                    <button 
                        onClick={resetDiagrams}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#16161A] hover:bg-[#202025] text-gray-400 rounded-lg border border-white/5 text-[10px] font-bold uppercase transition-colors"
                        title="重置所有圖表"
                    >
                        <RotateCcw size={14} /> 重置
                    </button>
                    {/* 獨立視窗按鈕 */}
                    <button 
                        onClick={openPopupWindow}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#16161A] hover:bg-[#202025] rounded-lg border border-white/5 text-[10px] font-bold uppercase transition-colors"
                    >
                        <Maximize2 size={14} /> Popup View
                    </button>
                    <button 
                        onClick={handleCommitPlan}
                        disabled={isSyncing}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-bold uppercase transition-colors",
                            isSyncing ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary/80"
                        )}
                    >
                        {isSyncing ? (
                             <>Syncing...</>
                        ) : (
                             <><Save size={14} /> Commit to Specs</>
                        )}
                    </button>
                </div>
            </header>


            {/* Tab 列 */}
            {diagrams.length > 1 && (
                <TabBar className="pb-2 border-b border-white/5" />
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Editor Panel */}
                <div className="flex flex-col bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Layers size={12} /> Mermaid Syntax
                        </span>
                        <span className="text-[9px] text-gray-600 font-mono uppercase">
                            {currentDiagram.type}
                        </span>
                    </div>
                    <textarea 
                        value={currentDiagram.code}
                        onChange={(e) => updateCurrentCode(e.target.value)}
                        className="flex-1 bg-[#0A0A0C] p-4 font-mono text-xs text-blue-300 focus:outline-none resize-none custom-scrollbar leading-relaxed"
                        spellCheck={false}
                    />
                </div>

                {/* Preview Panel */}
                <div className="flex flex-col bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Layers size={120} />
                    </div>
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#16161A]">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Layers size={12} /> Graph Render
                        </span>
                        <div className="text-[9px] text-gray-600 font-mono">Real-time Preview</div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-[#0A0A0C]/50 relative">
                        {/* Rendering Container */}
                        <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
                        
                        {/* Error Overlay */}
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3 backdrop-blur-sm">
                                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <span className="text-[10px] font-mono text-red-200 break-all">{error}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Popup Modal */}
            {isPopupOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="bg-[#0A0A0C] border border-white/10 rounded-3xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Popup Header */}
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0F0F12]">
                            <div className="flex items-center gap-4">
                                <Network className="text-primary" size={24} />
                                <h2 className="text-xl font-black uppercase tracking-wider">Architecture Diagrams</h2>
                            </div>
                            <button 
                                onClick={() => setIsPopupOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="px-6 py-3 border-b border-white/5 bg-[#16161A] flex items-center gap-4">
                            <button 
                                onClick={() => setActiveTabIndex(Math.max(0, activeTabIndex - 1))}
                                disabled={activeTabIndex === 0}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <TabBar className="flex-1" />
                            
                            <button 
                                onClick={() => setActiveTabIndex(Math.min(diagrams.length - 1, activeTabIndex + 1))}
                                disabled={activeTabIndex === diagrams.length - 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Popup Preview */}
                        <div className="flex-1 flex items-center justify-center p-12 overflow-auto bg-[#0A0A0C]/50">
                            <div ref={popupContainerRef} className="w-full h-full flex items-center justify-center" />
                        </div>

                        {/* Popup Footer */}
                        <div className="px-6 py-4 border-t border-white/10 bg-[#0F0F12] flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-mono uppercase">
                                {activeTabIndex + 1} / {diagrams.length} Diagrams
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">
                                {currentDiagram.name} • {currentDiagram.type.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
