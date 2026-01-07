import { useState } from 'react';
import { Scan, FileCode, Brain, Sparkles, Download, AlertCircle, Check, Loader2, Server, Cloud, Users, Network, ArrowRight } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import clsx from 'clsx';
import { getProjectAnalyzerSystemPrompt, getCurrentOutputLanguage } from '../../utils/ai-prompts';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { useTranslation } from '../../hooks/useTranslation';


interface ProjectScanResult {
    total_files: number;
    total_lines: number;
    file_tree: FileNode[];
    tech_stack: string[];
    entry_points: string[];
    key_files: KeyFile[];
}

interface FileNode {
    path: string;
    name: string;
    is_dir: boolean;
    extension: string | null;
    size: number;
    children: FileNode[];
}

interface KeyFile {
    path: string;
    file_type: string;
    summary: string;
    line_count: number;
}

// Structured AI analysis result
interface AnalyzedProject {
    spec: {
        name: string;
        overview: string;
        techStack: string;
        dataStructure: string;
        features: string;
        design: string;
        rules: string;
    };
    agents: {
        id: string;
        name: string;
        role: string;
        skills: string[];
        systemPrompt: string;
        goals?: string[];  // Agent 的目標
        tasks?: {          // Agent 的具體任務
            title: string;
            description: string;
        }[];
    }[];
    diagrams: {
        id: string;
        name: string;
        type: string;
        code: string;
    }[];
}

type AnalysisStep = 'idle' | 'scanning' | 'generating' | 'saving' | 'done' | 'error';
type AiSource = 'lmstudio' | 'ollama' | 'cloud';

export default function ProjectAnalyzer() {
    const t = useTranslation().projectAnalyzerUI;
    const [step, setStep] = useState<AnalysisStep>('idle');
    const [scanResult, setScanResult] = useState<ProjectScanResult | null>(null);
    const [generatedDocs, setGeneratedDocs] = useState<string>('');
    const [analyzedProject, setAnalyzedProject] = useState<AnalyzedProject | null>(null);
    const [error, setError] = useState<string>('');
    const [aiSource, setAiSource] = useState<AiSource>('cloud');
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [loadingSubMessage, setLoadingSubMessage] = useState<string>('');

    const handleScanProject = async () => {
        setStep('scanning');
        setError('');
        setLoadingMessage(t.loading.scanning);
        setLoadingSubMessage(t.loading.scanningFiles);
        try {
            const result = await invoke<ProjectScanResult>('scan_project');
            setScanResult(result);
            setStep('idle');
        } catch (e: any) {
            setError(e.toString());
            setStep('error');
        } finally {
            setLoadingMessage('');
            setLoadingSubMessage('');
        }
    };

    const handleGenerateDocs = async () => {
        if (!scanResult) return;
        
        setStep('generating');
        setError('');
        setAnalyzedProject(null);
        setLoadingMessage(t.loading.aiAnalyzing);
        setLoadingSubMessage(
            aiSource === 'lmstudio' ? t.loading.lmStudio : 
            aiSource === 'ollama' ? t.loading.ollama : 
            t.loading.cloud
        );
        
        try {
            // Get project name from workspace path
            let projectName = 'Unknown Project';
            try {
                const workspacePath = await invoke<string | null>('get_setting', { key: 'workspace_path' });
                if (workspacePath) {
                    projectName = workspacePath.split(/[\\/]/).pop() || workspacePath;
                }
            } catch {
                console.warn('[ProjectAnalyzer] Could not get workspace path');
            }

            // Build context from scan results with project name
            const context = `# Project Scan Results

## Project Name
${projectName}

## Statistics
- Total Files: ${scanResult.total_files}
- Total Lines: ${scanResult.total_lines}

## Technology Stack
${scanResult.tech_stack.map(t => `- ${t}`).join('\n')}

## Entry Points
${scanResult.entry_points.map(e => `- ${e}`).join('\n')}

## Key Files (Top 10)
${scanResult.key_files.slice(0, 10).map(f => `- ${f.path} (${f.line_count} lines): ${f.summary}`).join('\n')}`;

            let docs: string;
            
            // Determine provider based on AI source selection
            let overrideProvider: string | undefined = undefined;
            if (aiSource === 'lmstudio') {
                overrideProvider = 'custom';  // LM Studio uses OpenAI-compatible API
            } else if (aiSource === 'ollama') {
                overrideProvider = 'ollama';  // Ollama has its own API
            }
            // cloud uses default provider from settings
            
            const response = await invoke<string>('execute_ai_chat', {
                messages: [
                    { role: 'system', content: getProjectAnalyzerSystemPrompt(getCurrentOutputLanguage()) },
                    { role: 'user', content: context }
                ],
                ...(overrideProvider && { overrideProvider })
            });
            docs = response;
            
            setGeneratedDocs(docs);
            
            // Try to parse structured JSON from AI response with multiple strategies
            let parsed: AnalyzedProject | null = null;
            
            // Strategy 1: Look for ```json code block
            const jsonCodeBlockMatch = docs.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonCodeBlockMatch) {
                try {
                    // Clean up the JSON string - some AI models add extra escapes
                    let jsonStr = jsonCodeBlockMatch[1]
                        .replace(/\\n/g, '\n')  // Convert escaped newlines to actual newlines
                        .replace(/\\\\/g, '\\'); // Fix double escapes
                    parsed = JSON.parse(jsonStr) as AnalyzedProject;
                    console.log('[ProjectAnalyzer] Strategy 1 (code block) succeeded:', parsed);
                } catch (e1) {
                    console.warn('[ProjectAnalyzer] Strategy 1 failed:', e1);
                }
            }
            
            // Strategy 2: Look for standalone JSON object
            if (!parsed) {
                const jsonObjectMatch = docs.match(/\{[\s\S]*"spec"[\s\S]*\}/);
                if (jsonObjectMatch) {
                    try {
                        parsed = JSON.parse(jsonObjectMatch[0]) as AnalyzedProject;
                        console.log('[ProjectAnalyzer] Strategy 2 (standalone object) succeeded:', parsed);
                    } catch (e2) {
                        console.warn('[ProjectAnalyzer] Strategy 2 failed:', e2);
                    }
                }
            }
            
            // Strategy 3: Try to find and fix common JSON issues
            if (!parsed && jsonCodeBlockMatch) {
                try {
                    let fixedJson = jsonCodeBlockMatch[1]
                        .replace(/'/g, '"')  // Replace single quotes with double quotes
                        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
                        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
                        .replace(/\n/g, '\\n')   // Escape actual newlines in strings
                        .replace(/\t/g, '\\t');  // Escape tabs
                    parsed = JSON.parse(fixedJson) as AnalyzedProject;
                    console.log('[ProjectAnalyzer] Strategy 3 (fixed JSON) succeeded:', parsed);
                } catch (e3) {
                    console.warn('[ProjectAnalyzer] Strategy 3 failed:', e3);
                }
            }
            
            // Validate parsed result
            if (parsed) {
                // Check if spec exists and has required fields
                if (parsed.spec && parsed.spec.name && parsed.spec.overview) {
                    // Check if placeholders were replaced (detect "[" brackets in values)
                    const hasPlaceholders = Object.values(parsed.spec).some(
                        v => typeof v === 'string' && v.startsWith('[') && v.includes(']')
                    );
                    if (hasPlaceholders) {
                        console.warn('[ProjectAnalyzer] AI output contains unreplaced placeholders!');
                        // Still use it but log the warning
                    }
                    setAnalyzedProject(parsed);
                    console.log('[ProjectAnalyzer] Final parsed result:', {
                        specName: parsed.spec.name,
                        agentsCount: parsed.agents?.length || 0,
                        diagramsCount: parsed.diagrams?.length || 0
                    });
                } else {
                    console.error('[ProjectAnalyzer] Parsed JSON missing required spec fields:', parsed);
                }
            } else {
                console.error('[ProjectAnalyzer] All JSON parsing strategies failed. Raw output:', docs.substring(0, 500));
            }
            
            setStep('done');
        } catch (e: any) {
            setError(e.toString());
            setStep('error');
        } finally {
            setLoadingMessage('');
            setLoadingSubMessage('');
        }
    };

    const handleSaveToMemoryBank = async () => {
        if (!generatedDocs) return;
        
        setStep('saving');
        try {
            await invoke('update_memory', {
                workspace: '.',
                name: 'specs',
                content: generatedDocs
            });
            alert(t.alerts.savedToMemory);
        } catch (e: any) {
            setError(e.toString());
        }
        setStep('done');
    };

    const handleSaveToSpecPage = async () => {
        if (!analyzedProject && !generatedDocs) return;
        
        try {
            // Use structured data if available, otherwise fallback to raw markdown
            const specData = analyzedProject?.spec || {
                name: scanResult?.tech_stack.join(' + ') || 'Unknown Project',
                overview: generatedDocs,
                techStack: scanResult?.tech_stack.join(', ') || '',
                dataStructure: '',
                features: '',
                design: '',
                rules: ''
            };
            
            // Ensure all values are strings (AI might return objects for some fields)
            const stringify = (val: any): string => {
                if (val === null || val === undefined) return '';
                if (typeof val === 'string') return val;
                if (typeof val === 'object') return JSON.stringify(val, null, 2);
                return String(val);
            };
            
            await invoke('update_project_spec', {
                spec: {
                    id: 'default',
                    name: stringify(specData.name),
                    overview: stringify(specData.overview),
                    tech_stack: stringify(specData.techStack),
                    data_structure: stringify(specData.dataStructure),
                    features: stringify(specData.features),
                    design: stringify(specData.design),
                    rules: stringify(specData.rules)
                }
            });
            
            // Emit event to notify SpecPage to refresh
            await emit('spec-updated', { source: 'project-analyzer' });
            alert('✅ Saved to project spec');
        } catch (e: any) {
            console.error('[ProjectAnalyzer] Failed to save spec:', e);
            setError(e.toString());
        }
    };

    // Distribute analyzed agents to Team Settings
    const handleDistributeToTeam = async () => {
        if (!analyzedProject?.agents || analyzedProject.agents.length === 0) {
            alert(t.alerts.noAgents);
            return;
        }
        
        try {
            // Emit event to RoleSettingsPage with agents data
            await emit('agents-distributed', { 
                agents: analyzedProject.agents,
                source: 'project-analyzer'
            });
            alert(t.alerts.agentsDistributed.replace('{count}', analyzedProject.agents.length.toString()));
        } catch (e: any) {
            setError(e.toString());
        }
    };

    // Distribute diagrams to Workflow Visualizer
    const handleDistributeToDiagrams = async () => {
        if (!analyzedProject?.diagrams || analyzedProject.diagrams.length === 0) {
            alert(t.alerts.noDiagrams);
            return;
        }
        
        try {
            // Save to localStorage for Planner to pick up
            localStorage.setItem('taskrails_planner_diagrams', JSON.stringify(analyzedProject.diagrams));
            
            // Emit event to Planner
            await emit('diagrams-distributed', { 
                diagrams: analyzedProject.diagrams,
                source: 'project-analyzer'
            });
            alert(t.alerts.diagramsDistributed.replace('{count}', analyzedProject.diagrams.length.toString()));
        } catch (e: any) {
            setError(e.toString());
        }
    };

    // Distribute all: spec, agents, diagrams
    const handleDistributeAll = async () => {
        if (!analyzedProject) {
            alert(t.alerts.notAnalyzed);
            return;
        }
        
        try {
            await handleSaveToSpecPage();
            await handleDistributeToTeam();
            await handleDistributeToDiagrams();
            alert(t.alerts.allDistributed);
        } catch (e: any) {
            setError(e.toString());
        }
    };

    return (
        <>
            {/* Loading Overlay */}
            <LoadingOverlay 
                isVisible={step === 'scanning' || step === 'generating'}
                message={loadingMessage}
                subMessage={loadingSubMessage}
                showTimer={true}
            />
            
            <div className="h-full flex flex-col bg-[#0A0A0C] text-white p-8 overflow-hidden">
            {/* Header */}
            <header className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Scan className="text-primary" /> 
                        {t.title}
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-wider">
                        {t.subtitle}
                    </p>
                </div>
                
                {/* AI Source Selector */}
                <div className="flex items-center gap-1 bg-[#16161A] p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setAiSource('lmstudio')}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                            aiSource === 'lmstudio' 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Server size={14} /> LM Studio
                    </button>
                    <button
                        onClick={() => setAiSource('ollama')}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                            aiSource === 'ollama' 
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                                : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Server size={14} /> Ollama
                    </button>
                    <button
                        onClick={() => setAiSource('cloud')}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                            aiSource === 'cloud' 
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                                : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Cloud size={14} /> 雲端 AI
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
                {/* Left Panel: Scan Results */}
                <div className="flex flex-col bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileCode size={12} /> 專案掃描
                        </span>
                        <button
                            onClick={handleScanProject}
                            disabled={step === 'scanning'}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors",
                                step === 'scanning' 
                                    ? "bg-primary/50 cursor-not-allowed" 
                                    : "bg-primary hover:bg-primary/80"
                            )}
                        >
                            {step === 'scanning' ? (
                                <><Loader2 size={12} className="animate-spin" /> 掃描中...</>
                            ) : (
                                <><Scan size={12} /> 開始掃描</>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {!scanResult && step !== 'scanning' && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <FileCode size={48} className="text-gray-700 mb-4" />
                                <p className="text-gray-500 text-sm">點擊「開始掃描」分析專案結構</p>
                            </div>
                        )}

                        {scanResult && (
                            <div className="space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#16161A] p-3 rounded-xl border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase">檔案數</div>
                                        <div className="text-xl font-black text-primary">{scanResult.total_files}</div>
                                    </div>
                                    <div className="bg-[#16161A] p-3 rounded-xl border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase">程式碼行數</div>
                                        <div className="text-xl font-black text-blue-400">{scanResult.total_lines.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Tech Stack */}
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">技術棧</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {scanResult.tech_stack.map((tech, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Entry Points */}
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">入口點</h3>
                                    <div className="space-y-1">
                                        {scanResult.entry_points.slice(0, 5).map((entry, i) => (
                                            <div key={i} className="text-xs font-mono text-blue-300 bg-[#16161A] px-2 py-1 rounded">
                                                {entry}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Files */}
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">關鍵檔案 (前10)</h3>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {scanResult.key_files.slice(0, 10).map((file, i) => (
                                            <div key={i} className="bg-[#16161A] p-2 rounded-lg border border-white/5">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-mono text-gray-300 truncate">{file.path}</span>
                                                    <span className="text-[9px] text-gray-500">{file.line_count} lines</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 truncate">{file.summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: AI Generated Docs */}
                <div className="flex flex-col bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Brain size={12} /> AI 生成說明書
                        </span>
                        <div className="flex gap-2 flex-wrap">
                            {generatedDocs && (
                                <>
                                    <button
                                        onClick={handleSaveToMemoryBank}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded text-[9px] font-bold uppercase transition-colors"
                                    >
                                        <Download size={10} /> 存至記憶庫
                                    </button>
                                    <button
                                        onClick={handleSaveToSpecPage}
                                        className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded text-[9px] font-bold uppercase transition-colors"
                                    >
                                        <Check size={10} /> 存至說明書
                                    </button>
                                </>
                            )}
                            {analyzedProject && (
                                <>
                                    <button
                                        onClick={handleDistributeToTeam}
                                        disabled={!analyzedProject.agents?.length}
                                        className={clsx(
                                            "flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase transition-colors",
                                            analyzedProject.agents?.length
                                                ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                                : "bg-gray-700/50 text-gray-600 cursor-not-allowed"
                                        )}
                                    >
                                        <Users size={10} /> 分發 Agents ({analyzedProject.agents?.length || 0})
                                    </button>
                                    <button
                                        onClick={handleDistributeToDiagrams}
                                        disabled={!analyzedProject.diagrams?.length}
                                        className={clsx(
                                            "flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase transition-colors",
                                            analyzedProject.diagrams?.length
                                                ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                                                : "bg-gray-700/50 text-gray-600 cursor-not-allowed"
                                        )}
                                    >
                                        <Network size={10} /> 分發流程圖 ({analyzedProject.diagrams?.length || 0})
                                    </button>
                                    <button
                                        onClick={handleDistributeAll}
                                        className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30 rounded text-[9px] font-bold uppercase transition-colors border border-primary/30"
                                    >
                                        <ArrowRight size={10} /> 一鍵全部分發
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleGenerateDocs}
                                disabled={!scanResult || step === 'generating'}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors",
                                    !scanResult || step === 'generating'
                                        ? "bg-gray-700 cursor-not-allowed text-gray-500" 
                                        : "bg-primary hover:bg-primary/80"
                                )}
                            >
                                {step === 'generating' ? (
                                    <><Loader2 size={12} className="animate-spin" /> 生成中...</>
                                ) : (
                                    <><Sparkles size={12} /> AI 生成</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 flex items-start gap-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span className="text-xs">{error}</span>
                            </div>
                        )}

                        {!generatedDocs && !error && step !== 'generating' && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Brain size={48} className="text-gray-700 mb-4" />
                                <p className="text-gray-500 text-sm">先掃描專案，再點擊「AI 生成」</p>
                                <p className="text-gray-600 text-[10px] mt-2">AI 會根據掃描結果自動生成專案說明書</p>
                            </div>
                        )}

                        {generatedDocs && (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-xs text-gray-300 font-mono leading-relaxed bg-[#0A0A0C] p-4 rounded-xl border border-white/5">
                                    {generatedDocs}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
