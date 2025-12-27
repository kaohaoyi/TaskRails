import { Settings as SettingsIcon } from 'lucide-react';
import { PROVIDER_MODELS } from '../../../constants/ai-models';
import { Language } from '../../../utils/projectConfig';

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
    return (
        <div className="relative">
            <button 
                onClick={() => setShowAiSettings(!showAiSettings)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
                title="AI 設定"
            >
                <SettingsIcon size={12} />
                {currentProvider.toUpperCase()} / {currentModel} ({outputLanguage})
            </button>
            
            {showAiSettings && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-[#16161A] border border-white/10 rounded-xl shadow-2xl z-50 p-4 space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">AI Provider</label>
                        <select
                            value={currentProvider}
                            onChange={(e) => {
                                setCurrentProvider(e.target.value);
                                setCurrentModel(PROVIDER_MODELS[e.target.value]?.[0] || '');
                            }}
                            className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        >
                            {availableProviders.map(p => (
                                <option key={p} value={p}>{p.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Model</label>
                        <select
                            value={currentModel}
                            onChange={(e) => setCurrentModel(e.target.value)}
                            className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        >
                            {PROVIDER_MODELS[currentProvider]?.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Output Language</label>
                        <select
                            value={outputLanguage}
                            onChange={(e) => setOutputLanguage(e.target.value as Language)}
                            className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        >
                            <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
                            <option value="en-US">English (US)</option>
                            <option value="ja-JP">日本語 (Japanese)</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={() => setShowAiSettings(false)}
                        className="w-full py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20"
                    >
                        確認
                    </button>
                </div>
            )}
        </div>
    );
}
