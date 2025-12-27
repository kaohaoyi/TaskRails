import { useState } from 'react';
import { Scan, FileCode, Brain, Sparkles, Download, AlertCircle, Check, Loader2, Server, Cloud } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

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

type AnalysisStep = 'idle' | 'scanning' | 'generating' | 'saving' | 'done' | 'error';
type AiSource = 'local' | 'cloud';

export default function ProjectAnalyzer() {
    const [step, setStep] = useState<AnalysisStep>('idle');
    const [scanResult, setScanResult] = useState<ProjectScanResult | null>(null);
    const [generatedDocs, setGeneratedDocs] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [aiSource, setAiSource] = useState<AiSource>('cloud');

    const handleScanProject = async () => {
        setStep('scanning');
        setError('');
        try {
            const result = await invoke<ProjectScanResult>('scan_project');
            setScanResult(result);
            setStep('idle');
        } catch (e: any) {
            setError(e.toString());
            setStep('error');
        }
    };

    const handleGenerateDocs = async () => {
        if (!scanResult) return;
        
        setStep('generating');
        setError('');
        try {
            let docs: string;
            
            if (aiSource === 'local') {
                // Use local LM Studio via refine_prompt
                const context = `# 專案分析報告
## 統計資訊
- 總檔案數: ${scanResult.total_files}
- 總程式碼行數: ${scanResult.total_lines}

## 技術棧
${scanResult.tech_stack.map(t => `- ${t}`).join('\n')}

## 入口點
${scanResult.entry_points.map(e => `- ${e}`).join('\n')}

## 關鍵檔案
${scanResult.key_files.slice(0, 10).map(f => `- ${f.path} (${f.line_count} 行): ${f.summary}`).join('\n')}`;

                docs = await invoke<string>('refine_prompt', { 
                    userIntent: `請根據以下專案結構生成一份完整的專案說明書，包含：專案概述、技術架構、核心模組、資料結構、開發指南。使用 Markdown 格式，繁體中文輸出。`,
                    context 
                });
            } else {
                // Use cloud AI
                docs = await invoke<string>('generate_project_docs', { scanResult });
            }
            
            setGeneratedDocs(docs);
            setStep('done');
        } catch (e: any) {
            setError(e.toString());
            setStep('error');
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
            alert('已儲存至記憶庫 @specs.md');
        } catch (e: any) {
            setError(e.toString());
        }
        setStep('done');
    };

    const handleSaveToSpecPage = async () => {
        if (!generatedDocs) return;
        
        try {
            // Parse the markdown and update project spec
            await invoke('update_project_spec', {
                spec: {
                    id: 'default',
                    name: scanResult?.tech_stack.join(' + ') || 'Unknown Project',
                    overview: generatedDocs,
                    tech_stack: scanResult?.tech_stack.join(', ') || '',
                    data_structure: '',
                    features: '',
                    design: '',
                    rules: ''
                }
            });
            alert('已儲存至專案說明書');
        } catch (e: any) {
            setError(e.toString());
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white p-8 overflow-hidden">
            {/* Header */}
            <header className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Scan className="text-primary" /> 
                        專案分析器
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-wider">
                        掃描源代碼 → AI 分析 → 自動生成說明書
                    </p>
                </div>
                
                {/* AI Source Selector */}
                <div className="flex items-center gap-2 bg-[#16161A] p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setAiSource('local')}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                            aiSource === 'local' 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Server size={14} /> 本地 AI (LM Studio)
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
                        <div className="flex gap-2">
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
    );
}
