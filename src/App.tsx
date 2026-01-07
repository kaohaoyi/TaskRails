import { useState, useMemo, useEffect, useCallback } from "react";
import Titlebar from "./components/layout/Titlebar";
import Sidebar from "./components/layout/Sidebar";
import LogPanel from "./components/layout/LogPanel";
import KanbanBoard, { Task, initialTasks } from "./components/features/KanbanBoard";
import AirlockModal from "./components/features/AirlockModal";
import SettingsPage from "./components/features/SettingsPage";
import EngineeringPage from "./components/features/EngineeringPage";
import RoleSettingsPage, { AgentRole } from "./components/features/RoleSettingsPage";
import SpecPage from "./components/features/SpecPage";
import InstructionPage from "./components/features/InstructionPage";
import AiChatWindow from "./components/features/AiChatWindow"; // New Import
import OpsDashboard from "./components/features/OpsDashboard"; // New Import
import AgentLab from "./components/features/AgentLab"; // v2.6
import Planner from "./components/features/Planner"; // v2.6
import ExperienceLibrary from './components/features/ExperienceLibrary'; // v2.6
import MemoryBankViewer from './components/features/MemoryBankViewer'; // v1.1
import ProjectSetupHub from './components/features/ProjectSetupHub'; // v2.7
import ProjectSetupPopup from './components/features/ProjectSetupPopup'; // v2.7 Popup
import AiIdeControlCenter from './components/features/AiIdeControlCenter'; // v1.1 IDE Control
import ProjectAnalyzer from './components/features/ProjectAnalyzer'; // v1.1 Project Analysis
import FileExplorer from './components/features/FileExplorer'; // v1.1 Files
import TaskQueuePanel from './components/features/TaskQueuePanel'; // v3.0 Task Queue
import { useTranslation } from "./hooks/useTranslation";
import Toast, { ToastType } from "./components/common/Toast";
import * as dbApi from "./api/db";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import clsx from "clsx";
import { generateProjectContext } from "./utils/mdExport";
import { parseProjectContext } from "./utils/mdImport";
import { getTaskInjectionSystemPrompt, getCurrentOutputLanguage } from "./utils/ai-prompts";

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

function App() {
  // Check for standalone window routes
  if (window.location.pathname === '/chat') {
      return <AiChatWindow />;
  }
  if (window.location.pathname === '/project-setup-popup') {
      return <ProjectSetupPopup />;
  }

  const t = useTranslation();
  const [isAirlockOpen, setAirlockOpen] = useState(false);
  const [currentView, setCurrentView] = useState('kanban');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [projectKey, setProjectKey] = useState<number>(0);

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
  const loadData = useCallback(async () => {
    console.log('[App] Starting data load...');
    // 1. Explicitly Reset State to prevent data leakage from previous project
    setTasks([]);
    setRoles([]);
    
    try {
      // 2. Load basic project data from Database
      const [dbTasks, dbRoles] = await Promise.all([
        dbApi.fetchTasks(),
        dbApi.fetchRoles()
      ]);
      
      // 3. Check for Workspace Sync File (.taskrails context)
      const workspaceContent = await invoke<string | null>('read_workspace_file');
      
      if (workspaceContent) {
        const { tasks: wsTasks, roles: wsRoles } = parseProjectContext(workspaceContent);
        // Priority: Use workspace file if it contains newer or valid state
        if (wsTasks.length > 0) setTasks(wsTasks);
        else setTasks(dbTasks);

        if (wsRoles.length > 0) setRoles(wsRoles);
        else setRoles(dbRoles);
      } else {
        // No workspace file -> This is a fresh project folder within the current DB context
        // If we strictly want to reset:
        setTasks([]);
        setRoles([]);
      }
    } catch (err) {
      console.error('[App] Failed to load data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();

    const unlisten = listen('project-switched', () => {
      console.log('[App] Project switched event received. Refreshing global data...');
      setProjectKey(prev => prev + 1); // Force state reset of all components
      loadData();
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [loadData]);

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

  // 以下函數保留供未來使用
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateTask = useCallback(async (updatedTask: Task) => {
    try {
      await dbApi.updateTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    } catch (err) {
      console.error('[App] Failed to update task:', err);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      showToast(t.app.toast.allTasksDeleted, 'success');
    } catch (err) {
      console.error('[App] Failed to delete all tasks:', err);
      showToast(t.app.toast.deleteFailed, 'error');
    }
  }, [showToast]);

  // Rework: Mark original as reworked (locked), create new task in TODO
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleInjectTasksFromSpec = useCallback(async (specData: any) => {
    showToast(t.app.toast.aiAnalyzing, 'info');
    try {
      const prompt = `請根據以下專案說明書，執行「專員召喚」與「任務深度拆解」：
      
      專案名稱: ${specData.name}
      技術棧: ${specData.techStack}
      功能需求: ${specData.features}
      規則: ${specData.rules}

      任務要求：
      1. **召喚 AI 專員**：根據專案需求，定義 3-4 個專業角色（例如：Lead Architect, Frontend Engineer, Backend Dev）。
      2. **任務深度拆解**：將功能清單轉化為可執行的任務。每個任務必須包含：
         - 詳細的「實作內容 (Implementation Details)」：具體要寫什麼代碼、調用什麼 API。
         - 原子化步驟 (Detailed Steps)。
         - 指派給適合的專員 (Assignee)。
      
      請返回 JSON 格式：
      {
        "roles": [{ "name": "專員名稱", "role": "職位", "description": "職責描述" }],
        "tasks": [{ "title": "任務標題", "description": "實作內容與步驟", "assignee": "專員職位", "priority": "1-3", "phase": "階段名稱" }]
      }`;

      const aiResponse = await invoke<string>('execute_ai_chat', {
          messages: [
              { role: 'system', content: getTaskInjectionSystemPrompt(getCurrentOutputLanguage()) },
              { role: 'user', content: prompt }
          ]
      });

      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          const { roles: aiRoles, tasks: aiTasks } = JSON.parse(jsonMatch[1] || jsonMatch[0]);

          // 1. Inject Roles
          const newRoles: AgentRole[] = aiRoles.map((r: any) => ({
              id: r.role.toLowerCase().replace(/\s+/g, '_'),
              name: r.name,
              role: r.role,
              description: r.description,
              isDefault: false
          }));

          for (const role of newRoles) {
              await dbApi.createRole(role);
          }
          setRoles(prev => [...prev, ...newRoles]);

          // 2. Inject Tasks
          const newTasks: Task[] = aiTasks.map((t: any) => ({
              id: `TSK-${Math.floor(Math.random() * 10000)}`,
              title: t.title,
              status: 'todo',
              phase: t.phase || 'PHASE 1',
              priority: t.priority || '2',
              tag: 'Spec',
              assignee: t.assignee,
              description: t.description,
              isReworked: false
          }));

          for (const task of newTasks) {
              await dbApi.createTask(task);
          }
          setTasks(prev => [...prev, ...newTasks]);

          showToast(t.app.toast.aiInjectSuccess.replace('{rolesCount}', String(newRoles.length)).replace('{tasksCount}', String(newTasks.length)), 'success');
      }
    } catch (err) {
      console.error('[App] Failed to inject from spec:', err);
      showToast(t.app.toast.aiInjectFailed, 'error');
    }
  }, [showToast]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-dark text-gray-300 font-display">
      <Titlebar onNavigate={setCurrentView} />
      
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
                            {t.app.kanbanTitle}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm pl-5">
                            {t.app.kanbanSubtitle}
                        </p>
                    </div>
                )}
                
                <div key={projectKey} className="flex-1 min-h-0 relative">
                    {/* Persistent Page Containers */}
                    <div className={clsx("h-full", currentView !== 'manual' && "hidden")}>
                        <InstructionPage />
                    </div>
                    <div className={clsx("h-full", currentView !== 'specs' && "hidden")}>
                        <SpecPage 
                            onInjectTasks={handleInjectTasksFromSpec}
                            onNavigate={setCurrentView}
                            onShowToast={showToast}
                        />
                    </div>
                    <div className={clsx("h-full", currentView !== 'kanban' && "hidden")}>
                        <KanbanBoard 
                            availableRoles={allRoles} 
                            tasks={tasks} 
                            onTasksChange={handleTasksChange} 
                            onDeleteAllTasks={handleDeleteAllTasks}
                        />
                    </div>
                    <div className={clsx("h-full", currentView !== 'settings' && "hidden")}>
                        <SettingsPage />
                    </div>
                    <div className={clsx("h-full", currentView !== 'ops' && "hidden")}>
                        <OpsDashboard />
                    </div>
                    <div className={clsx("h-full", currentView !== 'roleSettings' && "hidden")}>
                        <RoleSettingsPage 
                            roles={customRoles} 
                            onAddRole={handleAddRole} 
                            onDeleteRole={handleDeleteRole} 
                        />
                    </div>
                    <div className={clsx("h-full", currentView !== 'agent-lab' && "hidden")}>
                        <AgentLab />
                    </div>
                    <div className={clsx("h-full", currentView !== 'knowledge' && "hidden")}>
                        <ExperienceLibrary />
                    </div>
                    <div className={clsx("h-full", currentView !== 'memory-bank' && "hidden")}>
                        <MemoryBankViewer />
                    </div>
                    <div className={clsx("h-full", currentView !== 'planner' && "hidden")}>
                        <Planner />
                    </div>
                    <div className={clsx("h-full", currentView !== 'project-setup' && "hidden")}>
                        <ProjectSetupHub />
                    </div>
                    <div className={clsx("h-full", currentView !== 'engineering' && "hidden")}>
                        <EngineeringPage tasks={tasks} onShowToast={showToast} />
                    </div>
                    <div className={clsx("h-full", currentView !== 'ai-ide-control' && "hidden")}>
                        <AiIdeControlCenter />
                    </div>
                    <div className={clsx("h-full", currentView !== 'project-analyzer' && "hidden")}>
                        <ProjectAnalyzer />
                    </div>
                    <div className={clsx("h-full", currentView !== 'file-explorer' && "hidden")}>
                        <FileExplorer />
                    </div>
                    <div className={clsx("h-full", currentView !== 'task-queue' && "hidden")}>
                        <TaskQueuePanel />
                    </div>
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
