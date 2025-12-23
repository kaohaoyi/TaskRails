import { useState, useRef } from 'react';
import { parseTaskMarkdown } from '../../utils/mdImport';
import { generateTaskMarkdown, downloadMarkdown } from '../../utils/mdExport';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { Plus, Search, LayoutGrid, Layers, Download, Upload, X, Bot, User, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import TaskDetailModal, { TaskData, TaskStatus } from './TaskDetailModal';
import TaskList from './TaskList';
import { AgentRole } from './RoleSettingsPage';

// Re-export or align with TaskData
export interface Task extends TaskData {}

// Initial tasks with Role assignments - exported for use in App.tsx
export const initialTasks: Task[] = [
  { id: 'TSK-101', title: '專案初始化', status: 'done', tag: 'Core', phase: 'PHASE 1', priority: '1', description: '# 專案設置\n- [x] 初始化 Vite 專案\n- [x] 設定 TypeScript' },
  { id: 'TSK-102', title: '設定 Tailwind', status: 'done', tag: 'UI', phase: 'PHASE 1', priority: '2', description: '設定 Tailwind CSS 與自定義色彩變數。' },
  { id: 'TSK-103', title: '實作看板功能', status: 'doing', tag: 'Feature', phase: 'PHASE 1', priority: '1', description: '使用 `@dnd-kit` 實作拖曳看板。' },
  { id: 'TSK-104', title: 'Rust 後端整合', status: 'todo', tag: 'Backend', phase: 'PHASE 2', priority: '3', description: '整合 Tauri Command 與前端。' },
  { id: 'TSK-105', title: '氣閘模態窗', status: 'todo', tag: 'UI', phase: 'PHASE 1', priority: '2', description: '實作 Airlock 安全確認機制。' },
  { id: 'TSK-106', title: 'DB Schema 設計', status: 'doing', tag: 'Database', phase: 'PHASE 2', priority: '1', description: '設計 SQLite 資料庫架構。' },
  { id: 'TSK-107', title: 'Code Review: API', status: 'todo', tag: 'Quality', phase: 'PHASE 2', priority: '2', description: '審查後端 API 介面定義。' },
];

interface KanbanBoardProps {
    availableRoles?: AgentRole[];
    tasks: Task[];
    onTasksChange: (tasks: Task[]) => void;
    onDeleteAllTasks?: () => void;
}

export default function KanbanBoard({ 
    availableRoles = [], 
    tasks, 
    onTasksChange,
    onDeleteAllTasks 
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('all'); // Filter by assignee role

  const fullT = useTranslation();
  const t = fullT.kanban;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort tasks logic: Phase (asc) -> Priority (asc)
  // Assuming 'PHASE X' or numbers for Phase. Priority is numeric string.
  // We need a robust sort function.
  const sortTasks = (tasksToSort: Task[]) => {
      return [...tasksToSort].sort((a, b) => {
          // 1. Sort by Phase (Numeric compare: PHASE 1 < PHASE 10)
          const phaseA = a.phase || 'PHASE 1';
          const phaseB = b.phase || 'PHASE 1';
          if (phaseA !== phaseB) {
              return phaseA.localeCompare(phaseB, undefined, { numeric: true, sensitivity: 'base' });
          }
          
          // 2. Sort by Priority (P1 < P2 < P3)
          const priorityA = parseInt((a.priority || '3').replace(/\D/g, '')) || 3;
          const priorityB = parseInt((b.priority || '3').replace(/\D/g, '')) || 3;
          return priorityA - priorityB;
      });
  };

  const sortedTasks = sortTasks(tasks);

  // Filter tasks based on selected role (by assignee)
  const visibleTasks = selectedRoleId === 'all' 
    ? sortedTasks 
    : sortedTasks.filter(t => t.assignee === selectedRoleId);
  const getTasksByStatus = (status: TaskStatus) => visibleTasks.filter(task => task.status === status);

  function findContainer(id: string): TaskStatus | undefined {
    if ((['todo', 'doing', 'done'] as TaskStatus[]).includes(id as TaskStatus)) {
        return id as TaskStatus;
    }
    return tasks.find(t => t.id === id)?.status as TaskStatus;
  }

  const handleDragStart = (event: DragStartEvent) => {
      // DOING column items cannot be dragged (or effectively disabled)
      const task = tasks.find(t => t.id === event.active.id);
      if (task?.status === 'doing') return; // Or create a validator
      setActiveId(event.active.id as string);
  };

  // ... Drag Handlers (Keep standard, but maybe block dropping into disallowed columns if needed) ...
  // For simplicity, we allow drag, but permissions usually strictly limit actions.
  // If user says "DOING" cannot be edited/added, maybe moving TO doing is okay? 
  // User said "Doing... cannot add card". Dragging IS adding in a way. 
  // Let's assume Drag & Drop flow is separate from "Add New Card" button.
  // If stricter, we block drag from/to restricted columns.

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    // ... logic ...
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }
    
    // Prevent dragging out of DOING if strict
    // if (activeContainer === 'doing') return; 

    onTasksChange(
      tasks.map(t => {
          if (t.id === activeId) return { ...t, status: overContainer };
          return t;
      })
    );
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;
      const activeId = active.id as string;
      const overId = over.id as string;
      const activeContainer = findContainer(activeId);
      const overContainer = findContainer(overId);
      
      if (activeContainer && overContainer && activeContainer === overContainer) {
        // Find indexes in the original array is tricky because visual sort != array sort
        // But dnd-kit uses arrayMove on the specific filtered list usually.
        // Since we force sort by Phase/Priority, manual reordering might be overwritten immediately.
        // If sorting is enforced, dragging within column does NOTHING to order.
        return; 
      }
  };

  const handleTaskClick = (task: Task) => {
      console.log('[KanbanBoard] handleTaskClick called', { taskId: task.id, status: task.status });
      // Check permissions
      if (task.status === 'doing') {
          console.log('[KanbanBoard] Task is DOING, blocking edit');
          return;
      }
      console.log('[KanbanBoard] Opening modal for task:', task.id);
      setSelectedTask(task);
      setIsModalOpen(true);
      console.log('[KanbanBoard] Modal should be open now');
  };

  const handleAddNewTask = (status: TaskStatus) => {
      if (status !== 'todo') return; // Only TODO can add

      const newTask: Task = {
          id: `TSK-${Math.floor(Math.random() * 10000)}`,
          title: 'New Task',
          description: '',
          status: status,
          assignee: selectedRoleId !== 'all' ? selectedRoleId : undefined, 
          tag: 'General',
          phase: 'PHASE 1',
          priority: '3'
      };
      onTasksChange([...tasks, newTask]);
      setSelectedTask(newTask);
      setIsModalOpen(true);
  };

  const handleSaveTask = (updatedTask: TaskData) => {
      console.log('[KanbanBoard] handleSaveTask called', updatedTask);
      // If task was in DONE and edited, it might go back to TODO?
      // User said "Done... edit... back to todo". 
      // We accept the status update from modal (user changes dropdown).
      onTasksChange(tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
      console.log('[KanbanBoard] Task updated successfully');
  };

  const handleDeleteTask = (taskId: string) => {
      // Double check permission (though button shouldn't receive click if hidden)
      const task = tasks.find(t => t.id === taskId);
      if (task && (task.status === 'doing' || task.status === 'done')) return;

      if (confirm('Are you sure you want to delete this task?')) {
        onTasksChange(tasks.filter(t => t.id !== taskId));
      }
  };

  const handleReworkTask = (originalTask: TaskData, newContent: TaskData) => {
    console.log('[KanbanBoard] Handling Rework', { original: originalTask.id, new: newContent.title });
    
    // 1. Mark original task as REWORKED (Locked)
    // 2. Create NEW task in TODO with updated content
    const newTask: Task = {
        ...newContent,
        id: `TSK-${Math.floor(Math.random() * 10000)}`, // New ID
        status: 'todo',
        isReworked: false // New task is active
    };

    onTasksChange(
        tasks.map(t => {
            if (t.id === originalTask.id) {
                return { ...t, isReworked: true }; // Lock original
            }
            return t;
        }).concat(newTask) // Add new task
    );
  };

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleExportClick = () => {
      const mdContent = generateTaskMarkdown(tasks);
      downloadMarkdown(mdContent, `taskrails-export-${new Date().toISOString().split('T')[0]}.md`);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
          const importedTasks = parseTaskMarkdown(text);
          if (importedTasks.length > 0) {
              const confirmMsg = fullT.common.importConfirm.replace('{count}', importedTasks.length.toString());
              if (confirm(confirmMsg)) {
                  onTasksChange(importedTasks);
              }
          } else {
              alert(fullT.common.noTasksFound);
          }
      } catch (e) {
          console.error(e);
          alert('Failed to parse Markdown file.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".md" 
        className="hidden" 
      />
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
             {/* ... Search ... */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    className="bg-surface-dark border border-border-dark rounded-md pl-9 pr-4 py-1.5 text-sm text-gray-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all w-64 shadow-inner"
                />
             </div>
             {/* Role Filter Dropdown */}
             <select 
                 value={selectedRoleId}
                 onChange={(e) => setSelectedRoleId(e.target.value)}
                 className="bg-surface-dark border border-border-dark rounded-md px-3 py-1.5 text-sm text-gray-300 focus:border-primary focus:outline-none cursor-pointer"
                 style={{ backgroundColor: '#1A1A1F' }}
             >
                 <option value="all" style={{ backgroundColor: '#1A1A1F', color: '#d1d5db' }}>全部任務</option>
                 {availableRoles.map(role => (
                     <option 
                         key={role.id} 
                         value={role.id}
                         style={{ backgroundColor: '#1A1A1F', color: '#d1d5db' }}
                     >
                         {role.agentName} ({role.name})
                     </option>
                 ))}
             </select>
             {/* View Toggles */}
             <div className="flex bg-surface-dark border border-border-dark rounded-md p-1">
                <button 
                    onClick={() => setViewMode('board')}
                    className={clsx("p-1.5 rounded transition-colors", viewMode === 'board' ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-gray-300")}
                >
                    <LayoutGrid size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={clsx("p-1.5 rounded transition-colors", viewMode === 'list' ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-gray-300")}
                >
                    <Layers size={16} />
                </button>
             </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleImportClick}
                className="text-gray-400 hover:text-white px-3 py-2 text-xs font-medium border border-border-dark rounded-md hover:bg-white/5 transition-colors flex items-center gap-2"
                title={fullT.common.importMd}
            >
                <Download size={14} />
                <span className="hidden md:inline">{fullT.common.importMd}</span>
            </button>
            <button 
                onClick={handleExportClick}
                className="text-gray-400 hover:text-white px-3 py-2 text-xs font-medium border border-border-dark rounded-md hover:bg-white/5 transition-colors flex items-center gap-2"
                title={fullT.common.exportMd}
            >
                <Upload size={14} />
                <span className="hidden md:inline">{fullT.common.exportMd}</span>
            </button>

            {tasks.length > 0 && (
                <button 
                    onClick={() => {
                        if (window.confirm(fullT.common.deleteAllConfirm)) {
                            onDeleteAllTasks?.();
                        }
                    }}
                    className="text-red-500/70 hover:text-red-500 px-3 py-2 text-xs font-medium border border-red-500/20 rounded-md hover:bg-red-500/5 transition-colors flex items-center gap-2"
                    title={fullT.common.deleteAll}
                >
                    <Trash2 size={14} />
                    <span className="hidden md:inline">{fullT.common.deleteAll}</span>
                </button>
            )}

            <button 
                onClick={() => handleAddNewTask('todo')}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md flex items-center shadow-lg shadow-orange-900/20 transition-all font-medium text-sm"
            >
                <Plus size={16} className="mr-2" />
                {t.newTask}
            </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'board' ? (
          <div className="flex-1 flex gap-6 overflow-x-auto pb-2">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {/* TODO Column */}
              <Column 
                id="todo" 
                title={t.columns.todo} 
                count={getTasksByStatus('todo').length} 
                tasks={getTasksByStatus('todo')} 
                onTaskClick={handleTaskClick} 
                onAddTask={handleAddNewTask} 
                onDeleteTask={handleDeleteTask}
                canAdd={true}
              />
              {/* DOING Column */}
              <Column 
                id="doing" 
                title={t.columns.doing} 
                count={getTasksByStatus('doing').length} 
                tasks={getTasksByStatus('doing')} 
                isActive 
                onTaskClick={handleTaskClick} 
                onAddTask={handleAddNewTask} 
                onDeleteTask={handleDeleteTask}
                canAdd={false}
                isReadOnly={true}
              />
              {/* DONE Column */}
              <Column 
                id="done" 
                title={t.columns.done} 
                count={getTasksByStatus('done').length} 
                tasks={getTasksByStatus('done')} 
                onTaskClick={handleTaskClick} 
                onAddTask={handleAddNewTask} 
                onDeleteTask={handleDeleteTask}
                canAdd={false}
                isReadOnly={false} 
                noDelete={true} 
              />
              
              <DragOverlay>
                  {activeId ? <TaskCard task={tasks.find(t => t.id === activeId)!} /> : null}
              </DragOverlay>
            </DndContext>
          </div>
      ) : (
          <TaskList 
              tasks={visibleTasks}
              onUpdateTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddNewTask}
          />
      )}

      <TaskDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSave={(updated) => { handleSaveTask(updated); setIsModalOpen(false); }} // Ensure explicit close logic
        onDelete={(id) => { handleDeleteTask(id); setIsModalOpen(false); }}
        onRework={handleReworkTask}
        availableRoles={availableRoles}
      />
    </div>
  );
}

interface ColumnProps {
    id: TaskStatus;
    title: string;
    count: number;
    tasks: Task[];
    isActive?: boolean;
    onTaskClick: (task: Task) => void;
    onAddTask: (status: TaskStatus) => void;
    onDeleteTask: (id: string) => void;
    canAdd?: boolean;
    isReadOnly?: boolean;
    noDelete?: boolean;
}

function Column({ id, title, count, tasks, isActive, onTaskClick, onAddTask, onDeleteTask, canAdd, isReadOnly, noDelete }: ColumnProps) {
    const { setNodeRef } = useSortable({ id, disabled: isReadOnly }); // Disable drag if read-only (optional)

    return (
        <div ref={setNodeRef} className={clsx(
            "flex-1 min-w-[320px] flex flex-col rounded-lg bg-surface-dark border transition-colors duration-300",
            isActive ? "border-primary/30 shadow-[0_0_15px_rgba(232,130,37,0.05)]" : "border-border-dark",
            isReadOnly && "opacity-90"
        )}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between rounded-t-lg ${isActive ? "bg-primary/5 border-primary/20" : "bg-black/20 border-border-dark"}`}>
                <div className="flex items-center gap-3">
                    <div className={clsx("w-2 h-2 rounded-full", id === 'doing' ? "bg-primary animate-pulse" : "bg-gray-500")}></div>
                    <span className={clsx("font-bold tracking-wide uppercase text-sm", isActive ? "text-primary" : "text-gray-400")}>
                        {title}
                    </span>
                </div>
                <span className="bg-black/40 px-2 py-0.5 rounded text-xs font-mono text-gray-500 border border-white/5">{count}</span>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onClick={!isReadOnly ? () => onTaskClick(task) : undefined}
                            onDelete={(!isReadOnly && !noDelete) ? () => onDeleteTask(task.id) : undefined}
                            disabled={isReadOnly}
                        />
                    ))}
                </SortableContext>
                
                {canAdd && (
                    <button 
                        onClick={() => onAddTask(id)}
                        className="w-full py-3 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-primary/5 rounded border border-dashed border-gray-800 hover:border-primary/30 transition-all group"
                    >
                        <Plus size={16} className="group-hover:scale-110 transition-transform duration-200" />
                    </button>
                )}
            </div>
        </div>
    );
}

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
    onDelete?: (e: React.MouseEvent) => void;
    disabled?: boolean;
}

function TaskCard({ task, onClick, onDelete, disabled }: TaskCardProps) {
    console.log('[TaskCard] Rendering', { taskId: task.id, disabled, hasOnClick: !!onClick });
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleCardClick = () => {
        console.log('[TaskCard] Card clicked!', { taskId: task.id, disabled });
        if (disabled) {
            console.log('[TaskCard] Click blocked - card is disabled');
            return;
        }
        if (onClick) {
            console.log('[TaskCard] Calling onClick handler');
            onClick();
        } else {
            console.log('[TaskCard] No onClick handler provided');
        }
    };

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-50 bg-[#1A1A1F] border border-primary p-4 rounded h-[100px]"></div>
        );
    }

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={clsx(
                "relative bg-[#1A1A1F] border p-4 rounded shadow-sm transition-all group",
                task.isReworked 
                    ? "border-orange-500/50 bg-orange-900/10 cursor-pointer" 
                    : "border-[#2A2A30]",
                !disabled && !task.isReworked ? "hover:border-primary/40 cursor-pointer hover:shadow-md hover:shadow-black/20" : "",
                disabled && !task.isReworked ? "cursor-default opacity-80" : ""
            )}
        >
            {/* Drag Handle - Invisible overlay for dragging */}
            <div 
                {...attributes} 
                {...listeners}
                className="absolute inset-0 z-0"
                style={{ cursor: disabled ? 'default' : 'grab' }}
            />
            
            {/* Content Area - Clickable, sits above drag handle */}
            <div 
                onClick={handleCardClick}
                className="relative z-10"
                style={{ cursor: disabled ? 'default' : 'pointer' }}
            >
                {/* Action Buttons (Visible on Hover) - Only if onDelete is provided */}
                {onDelete && (
                    <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button 
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                            className="p-1 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}

            <div className="flex justify-between items-start mb-2 pr-6">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono text-gray-500 group-hover:text-primary transition-colors">{task.id}</span>
                    <span className="text-[9px] font-bold text-primary/70">{task.phase}</span>
                    {task.isReworked && (
                        <span className="text-[9px] font-bold text-orange-500 border border-orange-500/30 px-1 rounded bg-orange-500/10 w-fit mt-0.5">REWORKED</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {task.priority === '1' && <span className="text-[9px] px-1 rounded bg-red-500/20 text-red-400 border border-red-500/20">P1</span>}
                    {task.priority === '2' && <span className="text-[9px] px-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/20">P2</span>}
                    {task.priority !== '1' && task.priority !== '2' && <span className="text-[9px] text-gray-600 font-mono">P{task.priority}</span>}
                    
                    {task.tag && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                            {task.tag}
                        </span>
                    )}
                    {task.assignee && (
                        <div className={clsx(
                            "w-4 h-4 rounded-full flex items-center justify-center ml-1",
                            (task.assignee.startsWith('ai_')) ? "bg-purple-500/20 text-purple-400" : 
                            (task.assignee.startsWith('user_')) ? "bg-blue-500/20 text-blue-400" : "bg-gray-700"
                        )}>
                             {task.assignee.startsWith('ai_') ? <Bot size={10} /> : <User size={10} />}
                        </div>
                    )}
                </div>
            </div>
            
            <h3 className="text-gray-200 font-medium text-sm leading-snug line-clamp-1">{task.title}</h3>
            
            
            {task.description && (
                <div className="mt-2.5 text-[11px] text-gray-400 font-normal leading-[1.5] line-clamp-3 overflow-hidden border-l-2 border-primary/20 pl-2.5 py-0.5 italic opacity-80 decoration-gray-600">
                    {task.description.replace(/[#*`\-[\]x]/g, '').replace(/\n/g, ' ').trim()}
                </div>
            )}
            
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
               <div className="flex -space-x-1.5 overflow-hidden">
                   <div className="w-5 h-5 rounded-full bg-gray-700 border border-[#1A1A1F] flex items-center justify-center text-[8px] text-gray-400">?</div>
               </div>
               <div className="flex items-center gap-1.5">
                   <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-[8px] text-primary font-bold">AI</div>
                   <span className="text-[9px] text-gray-600 font-mono">MDL_V2</span>
               </div>
            </div>
            </div> {/* Close Content Area div */}
        </div>
    );
}
