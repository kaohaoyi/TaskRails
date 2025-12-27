import clsx from 'clsx';
import { 
    Rocket, ArrowRight, ChevronDown, ChevronUp, 
} from 'lucide-react';
import { ProjectConfig, CompletenessCheck } from '../../../utils/projectConfig';
import { AgentList } from './AgentList';
import { ProgressIndicator } from './ProgressIndicator';

interface ConfigPanelProps {
    showConfigPanel: boolean;
    setShowConfigPanel: (v: boolean) => void;
    projectConfig: ProjectConfig;
    completenessCheck: CompletenessCheck;
    onAddAgent: () => void;
    onEditAgent: (index: number) => void;
    onDeleteAgent: (index: number) => void;
    isDeploying: boolean;
    onDeploy: () => void;
}

export function ConfigPanel({
    showConfigPanel,
    setShowConfigPanel,
    projectConfig,
    completenessCheck,
    onAddAgent,
    onEditAgent,
    onDeleteAgent,
    isDeploying,
    onDeploy
}: ConfigPanelProps) {
    return (
        <div className="w-80 border-l border-white/5 bg-[#0D0D0F] flex flex-col">
            <div 
                className="px-4 py-3 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5"
                onClick={() => setShowConfigPanel(!showConfigPanel)}
            >
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest select-text">
                    專案配置進度
                </span>
                {showConfigPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            
            {showConfigPanel && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    <ProgressIndicator completenessCheck={completenessCheck} />
                    
                    {/* Config Preview */}
                    {projectConfig.projectName && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                📋 專案資訊
                            </span>
                            <div className="space-y-1 text-[11px]">
                                <div className="px-3 py-2 bg-white/5 rounded-lg text-gray-300 select-text">{projectConfig.projectName}</div>
                                {projectConfig.techStack.length > 0 && (
                                    <div className="px-3 py-2 bg-white/5 rounded-lg text-gray-400 select-text">
                                        {projectConfig.techStack.join(' • ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Agents Section */}
                    <AgentList 
                        agents={projectConfig.generatedAgents || []}
                        onAdd={onAddAgent}
                        onEdit={onEditAgent}
                        onDelete={onDeleteAgent}
                    />
                    
                    {(projectConfig.generatedDiagrams?.length || 0) > 0 && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                📅 將建立的圖表
                            </span>
                            <div className="space-y-1">
                                {projectConfig.generatedDiagrams?.map((diagram, i) => (
                                    <div key={i} className="px-3 py-2 bg-white/5 rounded-lg text-[11px] text-gray-300 flex justify-between select-text">
                                        <span>{diagram.name}</span>
                                        <span className="text-gray-600 uppercase text-[9px]">{diagram.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {(projectConfig.generatedTasks?.length || 0) > 0 && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                📌 將建立的任務
                            </span>
                            <div className="text-[11px] text-gray-400 select-text">
                                {projectConfig.generatedTasks?.length} 個任務
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Deploy Button */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={onDeploy}
                    disabled={!completenessCheck.isComplete || isDeploying}
                    className={clsx(
                        "w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                        completenessCheck.isComplete && !isDeploying
                            ? "bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/30 cursor-pointer"
                            : "bg-gray-800 text-gray-600 cursor-not-allowed"
                    )}
                >
                    {isDeploying ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Deploying...
                        </>
                    ) : (
                        <>
                            <Rocket size={16} />
                            Deploy to All
                            {completenessCheck.isComplete && <ArrowRight size={14} />}
                        </>
                    )}
                </button>
                
                {!completenessCheck.isComplete && (
                        <p className="text-[10px] text-red-400/70 text-center mt-2 select-text">
                        ⚠️ 請先完成必填項目：{completenessCheck.missingRequired.join('、')}
                    </p>
                )}
            </div>
        </div>
    );
}
