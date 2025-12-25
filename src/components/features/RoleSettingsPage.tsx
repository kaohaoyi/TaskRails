import { useState } from 'react';
import { Bot, User, Plus, Trash2, Shield, Cpu, Eye, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from '../../hooks/useTranslation';
import { invoke } from '@tauri-apps/api/core';

export interface AgentRole {
    id: string;
    name: string;
    agentName: string;
    type: 'ai' | 'human';
    isDefault?: boolean;
    systemPrompt?: string; // AI 指令 - 用於 MCP 傳送給 AI IDE
}

interface RoleSettingsPageProps {
    roles: AgentRole[];
    onAddRole: (role: AgentRole) => void;
    onDeleteRole: (roleId: string) => void;
}

// Default roles that cannot be deleted
export const defaultRoles: AgentRole[] = [
    { 
        id: 'ai_antigravity', 
        name: '架構師', 
        agentName: 'Antigravity', 
        type: 'ai', 
        isDefault: true,
        systemPrompt: '你是系統架構師。專注於高層設計、模組劃分、技術選型與架構決策。優先考慮可擴展性、可維護性與效能。'
    },
    { 
        id: 'ai_codegen', 
        name: '開發者', 
        agentName: 'CodeGen-1', 
        type: 'ai', 
        isDefault: true,
        systemPrompt: '你是資深開發工程師。專注於撰寫高品質、可測試的程式碼。遵循專案程式碼風格與最佳實踐。'
    },
    { 
        id: 'ai_review_bot', 
        name: '審查者', 
        agentName: 'ReviewBot', 
        type: 'ai', 
        isDefault: true,
        systemPrompt: '你是程式碼審查專家。專注於發現潛在問題、安全漏洞、效能瓶頸與程式碼品質。提供具體且可執行的改進建議。'
    },
];

export default function RoleSettingsPage({ roles, onAddRole, onDeleteRole }: RoleSettingsPageProps) {
    const t = useTranslation().roleSettings;
    const [newRoleName, setNewRoleName] = useState('');
    const [newAgentName, setNewAgentName] = useState('');
    const [newRoleType, setNewRoleType] = useState<'ai' | 'human'>('ai');
    const [newSystemPrompt, setNewSystemPrompt] = useState('');

    const handleAddRole = () => {
        if (!newRoleName.trim() || !newAgentName.trim()) return;
        
        const newRole: AgentRole = {
            id: `${newRoleType}_${Date.now()}`,
            name: newRoleName,
            agentName: newAgentName,
            type: newRoleType,
            isDefault: false,
            systemPrompt: newSystemPrompt.trim() || undefined
        };
        
        onAddRole(newRole);
        setNewRoleName('');
        setNewAgentName('');
        setNewSystemPrompt('');
    };

    // Combine default + custom roles (for future use)
    // const allRoles = [...defaultRoles, ...roles];

    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="w-2 h-8 bg-primary block"></span>
                    {t.title}
                </h1>
                <p className="text-sm text-gray-500 pl-5">{t.subtitle}</p>
            </div>

            {/* Default Roles Section */}
            <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t.defaultRoles}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {defaultRoles.map(role => (
                        <RoleCard key={role.id} role={role} />
                    ))}
                </div>
            </div>

            {/* Custom Roles Section */}
            <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t.customRoles}</h2>
                {roles.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 border border-dashed border-border-dark rounded-lg">
                        {t.noCustomRoles}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {roles.map(role => (
                            <RoleCard 
                                key={role.id} 
                                role={role} 
                                onDelete={() => onDeleteRole(role.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add New Role Form */}
            <div className="bg-[#141419] border border-border-dark rounded-lg p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-primary" /> {t.addRole}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.roleName}</label>
                        <input 
                            type="text"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="例：測試工程師"
                            className="w-full bg-[#0D0D0F] border border-border-dark rounded px-3 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.agentName}</label>
                        <input 
                            type="text"
                            value={newAgentName}
                            onChange={(e) => setNewAgentName(e.target.value)}
                            placeholder="例：TestBot-1"
                            className="w-full bg-[#0D0D0F] border border-border-dark rounded px-3 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.roleType}</label>
                        <select 
                            value={newRoleType}
                            onChange={(e) => setNewRoleType(e.target.value as 'ai' | 'human')}
                            className="w-full bg-[#0D0D0F] border border-border-dark rounded px-3 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none"
                            style={{ backgroundColor: '#0D0D0F', color: '#d1d5db' }}
                        >
                            <option value="ai" style={{ backgroundColor: '#0D0D0F', color: '#d1d5db' }}>{t.typeAI}</option>
                            <option value="human" style={{ backgroundColor: '#0D0D0F', color: '#d1d5db' }}>{t.typeHuman}</option>
                        </select>
                    </div>
                </div>
                {/* System Prompt - Only show for AI type */}
                {newRoleType === 'ai' && (
                    <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
                            <span>
                                AI 指令 (System Prompt)
                                <span className="text-gray-600 ml-2">- 透過 MCP 傳送給 AI IDE</span>
                            </span>
                            <button 
                                onClick={() => invoke('open_chat_window')}
                                className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider transition-colors"
                            >
                                <Sparkles size={10} /> AI Suggest
                            </button>
                        </label>
                        <textarea 
                            value={newSystemPrompt}
                            onChange={(e) => setNewSystemPrompt(e.target.value)}
                            placeholder="例：你是測試工程師，專注於撰寫單元測試與整合測試。確保程式碼覆蓋率達到 80% 以上..."
                            rows={3}
                            className="w-full bg-[#0D0D0F] border border-border-dark rounded px-3 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none font-mono resize-none"
                        />
                    </div>
                )}
                <div className="flex justify-end">
                    <button 
                        onClick={handleAddRole}
                        disabled={!newRoleName.trim() || !newAgentName.trim()}
                        className="bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-bold text-sm transition-colors"
                    >
                        {t.save}
                    </button>
                </div>
            </div>
        </div>
    );
}

function RoleCard({ role, onDelete }: { role: AgentRole, onDelete?: () => void }) {
    const IconComponent = role.type === 'ai' ? Bot : User;
    const iconColor = role.type === 'ai' ? 'text-purple-400' : 'text-blue-400';
    const bgColor = role.type === 'ai' ? 'bg-purple-500/10' : 'bg-blue-500/10';

    // Role-specific icons for defaults
    let RoleIcon = Cpu;
    if (role.name === '架構師') RoleIcon = Shield;
    if (role.name === '審查者') RoleIcon = Eye;

    return (
        <div className={clsx(
            "border border-border-dark rounded-lg p-4 transition-all hover:border-primary/30 group",
            bgColor
        )}>
            <div className="flex items-start justify-between mb-3">
                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", bgColor)}>
                    <IconComponent size={20} className={iconColor} />
                </div>
                {role.isDefault ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-400">預設</span>
                ) : onDelete && (
                    <button 
                        onClick={onDelete}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
            <div className="text-sm font-bold text-white mb-1">{role.agentName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
                <RoleIcon size={12} /> {role.name}
            </div>
        </div>
    );
}
