import { useState, useEffect } from 'react';
import { ListTodo, Play, Pause, Check, AlertCircle, Clock, Trash2, ChevronUp, ChevronDown, Send, RotateCcw } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import clsx from 'clsx';

export interface TaskQueueItem {
    id: string;
    agentId: string;
    agentName: string;
    taskIndex: number;
    title: string;
    description: string;
    status: 'queued' | 'dispatched' | 'running' | 'completed' | 'failed';
    priority: number;
    createdAt: string;
    dispatchedAt?: string;
    completedAt?: string;
    result?: string;
    error?: string;
}

interface TaskQueuePanelProps {
    className?: string;
}

export default function TaskQueuePanel({ className }: TaskQueuePanelProps) {
    const [queue, setQueue] = useState<TaskQueueItem[]>([]);
    const [autoDispatch, setAutoDispatch] = useState(false);
    const [currentlyRunning, setCurrentlyRunning] = useState<string | null>(null);

    // Load queue from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('taskrails_task_queue');
        if (saved) {
            try {
                setQueue(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load task queue:', e);
            }
        }

        // Listen for new tasks added to queue
        const unlisten = listen<{ task: TaskQueueItem }>('task-queue-add', (event) => {
            console.log('[TaskQueuePanel] Received task-queue-add event:', event.payload);
            setQueue(prev => [...prev, event.payload.task]);
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    // Save queue to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('taskrails_task_queue', JSON.stringify(queue));
    }, [queue]);

    // Auto-dispatch next task when enabled
    useEffect(() => {
        if (autoDispatch && !currentlyRunning) {
            const pendingTask = queue.find(t => t.status === 'queued');
            if (pendingTask) {
                handleDispatchTask(pendingTask.id);
            }
        }
    }, [autoDispatch, currentlyRunning, queue]);

    const handleDispatchTask = async (taskId: string) => {
        const task = queue.find(t => t.id === taskId);
        if (!task) return;

        setCurrentlyRunning(taskId);
        setQueue(prev => prev.map(t => 
            t.id === taskId ? { ...t, status: 'dispatched' as const, dispatchedAt: new Date().toISOString() } : t
        ));

        try {
            // Format task for AI IDE
            const dispatchContent = `# 任務派發

> 任務 ID: ${task.id}
> Agent: ${task.agentName}
> 優先級: ${task.priority}
> 建立時間: ${task.createdAt}

---

## ${task.title}

${task.description}

---

**請執行上述任務，完成後報告結果。**
`;

            await invoke('update_memory', {
                workspace: '.',
                name: 'current_task',
                content: dispatchContent
            });

            // Copy instruction to clipboard
            const clipboardText = `Read @current_task.md and execute task: ${task.title}`;
            await navigator.clipboard.writeText(clipboardText);

            // Update status to running
            setQueue(prev => prev.map(t => 
                t.id === taskId ? { ...t, status: 'running' as const } : t
            ));

            console.log(`[TaskQueuePanel] Dispatched task: ${task.title}`);
        } catch (e: any) {
            console.error('Failed to dispatch task:', e);
            setQueue(prev => prev.map(t => 
                t.id === taskId ? { ...t, status: 'failed' as const, error: e.toString() } : t
            ));
            setCurrentlyRunning(null);
        }
    };

    const handleMarkComplete = (taskId: string) => {
        setQueue(prev => prev.map(t => 
            t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() } : t
        ));
        setCurrentlyRunning(null);
    };

    const handleMarkFailed = (taskId: string, error: string) => {
        setQueue(prev => prev.map(t => 
            t.id === taskId ? { ...t, status: 'failed' as const, error } : t
        ));
        setCurrentlyRunning(null);
    };

    const handleRetryTask = (taskId: string) => {
        setQueue(prev => prev.map(t => 
            t.id === taskId ? { ...t, status: 'queued' as const, error: undefined, dispatchedAt: undefined } : t
        ));
    };

    const handleRemoveTask = (taskId: string) => {
        setQueue(prev => prev.filter(t => t.id !== taskId));
        if (currentlyRunning === taskId) {
            setCurrentlyRunning(null);
        }
    };

    const handleMoveUp = (taskId: string) => {
        const idx = queue.findIndex(t => t.id === taskId);
        if (idx > 0) {
            const newQueue = [...queue];
            [newQueue[idx - 1], newQueue[idx]] = [newQueue[idx], newQueue[idx - 1]];
            setQueue(newQueue);
        }
    };

    const handleMoveDown = (taskId: string) => {
        const idx = queue.findIndex(t => t.id === taskId);
        if (idx < queue.length - 1) {
            const newQueue = [...queue];
            [newQueue[idx], newQueue[idx + 1]] = [newQueue[idx + 1], newQueue[idx]];
            setQueue(newQueue);
        }
    };

    const handleClearCompleted = () => {
        setQueue(prev => prev.filter(t => t.status !== 'completed'));
    };

    const getStatusIcon = (status: TaskQueueItem['status']) => {
        switch (status) {
            case 'queued': return <Clock size={12} className="text-gray-400" />;
            case 'dispatched': return <Send size={12} className="text-yellow-400" />;
            case 'running': return <Play size={12} className="text-blue-400 animate-pulse" />;
            case 'completed': return <Check size={12} className="text-green-400" />;
            case 'failed': return <AlertCircle size={12} className="text-red-400" />;
        }
    };

    const getStatusColor = (status: TaskQueueItem['status']) => {
        switch (status) {
            case 'queued': return 'border-gray-600/30';
            case 'dispatched': return 'border-yellow-500/30';
            case 'running': return 'border-blue-500/30 bg-blue-500/5';
            case 'completed': return 'border-green-500/30';
            case 'failed': return 'border-red-500/30';
        }
    };

    const queuedCount = queue.filter(t => t.status === 'queued').length;
    const completedCount = queue.filter(t => t.status === 'completed').length;
    const failedCount = queue.filter(t => t.status === 'failed').length;

    return (
        <div className={clsx("flex flex-col h-full bg-[#0A0A0C] text-white", className)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListTodo size={16} className="text-primary" />
                    <span className="text-sm font-bold">任務佇列</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono">
                        {queuedCount} 待執行
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Auto-dispatch toggle */}
                    <button
                        onClick={() => setAutoDispatch(!autoDispatch)}
                        className={clsx(
                            "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                            autoDispatch 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/5 text-gray-500 border border-white/10"
                        )}
                    >
                        {autoDispatch ? <Play size={10} /> : <Pause size={10} />}
                        {autoDispatch ? 'Auto' : 'Manual'}
                    </button>
                    
                    {completedCount > 0 && (
                        <button
                            onClick={handleClearCompleted}
                            className="text-[10px] text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-white/5 transition-all"
                        >
                            清除已完成
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-4 py-2 border-b border-white/5 flex gap-4 text-[10px]">
                <span className="text-gray-400">
                    ✅ {completedCount} 完成
                </span>
                {failedCount > 0 && (
                    <span className="text-red-400">
                        ❌ {failedCount} 失敗
                    </span>
                )}
                <span className="text-gray-500">
                    共 {queue.length} 任務
                </span>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {queue.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm">
                        <ListTodo size={32} className="mb-2 opacity-50" />
                        <p>任務佇列為空</p>
                        <p className="text-[10px] mt-1">在 Agent 卡片上點擊「派發」添加任務</p>
                    </div>
                ) : (
                    queue.map((task, idx) => (
                        <div 
                            key={task.id}
                            className={clsx(
                                "border rounded-lg p-3 transition-all group",
                                getStatusColor(task.status)
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    {getStatusIcon(task.status)}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                            {task.title}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                            {task.agentName} • #{idx + 1}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {task.status === 'queued' && (
                                        <>
                                            <button onClick={() => handleMoveUp(task.id)} className="p-1 hover:bg-white/10 rounded">
                                                <ChevronUp size={12} />
                                            </button>
                                            <button onClick={() => handleMoveDown(task.id)} className="p-1 hover:bg-white/10 rounded">
                                                <ChevronDown size={12} />
                                            </button>
                                            <button 
                                                onClick={() => handleDispatchTask(task.id)} 
                                                className="p-1 hover:bg-primary/20 text-primary rounded"
                                                title="派發任務"
                                            >
                                                <Send size={12} />
                                            </button>
                                        </>
                                    )}
                                    {task.status === 'running' && (
                                        <>
                                            <button 
                                                onClick={() => handleMarkComplete(task.id)} 
                                                className="p-1 hover:bg-green-500/20 text-green-400 rounded"
                                                title="標記完成"
                                            >
                                                <Check size={12} />
                                            </button>
                                            <button 
                                                onClick={() => handleMarkFailed(task.id, '手動標記失敗')} 
                                                className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                                                title="標記失敗"
                                            >
                                                <AlertCircle size={12} />
                                            </button>
                                        </>
                                    )}
                                    {task.status === 'failed' && (
                                        <button 
                                            onClick={() => handleRetryTask(task.id)} 
                                            className="p-1 hover:bg-yellow-500/20 text-yellow-400 rounded"
                                            title="重試"
                                        >
                                            <RotateCcw size={12} />
                                        </button>
                                    )}
                                    {task.status !== 'running' && (
                                        <button 
                                            onClick={() => handleRemoveTask(task.id)} 
                                            className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                                            title="移除"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Error message if failed */}
                            {task.status === 'failed' && task.error && (
                                <div className="mt-2 text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1">
                                    {task.error}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Helper function to add task to queue (can be imported by other components)
export function addTaskToQueue(task: Omit<TaskQueueItem, 'id' | 'status' | 'createdAt'>) {
    const newTask: TaskQueueItem = {
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        status: 'queued',
        createdAt: new Date().toISOString()
    };

    // Get current queue from localStorage
    const saved = localStorage.getItem('taskrails_task_queue');
    const queue = saved ? JSON.parse(saved) : [];
    queue.push(newTask);
    localStorage.setItem('taskrails_task_queue', JSON.stringify(queue));

    // Emit event for TaskQueuePanel to pick up
    window.dispatchEvent(new CustomEvent('task-queue-updated', { detail: { task: newTask } }));

    return newTask;
}

// Helper to add all agent tasks to queue
export function addAgentTasksToQueue(agent: {
    id: string;
    agentName: string;
    name: string;
    tasks?: { title: string; description: string }[];
    goals?: string[];
}) {
    if (!agent.tasks || agent.tasks.length === 0) {
        console.warn('No tasks to add to queue');
        return [];
    }

    const addedTasks: TaskQueueItem[] = [];
    agent.tasks.forEach((task, idx) => {
        const newTask = addTaskToQueue({
            agentId: agent.id,
            agentName: agent.agentName,
            taskIndex: idx,
            title: task.title,
            description: task.description,
            priority: 2 // Default priority
        });
        addedTasks.push(newTask);
    });

    return addedTasks;
}
