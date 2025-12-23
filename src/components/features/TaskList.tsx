import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Task } from './KanbanBoard'; // Import type
import TaskDetailModal from './TaskDetailModal';

// Re-use Task type for consistency
interface TaskListProps {
    tasks: Task[]; // Pass tasks from parent (already filtered)
    onUpdateTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
    onAddTask: (status: 'todo') => void;
}

export default function TaskList({ tasks, onUpdateTask, onDeleteTask, onAddTask }: TaskListProps) {
    // Local state for interactive filtering/search if needed, 
    // but ideally parent controls data. We will just render for now.
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Tasks are already filtered by parent - use directly

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            {/* Toolbar - Same as Kanban but different view toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search tasks..."
                            className="bg-surface-dark border border-border-dark rounded-md pl-9 pr-4 py-1.5 text-sm text-gray-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all w-64 shadow-inner"
                        />
                     </div>
                     <h2 className="text-lg font-bold text-white tracking-wide">TASK LIST</h2>
                </div>
                 <button 
                    onClick={() => onAddTask('todo')}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md flex items-center shadow-lg shadow-orange-900/20 transition-all font-medium text-sm"
                >
                    <Plus size={16} className="mr-2" />
                    New Task
                </button>
            </div>

            {/* Table Header */}
            <div className="bg-surface-dark border border-border-dark rounded-t-lg grid grid-cols-12 gap-4 p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">ID</div>
                <div className="col-span-1">Phase</div>
                <div className="col-span-1">Prio</div>
                <div className="col-span-5">Title</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto border-x border-b border-border-dark rounded-b-lg bg-black/20 custom-scrollbar">
                {tasks.map(task => (
                    <div 
                        key={task.id} 
                        onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                        className="grid grid-cols-12 gap-4 p-4 border-b border-border-dark/50 hover:bg-white/5 cursor-pointer transition-colors group items-center"
                    >
                        <div className="col-span-1 text-xs font-mono text-gray-500">{task.id}</div>
                        <div className="col-span-1 text-xs font-bold text-white">{task.phase}</div>
                        <div className="col-span-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                task.priority === '1' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                task.priority === '2' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                'bg-gray-800 text-gray-400 border-gray-700'
                            }`}>
                                P{task.priority || '3'}
                            </span>
                        </div>
                        <div className="col-span-5 text-sm text-gray-300 font-medium group-hover:text-primary transition-colors truncate">
                            {task.title}
                        </div>
                         <div className="col-span-2">
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                                task.status === 'todo' ? 'bg-blue-500/10 text-blue-400' :
                                task.status === 'doing' ? 'bg-yellow-500/10 text-yellow-400 animate-pulse' :
                                'bg-green-500/10 text-green-400'
                            }`}>
                                {task.status}
                            </span>
                        </div>
                        <div className="col-span-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                             {task.status !== 'doing' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                    className="text-gray-500 hover:text-red-500 p-1"
                                >
                                    Delete
                                </button>
                             )}
                        </div>
                    </div>
                ))}
            </div>

             <TaskDetailModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                    onSave={(updated) => { onUpdateTask(updated); setIsModalOpen(false); }}
                    onDelete={(id) => { onDeleteTask(id); setIsModalOpen(false); }}
            />
        </div>
    );
}
