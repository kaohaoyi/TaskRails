import { useState, useEffect } from 'react';
import { Bot, Plus, Trash2, Edit3, Save, FolderOpen, AlertCircle, Copy, Check, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { invoke } from '@tauri-apps/api/core';

// Agent 類型定義
interface Agent {
    name: string;
    role: string;
    systemPrompt: string;
}

// 專案與 Agents 的儲存結構
interface ProjectAgents {
    projectId: string;
    projectName: string;
    agents: Agent[];
    lastUpdated: string;
}

const STORAGE_KEY = 'taskrails_project_agents';

export default function AgentLab() {
    const [projectAgentsList, setProjectAgentsList] = useState<ProjectAgents[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [editingAgent, setEditingAgent] = useState<{ projectId: string; index: number; agent: Agent } | null>(null);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

    // 載入儲存的專案 Agents
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as ProjectAgents[];
                setProjectAgentsList(parsed);
                if (parsed.length > 0 && !selectedProjectId) {
                    setSelectedProjectId(parsed[0].projectId);
                }
            } catch (e) {
                console.error('Failed to parse saved agents:', e);
            }
        }
    }, []);

    // 儲存變更
    const saveToStorage = (list: ProjectAgents[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        setProjectAgentsList(list);
    };

    // 取得當前選中專案的 Agents
    const currentProject = projectAgentsList.find(p => p.projectId === selectedProjectId);

    // 刪除專案
    const handleDeleteProject = (projectId: string) => {
        if (confirm('確定要刪除此專案的所有 Agent 配置嗎？')) {
            const updated = projectAgentsList.filter(p => p.projectId !== projectId);
            saveToStorage(updated);
            if (selectedProjectId === projectId) {
                setSelectedProjectId(updated.length > 0 ? updated[0].projectId : null);
            }
        }
    };

    // 刪除 Agent
    const handleDeleteAgent = (projectId: string, agentIndex: number) => {
        if (confirm('確定要刪除此 Agent 嗎？')) {
            const updated = projectAgentsList.map(p => {
                if (p.projectId === projectId) {
                    return {
                        ...p,
                        agents: p.agents.filter((_, i) => i !== agentIndex),
                        lastUpdated: new Date().toISOString()
                    };
                }
                return p;
            });
            saveToStorage(updated);
        }
    };

    // 編輯 Agent
    const handleEditAgent = (projectId: string, index: number, agent: Agent) => {
        setEditingAgent({ projectId, index, agent: { ...agent } });
    };

    // 儲存編輯的 Agent
    const handleSaveAgent = () => {
        if (!editingAgent) return;

        const updated = projectAgentsList.map(p => {
            if (p.projectId === editingAgent.projectId) {
                const newAgents = [...p.agents];
                newAgents[editingAgent.index] = editingAgent.agent;
                return {
                    ...p,
                    agents: newAgents,
                    lastUpdated: new Date().toISOString()
                };
            }
            return p;
        });
        saveToStorage(updated);
        setEditingAgent(null);
    };

    // 複製 System Prompt
    const handleCopyPrompt = async (prompt: string, agentName: string) => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopiedPrompt(agentName);
            setTimeout(() => setCopiedPrompt(null), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    // 套用 Agent 到全域 AI 設定
    const handleApplyAgent = async (agent: Agent) => {
        try {
            await invoke('set_setting', { key: 'ai_system_prompt', value: agent.systemPrompt });
            alert(`已將 "${agent.name}" 的 System Prompt 套用至全域 AI 設定！`);
        } catch (e) {
            console.error('Failed to apply agent:', e);
            alert('套用失敗');
        }
    };

    // 手動新增專案
    const handleAddProject = () => {
        const projectName = prompt('請輸入專案名稱：');
        if (!projectName?.trim()) return;
        
        const projectId = `project-${projectName.replace(/\s+/g, '-')}-${Date.now()}`;
        const newProject: ProjectAgents = {
            projectId,
            projectName: projectName.trim(),
            agents: [],
            lastUpdated: new Date().toISOString()
        };
        
        const updated = [newProject, ...projectAgentsList];
        saveToStorage(updated);
        setSelectedProjectId(projectId);
    };

    // 手動新增 Agent
    const handleAddAgent = (projectId: string) => {
        const newAgent: Agent = {
            name: '新 Agent',
            role: '請輸入角色描述',
            systemPrompt: '請輸入這個 Agent 的系統提示詞...'
        };
        
        // 開啟編輯模式（使用 -1 表示新增）
        const project = projectAgentsList.find(p => p.projectId === projectId);
        if (project) {
            const newIndex = project.agents.length;
            const updated = projectAgentsList.map(p => {
                if (p.projectId === projectId) {
                    return {
                        ...p,
                        agents: [...p.agents, newAgent],
                        lastUpdated: new Date().toISOString()
                    };
                }
                return p;
            });
            saveToStorage(updated);
            setEditingAgent({ projectId, index: newIndex, agent: newAgent });
        }
    };

    // 重置所有 Agent 配置
    const handleResetAll = () => {
        if (!confirm('確定要清除所有專案的 Agent 配置嗎？此操作無法復原。')) return;
        localStorage.removeItem(STORAGE_KEY);
        setProjectAgentsList([]);
        setSelectedProjectId(null);
        setEditingAgent(null);
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white p-8 overflow-hidden">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Bot className="text-primary" /> 
                        AI 代理配置
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-wider">
                        管理各專案的 AI 生成代理角色
                    </p>
                </div>
                {projectAgentsList.length > 0 && (
                    <div className="flex gap-2">
                        <button 
                            onClick={handleAddProject}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg border border-green-500/20 text-[10px] font-bold uppercase transition-colors"
                        >
                            <Plus size={14} /> 新增專案
                        </button>
                        <button 
                            onClick={handleResetAll}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 text-[10px] font-bold uppercase transition-colors"
                        >
                            <RotateCcw size={14} /> 重置全部
                        </button>
                    </div>
                )}
            </header>

            {projectAgentsList.length === 0 ? (
                /* 無專案提示 */
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                        <AlertCircle size={40} className="text-gray-600" />
                    </div>
                    <h2 className="text-xl font-black text-gray-300 mb-2">尚無 Agent 配置</h2>
                    <p className="text-gray-500 text-sm max-w-md mb-6">
                        請先到「專案設定中心」使用 AI 產生專案 Agents，系統會自動儲存至此處。
                    </p>
                    <div className="text-[10px] text-gray-600 font-mono">
                        提示：AI 會根據專案類型自動設計適合的代理角色
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* 左側：專案列表 */}
                    <div className="w-64 flex flex-col bg-[#0D0D0F] border border-white/5 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <FolderOpen size={12} />
                                專案列表
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {projectAgentsList.map(project => (
                                <button
                                    key={project.projectId}
                                    onClick={() => setSelectedProjectId(project.projectId)}
                                    className={clsx(
                                        "w-full text-left px-3 py-3 rounded-lg transition-all group",
                                        selectedProjectId === project.projectId
                                            ? "bg-primary/10 border border-primary/30"
                                            : "hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={clsx(
                                            "text-sm font-bold truncate",
                                            selectedProjectId === project.projectId ? "text-primary" : "text-gray-300"
                                        )}>
                                            {project.projectName}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.projectId); }}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1">
                                        {project.agents.length} 個 Agent
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 右側：Agent 詳情 */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {currentProject ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-black text-white">{currentProject.projectName}</h2>
                                        <p className="text-[10px] text-gray-500 font-mono">
                                            最後更新：{new Date(currentProject.lastUpdated).toLocaleString('zh-TW')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                    {currentProject.agents.map((agent, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#0F0F12] border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                        <Bot size={20} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white">{agent.name}</h3>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{agent.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCopyPrompt(agent.systemPrompt, agent.name)}
                                                        className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                        title="複製 System Prompt"
                                                    >
                                                        {copiedPrompt === agent.name ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditAgent(currentProject.projectId, index, agent)}
                                                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                                                        title="編輯"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAgent(currentProject.projectId, index)}
                                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="刪除"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-black/30 border border-white/5 rounded-lg p-4 mb-4">
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">System Prompt</div>
                                                <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                                                    {agent.systemPrompt.slice(0, 300)}{agent.systemPrompt.length > 300 ? '...' : ''}
                                                </pre>
                                            </div>

                                            <button
                                                onClick={() => handleApplyAgent(agent)}
                                                className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold transition-all"
                                            >
                                                套用至全域 AI 設定
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                請選擇一個專案
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Agent 編輯 Modal */}
            {editingAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-[#0F0F12] border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-lg font-black text-white mb-4">編輯 Agent</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">名稱</label>
                                <input
                                    type="text"
                                    value={editingAgent.agent.name}
                                    onChange={(e) => setEditingAgent({
                                        ...editingAgent,
                                        agent: { ...editingAgent.agent, name: e.target.value }
                                    })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">角色</label>
                                <input
                                    type="text"
                                    value={editingAgent.agent.role}
                                    onChange={(e) => setEditingAgent({
                                        ...editingAgent,
                                        agent: { ...editingAgent.agent, role: e.target.value }
                                    })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">System Prompt</label>
                                <textarea
                                    value={editingAgent.agent.systemPrompt}
                                    onChange={(e) => setEditingAgent({
                                        ...editingAgent,
                                        agent: { ...editingAgent.agent, systemPrompt: e.target.value }
                                    })}
                                    rows={10}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-primary/50 resize-none custom-scrollbar"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingAgent(null)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm font-bold transition-all"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveAgent}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                            >
                                <Save size={14} /> 儲存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
