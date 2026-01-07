import { useState, useEffect } from 'react';
import { 
    CheckCircle2, XCircle, AlertCircle, Sparkles,
    RotateCcw, Maximize2, FolderOpen, FilePlus, Save, ChevronDown,
    Trash2, ExternalLink, Bot
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { AiSettingsDropdown } from './project-setup/AiSettingsDropdown';
import { ChatInterface } from './project-setup/ChatInterface';
import { ConfigPanel } from './project-setup/ConfigPanel';
import { AgentEditModal } from './project-setup/AgentEditModal';
import { TokenCounter } from '../ui/TokenCounter';
import { 
    ProjectConfig, 
    CompletenessCheck,
    checkProjectCompleteness, 
    getDefaultProjectConfig
} from '../../utils/projectConfig';
import { useProjectChat } from './project-setup/hooks/useProjectChat';
import { useProjectActions } from './project-setup/hooks/useProjectActions';

interface ProjectSetupHubProps {
    onDeployComplete?: (config: ProjectConfig) => void;
}

export default function ProjectSetupHub({ onDeployComplete }: ProjectSetupHubProps) {
    
    // Project Config State (Shared Source of Truth)
    const [projectConfig, setProjectConfig] = useState<ProjectConfig>(getDefaultProjectConfig());
    const [completenessCheck, setCompletenessCheck] = useState<CompletenessCheck>({
        isComplete: false,
        progress: 0,
        items: [],
        missingRequired: ['專案名稱', '專案目標', '技術棧', '功能清單', '資料結構', '設計規範', '工程規則']
    });
    const [showConfigPanel, setShowConfigPanel] = useState(true);
    
    // Hook: AI Chat Logic
    const {
        messages, isThinking,
        currentProvider, setCurrentProvider,
        currentModel, setCurrentModel,
        outputLanguage, setOutputLanguage,
        showAiSettings, setShowAiSettings,
        availableProviders,
        handleSendMessage,
        messagesEndRef,
        setMessages // Needed for actions to provide feedback
    } = useProjectChat({ projectConfig, setProjectConfig });
    
    // Hook: Project Actions & State
    const {
        isDeploying, savedProjects, currentProjectPath, workspacePath,
        showProjectMenu, setShowProjectMenu,
        isPopupOpen, setIsPopupOpen, editingAgentIndex, setEditingAgentIndex,
        
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
        handleAddAgent,
        handleInjectTasks
    } = useProjectActions({ 
        projectConfig, setProjectConfig, 
        messages, setMessages, 
        completenessCheck,
        currentProvider, currentModel 
    });

    // Effect: Update completeness check when config changes
    useEffect(() => {
        const check = checkProjectCompleteness(projectConfig);
        setCompletenessCheck(check);
    }, [projectConfig]);

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="text-primary" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-wider select-text">Project Setup Hub</h1>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest select-text">
                            {currentProjectPath ? currentProjectPath.split(/[/\\]/).pop() : 'Unsaved Project'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Simplified Transfer/Export - Now viewed as 'Genesis Context' */}
                    <button 
                        onClick={async () => {
                            try {
                                const context = messages.map(m => `## ${m.role === 'user' ? 'User' : 'Assistant'}\n${m.content}`).join('\n\n');
                                const fileContent = `# Project Genesis Context\nTimestamp: ${new Date().toISOString()}\n\n${context}`;
                                await invoke('update_memory', { workspace: '.', name: 'genesis_context', content: fileContent });
                                alert("Genesis context exported to @genesis_context.md. Your IDE Agent can now read the setup history.");
                            } catch (e) { console.error(e); }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-colors border border-white/5"
                        title="Export setup history for IDE knowledge"
                    >
                        <Bot size={12} /> Export History
                    </button>

                    <AiSettingsDropdown 
                        currentProvider={currentProvider}
                        setCurrentProvider={setCurrentProvider}
                        currentModel={currentModel}
                        setCurrentModel={setCurrentModel}
                        outputLanguage={outputLanguage}
                        setOutputLanguage={setOutputLanguage}
                        availableProviders={availableProviders}
                        showAiSettings={showAiSettings}
                        setShowAiSettings={setShowAiSettings}
                    />
                    
                    {/* Token Counter with New Chat */}
                    <TokenCounter 
                        messages={messages.map(m => ({ role: m.role, content: m.content }))}
                        model={currentModel}
                        onNewChat={() => {
                            if (confirm('確定要開始新對話嗎？這將清除目前的對話歷史。')) {
                                setMessages([]);
                                setProjectConfig(getDefaultProjectConfig());
                            }
                        }}
                    />
                    
                    <button 
                        onClick={handleOpenPopupWindow}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
                        title="開啟獨立視窗"
                    >
                        <ExternalLink size={12} /> 獨立視窗
                    </button>
                    
                    <button 
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>
            
            <div className="flex-1 flex min-h-0">
                {/* Chat Area */}
                <ChatInterface 
                    messages={messages}
                    isThinking={isThinking}
                    onSendMessage={handleSendMessage}
                    messagesEndRef={messagesEndRef}
                />
                
                {/* Config Panel */}
                <ConfigPanel 
                    showConfigPanel={showConfigPanel}
                    setShowConfigPanel={setShowConfigPanel}
                    projectConfig={projectConfig}
                    completenessCheck={completenessCheck}
                    onAddAgent={handleAddAgent}
                    onEditAgent={handleEditAgent}
                    onDeleteAgent={handleDeleteAgent}
                    isDeploying={isDeploying}
                    onDeploy={() => handleDeployToAll(onDeployComplete)}
                    onInjectTasks={handleInjectTasks}
                />
            </div>
            
            {/* Agent 編輯 Modal */}
            {editingAgentIndex !== null && projectConfig.generatedAgents && projectConfig.generatedAgents[editingAgentIndex] && (
                <AgentEditModal
                    agent={projectConfig.generatedAgents[editingAgentIndex]}
                    isOpen={true}
                    onClose={() => setEditingAgentIndex(null)}
                    onSave={handleSaveAgent}
                />
            )}
            
            {/* Fallback Popup Content (If Webview fails, we might still want to show something? Or just Action logic handles isPopupOpen state) */}
            {/* Note: In UseProjectActions, isPopupOpen is set true if Webview fails. We should probably render a modal or nothing if we rely on Webview fully.
                Original logic rendered a div if isPopupOpen.
                I will restore that simple fallback logic.
             */}
            {isPopupOpen && (
                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-[#1E1E1E] p-6 rounded-lg text-center max-w-sm">
                        <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
                        <h3 className="text-lg font-bold mb-2">無法開啟獨立視窗</h3>
                        <p className="text-gray-400 mb-4 text-sm">請檢查是否有阻擋彈出視窗，或使用目前的瀏覽器環境。</p>
                        <button 
                            onClick={() => setIsPopupOpen(false)}
                            className="px-4 py-2 bg-primary rounded hover:bg-primary/80"
                        >
                            關閉
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
}
