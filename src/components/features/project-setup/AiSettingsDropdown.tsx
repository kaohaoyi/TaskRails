import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Zap, ZapOff, RefreshCcw } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { PROVIDER_MODELS } from '../../../constants/ai-models';
import { Language } from '../../../utils/projectConfig';
import clsx from 'clsx';

interface AiSettingsDropdownProps {
    currentProvider: string;
    setCurrentProvider: (p: string) => void;
    currentModel: string;
    setCurrentModel: (m: string) => void;
    outputLanguage: Language;
    setOutputLanguage: (l: Language) => void;
    availableProviders: string[];
    showAiSettings: boolean;
    setShowAiSettings: (show: boolean) => void;
}

export function AiSettingsDropdown({
    currentProvider,
    setCurrentProvider,
    currentModel,
    setCurrentModel,
    outputLanguage,
    setOutputLanguage,
    availableProviders,
    showAiSettings,
    setShowAiSettings
}: AiSettingsDropdownProps) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');

    const checkConnection = async (p: string, m: string) => {
        setStatus('checking');
        try {
            const ok = await invoke<boolean>('verify_ai_connection', { provider: p, model: m });
            setStatus(ok ? 'ok' : 'fail');
        } catch (e) {
            setStatus('fail');
        }
    };

    useEffect(() => {
        checkConnection(currentProvider, currentModel);
    }, [currentProvider, currentModel]);

    const handleSave = async (p: string, m: string, l: string) => {
        try {
            await invoke('set_setting', { key: 'ai_provider', value: p });
            await invoke('set_setting', { key: 'ai_model', value: m });
            await invoke('set_setting', { key: 'taskrails_language', value: l });
            
            // Emit to sync other windows
            emit('ai-settings-changed', { provider: p, model: m, language: l });
            
            setShowAiSettings(false);
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setShowAiSettings(!showAiSettings)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-colors border border-white/5"
                title="AI 設定"
            >
                <div className="relative">
                    <SettingsIcon size={12} className={clsx(status === 'checking' && "animate-spin")} />
                    <div className={clsx(
                        "absolute -top-1 -right-1 w-2 h-2 rounded-full border border-[#0A0A0C]",
                        status === 'ok' && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                        status === 'fail' && "bg-red-500",
                        status === 'checking' && "bg-yellow-500 animate-pulse",
                        status === 'idle' && "bg-gray-500"
                    )}></div>
                </div>
                <span className="truncate max-w-[150px]">
                    {currentProvider.toUpperCase()} / {currentModel}
                </span>
            </button>
            
            {showAiSettings && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-[#16161A] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 p-5 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">AI Configurator</h3>
                        <div className={clsx(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter",
                            status === 'ok' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {status === 'ok' ? <Zap size={8} /> : <ZapOff size={8} />}
                            {status === 'ok' ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">AI Provider</label>
                            <select
                                value={currentProvider}
                                onChange={(e) => {
                                    const p = e.target.value;
                                    setCurrentProvider(p);
                                    const m = PROVIDER_MODELS[p]?.[0] || '';
                                    setCurrentModel(m);
                                }}
                                className="w-full bg-[#0A0A0C] border border-white/5 focus:border-primary/50 rounded-lg px-3 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
                            >
                                {availableProviders.map(p => (
                                    <option key={p} value={p}>{p.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Model Selection</label>
                            <select
                                value={currentModel}
                                onChange={(e) => setCurrentModel(e.target.value)}
                                className="w-full bg-[#0A0A0C] border border-white/5 focus:border-primary/50 rounded-lg px-3 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
                            >
                                {PROVIDER_MODELS[currentProvider]?.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Interface Language</label>
                            <select
                                value={outputLanguage}
                                onChange={(e) => setOutputLanguage(e.target.value as Language)}
                                className="w-full bg-[#0A0A0C] border border-white/5 focus:border-primary/50 rounded-lg px-3 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
                            >
                                <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
                                <option value="en-US">English (US)</option>
                                <option value="ja-JP">日本語 (Japanese)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                         <button 
                            onClick={() => checkConnection(currentProvider, currentModel)}
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                            title="Retry Connection"
                        >
                            <RefreshCcw size={14} className={clsx(status === 'checking' && "animate-spin")} />
                        </button>
                        <button
                            onClick={() => handleSave(currentProvider, currentModel, outputLanguage)}
                            className="flex-1 py-2.5 bg-primary text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            Sync & Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
