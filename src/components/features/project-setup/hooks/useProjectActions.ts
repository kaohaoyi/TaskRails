import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { ProjectConfig, CompletenessCheck, getDefaultProjectConfig, GeneratedAgent } from '../../../../utils/projectConfig';
import { Message, SavedProject } from '../../../../types/project-setup';

interface UseProjectActionsProps {
    projectConfig: ProjectConfig;
    setProjectConfig: React.Dispatch<React.SetStateAction<ProjectConfig>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    completenessCheck: CompletenessCheck;
    currentProvider: string;
    currentModel: string;
}

export function useProjectActions({ 
    projectConfig, setProjectConfig, 
    messages, setMessages, 
    completenessCheck,
    currentProvider, currentModel
}: UseProjectActionsProps) {
    const [isDeploying, setIsDeploying] = useState(false);
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [currentProjectPath, setCurrentProjectPath] = useState<string | null>(null);
    const [workspacePath, setWorkspacePath] = useState<string | null>(null);
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingAgentIndex, setEditingAgentIndex] = useState<number | null>(null);

    // Load saved projects
    useEffect(() => {
        const saved = localStorage.getItem('taskrails_saved_projects');
        if (saved) {
            setSavedProjects(JSON.parse(saved));
        }
    }, []);

    // Deploy to all modules
    const handleDeployToAll = async (onDeployComplete?: (config: ProjectConfig) => void) => {
        if (!completenessCheck.isComplete) return;
        
        setIsDeploying(true);
        
        try {
            await invoke('update_project_spec', {
                spec: {
                    id: 'default',
                    name: projectConfig.projectName,
                    overview: projectConfig.projectGoal,
                    tech_stack: projectConfig.techStack.join('\n'),
                    data_structure: projectConfig.dataStructure || '',
                    features: projectConfig.features.map((f, i) => `${i + 1}. ${f}`).join('\n'),
                    design: projectConfig.designSpec || '',
                    rules: projectConfig.engineeringRules || ''
                }
            });
            
            if (projectConfig.generatedDiagrams && projectConfig.generatedDiagrams.length > 0) {
                localStorage.setItem('taskrails_planner_diagrams', JSON.stringify(projectConfig.generatedDiagrams));
            }

            // Generate Memory Bank Files (Vibe Core)
            const memoryPath = workspacePath || '.';
            
            // 1. specs.md
            await invoke('update_memory', {
                workspace: memoryPath,
                name: 'specs',
                content: `# ${projectConfig.projectName || 'Project'} Specs\n\n## Overview\n${projectConfig.projectGoal}\n\n## Features\n${projectConfig.features.join('\n- ')}\n\n## Rules\n${projectConfig.engineeringRules}`
            }).catch(e => console.error('Failed to write specs.md', e));

            // 2. tech-stack.md
            await invoke('update_memory', {
                workspace: memoryPath,
                name: 'tech-stack',
                content: `# Technology Stack\n\n${projectConfig.techStack.join('\n- ')}`
            }).catch(e => console.error('Failed to write tech-stack.md', e));

            // 3. architecture.md
            await invoke('update_memory', {
                workspace: memoryPath,
                name: 'architecture',
                content: `# System Architecture\n\n## Design\n${projectConfig.designSpec}\n\n## Data Structure\n${projectConfig.dataStructure}`
            }).catch(e => console.error('Failed to write architecture.md', e));

            
            // 儲存 Agents 到 AgentLab 格式（依專案分組）
            if (projectConfig.generatedAgents && projectConfig.generatedAgents.length > 0) {
                const AGENT_STORAGE_KEY = 'taskrails_project_agents';
                const existingData = localStorage.getItem(AGENT_STORAGE_KEY);
                let projectAgentsList: Array<{
                    projectId: string;
                    projectName: string;
                    agents: Array<{ name: string; role: string; systemPrompt: string }>;
                    lastUpdated: string;
                }> = [];
                
                if (existingData) {
                    try { projectAgentsList = JSON.parse(existingData); } catch { }
                }
                
                const projectId = `project-${projectConfig.projectName?.replace(/\s+/g, '-') || Date.now()}`;
                const newProjectAgents = {
                    projectId,
                    projectName: projectConfig.projectName || '未命名專案',
                    agents: projectConfig.generatedAgents.map(a => ({
                        name: a.name,
                        role: a.role,
                        systemPrompt: a.systemPrompt
                    })),
                    lastUpdated: new Date().toISOString()
                };
                
                // 更新或新增專案 Agents
                const existingIndex = projectAgentsList.findIndex(p => p.projectId === projectId);
                if (existingIndex >= 0) {
                    projectAgentsList[existingIndex] = newProjectAgents;
                } else {
                    projectAgentsList.unshift(newProjectAgents);
                }
                
                localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(projectAgentsList));
            }
            
            if (projectConfig.generatedTasks && projectConfig.generatedTasks.length > 0) {
                for (const task of projectConfig.generatedTasks) {
                    await invoke('create_task', {
                        task: {
                            id: task.id || `TSK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                            title: task.title,
                            description: task.description,
                            status: 'todo',
                            priority: task.priority || '3',
                            phase: task.phase,
                            tag: 'AI-Generated'
                        }
                    });
                }
            }
            
            setMessages(msgs => [...msgs, { 
                role: 'assistant', 
                content: `✅ **專案配置已成功分發！**\n\n📋 **Spec** - 專案說明書已更新\n🤖 **Agent Lab** - ${projectConfig.generatedAgents?.length || 0} 個 Agent 已建立\n📅 **Planner** - ${projectConfig.generatedDiagrams?.length || 0} 張架構圖已生成\n📌 **Tasks** - ${projectConfig.generatedTasks?.length || 0} 個任務已注入看板\n\n請前往各模組查看和微調內容。`
            }]);
            
            onDeployComplete?.(projectConfig);
            
        } catch (err) {
            setMessages(msgs => [...msgs, { 
                role: 'assistant', 
                content: `❌ 分發失敗：${err}` 
            }]);
        } finally {
            setIsDeploying(false);
        }
    };
    
    const handleReset = () => {
        if (confirm('確定要重置專案配置嗎？所有對話和設定都會清除。')) {
            setProjectConfig(getDefaultProjectConfig());
            setCurrentProjectPath(null);
            setMessages([
                { role: 'assistant', content: '👋 專案配置已重置。\n\n請告訴我：**你想做什麼？**' }
            ]);
        }
    };
    
    const handleSelectWorkspace = async () => {
        try {
            const path = await invoke<string | null>('pick_folder');
            if (path) {
                setWorkspacePath(path);
                setMessages(msgs => [...msgs, { 
                    role: 'assistant', 
                    content: `📁 專案資料夾已設定：\n\`${path}\`\n\n現在你可以告訴我想做什麼專案了！` 
                }]);
            }
        } catch (err) {
            console.error('Failed to pick folder:', err);
            setMessages(msgs => [...msgs, { role: 'assistant', content: `❌ 選擇資料夾失敗：${err}` }]);
        }
    };
    
    const handleCreateWorkspace = async () => {
        const folderName = prompt('請輸入專案資料夾名稱：', projectConfig.projectName || 'NewProject');
        if (!folderName) return;
        
        try {
            const parentPath = await invoke<string | null>('pick_folder');
            if (!parentPath) return;
            
            const newFolderPath = `${parentPath}/${folderName}`;
            await invoke('write_workspace_file', { 
                relativePath: '.taskrails/project.json',
                content: JSON.stringify({ 
                    name: folderName, 
                    createdAt: Date.now() 
                }, null, 2),
                basePath: newFolderPath
            });
            
            setWorkspacePath(newFolderPath);
            if (!projectConfig.projectName) {
                setProjectConfig(prev => ({ ...prev, projectName: folderName }));
            }
            
            setMessages(msgs => [...msgs, { 
                role: 'assistant', 
                content: `📁 專案資料夾已建立：\n\`${newFolderPath}\`\n\n/專案名稱/*${folderName}*\n\n現在告訴我這個專案要做什麼？` 
            }]);
        } catch (err) {
            console.error('Failed to create workspace:', err);
            setMessages(msgs => [...msgs, { role: 'assistant', content: `❌ 建立資料夾失敗：${err}` }]);
        }
    };
    
    const handleSaveProject = () => {
        const projectName = projectConfig.projectName || prompt('請輸入專案名稱：', 'My Project');
        if (!projectName) return;
        
        const projectId = currentProjectPath || `project-${Date.now()}`;
        const projectData = {
            id: projectId,
            config: { ...projectConfig, projectName },
            messages: messages,
            workspacePath: workspacePath,
            savedAt: Date.now()
        };
        
        localStorage.setItem(`taskrails_project_${projectId}`, JSON.stringify(projectData));
        setCurrentProjectPath(projectId);
        
        if (!projectConfig.projectName) {
            setProjectConfig(prev => ({ ...prev, projectName }));
        }
        
        const newProject: SavedProject = {
            name: projectName,
            path: projectId,
            workspacePath: workspacePath || '',
            lastModified: Date.now()
        };
        setSavedProjects(prev => {
            const filtered = prev.filter(p => p.path !== projectId);
            const updated = [newProject, ...filtered].slice(0, 10);
            localStorage.setItem('taskrails_saved_projects', JSON.stringify(updated));
            return updated;
        });
        
        setMessages(msgs => [...msgs, { role: 'assistant', content: `✅ 專案「${projectName}」已儲存！${workspacePath ? `\n📁 資料夾：${workspacePath}` : ''}` }]);
    };
    
    const handleLoadSavedProject = (projectId: string) => {
        try {
            const saved = localStorage.getItem(`taskrails_project_${projectId}`);
            if (saved) {
                const projectData = JSON.parse(saved);
                if (projectData.config) setProjectConfig(projectData.config);
                if (projectData.messages) setMessages(projectData.messages);
                if (projectData.workspacePath) setWorkspacePath(projectData.workspacePath);
                setCurrentProjectPath(projectId);
                setMessages(msgs => [...msgs, { 
                    role: 'assistant', 
                    content: `✅ 專案「${projectData.config?.projectName || 'Untitled'}」已載入！${projectData.workspacePath ? `\n📁 資料夾：${projectData.workspacePath}` : ''}` 
                }]);
            }
        } catch (err) {
            console.error('Failed to load project:', err);
            setMessages(msgs => [...msgs, { role: 'assistant', content: `❌ 載入失敗：${err}` }]);
        }
    };
    
    const handleDeleteSavedProject = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('確定要刪除這個專案嗎？')) return;
        
        localStorage.removeItem(`taskrails_project_${projectId}`);
        setSavedProjects(prev => {
            const updated = prev.filter(p => p.path !== projectId);
            localStorage.setItem('taskrails_saved_projects', JSON.stringify(updated));
            return updated;
        });
        
        if (currentProjectPath === projectId) {
            setCurrentProjectPath(null);
        }
    };
    
    const handleNewProject = () => {
        if (messages.length > 1) {
            if (!confirm('目前有未儲存的專案，確定要建立新專案嗎？')) return;
        }
        setProjectConfig(getDefaultProjectConfig());
        setCurrentProjectPath(null);
        setMessages([
            { role: 'assistant', content: '🆕 新專案已建立！\n\n請告訴我：**你想做什麼？**' }
        ]);
    };
    
    const handleOpenPopupWindow = async () => {
        const state = {
            messages,
            projectConfig,
            currentProvider,
            currentModel
        };
        localStorage.setItem('taskrails_popup_state', JSON.stringify(state));
        
        try {
            const existingWindow = await WebviewWindow.getByLabel('project-setup-popup');
            if (existingWindow) {
                await existingWindow.setFocus();
                return;
            }
            
            const webview = new WebviewWindow('project-setup-popup', {
                url: '/project-setup-popup',
                title: 'AI 專案設定對話',
                width: 600,
                height: 700,
                center: true,
                resizable: true,
                decorations: false,
                transparent: false,
                alwaysOnTop: false
            });
            
            webview.once('tauri://created', () => console.log('Popup window created'));
            webview.once('tauri://error', (e) => console.error('Failed to create popup window:', e));
        } catch (err) {
            console.error('Failed to open popup window:', err);
            setIsPopupOpen(true);
        }
    };
    
    // Agent Handlers
    const handleEditAgent = (index: number) => setEditingAgentIndex(index);
    
    const handleSaveAgent = (updatedAgent: GeneratedAgent) => {
        if (editingAgentIndex === null) return;
        const updatedAgents = [...(projectConfig.generatedAgents || [])];
        updatedAgents[editingAgentIndex] = updatedAgent;
        setProjectConfig(prev => ({ ...prev, generatedAgents: updatedAgents }));
        setEditingAgentIndex(null);
    };
    
    const handleDeleteAgent = (index: number) => {
        if (!confirm('確定要刪除這個 Agent 嗎？')) return;
        const updatedAgents = projectConfig.generatedAgents?.filter((_, i) => i !== index) || [];
        setProjectConfig(prev => ({ ...prev, generatedAgents: updatedAgents }));
    };
    
    const handleAddAgent = () => {
        const newAgent: GeneratedAgent = {
            id: `agent-${Date.now()}`,
            name: '新 Agent',
            role: '請輸入角色描述',
            skills: ['skill1', 'skill2'],
            systemPrompt: '請輸入 Agent 的系統提示詞...'
        };
        setProjectConfig(prev => ({
            ...prev,
            generatedAgents: [...(prev.generatedAgents || []), newAgent]
        }));
    };

    return {
        isDeploying,
        savedProjects,
        currentProjectPath,
        workspacePath,
        showProjectMenu, setShowProjectMenu,
        isPopupOpen, setIsPopupOpen,
        editingAgentIndex, setEditingAgentIndex,
        
        handleDeployToAll,
        handleReset,
        handleSelectWorkspace,
        handleCreateWorkspace,
        handleSaveProject,
        handleLoadSavedProject,
        handleDeleteSavedProject,
        handleNewProject,
        handleOpenPopupWindow,
        handleEditAgent,
        handleSaveAgent,
        handleDeleteAgent,
        handleAddAgent
    };
}
