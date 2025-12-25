import { useState } from 'react';
import { UserCog, Cpu, Database, X, Zap, Terminal } from 'lucide-react';
import clsx from 'clsx';
import { invoke } from '@tauri-apps/api/core';

const ROLES = [
    { id: 'architect', name: 'Architect', desc: 'System Design & Planning' },
    { id: 'coder', name: 'Coder', desc: 'Implementation & Refactoring' },
    { id: 'reviewer', name: 'Reviewer', desc: 'Code Quality & Security' },
];

const MOCK_SKILLS = [
    { id: 'rust_expert', name: 'Rust Expert', type: 'lang' },
    { id: 'react_react', name: 'React Master', type: 'framework' },
    { id: 'tauri_api', name: 'Tauri v2 API', type: 'lib' },
    { id: 'git_ops', name: 'Git Operations', type: 'tool' },
];

export default function AgentLab() {
    const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [featureTags, setFeatureTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [kernelPrompt, setKernelPrompt] = useState('');

    const toggleSkill = (id: string) => {
        setSelectedSkills(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            if (!featureTags.includes(tagInput.trim())) {
                setFeatureTags([...featureTags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFeatureTags(prev => prev.filter(t => t !== tag));
    };

    const generateSystemPrompt = () => {
        const role = ROLES.find(r => r.id === selectedRole);
        const skills = MOCK_SKILLS.filter(s => selectedSkills.includes(s.id));
        const tags = featureTags.join(', ');

        return `「你現在是 **TaskRails v1.0 核心**的執行端。你的任務是依據 **TaskRails 提供的 Mermaid 規格** 與 **TODO 清單** 進行開發。

**操作原則**:

1. **氣閘協定**: 寫入檔案前，必須先宣告 <scope_intent>path/to/target/*</scope_intent>。若無此宣告，TaskRails 將攔截請求。
2. **經驗繼承**: 請優先參考透過 MCP resources 傳入的 feat:tags 經驗片段。
3. **回饋機制**: 若發現值得保存的修正，請呼叫 record_experience 工具回傳給 TaskRails。

請等待使用者的下一步指令。」

=== CONFIGURATION ===
ROLE: ${role?.name} (${role?.desc})
SKILLS: ${skills.map(s => s.name).join(', ')}
INHERIT_TAGS: ${tags || 'None'}
`;
    };

    const handleInitialize = async () => {
        const prompt = generateSystemPrompt();
        setKernelPrompt(prompt);
        try {
            await invoke('set_setting', { key: 'ai_system_prompt', value: prompt });
            // In a real app, you might want to show a toast here
            // alert('Core Injector: System Prompt Updated Successfully.');
        } catch (err) {
            console.error('Failed to set system prompt:', err);
             // alert('Error: Failed to inject prompt.');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white p-8 overflow-y-auto custom-scrollbar">
             <header className="mb-8">
                <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                    <UserCog className="text-primary" /> 
                    Agent Lab
                </h1>
                <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-wider">Composite Agent Assembly & Configuration</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Base Role Selection */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest">
                        <span className="w-6 h-6 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">1</span>
                        Base Role
                    </div>
                    <div className="space-y-3">
                        {ROLES.map(role => (
                            <div 
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={clsx(
                                    "p-4 rounded-xl border cursor-pointer transition-all",
                                    selectedRole === role.id 
                                        ? "bg-blue-500/10 border-blue-500 text-white" 
                                        : "bg-[#0F0F12] border-white/5 text-gray-500 hover:bg-white/5"
                                )}
                            >
                                <div className="font-bold flex items-center justify-between">
                                    {role.name}
                                    {selectedRole === role.id && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                                </div>
                                <div className="text-[10px] opacity-60 mt-1">{role.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Atomic Skills */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                            <span className="w-6 h-6 rounded bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs">2</span>
                            Atomic Skills (Capabilities)
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {MOCK_SKILLS.map(skill => (
                                <button
                                    key={skill.id}
                                    onClick={() => toggleSkill(skill.id)}
                                    className={clsx(
                                        "p-3 rounded-lg border text-left transition-all text-xs font-bold",
                                        selectedSkills.includes(skill.id)
                                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                            : "bg-[#0F0F12] border-white/5 text-gray-500 hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Cpu size={14} />
                                        {skill.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* 3. Experience Inheritance */}
                    <div>
                         <div className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                            <span className="w-6 h-6 rounded bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs">3</span>
                            Experience Inheritance
                        </div>
                        <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {featureTags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-white/5 rounded flex items-center gap-1 text-[10px] font-mono text-gray-300 border border-white/10">
                                        <Database size={10} className="text-orange-500" />
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                                    </span>
                                ))}
                                <input 
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={addTag}
                                    placeholder="Add feature tag (e.g. feat:auth)..."
                                    className="bg-transparent text-xs text-white placeholder:text-gray-700 focus:outline-none min-w-[120px]"
                                />
                            </div>
                            <p className="text-[10px] text-gray-600">
                                * Agents will inherit memory from tasks tagged with these features across other projects.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prompt Preview (Kernel Trace) */}
            {kernelPrompt && (
                <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-2 text-primary uppercase tracking-widest font-black">
                        <Terminal size={12} /> Kernel Injection Trace
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed opacity-70 border-l-2 border-primary/20 pl-4">
                        {kernelPrompt}
                    </pre>
                </div>
            )}

            {/* Launch Action */}
            <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] font-mono text-gray-500">
                    <div>COMPOSITE_SIG: <span className="text-white">{selectedRole}::{selectedSkills.length}sk::{featureTags.length}xp</span></div>
                    <div>EST_TOKENS: ~4,200</div>
                </div>
                <button 
                    onClick={handleInitialize}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                >
                    <Zap size={18} fill="currentColor" /> Initialize Agent
                </button>
            </div>
        </div>
    );
}
