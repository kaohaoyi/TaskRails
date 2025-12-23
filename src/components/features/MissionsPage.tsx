import { useState, useRef } from 'react';
import { Search, CheckCircle, Clock, List, Bot, User, RotateCcw, Upload, Download, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from '../../hooks/useTranslation';
import TaskDetailModal, { TaskData } from './TaskDetailModal';
import { AgentRole } from './RoleSettingsPage';
import { parseTaskMarkdown } from '../../utils/mdImport';
import { generateTaskMarkdown, downloadMarkdown } from '../../utils/mdExport';

interface MissionsPageProps {
    tasks: TaskData[];
    onUpdateTask: (task: TaskData) => void;
    onDeleteTask: (id: string) => void;
    onDeleteAllTasks?: () => void;
    onRework: (original: TaskData, newContent: TaskData) => void;
    availableRoles: AgentRole[];
}

export default function MissionsPage({ 
    tasks, 
    onUpdateTask, 
    onDeleteTask, 
    onDeleteAllTasks,
    onRework, 
    availableRoles 
}: MissionsPageProps) {
    const t = useTranslation();
    const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todo' | 'doing' | 'done' | 'reworked' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => fileInputRef.current?.click();

    const handleExportClick = () => {
        const mdContent = generateTaskMarkdown(tasks);
        downloadMarkdown(mdContent, `taskrails-missions-${new Date().toISOString().split('T')[0]}.md`);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedTasks = parseTaskMarkdown(text);
            if (importedTasks.length > 0) {
                const confirmMsg = t.common.importConfirm.replace('{count}', importedTasks.length.toString());
                if (confirm(confirmMsg)) {
                    // We need a way to batch update, but for now we'll assume the parent handles it
                    importedTasks.forEach(t => onUpdateTask(t));
                }
            } else {
                alert(t.common.noTasksFound);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to parse Markdown file.');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Stats
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const doingCount = tasks.filter(t => t.status === 'doing').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const reworkedCount = tasks.filter(t => t.isReworked).length;

    // Filter by search and status, then sort by Phase and Priority
    const filteredTasks = tasks.filter(task => {
        // Search filter
        const matchesSearch = !searchQuery || 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Status filter
        const matchesStatus = !statusFilter || 
            (statusFilter === 'reworked' ? task.isReworked : task.status === statusFilter);
        
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        // 1. Sort by Phase (e.g., PHASE 1, PHASE 2)
        const phaseA = a.phase || 'PHASE 1';
        const phaseB = b.phase || 'PHASE 1';
        if (phaseA !== phaseB) {
            return phaseA.localeCompare(phaseB, undefined, { numeric: true, sensitivity: 'base' });
        }
        
        // 2. Sort by Priority (P1 < P2 < P3)
        const priorityA = parseInt(a.priority || '3');
        const priorityB = parseInt(b.priority || '3');
        return priorityA - priorityB;
    });

    // List click handler - same permission as Kanban
    const handleRowClick = (task: TaskData) => {
        if (task.status === 'doing') {
            console.log('[MissionsPage] Task is DOING, blocking edit per Kanban rules');
            return;
        }
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    // Get role name by id
    const getRoleName = (assigneeId?: string) => {
        if (!assigneeId) return '-';
        const role = availableRoles.find(r => r.id === assigneeId);
        return role ? role.agentName : assigneeId;
    };

    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary block"></span>
                        {t.missions.title}
                    </h1>
                    <p className="text-sm text-gray-500 pl-5">{t.missions.subtitle}</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".md" 
                        className="hidden" 
                    />
                    <button 
                        onClick={handleImportClick}
                        className="text-gray-400 hover:text-white px-3 py-2 text-xs font-medium border border-border-dark rounded-md hover:bg-white/5 transition-colors flex items-center gap-2"
                        title={t.common.importMd}
                    >
                        <Download size={14} />
                        <span className="hidden md:inline">{t.common.importMd}</span>
                    </button>
                    <button 
                        onClick={handleExportClick}
                        className="text-gray-400 hover:text-white px-3 py-2 text-xs font-medium border border-border-dark rounded-md hover:bg-white/5 transition-colors flex items-center gap-2"
                        title={t.common.exportMd}
                    >
                        <Upload size={14} />
                        <span className="hidden md:inline">{t.common.exportMd}</span>
                    </button>

                    {tasks.length > 0 && (
                        <button 
                            onClick={() => {
                                if (window.confirm(t.common.deleteAllConfirm)) {
                                    onDeleteAllTasks?.();
                                }
                            }}
                            className="text-red-500/70 hover:text-red-500 px-3 py-2 text-xs font-medium border border-red-500/20 rounded-md hover:bg-red-500/5 transition-colors flex items-center gap-2"
                            title={t.common.deleteAll}
                        >
                            <Trash2 size={14} />
                            <span className="hidden md:inline">{t.common.deleteAll}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards - Clickable Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <button 
                    onClick={() => setStatusFilter(statusFilter === 'todo' ? null : 'todo')}
                    className={clsx(
                        "bg-[#141419] border rounded-lg p-4 flex items-center gap-4 transition-all text-left",
                        statusFilter === 'todo' ? "border-blue-500 ring-1 ring-blue-500/50" : "border-border-dark hover:border-blue-500/50"
                    )}
                >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <List size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{todoCount}</div>
                        <div className="text-xs text-gray-500">{t.missions.stats.todo}</div>
                    </div>
                </button>
                <button 
                    onClick={() => setStatusFilter(statusFilter === 'doing' ? null : 'doing')}
                    className={clsx(
                        "bg-[#141419] border rounded-lg p-4 flex items-center gap-4 transition-all text-left",
                        statusFilter === 'doing' ? "border-yellow-500 ring-1 ring-yellow-500/50" : "border-border-dark hover:border-yellow-500/50"
                    )}
                >
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Clock size={24} className="text-yellow-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{doingCount}</div>
                        <div className="text-xs text-gray-500">{t.missions.stats.doing}</div>
                    </div>
                </button>
                <button 
                    onClick={() => setStatusFilter(statusFilter === 'done' ? null : 'done')}
                    className={clsx(
                        "bg-[#141419] border rounded-lg p-4 flex items-center gap-4 transition-all text-left",
                        statusFilter === 'done' ? "border-green-500 ring-1 ring-green-500/50" : "border-border-dark hover:border-green-500/50"
                    )}
                >
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle size={24} className="text-green-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{doneCount}</div>
                        <div className="text-xs text-gray-500">{t.missions.stats.done}</div>
                    </div>
                </button>
                <button 
                    onClick={() => setStatusFilter(statusFilter === 'reworked' ? null : 'reworked')}
                    className={clsx(
                        "bg-[#141419] border rounded-lg p-4 flex items-center gap-4 transition-all text-left",
                        statusFilter === 'reworked' ? "border-purple-500 ring-1 ring-purple-500/50" : "border-border-dark hover:border-purple-500/50"
                    )}
                >
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <RotateCcw size={24} className="text-purple-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{reworkedCount}</div>
                        <div className="text-xs text-gray-500">{t.missions.stats.reworked}</div>
                    </div>
                </button>
            </div>

            {/* Search */}
            <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜尋任務 ID、標題或描述..."
                        className="w-full bg-[#0D0D0F] border border-border-dark rounded-md pl-10 pr-4 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none"
                    />
                </div>
                <span className="text-sm text-gray-500">{filteredTasks.length} 筆任務</span>
            </div>

            {/* Table */}
            <div className="bg-[#141419] border border-border-dark rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 p-4 bg-[#0D0D0F] border-b border-border-dark text-xs font-mono text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-1">階段</div>
                    <div className="col-span-1">優先</div>
                    <div className="col-span-4">標題</div>
                    <div className="col-span-2">負責人</div>
                    <div className="col-span-1">狀態</div>
                    <div className="col-span-2 text-right">標籤</div>
                </div>

                {/* Table Body */}
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">
                            {searchQuery ? '找不到符合的任務' : '尚無任務'}
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <div 
                                key={task.id}
                                onClick={() => handleRowClick(task)}
                                className={clsx(
                                    "grid grid-cols-12 gap-2 p-4 border-b border-border-dark/50 hover:bg-white/5 transition-colors group items-center",
                                    task.status === 'doing' ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                                )}
                            >
                                <div className="col-span-1 text-xs font-mono text-gray-500 group-hover:text-primary">{task.id}</div>
                                <div className="col-span-1 text-xs font-bold text-primary/70">{task.phase}</div>
                                <div className="col-span-1">
                                    <span className={clsx(
                                        "text-[10px] px-1.5 py-0.5 rounded border",
                                        task.priority === '1' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                        task.priority === '2' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                        'bg-gray-800 text-gray-400 border-gray-700'
                                    )}>
                                        P{task.priority || '3'}
                                    </span>
                                </div>
                                <div className="col-span-4 flex items-center gap-2 text-sm text-gray-300 font-medium truncate group-hover:text-white">
                                    {task.isReworked && (
                                        <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                            <RotateCcw size={8} className="inline mr-0.5" />重工
                                        </span>
                                    )}
                                    <span className={clsx("truncate", task.isReworked && "line-through opacity-60")}>{task.title}</span>
                                </div>
                                <div className="col-span-2 flex items-center gap-1.5">
                                    {task.assignee && (
                                        <>
                                            <div className={clsx(
                                                "w-5 h-5 rounded-full flex items-center justify-center",
                                                task.assignee.startsWith('ai_') ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                            )}>
                                                {task.assignee.startsWith('ai_') ? <Bot size={10} /> : <User size={10} />}
                                            </div>
                                            <span className="text-xs text-gray-400 truncate">{getRoleName(task.assignee)}</span>
                                        </>
                                    )}
                                    {!task.assignee && <span className="text-xs text-gray-600">-</span>}
                                </div>
                                <div className="col-span-1">
                                    <span className={clsx(
                                        "text-[10px] px-2 py-1 rounded-full uppercase font-bold",
                                        task.status === 'todo' ? 'bg-blue-500/10 text-blue-400' :
                                        task.status === 'doing' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-green-500/10 text-green-400'
                                    )}>
                                        {task.status === 'todo' ? '待辦' : task.status === 'doing' ? '進行' : '完成'}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right flex items-center justify-end gap-2">
                                    {task.tag && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                            {task.tag}
                                        </span>
                                    )}
                                    {task.status === 'todo' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); if (confirm('確定要刪除此任務嗎？')) onDeleteTask(task.id); }}
                                            className="p-1 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                            title="刪除任務"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Task Detail Modal */}
            <TaskDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                onSave={(updated) => { onUpdateTask(updated); setIsModalOpen(false); }}
                onDelete={(id) => { onDeleteTask(id); setIsModalOpen(false); }}
                onRework={(original, newContent) => { onRework(original, newContent); setIsModalOpen(false); }}
                availableRoles={availableRoles}
            />
        </div>
    );
}
