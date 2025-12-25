import { useState, useEffect, useRef } from 'react';
import { Network, Wand2, Save, Play, FileCode, Layers, AlertCircle } from 'lucide-react';
import mermaid from 'mermaid';
import clsx from 'clsx';
// import { useTranslation } from '../../hooks/useTranslation';

// Initialize Mermaid globally
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter',
});

const TEMPLATES = {
    flowchart: {
        label: 'Flowchart',
        code: `graph TD
    A[Start] --> B{Is it safe?}
    B -- Yes --> C[Proceed]
    B -- No --> D[Stop]
    style A fill:#0A0A0C,stroke:#333,stroke-width:2px
    style B fill:#0A0A0C,stroke:#333,stroke-width:2px
    style C fill:#0f0,stroke:#333,stroke-width:2px,color:#000
    style D fill:#f00,stroke:#333,stroke-width:2px,color:#fff`
    },
    sequence: {
        label: 'Sequence',
        code: `sequenceDiagram
    participant U as User
    participant S as System
    participant D as Database
    U->>S: Request Data
    S->>D: Query
    D-->>S: Return Result
    S-->>U: Show Response`
    },
    class: {
        label: 'Class Diagram',
        code: `classDiagram
    class Agent {
        +String name
        +String role
        +execute()
    }
    class Task {
        +String title
        +String status
    }
    Agent "1" -- "*" Task : manages`
    },
    state: {
        label: 'State Machine',
        code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Event
    Processing --> Success
    Processing --> Error
    Error --> Idle : Reset`
    },
    er: {
        label: 'ER Diagram',
        code: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CATEGORY ||--|{ ITEM : contains`
    }
};

export default function Planner() {
    const [mermaidCode, setMermaidCode] = useState(TEMPLATES.flowchart.code);
    const [showTemplates, setShowTemplates] = useState(false);
    const [error, setError] = useState<string | null>(null); // Restored
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const render = async () => {
            if (!containerRef.current) return;
            try {
                // Clear error
                setError(null);
                // Ensure unique ID for multiple renders
                const id = 'mermaid-svg-' + Math.random().toString(36).substring(7);
                
                // Parse first to catch syntax errors without rendering
                await mermaid.parse(mermaidCode);

                // Render
                const { svg } = await mermaid.render(id, mermaidCode);
                containerRef.current.innerHTML = svg;
            } catch (err: any) {
                console.error("Mermaid error:", err);
                // Keep the previous graph if parsing fails, but show error
                setError(err.message || 'Syntax Error in Mermaid Code');
            }
        };

        const timeout = setTimeout(render, 500); // 500ms debounce
        return () => clearTimeout(timeout);
    }, [mermaidCode]);

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Network className="text-primary" /> 
                        Workflow Visualizer
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-wider">Mermaid Logic Planner & Architecture Graph</p>
                </div>
                <div className="flex gap-2">
                    {/* Template Selector */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowTemplates(!showTemplates)}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors",
                                showTemplates ? "bg-white/10 border-white/20 text-white" : "bg-[#16161A] hover:bg-[#202025] border-white/5 text-gray-400"
                            )}
                        >
                            <FileCode size={14} /> Templates
                        </button>
                        {/* Dropdown */}
                        {showTemplates && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#16161A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-1 space-y-0.5">
                                    {Object.entries(TEMPLATES).map(([key, template]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setMermaidCode(template.code);
                                                setShowTemplates(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between group"
                                        >
                                            {template.label}
                                            <span className="opacity-0 group-hover:opacity-100 text-primary">→</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#16161A] hover:bg-[#202025] rounded-lg border border-white/5 text-[10px] font-bold uppercase transition-colors">
                        <Save size={14} /> Save Plan
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[10px] font-bold uppercase transition-colors">
                        <Wand2 size={14} /> AI Refine
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Editor Panel */}
                <div className="flex flex-col bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileCode size={12} /> Mermaid Syntax
                        </span>
                    </div>
                    <textarea 
                        value={mermaidCode}
                        onChange={(e) => setMermaidCode(e.target.value)}
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

                    <div className="p-4 border-t border-white/5 flex justify-end">
                         <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-primary/20">
                            <Play size={14} /> Inject to Context
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
