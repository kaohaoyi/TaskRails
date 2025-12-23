import { useState, useMemo, useEffect, useCallback } from "react";
import Titlebar from "./components/layout/Titlebar";
import Sidebar from "./components/layout/Sidebar";
import LogPanel from "./components/layout/LogPanel";
import KanbanBoard, { Task, initialTasks } from "./components/features/KanbanBoard";
import AirlockModal from "./components/features/AirlockModal";
import SettingsPage from "./components/features/SettingsPage";
import EngineeringPage from "./components/features/EngineeringPage";
import RoleSettingsPage, { AgentRole } from "./components/features/RoleSettingsPage";
import MissionsPage from "./components/features/MissionsPage";
import SpecPage from "./components/features/SpecPage";
import InstructionPage from "./components/features/InstructionPage";
import AiChatWindow from "./components/features/AiChatWindow"; // New Import
import { useTranslation } from "./hooks/useTranslation";
import Toast, { ToastType } from "./components/common/Toast";
import * as dbApi from "./api/db";
import { invoke } from "@tauri-apps/api/core";
import { generateProjectContext } from "./utils/mdExport";
import { parseProjectContext } from "./utils/mdImport";

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

function App() {
  // Check for standalone window route
  if (window.location.pathname === '/chat') {
      return <AiChatWindow />;
  }

  const t = useTranslation();
  const [isAirlockOpen, setAirlockOpen] = useState(false);
  const [currentView, setCurrentView] = useState('kanban');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  // State from database
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roles, setRoles] = useState<AgentRole[]>([]);
  const [lastSyncHash, setLastSyncHash] = useState<string>('');

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      console.log('[App] Starting data load...');
      try {
        const [dbTasks, dbRoles] = await Promise.all([
          dbApi.fetchTasks(),
          dbApi.fetchRoles()
        ]);
        
        // Attempt to read from workspace .taskrails for any updates
        const workspaceContent = await invoke<string | null>('read_workspace_file');
        
        if (workspaceContent) {
           const { tasks: wsTasks, roles: wsRoles } = parseProjectContext(workspaceContent);
           
           // If DB is empty but WS has data
           if (dbTasks.length === 0 && wsTasks.length > 0) {
             console.log('[App] DB is empty, importing from workspace .taskrails');
             setTasks(wsTasks);
             setRoles(wsRoles);
             // Persist imported data to DB
             for (const t of wsTasks) await dbApi.createTask(t);
             for (const r of wsRoles) await dbApi.createRole(r);
             return;
           }
        }

        setTasks(dbTasks);
        setRoles(dbRoles);
      } catch (err) {
        console.error('[App] Failed to load data:', err);
        setTasks(initialTasks);
        setRoles([]);
      }
    };
    loadData();
  }, []);

  // Sync tasks & roles to workspace file whenever they change
  useEffect(() => {
    if (tasks.length > 0 || roles.length > 0) {
      const content = generateProjectContext(tasks, roles);
      const currentHash = btoa(unescape(encodeURIComponent(content))); // Simple hash
      
      if (currentHash !== lastSyncHash) {
        setLastSyncHash(currentHash);
        invoke('write_workspace_file', { content })
          .catch(err => console.error('[App] Failed to sync to workspace:', err));
      }
    }
  }, [tasks, roles, lastSyncHash]);

  // Separate default and custom roles
  const customRoles = useMemo(() => roles.filter(r => r.isDefault === false), [roles]);
  const allRoles = roles; // All roles from DB

  // Role handlers with DB persistence
  const handleAddRole = useCallback(async (newRole: AgentRole) => {
    try {
      await dbApi.createRole(newRole);
      setRoles(prev => [...prev, newRole]);
    } catch (err) {
      console.error('[App] Failed to add role:', err);
    }
  }, []);

  const handleDeleteRole = useCallback(async (roleId: string) => {
    try {
      await dbApi.deleteRole(roleId);
      setRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (err) {
      console.error('[App] Failed to delete role:', err);
    }
  }, []);

  // Task handlers with DB persistence
  const handleTasksChange = useCallback(async (newTasks: Task[]) => {
    const oldTasks = tasks;
    setTasks(newTasks); // Optimistic update
    
    try {
      // Detect what changed
      const addedTasks = newTasks.filter(nt => !oldTasks.find(ot => ot.id === nt.id));
      const deletedTasks = oldTasks.filter(ot => !newTasks.find(nt => nt.id === ot.id));
      const updatedTasks = newTasks.filter(nt => {
        const old = oldTasks.find(ot => ot.id === nt.id);
        return old && JSON.stringify(old) !== JSON.stringify(nt);
      });

      // Persist changes
      for (const task of addedTasks) {
        await dbApi.createTask(task);
      }
      for (const task of deletedTasks) {
        await dbApi.deleteTask(task.id);
      }
      for (const task of updatedTasks) {
        await dbApi.updateTask(task);
      }
    } catch (err) {
      console.error('[App] Failed to persist task changes:', err);
      // Rollback on error
      setTasks(oldTasks);
    }
  }, [tasks]);

  const handleUpdateTask = useCallback(async (updatedTask: Task) => {
    try {
      await dbApi.updateTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    } catch (err) {
      console.error('[App] Failed to update task:', err);
    }
  }, []);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await dbApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('[App] Failed to delete task:', err);
    }
  }, []);

  const handleDeleteAllTasks = useCallback(async () => {
    try {
      await dbApi.deleteAllTasks();
      setTasks([]);
      showToast('所有任務已刪除', 'success');
    } catch (err) {
      console.error('[App] Failed to delete all tasks:', err);
      showToast('刪除失敗', 'error');
    }
  }, [showToast]);

  // Rework: Mark original as reworked (locked), create new task in TODO
  const handleReworkTask = useCallback(async (originalTask: Task, newContent: Task) => {
    try {
      // 1. Mark original task as reworked
      const reworkedOriginal = { ...originalTask, isReworked: true };
      await dbApi.updateTask(reworkedOriginal);

      // 2. Create new task based on newContent
      const newTask: Task = {
        ...newContent,
        id: `TSK-${Math.floor(Math.random() * 10000)}`,
        status: 'todo',
        isReworked: false,
      };
      await dbApi.createTask(newTask);

      // 3. Update state
      setTasks(prev => [
        ...prev.map(t => t.id === originalTask.id ? reworkedOriginal : t),
        newTask
      ]);
      
      console.log('[App] Rework completed:', originalTask.id, '->', newTask.id);
    } catch (err) {
      console.error('[App] Failed to rework task:', err);
    }
  }, []);

  const handleInjectTasksFromSpec = useCallback(async (featuresMarkdown: string) => {
    try {
      const lines = featuresMarkdown.split('\n');
      const injectedTasks: Task[] = [];
      let currentPhase = 'PHASE 1';

      for (const line of lines) {
        // Match Phase headers: ## Phase 1
        const phaseMatch = line.match(/^##\s*(Phase\s*\d+)/i);
        if (phaseMatch) {
            currentPhase = phaseMatch[1].toUpperCase();
            continue;
        }

        // Match task items: "1. Task Name" or "- Task Name"
        const taskMatch = line.match(/^(\d+\.|-)\s*(.+)/);
        if (taskMatch) {
            const title = taskMatch[2].trim();
            if (title) {
                const newTask: Task = {
                    id: `TSK-${Math.floor(Math.random() * 10000)}`,
                    title,
                    status: 'todo',
                    phase: currentPhase,
                    priority: '3',
                    tag: 'Spec',
                    isReworked: false,
                    description: `來自專案說明書的任務。\n階段：${currentPhase}`
                };
                await dbApi.createTask(newTask);
                injectedTasks.push(newTask);
            }
        }
      }

      if (injectedTasks.length > 0) {
        setTasks(prev => [...prev, ...injectedTasks]);
        showToast(`成功導入 ${injectedTasks.length} 個任務至看板`, 'success');
      } else {
        showToast('未發現有效任務項目', 'info');
      }
    } catch (err) {
      console.error('[App] Failed to inject tasks:', err);
      showToast('導入失敗', 'error');
    }
  }, [showToast]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-dark text-gray-300 font-display">
      <Titlebar />
      
      <div className="flex flex-1 pt-8"> {/* pt-8 to account for absolute/fixed Titlebar */}
        <Sidebar 
            currentView={currentView}
            onNavigate={setCurrentView}
        />
        
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0D0D0F]">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                     backgroundSize: '40px 40px' 
                 }}>
            </div>

            <div className="flex-1 overflow-y-auto p-8 z-10 flex flex-col">
                {/* Global Header - Only show for Kanban view */}
                {currentView === 'kanban' && (
                    <div className="mb-6">
                        <h1 data-tauri-drag-region className="text-3xl font-bold uppercase tracking-tight text-white flex items-center gap-3 cursor-default select-none">
                            <span className="w-2 h-8 bg-primary block pointer-events-none"></span>
                            {t.kanban.title}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm pl-5">
                            {t.kanban.subtitle}
                        </p>
                    </div>
                )}
                
                <div className="flex-1 min-h-0">
                    {currentView === 'manual' && (
                        <InstructionPage />
                    )}
                    {currentView === 'specs' && (
                        <SpecPage 
                            onInjectTasks={handleInjectTasksFromSpec}
                            onShowToast={showToast}
                        />
                    )}
                    {currentView === 'kanban' && (
                        <KanbanBoard 
                            availableRoles={allRoles} 
                            tasks={tasks} 
                            onTasksChange={handleTasksChange} 
                            onDeleteAllTasks={handleDeleteAllTasks}
                        />
                    )}
                    {currentView === 'missions' && (
                        <MissionsPage 
                            tasks={tasks} 
                            onUpdateTask={handleUpdateTask} 
                            onDeleteTask={handleDeleteTask} 
                            onDeleteAllTasks={handleDeleteAllTasks}
                            onRework={handleReworkTask}
                            availableRoles={allRoles}
                        />
                    )}
                    {currentView === 'settings' && <SettingsPage />}
                    {currentView === 'roleSettings' && (
                        <RoleSettingsPage 
                            roles={customRoles} 
                            onAddRole={handleAddRole} 
                            onDeleteRole={handleDeleteRole} 
                        />
                    )}
                    {currentView === 'issues' && <EngineeringPage type="issues" tasks={tasks} onShowToast={showToast} />}
                    {currentView === 'commits' && <EngineeringPage type="commits" tasks={tasks} onShowToast={showToast} />}
                    {currentView === 'history' && <EngineeringPage type="history" tasks={tasks} onShowToast={showToast} />}
                </div>
            </div>

            {/* Bottom Panel */}
            <LogPanel />
        </main>
      </div>

      <div className="scanlines"></div>

      {/* Toast Overlay */}
      <div className="fixed bottom-24 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
          {toasts.map(toast => (
              <Toast 
                key={toast.id}
                id={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={removeToast}
              />
          ))}
      </div>
      
      {/* Global Overlay */}
      <AirlockModal 
        isOpen={isAirlockOpen} 
        onClose={() => setAirlockOpen(false)}
        onApprove={() => {
            console.log("Approved");
            setAirlockOpen(false);
        }}
        onReject={() => {
            console.log("Rejected");
            setAirlockOpen(false);
        }}
      />
    </div>
  );
}

export default App;
