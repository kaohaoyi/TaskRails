import { useState, useEffect } from 'react';
import { BellRing, User, Globe, Shield, Terminal, Fingerprint, FolderSearch, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation, setLanguage, getLanguage, LanguageCode } from '../../hooks/useTranslation';
import { invoke } from '@tauri-apps/api/core';

import { PROVIDER_MODELS } from '../../constants/ai-models';

export default function SettingsPage() {
    const [language, setUiLanguage] = useState<LanguageCode>(getLanguage());
    const [broadcastEnabled, setBroadcastEnabled] = useState(true);
    const [workspacePath, setWorkspacePath] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<string>('openai');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('gpt-4o');
    const [endpoint, setEndpoint] = useState('');
    const [storedKeys, setStoredKeys] = useState<Record<string, string>>({});
    const t = useTranslation().settings;

    const loadAllKeys = async () => {
        if (typeof invoke === 'undefined') return;
        const keys: Record<string, string> = {};
        try {
            for (const provider of Object.keys(t.ai.providers)) {
                const val = await invoke<string | null>('get_setting', { key: `ai_api_key_${provider}` });
                if (val) keys[provider] = val;
            }
            setStoredKeys(keys);
        } catch (e) {
            console.error('Failed to load keys:', e);
        }
    };

    useEffect(() => {
        if (typeof invoke === 'undefined') {
            console.warn('[Settings] Tauri invoke not detected. Running in browser?');
            return;
        }

        // Load settings
        invoke<string | null>('get_setting', { key: 'workspace_path' })
            .then(path => setWorkspacePath(path))
            .catch(console.error);

        invoke<string | null>('get_setting', { key: 'ai_provider' })
            .then(val => val && setSelectedProvider(val))
            .catch(console.error);
        
        invoke<string | null>('get_setting', { key: 'ai_model' })
            .then(val => val && setModel(val))
            .catch(console.error);
        
        invoke<string | null>('get_setting', { key: 'ai_endpoint' })
            .then(val => val && setEndpoint(val))
            .catch(console.error);

        loadAllKeys();
    }, []);

    useEffect(() => {
        setApiKey(storedKeys[selectedProvider] || '');
        // Auto-switch model when provider changes to prevent invalid model names
        const defaults = PROVIDER_MODELS[selectedProvider];
        if (defaults && defaults.length > 0) {
             setModel(defaults[0]);
        }
    }, [selectedProvider, storedKeys]);

    const handleSaveAiSettings = async () => {
        if (typeof invoke === 'undefined') {
            alert('Tauri 環境未就緒，無法儲存設定。');
            return;
        }

        try {
            await invoke('set_setting', { key: 'ai_provider', value: selectedProvider });
            await invoke('set_setting', { key: `ai_api_key_${selectedProvider}`, value: apiKey });
            await invoke('set_setting', { key: 'ai_model', value: model });
            await invoke('set_setting', { key: 'ai_endpoint', value: endpoint });
            await loadAllKeys();
            alert(t.ai.saveSuccess);
        } catch (err) {
            console.error('Failed to save AI settings:', err);
            alert(t.ai.saveError);
        }
    };

    const handleDeleteKey = async (provider: string) => {
        if (typeof invoke === 'undefined') return;
        if (confirm(`確定要刪除 ${t.ai.providers[provider as keyof typeof t.ai.providers]} 的金鑰嗎？`)) {
            try {
                await invoke('set_setting', { key: `ai_api_key_${provider}`, value: '' });
                await loadAllKeys();
            } catch (err) {
                console.error('Failed to delete key:', err);
            }
        }
    };

    const handleLanguageChange = (code: LanguageCode) => {
        setUiLanguage(code);
        setLanguage(code);
    };

    const handlePickFolder = async () => {
        if (typeof invoke === 'undefined') return;
        try {
            const path = await invoke<string | null>('pick_folder');
            if (path) {
                await invoke('set_setting', { key: 'workspace_path', value: path });
                setWorkspacePath(path);
            }
        } catch (err) {
            console.error('Failed to pick folder:', err);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
             <div className="mb-8 border-b border-white/5 pb-6">
                <h1 className="text-3xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="w-2 h-8 bg-primary block"></span>
                    {t.title}
                </h1>
                <p className="text-sm text-gray-500 pl-5">{t.subtitle}</p>
            </div>

            <div className="space-y-8 max-w-3xl">
                {/* Section: General */}
                <section className="space-y-4">
                    <SectionHeader title={t.general.title} icon={Terminal} />
                    
                    <div className="grid grid-cols-1 gap-4">
                        <SettingCard 
                            icon={Globe}
                            title={t.general.language}
                            description={t.general.languageDesc}
                        >
                            <select 
                                value={language} 
                                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                                className="bg-[#0B0B0E] border border-border-dark rounded px-4 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer hover:border-gray-600 transition-colors"
                            >
                                <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
                                <option value="zh-CN">简体中文 (Simplified Chinese)</option>
                                <option value="en-US">English (US)</option>
                                <option value="ja-JP">日本語 (Japanese)</option>
                                <option value="es-ES">Español (Spanish)</option>
                                <option value="fr-FR">Français (French)</option>
                                <option value="de-DE">Deutsch (German)</option>
                            </select>
                        </SettingCard>

                        <SettingCard 
                            icon={FolderSearch}
                            title={t.general.workspace}
                            description={t.general.workspaceDesc}
                        >
                            <div className="flex flex-col items-end gap-2">
                                <button 
                                    onClick={handlePickFolder}
                                    className="bg-[#1A1A1F] border border-border-dark hover:border-primary/50 text-gray-300 px-4 py-2 rounded text-xs font-medium transition-colors flex items-center gap-2"
                                >
                                    <FolderSearch size={14} />
                                    {t.general.pickFolder}
                                </button>
                                {workspacePath && (
                                    <div className="text-[10px] text-primary/70 font-mono truncate max-w-[200px]" title={workspacePath}>
                                        {workspacePath}
                                    </div>
                                )}
                            </div>
                        </SettingCard>

                        <SettingCard 
                            icon={User}
                            title={t.general.profile}
                            description={t.general.profileDesc}
                        >
                            <div className="flex items-center gap-3 bg-[#0B0B0E] px-4 py-2 rounded border border-border-dark">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                                <span className="text-xs font-mono text-green-500 font-bold tracking-widest">{t.general.adminAccess}</span>
                            </div>
                        </SettingCard>
                    </div>
                </section>

                {/* Section: Protocols */}
                <section className="space-y-4">
                    <SectionHeader title={t.protocols.title} icon={Fingerprint} />

                    <div className="grid grid-cols-1 gap-4">
                        <SettingCard 
                            icon={BellRing}
                            title={t.protocols.broadcast}
                            description={t.protocols.broadcastDesc}
                            iconColor={broadcastEnabled ? "text-primary" : "text-gray-600"}
                        >
                            <Toggle 
                                enabled={broadcastEnabled} 
                                onChange={setBroadcastEnabled} 
                            />
                        </SettingCard>

                        <SettingCard 
                            icon={Shield}
                            title="硬重置 (氣閘)"
                            description="在切換上下文時強制清除 IDE 歷史記錄。"
                            className="opacity-60 grayscale-[50%]"
                        >
                            <div className="text-[10px] font-mono border border-yellow-500/30 text-yellow-500 px-3 py-1.5 rounded bg-yellow-500/5 tracking-widest">
                                敬請期待
                            </div>
                        </SettingCard>
                    </div>
                </section>

                {/* Section: AI API */}
                <section className="space-y-4">
                    <SectionHeader title={t.ai.title} icon={Globe} />

                    <div className="bg-[#141419] border border-border-dark rounded-xl p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.ai.provider}</label>
                                <select 
                                    className="w-full bg-[#1A1A1F] border border-border-dark rounded-md px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                                    value={selectedProvider}
                                    onChange={(e) => setSelectedProvider(e.target.value)}
                                    style={{ colorScheme: 'dark' }}
                                >
                                    {Object.entries(t.ai.providers).map(([key, label]) => (
                                        <option key={key} value={key} className="bg-[#1A1A1F] text-gray-100">{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.ai.model}</label>
                                {selectedProvider === 'custom' ? (
                                    <input 
                                        type="text" 
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        placeholder="e.g. gpt-4o"
                                        className="w-full bg-[#1A1A1F] border border-border-dark rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-primary/50"
                                    />
                                ) : (
                                    <select 
                                        className="w-full bg-[#1A1A1F] border border-border-dark rounded-md px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                    >
                                    {(PROVIDER_MODELS[selectedProvider] || []).map(m => (
                                        <option key={m} value={m} className="bg-[#1A1A1F] text-gray-100">{m}</option>
                                    ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {selectedProvider === 'custom' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.ai.endpoint}</label>
                                <input 
                                    type="text" 
                                    value={endpoint}
                                    onChange={(e) => setEndpoint(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-[#1A1A1F] border border-border-dark rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-primary/50"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} className="text-primary" />
                                {t.ai.apiKey}
                            </label>
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-black/40 border border-border-dark rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 font-mono"
                            />
                            <p className="text-[10px] text-gray-600 mt-1 italic">API Key 僅存儲於本地加密資料庫，不會上傳至任何雲端。</p>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button 
                                onClick={handleSaveAiSettings}
                                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg transition-all font-bold text-xs uppercase tracking-widest"
                            >
                                {useTranslation().kanban.taskModal.save}
                            </button>
                        </div>

                        {Object.keys(storedKeys).length > 0 && (
                            <div className="pt-6 border-t border-white/5 space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.ai.storedKeys}</h4>
                                <div className="space-y-2">
                                    {Object.entries(storedKeys).filter(([_, val]) => val).map(([prov, val]) => (
                                        <div key={prov} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg group">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-300">
                                                    {t.ai.providers[prov as keyof typeof t.ai.providers] || prov}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-600">
                                                    {val.slice(0, 8)}••••••••••••{val.slice(-4)}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteKey(prov)}
                                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title={t.ai.delete}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function SectionHeader({ title, icon: Icon }: { title: string, icon: any }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <Icon size={16} className="text-gray-500" />
            <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">{title}</h2>
            <div className="h-px bg-white/5 flex-1 ml-4" />
        </div>
    );
}

function SettingCard({ icon: Icon, title, description, children, className, iconColor = "text-gray-400" }: any) {
    return (
        <div className={clsx("bg-surface-dark border border-border-dark p-5 rounded-lg flex items-center justify-between hover:border-white/10 transition-colors", className)}>
            <div className="flex gap-4 items-center">
                <div className="p-3 bg-white/5 rounded-md border border-white/5">
                    <Icon className={iconColor} size={20} />
                </div>
                <div>
                    <div className="text-gray-100 font-medium tracking-wide text-sm">{title}</div>
                    <div className="text-xs text-gray-500 mt-1 max-w-sm">{description}</div>
                </div>
            </div>
            <div className="pl-6">
                {children}
            </div>
        </div>
    );
}

function Toggle({ enabled, onChange }: { enabled: boolean, onChange: (v: boolean) => void }) {
    return (
        <button 
            onClick={() => onChange(!enabled)}
            className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-[#16161A]",
                enabled ? 'bg-primary shadow-[0_0_10px_rgba(242,153,74,0.4)]' : 'bg-gray-800 border border-gray-700'
            )}
        >
            <span className={clsx(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                enabled ? 'translate-x-6' : 'translate-x-1'
            )} />
        </button>
    );
}
