import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Bot, User } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from '../../hooks/useTranslation';
import { Role } from '../common/RoleTabs';
import { AgentRole } from './RoleSettingsPage';

// Duplicate definition for standalone usage, ideally integrate shared types
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface TaskData {
    id: string;
    title: string;
    description?: string; // Markdown content
    status: TaskStatus;
    tag?: string;
    role?: Role | 'all';
    phase: string;
    priority: string;
    isReworked?: boolean;
    assignee?: string;
}

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: TaskData | null;
    onSave: (updatedTask: TaskData) => void;
    onDelete: (taskId: string) => void;
    onRework?: (originalTask: TaskData, newContent: TaskData) => void;
    availableRoles?: AgentRole[];
}

export default function TaskDetailModal({ isOpen, onClose, task, onSave, onDelete, onRework, availableRoles = [] }: TaskDetailModalProps) {
    const { kanban } = useTranslation();
    const t = kanban.taskModal;
    const [editedTask, setEditedTask] = useState<TaskData | null>(task);
    
    useEffect(() => {
        setEditedTask(task);
    }, [task]);

    if (!isOpen || !editedTask) return null;

    const handleSave = () => {
        if (editedTask) {
            onSave(editedTask);
            onClose();
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            onDelete(editedTask.id);
            onClose();
        }
    };

    const handleRework = () => {
        if (editedTask && onRework) {
            onRework(task!, editedTask);
            onClose();
        }
    };

    const isReadOnly = editedTask.status === 'done' && editedTask.isReworked;

    const statusStyles: Record<TaskStatus, { border: string, glow: string, bg: string, text: string }> = {
        todo: { border: 'border-blue-500/30', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]', bg: 'bg-blue-500/5', text: 'text-blue-400' },
        doing: { border: 'border-primary/30', glow: 'shadow-[0_0_20px_rgba(242,153,74,0.1)]', bg: 'bg-primary/5', text: 'text-primary' },
        done: { border: 'border-green-500/30', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.1)]', bg: 'bg-green-500/5', text: 'text-green-400' },
    };

    const currentStyle = statusStyles[editedTask.status];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            {/* Modal Window */}
            <div className={clsx(
                "w-[95vw] max-w-[1400px] h-[90vh] bg-[#0A0A0C] border rounded-2xl flex flex-col overflow-hidden relative shadow-2xl transition-all duration-500",
                currentStyle.border,
                currentStyle.glow
            )}>
                {/* Status Indicator Bar */}
                <div className={clsx("h-1 w-full", currentStyle.bg)}>
                    <div className={clsx("h-full bg-current transition-all duration-500", currentStyle.text)} style={{ width: '100%' }}></div>
                </div>

                {/* Header Area */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0F0F12]">
                    <div className="flex items-center gap-5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase leading-none mb-1">REFERENCE_ID</span>
                            <span className="font-mono text-sm text-white font-bold tracking-tighter">{editedTask.id}</span>
                        </div>
                        
                        <div className="h-8 w-px bg-white/5"></div>
                        
                        <div className="flex items-center gap-3">
                            <span className={clsx("text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider", currentStyle.bg, currentStyle.border, currentStyle.text)}>
                                {editedTask.status}
                            </span>
                            {editedTask.isReworked && (
                                <span className="text-[10px] bg-orange-500 text-white font-black px-3 py-1 rounded-full italic tracking-tight animate-pulse">
                                    REWORKED
                                </span>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main Body */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Content Editor */}
                    <div className="flex-1 flex flex-col min-w-0 bg-transparent">
                        <div className="p-8 pb-0">
                            <textarea 
                                value={editedTask.title}
                                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                readOnly={isReadOnly}
                                className="w-full bg-transparent text-4xl font-black text-white placeholder-white/10 focus:outline-none resize-none leading-tight tracking-tight h-auto min-h-[80px]"
                                placeholder={t.titlePlaceholder}
                                rows={2}
                            />
                        </div>

                        <div className="flex-1 flex flex-col p-8 pt-4 overflow-hidden">
                            <div className="flex items-center gap-3 mb-4 text-gray-500">
                                <span className="text-[10px] outline-none font-black tracking-widest uppercase">Mission Intelligence</span>
                                <div className="h-px flex-1 bg-white/5"></div>
                            </div>
                            <div className="flex-1 relative group">
                                <textarea 
                                    value={editedTask.description || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    readOnly={isReadOnly}
                                    className="w-full h-full bg-[#0D0D0F] border border-white/5 rounded-xl p-6 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-primary/20 transition-all leading-relaxed whitespace-pre-wrap selectable"
                                    placeholder={t.descPlaceholder}
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] bg-black/60 px-2 py-1 rounded border border-white/10 font-mono text-gray-500 uppercase">Markdown Editor</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Metadata & Options */}
                    <div className="w-[380px] border-l border-white/5 bg-[#0D0D0F] flex flex-col">
                        <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                            {/* Assignee Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t.assignee}</h4>
                                <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                        (editedTask.assignee?.startsWith('ai_')) ? "bg-purple-500/20 text-purple-400 border border-purple-500/20" : 
                                        "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                                    )}>
                                        {editedTask.assignee?.startsWith('ai_') ? <Bot size={24} /> : <User size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <select 
                                            value={editedTask.assignee || 'unassigned'}
                                            onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                                            className="w-full bg-transparent text-sm font-bold text-gray-200 focus:outline-none cursor-pointer appearance-none"
                                        >
                                            <option value="unassigned">{t.unassigned}</option>
                                            {availableRoles.map(r => (
                                                <option key={r.id} value={r.id}>{r.agentName}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-500 font-medium truncate">
                                            {availableRoles.find(r => r.id === editedTask.assignee)?.name || '未分派人員'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Specs */}
                            <div className="space-y-4 pt-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Deployment Specs</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase block">{t.phase}</span>
                                        <input 
                                            type="text"
                                            value={editedTask.phase}
                                            onChange={(e) => setEditedTask({ ...editedTask, phase: e.target.value })}
                                            className="bg-transparent text-sm font-mono font-bold text-white w-full focus:outline-none"
                                        />
                                    </div>
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase block">{t.priority}</span>
                                        <select 
                                            value={editedTask.priority}
                                            onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                                            className="bg-transparent text-sm font-mono font-bold text-white w-full focus:outline-none cursor-pointer"
                                        >
                                            <option value="1">P1 HIGHEST</option>
                                            <option value="2">P2 HIGH</option>
                                            <option value="3">P3 MEDIUM</option>
                                            <option value="4">P4 LOW</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Labels */}
                            <div className="space-y-4 pt-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t.tag}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['General', 'Feature', 'Bug', 'Design', 'Backend'].map(tagItem => (
                                        <button 
                                            key={tagItem}
                                            onClick={() => setEditedTask({ ...editedTask, tag: tagItem })}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                                editedTask.tag === tagItem 
                                                    ? "bg-primary/20 border-primary/40 text-primary" 
                                                    : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
                                            )}
                                        >
                                            {tagItem}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status Selector */}
                            <div className="space-y-4 pt-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Execution Status</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['todo', 'doing', 'done'] as TaskStatus[]).map(status => (
                                        <button 
                                            key={status}
                                            onClick={() => setEditedTask({ ...editedTask, status: status })}
                                            className={clsx(
                                                "py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border",
                                                editedTask.status === status 
                                                    ? statusStyles[status].bg + " " + statusStyles[status].border + " " + statusStyles[status].text
                                                    : "bg-white/[0.02] border-white/5 text-gray-600 hover:border-white/10"
                                            )}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-white/5 bg-black/40 space-y-3">
                            {!isReadOnly && (
                                <button 
                                    onClick={handleSave}
                                    className="w-full bg-primary hover:bg-primary-hover text-white h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-950/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> COMMIT_CHANGES
                                </button>
                            )}
                            
                            {editedTask.status === 'done' && !editedTask.isReworked ? (
                                <button 
                                    onClick={handleRework}
                                    className="w-full bg-orange-600 hover:bg-orange-500 text-white h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-950/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={16} /> INITIATE_REWORK
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={onClose}
                                        className="bg-white/5 hover:bg-white/10 text-gray-400 h-11 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                    >
                                        DISCARD
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 h-11 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                    >
                                        TERMINATE
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
