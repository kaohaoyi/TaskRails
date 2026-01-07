import { useState, useEffect } from 'react';
import { Bot, User, Plus, Trash2, Shield, Cpu, Eye, Sparkles, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from '../../hooks/useTranslation';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface AgentRole {
    id: string;
    name: string;         // 角色名稱 (e.g., "開發者")
    agentName: string;    // Agent 名稱 (e.g., "Python Backend Engineer")
    type: 'ai' | 'human';
    isDefault?: boolean;
    systemPrompt?: string; // AI 指令 - 用於 MCP 傳送給 AI IDE
    skills?: string[];     // Agent 的技能列表
    goals?: string[];      // Agent 的目標
    tasks?: {              // Agent 的具體任務
        title: string;
        description: string;
    }[];
}

interface RoleSettingsPageProps {
    roles: AgentRole[];
    onAddRole: (role: AgentRole) => void;
    onDeleteRole: (roleId: string) => void;
}

// Default roles factory function - uses translations
export const getDefaultRoles = (t: any): AgentRole[] => [
    { 
        id: 'ai_antigravity', 
        name: t?.defaultAgents?.architect?.name || 'Architect', 
        agentName: 'Antigravity', 
        type: 'ai', 
        isDefault: true,
        systemPrompt: t?.defaultAgents?.architect?.prompt || 'You are a system architect.'
    },
    { 
        id: 'ai_codegen', 
        name: t?.defaultAgents?.developer?.name || 'Developer', 
        agentName: 'CodeGen-1', 
        type: 'ai', 
        isDefault: true,
        systemPrompt: t?.defaultAgents?.developer?.prompt || 'You are a senior developer.'
    },
    { 
        id: 'ai_review_bot', 
        name: t?.defaultAgents?.reviewer?.name || 'Reviewer', 
        agentName: 'ReviewBot', 
        type: 'ai', 
        isDefault: true,
        systemPrompt: t?.defaultAgents?.reviewer?.prompt || 'You are a code review expert.'
    },
];

// Legacy export for backward compatibility (uses English defaults)
export const defaultRoles: AgentRole[] = getDefaultRoles(null);

export default function RoleSettingsPage({ roles, onAddRole, onDeleteRole }: RoleSettingsPageProps) {
    const t = useTranslation().roleSettings;
    const [newRoleName, setNewRoleName] = useState('');
    const [newAgentName, setNewAgentName] = useState('');
    const [newRoleType, setNewRoleType] = useState<'ai' | 'human'>('ai');
    const [newSystemPrompt, setNewSystemPrompt] = useState('');

    // Listen for agents distributed from ProjectAnalyzer
    useEffect(() => {
        const setupListener = async () => {
            const unlisten = await listen<{ agents: any[], source: string }>('agents-distributed', (event) => {
                console.log('[RoleSettingsPage] Received agents-distributed event:', event.payload);
                
                const { agents } = event.payload;
                if (agents && agents.length > 0) {
                    agents.forEach((agent: any) => {
                        // Convert AI-generated agent to AgentRole format with full data
                        const newRole: AgentRole = {
                            id: agent.id || `ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            name: agent.role || agent.name,
                            agentName: agent.name,
                            type: 'ai',
                            isDefault: false,
                            systemPrompt: agent.systemPrompt || `你是 ${agent.role}。擅長: ${(agent.skills || []).join(', ')}`,
                            // Preserve full agent data
                            skills: agent.skills || [],
                            goals: agent.goals || [],
                            tasks: agent.tasks || []
                        };
                        onAddRole(newRole);
                    });
                    console.log(`[RoleSettingsPage] Added ${agents.length} agents with full data (skills, goals, tasks)`);
                }
            });
            return unlisten;
        };

        const unlistenPromise = setupListener();
        return () => {
            unlistenPromise.then(unlisten => unlisten());
        };
    }, [onAddRole]);

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
                            placeholder={t.placeholders.roleName}
                            className="w-full bg-[#0D0D0F] border border-border-dark rounded px-3 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.agentName}</label>
                        <input 
                            type="text"
                            value={newAgentName}
                            onChange={(e) => setNewAgentName(e.target.value)}
                            placeholder={t.placeholders.agentName}
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
                                {t.systemPromptLabel}
                                <span className="text-gray-600 ml-2">- {t.systemPromptDesc}</span>
                            </span>
                            <button 
                                onClick={() => invoke('open_chat_window')}
                                className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider transition-colors"
                            >
                                <Sparkles size={10} /> {t.aiSuggest}
                            </button>
                        </label>
                        <textarea 
                            value={newSystemPrompt}
                            onChange={(e) => setNewSystemPrompt(e.target.value)}
                            placeholder={t.placeholders.systemPrompt}
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
    const t = useTranslation().roleSettings;
    const IconComponent = role.type === 'ai' ? Bot : User;
    const iconColor = role.type === 'ai' ? 'text-purple-400' : 'text-blue-400';
    const bgColor = role.type === 'ai' ? 'bg-purple-500/10' : 'bg-blue-500/10';

    // Role-specific icons for defaults (use translated names for matching)
    let RoleIcon = Cpu;
    if (role.name === t.defaultAgents.architect.name) RoleIcon = Shield;
    if (role.name === t.defaultAgents.reviewer.name) RoleIcon = Eye;

    // Dispatch agent to AI IDE (multi-platform support)
    const handleDispatchToIde = async () => {
        try {
            // Import IDE integration utilities dynamically
            const { generateAgentRulesMarkdown, IDE_CONFIGS, generateMcpConfig } = await import('../../utils/ide-integration');
            
            // Generate platform-agnostic rules markdown
            const agentRules = generateAgentRulesMarkdown(role);
            
            // Format agent data for AI IDE consumption (JSON)
            const dispatchPayload = {
                version: "1.0",
                type: "agent_dispatch",
                agent: {
                    id: role.id,
                    name: role.agentName,
                    role: role.name,
                    systemPrompt: role.systemPrompt || role.name,
                    skills: role.skills || [],
                    goals: role.goals || [],
                    tasks: (role.tasks || []).map((task, i) => ({
                        id: `task-${i + 1}`,
                        title: task.title,
                        description: task.description,
                        status: 'pending'
                    }))
                },
                platforms: Object.keys(IDE_CONFIGS),
                timestamp: new Date().toISOString()
            };

            // Save JSON payload to active_context.md
            await invoke('update_memory', {
                workspace: '.',
                name: 'active_context',
                content: JSON.stringify(dispatchPayload, null, 2)
            });

            // Save platform-agnostic rules to .taskrails/agents/
            await invoke('update_memory', {
                workspace: '.',
                name: `agents/${role.id}`,
                content: agentRules
            });

            // Generate combined agent_dispatch.md for human readability
            const markdownContent = `# AI Agent Dispatch

> Dispatch Time: ${new Date().toLocaleString()}
> Agent: ${role.agentName}
> Role: ${role.name}

---

${agentRules}

---

## Quick Start Commands

### Cursor
\`\`\`
Read @.taskrails/agents/${role.id}.md and execute the tasks
\`\`\`

### VS Code (Cline/Roo Code)
\`\`\`
@.taskrails/agents/${role.id}.md - Execute tasks for ${role.agentName}
\`\`\`

### Google Antigravity
\`\`\`
Load rules from @.taskrails/agents/ and start ${role.agentName}
\`\`\`
`;

            await invoke('update_memory', {
                workspace: '.',
                name: 'agent_dispatch',
                content: markdownContent
            });

            // Generate MCP config if not exists
            const mcpConfig = generateMcpConfig('.');
            await invoke('update_memory', {
                workspace: '.',
                name: 'mcp_config',
                content: JSON.stringify(mcpConfig, null, 2)
            });

            // Copy instruction to clipboard
            const clipboardText = `Read @.taskrails/agents/${role.id}.md and execute the tasks for ${role.agentName}`;
            await navigator.clipboard.writeText(clipboardText);

            alert(t.alerts.dispatched.replace('{agentName}', role.agentName));
        } catch (e: any) {
            console.error('Failed to dispatch agent:', e);
            alert(t.alerts.dispatchFailed.replace('{error}', e.toString()));
        }
    };

    // Add all tasks to queue
    const handleAddToQueue = () => {
        if (!role.tasks || role.tasks.length === 0) {
            alert(t.alerts.noTasks);
            return;
        }

        // Dynamically import to avoid circular dependency
        import('./TaskQueuePanel').then(({ addAgentTasksToQueue }) => {
            const addedTasks = addAgentTasksToQueue({
                id: role.id,
                agentName: role.agentName,
                name: role.name,
                tasks: role.tasks,
                goals: role.goals
            });
            alert(t.alerts.addedToQueue.replace('{count}', addedTasks.length.toString()));
        });
    };

    const hasTasksOrGoals = (role.goals && role.goals.length > 0) || (role.tasks && role.tasks.length > 0);

    return (
        <div className={clsx(
            "border border-border-dark rounded-lg p-4 transition-all hover:border-primary/30 group",
            bgColor
        )}>
            <div className="flex items-start justify-between mb-3">
                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", bgColor)}>
                    <IconComponent size={20} className={iconColor} />
                </div>
                <div className="flex items-center gap-1">
                    {role.isDefault ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-400">{t.default}</span>
                    ) : (
                        <>
                            {/* Add to Queue button */}
                            {role.tasks && role.tasks.length > 0 && (
                                <button 
                                    onClick={handleAddToQueue}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-500/20 text-gray-500 hover:text-green-400 rounded transition-all"
                                    title={t.buttons.addToQueue}
                                >
                                    <Plus size={14} />
                                </button>
                            )}
                            {/* Dispatch to IDE button */}
                            {hasTasksOrGoals && (
                                <button 
                                    onClick={handleDispatchToIde}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/20 text-gray-500 hover:text-primary rounded transition-all"
                                    title={t.buttons.dispatchToIde}
                                >
                                    <ExternalLink size={14} />
                                </button>
                            )}
                            {onDelete && (
                                <button 
                                    onClick={onDelete}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="text-sm font-bold text-white mb-1">{role.agentName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <RoleIcon size={12} /> {role.name}
            </div>
            
            {/* Show skills if available */}
            {role.skills && role.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {role.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">
                            {skill}
                        </span>
                    ))}
                    {role.skills.length > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500">
                            +{role.skills.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Show tasks count if available */}
            {hasTasksOrGoals && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    {role.goals && role.goals.length > 0 && (
                        <span className="text-[9px] text-green-400/70 flex items-center gap-1">
                            🎯 {role.goals.length} {t.stats.goals}
                        </span>
                    )}
                    {role.tasks && role.tasks.length > 0 && (
                        <span className="text-[9px] text-blue-400/70 flex items-center gap-1">
                            📋 {role.tasks.length} {t.stats.tasks}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
