import { useState, useEffect, useRef } from 'react';
import { 
    Sparkles, Send, Trash2, Layout, Code, Database, 
    ListChecks, Palette, ShieldCheck, Download, 
    MessageSquare, ChevronRight, Activity, Eye, Play, 
    CheckCircle2, AlertTriangle, Info, Bot, Settings,
    Zap, RefreshCcw
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import clsx from 'clsx';
import mermaid from 'mermaid';
import { AiSettingsDropdown } from './project-setup/AiSettingsDropdown';
import { PROVIDER_MODELS } from '../../constants/ai-models';
import { Language } from '../../utils/projectConfig';
import { getSpecReviewSystemPrompt } from '../../utils/ai-prompts';

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });

interface SpecData {
    name: string;
    overview: string;
    techStack: string;
    dataStructure: string;
    features: string;
    design: string;
    rules: string;
}

interface Diagram {
    id: string;
    name: string;
    type: string;
    code: string;
}

interface ReviewResult {
    score: number;
    completeness: string[];
    risks: string[];
    suggestions: string[];
    optimizedSpec?: {
        overview: string;
        techStack: string;
        dataStructure: string;
        features: string;
        design: string;
        rules: string;
    };
}

export default function SpecPage({ onInjectTasks, onNavigate, onShowToast }: { 
    onInjectTasks?: (spec: any) => void;
    onNavigate?: (view: string) => void;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
    const t = useTranslation();
    const st = t.specs;

    const [spec, setSpec] = useState<SpecData>({
        name: '',
        overview: '',
        techStack: '',
        dataStructure: '',
        features: '',
        design: '',
        rules: ''
    });

    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [activeDiagramIndex, setActiveDiagramIndex] = useState(0);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
    const [category, setCategory] = useState('web');
    
    // AI Settings State (Consistent with Setup Hub)
    const [currentProvider, setCurrentProvider] = useState<string>('google');
    const [currentModel, setCurrentModel] = useState<string>('gemini-2.0-flash');
    const [outputLanguage, setOutputLanguage] = useState<Language>('zh-TW');
    const [showAiSettings, setShowAiSettings] = useState(false);
    const [availableProviders, setAvailableProviders] = useState<string[]>(['google', 'openai', 'anthropic', 'ollama']);

    const diagramRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const load = async () => {
            try {
                // 1. Load Spec
                const saved = await invoke<any>('get_project_spec');
                if (saved) {
                    setSpec({
                        name: saved.name || '',
                        overview: saved.overview || '',
                        techStack: saved.tech_stack || '',
                        dataStructure: saved.data_structure || '',
                        features: saved.features || '',
                        design: saved.design || '',
                        rules: saved.rules || ''
                    });
                } else {
                    setSpec({ name: '', overview: '', techStack: '', dataStructure: '', features: '', design: '', rules: '' });
                }
                
                // 2. Load Diagrams
                const savedDiagrams = localStorage.getItem('taskrails_planner_diagrams');
                if (savedDiagrams) setDiagrams(JSON.parse(savedDiagrams));

                // 3. Load AI Settings
                const available: string[] = ['ollama', 'custom'];
                for (const p of Object.keys(PROVIDER_MODELS)) {
                    if (p === 'ollama' || p === 'custom') continue;
                    let key = await invoke<string | null>('get_setting', { key: `ai_api_key_${p}` }).catch(() => null);
                    if (!key) key = localStorage.getItem(`taskrails_api_key_${p}`);
                    if (key && key.trim().length > 0) available.push(p);
                }
                setAvailableProviders(available);

                let provider = await invoke<string | null>('get_setting', { key: 'ai_provider' }).catch(() => null);
                let model = await invoke<string | null>('get_setting', { key: 'ai_model' }).catch(() => null);
                if (!provider) provider = localStorage.getItem('taskrails_ai_provider');
                if (!model) model = localStorage.getItem('taskrails_ai_model');
                if (provider && available.includes(provider)) {
                    setCurrentProvider(provider);
                    if (model) setCurrentModel(model);
                }
            } catch (err) {
                console.error('Failed to load spec:', err);
            }
        };
        load();

        // Listen for AI settings changes
        const unlistenAiSettings = listen('ai-settings-changed', (event: any) => {
            const { provider, model, language } = event.payload;
            if (provider) setCurrentProvider(provider);
            if (model) setCurrentModel(model);
            if (language) setOutputLanguage(language);
        });

        // Listen for spec updates from ProjectAnalyzer
        const unlistenSpecUpdate = listen('spec-updated', async () => {
            console.log('[SpecPage] Received spec-updated event, reloading...');
            try {
                const saved = await invoke<any>('get_project_spec');
                if (saved) {
                    setSpec({
                        name: saved.name || '',
                        overview: saved.overview || '',
                        techStack: saved.tech_stack || '',
                        dataStructure: saved.data_structure || '',
                        features: saved.features || '',
                        design: saved.design || '',
                        rules: saved.rules || ''
                    });
                    console.log('[SpecPage] Spec reloaded successfully');
                }
            } catch (err) {
                console.error('[SpecPage] Failed to reload spec:', err);
            }
        });

        return () => {
            unlistenAiSettings.then((f: any) => f());
            unlistenSpecUpdate.then((f: any) => f());
        };
    }, []);

    // ... existing Mermaid effect ...
    useEffect(() => {
        if (diagramRef.current && diagrams[activeDiagramIndex]) {
            const render = async () => {
                try {
                    const id = `spec-mermaid-${activeDiagramIndex}`;
                    const { svg } = await mermaid.render(id, diagrams[activeDiagramIndex].code);
                    if (diagramRef.current) diagramRef.current.innerHTML = svg;
                } catch (e) { console.error('Mermaid render error:', e); }
            };
            render();
        }
    }, [diagrams, activeDiagramIndex]);

    const handleReview = async () => {
        setIsReviewing(true);
        setIsReviewOpen(true);
        try {
            const prompt = `Analyze and optimize the following project specification:
            
            Project Name: ${spec.name}
            Project Goal: ${spec.overview}
            Tech Stack: ${spec.techStack}
            Data Structure: ${spec.dataStructure}
            Features: ${spec.features}
            Design Guidelines: ${spec.design}
            Engineering Rules: ${spec.rules}

            Provide JSON scoring and optimized content for each field.`;
            
            const result = await invoke<string>('execute_ai_chat', { 
                messages: [
                    { role: 'system', content: getSpecReviewSystemPrompt(outputLanguage) },
                    { role: 'user', content: prompt }
                ],
                overrideProvider: currentProvider,
                overrideModel: currentModel
            });
            
            const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                setReviewResult(parsed);
            } else {
                onShowToast?.("AI 解析格式錯誤", 'error');
            }
        } catch (e) {
            console.error('Review failed:', e);
            onShowToast?.("分析失敗", 'error');
        } finally {
            setIsReviewing(false);
        }
    };

    const applyOptimizedSpec = () => {
        if (!reviewResult?.optimizedSpec) return;
        const opt = reviewResult.optimizedSpec;
        setSpec(prev => ({
            ...prev,
            overview: opt.overview || prev.overview,
            techStack: opt.techStack || prev.techStack,
            dataStructure: opt.dataStructure || prev.dataStructure,
            features: opt.features || prev.features,
            design: opt.design || prev.design,
            rules: opt.rules || prev.rules
        }));
        onShowToast?.("已套用 AI 優化內容", 'success');
        handleAutoSave();
    };

    const handleInputChange = (field: keyof SpecData, value: string) => {
        setSpec(prev => ({ ...prev, [field]: value }));
    };

    const handleAutoSave = async () => {
        try {
            await invoke('update_project_spec', { 
               spec: {
                   id: 'default',
                   name: spec.name,
                   overview: spec.overview,
                   tech_stack: spec.techStack,
                   data_structure: spec.dataStructure,
                   features: spec.features,
                   design: spec.design,
                   rules: spec.rules
               }
            });
        } catch (err) { console.error('Auto-save failed:', err); }
    };

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
                onBlur={handleAutoSave}
                placeholder={placeholder}
                className="w-full bg-[#0D0D0F] border border-white/5 rounded-xl p-4 text-[13px] text-gray-200 placeholder:text-gray-800 focus:outline-none focus:border-primary/30 focus:bg-[#111115] transition-all min-h-[100px] custom-scrollbar leading-relaxed"
            />
        </div>
    );

    return (
        <div className="h-full flex min-w-0 bg-[#0A0A0C] text-white">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 p-8 overflow-y-auto custom-scrollbar">
                <header className="flex items-end justify-between mb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Bot size={14} className="text-primary animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Project Explorer / Specifications</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                            Mission <span className="text-primary underline decoration-primary/30 decoration-4 underline-offset-8">Blueprints</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 bg-[#0D0D0F] p-2 rounded-2xl border border-white/5 shadow-2xl">
                        <AiSettingsDropdown 
                            currentProvider={currentProvider}
                            setCurrentProvider={setCurrentProvider}
                            currentModel={currentModel}
                            setCurrentModel={setCurrentModel}
                            outputLanguage={outputLanguage}
                            setOutputLanguage={setOutputLanguage}
                            availableProviders={availableProviders}
                            showAiSettings={showAiSettings}
                            setShowAiSettings={setShowAiSettings}
                        />

                        <div className="w-px h-6 bg-white/5"></div>

                        <button 
                            onClick={handleReview}
                            disabled={isReviewing}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-primary/20"
                        >
                            <Activity size={14} className={clsx(isReviewing && "animate-spin")} /> {isReviewing ? "Analyzing..." : "AI REVIEW"}
                        </button>
                        <button 
                            onClick={async () => {
                                if (onInjectTasks) onInjectTasks(spec);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-green-500/20"
                        >
                            <Play size={14} /> Launch to Kanban
                        </button>
                    </div>
                </header>

                <div className="flex-1 space-y-8">
                    <div className="p-8 bg-[#0F0F12] border border-white/5 rounded-3xl space-y-8 shadow-inner">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">MISSION_IDENTIFIER</label>
                            <input 
                                type="text" 
                                value={spec.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                onBlur={handleAutoSave}
                                className="w-full bg-transparent border-b border-white/10 text-3xl font-black text-white focus:outline-none focus:border-primary transition-all py-3 placeholder-white/5"
                                placeholder="UNNAMED_PROTOTYPE"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <Field label="PURPOSE_OVERVIEW" icon={Layout} field="overview" placeholder="What problem does this project solve?" />
                            <Field label="TECHNOLOGY_STACK" icon={Code} field="techStack" placeholder="Libraries, Languages, Frameworks..." />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                            <Field label="DATA_ARCH" icon={Database} field="dataStructure" placeholder="Models, Schemas, JSON structures..." />
                            <Field label="DESIGN_GUIDELINES" icon={Palette} field="design" placeholder="Visual style, branding, colors..." />
                        </div>

                        <Field label="FUNCTIONAL_REQUIREMENTS" icon={ListChecks} field="features" placeholder="Detailed feature list in Markdown..." />
                        <Field label="ENGINEERING_PROTOCOLS" icon={ShieldCheck} field="rules" placeholder="Linting, Testing, Commit conventions..." />
                    </div>
                </div>
            </div>

            {/* Side Panel: Diagrams & Review */}
            <div className="w-[450px] border-l border-white/5 bg-[#0D0D0F] flex flex-col overflow-hidden">
                {/* Side Nav Tabs */}
                <div className="flex border-b border-white/5">
                    <button 
                        onClick={() => setIsReviewOpen(false)}
                        className={clsx(
                            "flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                            !isReviewOpen ? "text-primary bg-primary/5" : "text-gray-500 hover:text-white"
                        )}
                    >
                        <Eye size={14} /> Workflow Visualizer
                    </button>
                    <button 
                        onClick={() => setIsReviewOpen(true)}
                        className={clsx(
                            "flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                            isReviewOpen ? "text-primary bg-primary/5" : "text-gray-500 hover:text-white"
                        )}
                    >
                        <MessageSquare size={14} /> AI Analysis
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {!isReviewOpen ? (
                        <div className="space-y-6">
                            {/* Diagram Selector */}
                            <div className="grid grid-cols-2 gap-2">
                                {diagrams.map((d, i) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setActiveDiagramIndex(i)}
                                        className={clsx(
                                            "px-3 py-2 rounded-lg text-[10px] font-bold text-left transition-all border",
                                            activeDiagramIndex === i 
                                                ? "bg-primary/20 border-primary/50 text-white" 
                                                : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                                        )}
                                    >
                                        <div className="truncate">{d.name}</div>
                                        <div className="text-[8px] opacity-40 uppercase">{d.type}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Mermaid Container */}
                            <div className="bg-[#050507] border border-white/5 rounded-2xl p-6 min-h-[300px] flex items-center justify-center overflow-auto">
                                <div ref={diagramRef} className="w-full h-full flex items-center justify-center" />
                            </div>
                            
                            {diagrams[activeDiagramIndex] && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Diagram Source</h4>
                                        <div className="font-mono text-[10px] text-gray-600 line-clamp-4 overflow-hidden italic">
                                            {diagrams[activeDiagramIndex].code}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onNavigate?.('planner')}
                                        className="w-full py-4 border border-dashed border-white/10 rounded-xl text-[10px] font-black text-gray-600 uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
                                    >
                                        Edit in Planner <ChevronRight size={14} />
                                    </button>
                                </div>
                            ) || (
                                <div className="text-center py-20 text-gray-700">
                                    <Activity size={40} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Diagrams Detected</p>
                                    <p className="text-[10px] opacity-40 mt-1">Generate them in Project Setup Hub</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {reviewResult ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Architectural Score</span>
                                            <span className="text-5xl font-black text-primary italic">{reviewResult.score}<span className="text-lg opacity-40 not-italic ml-1">/100</span></span>
                                        </div>
                                        <div className={clsx(
                                            "w-16 h-16 rounded-full border-4 flex items-center justify-center",
                                            reviewResult.score > 80 ? "border-green-500 text-green-500" : "border-yellow-500 text-yellow-500"
                                        )}>
                                            <CheckCircle2 size={32} />
                                        </div>
                                    </div>

                                    {reviewResult.optimizedSpec && (
                                        <button 
                                            onClick={applyOptimizedSpec}
                                            className="w-full py-4 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(242,153,74,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Sparkles size={14} /> Apply AI Optimizations
                                        </button>
                                    )}

                                    <div className="space-y-6">
                                        <ReviewSection title="COMPLETENESS" icon={Info} items={reviewResult.completeness} color="text-blue-400" />
                                        <ReviewSection title="POTENTIAL_RISKS" icon={AlertTriangle} items={reviewResult.risks} color="text-red-400" />
                                    </div>

                                    <button 
                                        onClick={handleReview}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
                                    >
                                        RE-ANALYZE
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-20 text-gray-700">
                                    <Sparkles size={40} className="mx-auto mb-4 opacity-10 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Analysis</p>
                                    <p className="text-[10px] opacity-40 mt-1">Click "AI REVIEW" to start system scan</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-white/5 flex gap-3">
                    <button 
                        onClick={async () => {
                             const content = `# ${spec.name}\n\n## Overview\n${spec.overview}\n\n## Tech Stack\n${spec.techStack}\n\n## Data Structure\n${spec.dataStructure}\n\n## Objectives\n${spec.features}\n\n## Design\n${spec.design}\n\n## Rules\n${spec.rules}`;
                             try {
                                 await invoke('save_md_file', { content, filename: `${spec.name.replace(/\s+/g, '_')}_Specs.md` });
                             } catch (e) {
                                  console.error(e);
                                  onShowToast?.('Export failed', 'error');
                             }
                        }}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                        <Download size={14} /> EXPORT_BLUEPRINT
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReviewSection({ title, icon: Icon, items, color }: { title: string, icon: any, items: string[], color: string }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="space-y-3">
            <h5 className={clsx("text-[10px] font-black flex items-center gap-2 uppercase tracking-wider", color)}>
                <Icon size={12} /> {title}
            </h5>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-3 text-[11px] text-gray-400 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                        <span className="text-primary font-bold">•</span>
                        <p>{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
