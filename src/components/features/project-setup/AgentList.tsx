import { Plus, Edit3, Trash2 } from 'lucide-react';
import { GeneratedAgent } from '../../../utils/projectConfig';

interface AgentListProps {
    agents: GeneratedAgent[];
    onAdd: () => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

export function AgentList({ agents, onAdd, onEdit, onDelete }: AgentListProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    🤖 Agent 清單 ({agents?.length || 0})
                </span>
                <button
                    onClick={onAdd}
                    className="p-1 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    title="新增 Agent"
                >
                    <Plus size={14} />
                </button>
            </div>
            {(agents?.length || 0) > 0 ? (
                <div className="space-y-1">
                    {agents.map((agent, i) => (
                        <div key={i} className="px-3 py-2 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-gray-200 select-text">{agent.name}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onEdit(i)}
                                        className="p-1 hover:text-white text-gray-500"
                                    >
                                        <Edit3 size={12} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(i)}
                                        className="p-1 hover:text-red-400 text-gray-500"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {agent.skills.slice(0, 3).map((skill, j) => (
                                    <span key={j} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] rounded select-text">
                                        {skill}
                                    </span>
                                ))}
                                {agent.skills.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-white/5 text-gray-500 text-[9px] rounded">
                                        +{agent.skills.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="px-3 py-4 bg-white/5 rounded-lg text-center text-gray-600 text-[10px]">
                    AI 將根據專案需求自動生成 Agent，<br/>
                    或點擊 + 手動新增
                </div>
            )}
        </div>
    );
}
