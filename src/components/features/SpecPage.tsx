import { useState, useEffect } from 'react';
import { Sparkles, Send, Trash2, Layout, Code, Database, ListChecks, Palette, ShieldCheck, Download } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface SpecData {
    name: string;
    overview: string;
    techStack: string;
    data_structure: string;
    features: string;
    design: string;
    rules: string;
}

interface SpecPageProps {
    onInjectTasks?: (features: string) => void;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function SpecPage({ onInjectTasks, onShowToast }: SpecPageProps) {
    const t = useTranslation();
    const st = t.specs;

    const [spec, setSpec] = useState<SpecData>({
        name: '',
        overview: '',
        techStack: '',
        data_structure: '',
        features: '',
        design: '',
        rules: ''
    } as any);

    const [category, setCategory] = useState<'web' | 'desktop' | 'esp' | 'backend' | 'mobile' | 'game' | 'web3' | 'bot' | 'ml' | 'extension'>('web');
    
    // Initial Load
    useEffect(() => {
        const load = async () => {
             // Load Spec
            try {
                const saved = await invoke<any>('get_project_spec');
                if (saved) {
                    setSpec({
                       name: saved.name || '',
                       overview: saved.overview || '',
                       techStack: saved.tech_stack || '',
                       data_structure: saved.data_structure || '',
                       features: saved.features || '',
                       design: saved.design || '',
                       rules: saved.rules || ''
                    } as any);
                }
            } catch (err) {
                console.error('Failed to load spec:', err);
            }
        };
        load();
    }, []);

    // Auto-save Spec
    useEffect(() => {
        const save = async () => {
             if (!spec.name && !spec.overview) return;
             try {
                 await invoke('update_project_spec', { 
                    spec: {
                        id: 'default',
                        name: spec.name,
                        overview: spec.overview,
                        tech_stack: (spec as any).techStack || (spec as any).tech_stack,
                        data_structure: (spec as any).dataStructure || (spec as any).data_structure,
                        features: spec.features,
                        design: spec.design,
                        rules: spec.rules
                    }
                 });
             } catch (err) {
                 console.error('Auto-save failed:', err);
             }
        };
        const timer = setTimeout(save, 2000);
        return () => clearTimeout(timer);
    }, [spec]);

    const templates: Record<string, SpecData> = {
        web: {
            name: "新世代 Web 應用程式",
            overview: "一個基於 AI 驅動的數據可視化平台，旨在提供即時決策支援。",
            techStack: "- 前端: React 19, Vite, Tailwind CSS\n- 後端: Rust (Tauri), Node.js\n- 資料庫: SQLite (整合 Prisma)",
            data_structure: "**使用者 (User):** id, username, email\n**專案 (Project):** id, name, owner_id\n**任務 (Task):** id, title, status, priority",
            features: "## 第一階段: 核心開發 (MVP)\n1. 使用者認證與權限管理\n2. 基礎看板介面開發\n3. 資料庫連動功能實作\n\n## 第二階段: AI 增強\n1. AI 自動化流程建議系統\n2. 智慧型任務分配演算法",
            design: "- 主色調: #F2994A (活力橘)\n- 風格: 玻璃擬態 (Glassmorphism), 深色模式優先",
            rules: "- TypeScript 嚴格模式\n- API 需要包含錯誤重試機制\n- 組件需符合響應式設計規範"
        },
        desktop: {
            name: "高效能桌面工具",
            overview: "跨平台本地端效能監控與自動化工具。",
            techStack: "- 核心: Rust (高性能並發處理)\n- 介面: React + Framer Motion",
            data_structure: "**設定 (Config):** key, value, updated_at\n**紀錄 (Log):** timestamp, event_type, message",
            features: "## 第一階段\n1. 系統資源監控模組\n2. 本地檔案系統快速掃描\n\n## 第二階段\n1. 自動化腳本執行引擎",
            design: "- 無邊框窗口設計\n- 系統原生毛玻璃特效",
            rules: "- 邏輯層必須在 Rust 實作\n- 記憶體消耗需維持在 100MB 以下"
        },
        esp: {
            name: "ESP32 工業物聯網終端",
            overview: "工業級環境監測與自動化控制系統。",
            techStack: "- 硬體: ESP32-S3-WROOM-1\n- 框架: ESP-IDF v5.1\n- 通訊: MQTT, WebSockets",
            data_structure: "**感測器 (Sensor):** id, type, pin_config\n**讀數 (Reading):** sensor_id, value, timestamp",
            features: "## 第一階段\n1. WiFi 與配網系統\n2. 即時感測器數據採集 (I2C)\n\n## 第二階段\n1. OTA 遠端韌體更新系統",
            design: "- OLED 128x64 嵌入式 UI\n- 狀態指示燈燈效設計 (NeoPixel)",
            rules: "- 嚴禁阻塞型 Delay\n- 必須實作傳輸加密 (TLS/SSL)"
        }
    };

    const handleInputChange = (field: keyof SpecData, value: string) => {
        setSpec(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateAI = () => {
        const selectedTemplate = templates[category] || templates.web;
        setSpec(selectedTemplate);
        onShowToast?.(st.toast.generated, 'success');
    };

    const handleInject = () => {
        if (!spec.features) {
            onShowToast?.("請先填寫功能清單", 'error');
            return;
        }
        onInjectTasks?.(spec.features);
    };

    const resetSpec = () => {
        if (confirm('確定要清空所有內容嗎？')) {
            setSpec({ name: '', overview: '', techStack: '', data_structure: '', features: '', design: '', rules: '' });
        }
    };

    const openAiChat = async () => {
        try {
            await invoke('open_chat_window');
        } catch (err) {
            console.error("Failed to open chat window:", err);
            onShowToast?.(`Failed to open chat window: ${err}`, 'error');
        }
    }

    const Field = ({ label, icon: Icon, field, placeholder }: { label: string, icon: any, field: keyof SpecData, placeholder: string }) => (
        <div className="group space-y-2">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">
                    <Icon size={12} />
                    {label}
                </label>
            </div>
            <textarea 
                value={spec[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#0D0D0F] border border-white/5 rounded-xl p-4 text-sm text-gray-200 placeholder:text-gray-800 focus:outline-none focus:border-primary/30 focus:bg-[#111115] transition-all min-h-[120px] custom-scrollbar leading-relaxed"
            />
        </div>
    );

    return (
        <div className="h-full flex flex-col min-w-0 relative">
            {/* Header Area */}
            <div className="flex items-end justify-between mb-8">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(242,153,74,0.6)]"></div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Module: SpecArchitect_v2.5</span>
                   </div>
                   <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                      Mission <span className="text-primary underline decoration-primary/30 decoration-4 underline-offset-8">Objectives</span>
                   </h1>
                </div>

                <div className="flex items-center gap-2 bg-[#0D0D0F] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="bg-transparent text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 py-2 focus:outline-none cursor-pointer hover:text-white transition-colors"
                    >
                        {Object.keys(st.categories).map(cat => (
                            <option key={cat} value={cat} className="bg-[#0D0D0F]">{st.categories[cat as keyof typeof st.categories]}</option>
                        ))}
                    </select>
                    <div className="w-px h-6 bg-white/5 mx-1"></div>
                    <button 
                        onClick={openAiChat}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white shadow-lg shadow-black/50"
                        )}
                    >
                        <Sparkles size={14} /> AI_CONSULT
                    </button>
                </div>
            </div>

            {/* Layout Grid - Lower Z-Index */}
            <div className="flex-1 flex gap-8 min-h-0 z-0">
                {/* Left Column: Editor Surface */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="p-8 bg-[#0F0F12] border border-white/5 rounded-3xl space-y-8 shadow-inner">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">{st.placeholders.name}</label>
                            <input 
                                type="text" 
                                value={spec.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 text-3xl font-black text-white focus:outline-none focus:border-primary transition-all py-3 placeholder-white/5 leading-none"
                                placeholder="UNNAMED_MISSION_DATA"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <Field label="MISSION_OVERVIEW" icon={Layout} field="overview" placeholder={st.placeholders.overview} />
                            <Field label="TECH_STRATUM" icon={Code} field="techStack" placeholder={st.placeholders.techStack} />
                            <Field label="DATA_SCHEMA" icon={Database} field="data_structure" placeholder={st.placeholders.dataStructure} />
                            <Field label="DESIGN_ASSETS" icon={Palette} field="design" placeholder={st.placeholders.design} />
                        </div>

                        <Field label="CORE_OBJECTIVES (MARKDOWN)" icon={ListChecks} field="features" placeholder={st.placeholders.features} />
                        <Field label="ENGINEERING_RULES" icon={ShieldCheck} field="rules" placeholder={st.placeholders.rules} />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-4 py-6">
                        <button 
                            onClick={handleGenerateAI}
                            className="flex-1 h-14 flex items-center justify-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all group"
                        >
                            <Layout size={16} className="group-hover:text-primary transition-colors" /> LOAD_TEMPLATE
                        </button>
                        <button 
                            onClick={handleInject}
                            className="flex-[1.5] h-14 flex items-center justify-center gap-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all shadow-lg active:scale-95"
                        >
                            <Send size={16} /> DEPLOY_TO_MISSION_BOARD
                        </button>
                    </div>
                     
                    {/* Utility Actions */}
                    <div className="flex gap-4">
                        <button 
                            onClick={async () => {
                                const content = `# ${spec.name}\n\n## Overview\n${spec.overview}\n\n## Tech Stack\n${spec.techStack}\n\n## Data Structure\n${spec.data_structure}\n\n## Objectives\n${spec.features}\n\n## Design\n${spec.design}\n\n## Rules\n${spec.rules}`;
                                try {
                                    await invoke('save_md_file', { content, filename: `${spec.name.replace(/\s+/g, '_')}_Specs.md` });
                                } catch (e) {
                                    console.error(e);
                                    onShowToast?.('Export failed', 'error');
                                }
                            }}
                            className="flex-1 py-3 bg-[#16161A] hover:bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:text-white transition-all"
                        >
                            <Download size={14} /> EXPORT_MD
                        </button>

                        <button 
                            onClick={resetSpec}
                            className="w-14 h-12 flex items-center justify-center bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 border border-red-500/10 rounded-xl transition-all"
                            title="Clear Specs (Create New)"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Right Column: Digital Blueprint Preview */}
                <div className="w-[450px] bg-[#070708] border border-white/5 rounded-3xl p-10 overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col group/preview">
                    {/* ... (Existing Preview Content) ... */}
                    <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none group-hover/preview:opacity-40 transition-opacity">
                        <div className="text-[60px] font-black text-white/5 leading-none select-none italic">SPEC</div>
                    </div>
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Status: Verified</span>
                            <span className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">Digital_Blueprint_Buffer</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                            <div className="w-1 h-3 bg-white/10 rounded-full"></div>
                        </div>
                    </div>
                     <div className="prose prose-invert prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:text-gray-400 prose-p:leading-relaxed relative z-10">
                        <h1 className="text-white italic mt-0 text-3xl mb-8 tracking-tighter">{spec.name || 'AWAITING_DATA'}</h1>
                        <div className="space-y-10">
                             <section className="relative">
                                <span className="absolute -left-6 top-1 text-[8px] font-black text-primary/40 vertical-text">01</span>
                                <h4 className="text-gray-200 text-xs font-black tracking-widest mb-4 opacity-80 uppercase">Mission_Overview</h4>
                                <p className="whitespace-pre-wrap text-[13px] border-l-2 border-white/5 pl-4">{spec.overview || 'Architecture pending input...'}</p>
                            </section>
                             <section className="relative">
                                <span className="absolute -left-6 top-1 text-[8px] font-black text-primary/40 vertical-text">02</span>
                                <h4 className="text-gray-200 text-xs font-black tracking-widest mb-4 opacity-80 uppercase">Tech_Stratum</h4>
                                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl font-mono text-[11px] text-gray-500 whitespace-pre-wrap leading-loose">
                                    {spec.techStack || '// No stratum defined'}
                                </div>
                            </section>
                             <section className="relative">
                                <span className="absolute -left-6 top-1 text-[8px] font-black text-primary/40 vertical-text">03</span>
                                <h4 className="text-gray-200 text-xs font-black tracking-widest mb-4 opacity-80 uppercase">Deployment_Objectives</h4>
                                <div className="text-sm border border-primary/20 rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-transparent shadow-inner">
                                    <p className="whitespace-pre-wrap font-bold text-gray-300 leading-relaxed">{spec.features || 'Objectives not yet mapped'}</p>
                                </div>
                            </section>
                            <section className="relative">
                                <span className="absolute -left-6 top-1 text-[8px] font-black text-primary/40 vertical-text">04</span>
                                <h4 className="text-gray-200 text-xs font-black tracking-widest mb-4 opacity-80 uppercase">Operational_Rules</h4>
                                <p className="whitespace-pre-wrap text-[12px] italic text-gray-500 px-4">{spec.rules || 'Standard protocols apply'}</p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
