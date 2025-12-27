import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GeneratedAgent } from '../../../utils/projectConfig';

interface AgentEditModalProps {
    agent: GeneratedAgent;
    isOpen: boolean;
    onClose: () => void;
    onSave: (agent: GeneratedAgent) => void;
}

export function AgentEditModal({ agent, isOpen, onClose, onSave }: AgentEditModalProps) {
    // Local form state
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [skillsStr, setSkillsStr] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');

    // Sync state when agent changes or modal opens
    useEffect(() => {
        if (agent) {
            setName(agent.name);
            setRole(agent.role);
            setSkillsStr(Array.isArray(agent.skills) ? agent.skills.join(', ') : '');
            setSystemPrompt(agent.systemPrompt);
        }
    }, [agent, isOpen]);

    const handleSave = () => {
        const updatedAgent: GeneratedAgent = {
            ...agent,
            name,
            role,
            skills: skillsStr.split(',').map(s => s.trim()).filter(s => s),
            systemPrompt
        };
        onSave(updatedAgent);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-[#16161A] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider">編輯 Agent</h3>
                    <button 
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">名稱</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">角色描述</label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">技術標籤（逗號分隔）</label>
                        <input
                            type="text"
                            value={skillsStr}
                            onChange={(e) => setSkillsStr(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            placeholder="react, typescript, tailwindcss"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">系統提示詞</label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white h-32 resize-none"
                        />
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover"
                    >
                        儲存
                    </button>
                </div>
            </div>
        </div>
    );
}
