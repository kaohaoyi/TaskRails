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
    onInjectTasks: () => void;
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
    onDeploy,
    onInjectTasks
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
                    
                    {/* Config Preview - Show all 7 core items if they exist */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                📋 專案規格詳情
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            {/* Project Name & Goal */}
                            {projectConfig.projectName && (
                                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Project Name</div>
                                    <div className="text-[12px] font-bold text-gray-200 select-text">{projectConfig.projectName}</div>
                                </div>
                            )}

                            {projectConfig.projectGoal && projectConfig.projectGoal !== '...' && (
                                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Project Goal</div>
                                    <div className="text-[11px] text-gray-400 leading-relaxed select-text whitespace-pre-wrap">{projectConfig.projectGoal}</div>
                                </div>
                            )}

                            {/* Tech Stack & Features */}
                            {projectConfig.techStack.length > 0 && (
                                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1.5">
                                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Tech Stack</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {projectConfig.techStack.map((tech, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black rounded border border-blue-500/20">{tech}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {projectConfig.features.length > 0 && (
                                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1.5">
                                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Features</div>
                                    <div className="space-y-1">
                                        {projectConfig.features.map((feature, i) => (
                                            <div key={i} className="text-[10px] text-gray-400 flex gap-2">
                                                <span className="text-primary">•</span>
                                                <span className="flex-1 select-text">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Data, Design & Engineering */}
                            {projectConfig.dataStructure && projectConfig.dataStructure !== '...' && (
                                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Data Structure</div>
                                    <div className="text-[10px] text-gray-500 italic select-text whitespace-pre-wrap">{projectConfig.dataStructure}</div>
                                </div>
                            )}

                            {projectConfig.designSpec && projectConfig.designSpec !== '...' && (
                                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Design Spec</div>
                                    <div className="text-[10px] text-gray-500 select-text whitespace-pre-wrap">{projectConfig.designSpec}</div>
                                </div>
                            )}

                            {projectConfig.engineeringRules && projectConfig.engineeringRules !== '...' && (
                                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Engineering Rules</div>
                                    <div className="text-[10px] font-mono text-primary/70 select-text whitespace-pre-wrap">{projectConfig.engineeringRules}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Agents Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                🛸 召集團隊 (Agents)
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-bold">{projectConfig.generatedAgents?.length || 0}</span>
                        </div>
                        <AgentList 
                            agents={projectConfig.generatedAgents || []}
                            onAdd={onAddAgent}
                            onEdit={onEditAgent}
                            onDelete={onDeleteAgent}
                        />
                    </div>
                    
                    {(projectConfig.generatedDiagrams?.length || 0) > 0 && (
                        <div className="space-y-2">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    📐 專案藍圖 (Diagrams)
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-bold">{projectConfig.generatedDiagrams?.length}</span>
                            </div>
                            <div className="space-y-1">
                                {projectConfig.generatedDiagrams?.map((diagram, i) => (
                                    <div key={i} className="px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-[11px] text-gray-300 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{diagram.name}</span>
                                            <span className="text-[9px] text-gray-600 uppercase font-mono">{diagram.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {(projectConfig.generatedTasks?.length || 0) > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    📌 待注入任務
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-bold">{projectConfig.generatedTasks?.length}</span>
                            </div>
                            
                            <button
                                onClick={onInjectTasks}
                                disabled={isDeploying}
                                className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-yellow-500/20 flex items-center justify-center gap-2"
                            >
                                立刻注入到看板 (TODO)
                                <ArrowRight size={12} />
                            </button>
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
