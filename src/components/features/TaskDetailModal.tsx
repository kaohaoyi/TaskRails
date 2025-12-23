import { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Tag, RotateCcw, CheckCircle, Lock, Bot, User } from 'lucide-react';
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
    const { kanban, roles, tags } = useTranslation();
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
            onRework(task!, editedTask); // task! is the original task, editedTask has potential new content
            onClose();
        }
    };

    const isReadOnly = editedTask.status === 'done' && editedTask.isReworked;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Window */}
            <div className="w-[95vw] max-w-[1600px] h-[90vh] bg-[#0D0D0F] border border-border-dark rounded-lg shadow-2xl flex flex-col overflow-hidden relative group">
                {/* ... (keep cyber corners and other content same) ... */}
                
                {/* Cyberpunk Decorative Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-dark bg-[#141419]">
                    <div className="flex items-center gap-4 flex-1">
                        <span className="font-mono text-xs text-primary/70 border border-primary/20 px-2 py-1 rounded bg-primary/5">
                            {editedTask.id}
                        </span>
                        
                        {/* REWORK INDICATOR */}
                        {editedTask.isReworked && (
                             <span className="font-mono text-xs text-orange-500 border border-orange-500/20 px-2 py-1 rounded bg-orange-500/10 flex items-center gap-1">
                                <Lock size={12} /> {t.reworked}
                            </span>
                        )}
                        {!editedTask.isReworked && editedTask.status === 'done' && (
                             <span className="font-mono text-xs text-green-500 border border-green-500/20 px-2 py-1 rounded bg-green-500/10 flex items-center gap-1">
                                <CheckCircle size={12} /> {t.completed}
                            </span>
                        )}

                        <select 
                             value={editedTask.role || 'all'}
                             onChange={(e) => setEditedTask({ ...editedTask, role: e.target.value as Role })}
                             disabled={isReadOnly}
                             className={clsx(
                                "bg-black/30 border border-border-dark text-xs text-gray-400 rounded px-2 py-1 focus:border-primary focus:outline-none uppercase tracking-wide cursor-pointer hover:bg-white/5",
                                isReadOnly && "opacity-50 cursor-not-allowed"
                             )}
                         >
                             <option value="coder">{roles.coder}</option>
                             <option value="reviewer">{roles.reviewer}</option>
                             <option value="architect">{roles.architect}</option>
                             <option value="all">{roles.all || 'ALL'}</option>
                         </select>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Main Editor Area */}
                    <div className="flex-1 flex flex-col border-r border-border-dark min-w-0">
                        {/* Title Input */}
                        <div className="p-6 pb-2">
                             <input 
                                type="text"
                                value={editedTask.title}
                                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                 className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none border-b border-transparent focus:border-primary/50 transition-colors py-2"
                                 placeholder={t.titlePlaceholder}
                            />
                        </div>

                        {/* Description Editor */}
                        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                            <textarea 
                                value={editedTask.description || ''}
                                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                                placeholder={t.descPlaceholder}
                            />
                        </div>
                    </div>

                    {/* Sidebar Metadata */}
                    <div className="w-full md:w-64 bg-[#111115] p-6 space-y-6 overflow-y-auto">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Tag size={12} /> {t.phase}
                                </label>
                                 <input 
                                    type="text"
                                    value={editedTask.phase.replace(/\D/g, '')}
                                    readOnly={isReadOnly}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setEditedTask({ ...editedTask, phase: `PHASE ${val}` });
                                    }}
                                    className={clsx(
                                        "w-full bg-[#0D0D0F] border border-border-dark rounded px-3 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none font-mono",
                                        isReadOnly && "opacity-50 cursor-not-allowed"
                                    )}
                                    placeholder="1" 
                                />
                                <span className="text-[10px] text-gray-600">{t.enterNumber}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Tag size={12} /> {t.priority}
                                </label>
                                <input 
                                    type="text"
                                    value={editedTask.priority || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                                    className="w-full bg-[#0D0D0F] border border-border-dark rounded px-3 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none font-mono"
                                    placeholder="3"
                                />
                                <div className="text-[10px] text-gray-600">
                                    {t.sortOrder}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Tag size={12} /> {t.tag}
                            </label>
                            <select 
                                value={editedTask.tag || 'General'}
                                disabled={isReadOnly}
                                onChange={(e) => setEditedTask({ ...editedTask, tag: e.target.value })}
                                className={clsx(
                                    "w-full bg-[#0D0D0F] border border-border-dark rounded px-3 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none cursor-pointer",
                                    isReadOnly && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <option value="General">{tags.general}</option>
                                <option value="Feature">{tags.feature}</option>
                                <option value="Bug">{tags.bug}</option>
                                <option value="Enhancement">{tags.enhancement}</option>
                                <option value="Documentation">{tags.documentation}</option>
                                <option value="Design">{tags.design}</option>
                            </select>
                        </div>

                        <div className="pt-6 border-t border-border-dark/50">
                            <div className="text-xs text-gray-600 font-mono mb-2">{t.created}</div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar size={14} />
                                2025-12-18
                            </div>
                        </div>

                         <div className="pt-4">
                            <div className="text-xs text-gray-600 font-mono mb-2">{t.assignee}</div>
                            <div className="flex items-center gap-2">
                                {/* Dynamic Icon based on assignee */}
                                <div className={clsx(
                                    "w-6 h-6 rounded-full flex items-center justify-center",
                                    (editedTask.assignee?.startsWith('ai_')) ? "bg-purple-500/20 text-purple-400" : 
                                    (editedTask.assignee?.startsWith('user_')) ? "bg-blue-500/20 text-blue-400" : "bg-gray-700"
                                )}>
                                    {editedTask.assignee?.startsWith('ai_') ? <Bot size={14} /> : 
                                     editedTask.assignee?.startsWith('user_') ? <User size={14} /> : null}
                                </div>
                                <select 
                                    value={editedTask.assignee || 'unassigned'}
                                    disabled={isReadOnly}
                                    onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                                    style={{ backgroundColor: '#1A1A1F' }}
                                    className={clsx(
                                        "border border-border-dark rounded px-2 py-1 text-sm text-gray-300 focus:outline-none cursor-pointer w-full hover:border-primary/50 transition-colors",
                                        isReadOnly && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <option value="unassigned" style={{ backgroundColor: '#1A1A1F', color: '#d1d5db' }}>{t.unassigned}</option>
                                    {availableRoles.length > 0 ? (
                                        <>
                                            <optgroup label="AI Agents">
                                                {availableRoles.filter(r => r.type === 'ai').map(role => (
                                                    <option 
                                                        key={role.id} 
                                                        value={role.id} 
                                                        style={{ backgroundColor: '#1A1A1F', color: '#d1d5db' }}
                                                    >
                                                        {role.agentName} ({role.name})
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Collaborators">
                                                {availableRoles.filter(r => r.type === 'human').map(role => (
                                                    <option 
                                                        key={role.id} 
                                                        value={role.id} 
                                                        style={{ backgroundColor: '#1A1A1F', color: '#d1d5db' }}
                                                    >
                                                        {role.agentName} ({role.name})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </>
                                    ) : (
                                        <option value="" disabled style={{ backgroundColor: '#1A1A1F', color: '#888' }}>無可用角色</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border-dark bg-[#141419] flex justify-between items-center">
                    <button 
                         onClick={handleDelete}
                         className="flex items-center gap-2 text-red-500 hover:text-red-400 px-4 py-2 rounded hover:bg-red-500/10 transition-colors text-sm font-medium"
                    >
                        <Trash2 size={16} /> {t.delete}
                    </button>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                        >
                            {t.cancel}
                        </button>
                        
                        {editedTask.status === 'done' && !editedTask.isReworked ? (
                            <button 
                                onClick={handleRework}
                                disabled={isReadOnly}
                                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded shadow-lg shadow-yellow-900/20 font-bold tracking-wide text-sm transition-all"
                            >
                                <RotateCcw size={16} /> {t.rework}
                            </button>
                        ) : !isReadOnly && (
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded shadow-lg shadow-orange-900/20 font-bold tracking-wide text-sm transition-all"
                            >
                                <Save size={16} /> {t.save}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
