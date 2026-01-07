import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Square, Minus, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import icon from "../../assets/ICON.png";
import clsx from "clsx";

interface TitlebarProps {
    onNavigate?: (view: string) => void;
}

export default function Titlebar({ onNavigate }: TitlebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");

  useEffect(() => {
    const fetchProjectName = async () => {
        try {
            const path = await invoke<string | null>('get_setting', { key: 'workspace_path' });
            if (path) {
                const name = path.split(/[\\/]/).pop() || path;
                setProjectName(name);
            }
        } catch (e) {
            console.error(e);
        }
    };
    fetchProjectName();
    
    // Listen for project switch events
    const unlisten = import("@tauri-apps/api/event").then(m => 
        m.listen('project-switched', (event: any) => {
            const path = event.payload as string;
            const name = path.split(/[\\/]/).pop() || path;
            setProjectName(name);
        })
    );
    return () => { unlisten.then(f => f()); };
  }, []);

  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await getCurrentWindow().minimize();
  };

  const handleToggleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await getCurrentWindow().toggleMaximize();
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await getCurrentWindow().close();
  };

  const handleNewProject = async () => {
      try {
          // Use atomic command to pick folder, switch DB, reset data, and notify
          const selected = await invoke<string | null>('initialize_new_project');
          
          if (selected) {
              // Clear project-specific cache
              localStorage.removeItem('taskrails_planner_diagrams');
              localStorage.removeItem('taskrails_ai_sessions');
              localStorage.removeItem('taskrails_project_config');
              localStorage.removeItem('taskrails_pinned_memories');
              
              // Refresh UI State and Navigate
              onNavigate?.('project-setup');
              setActiveMenu(null);
          }
      } catch (err) {
          console.error(err);
      }
  };

  const handleOpenFolder = async () => {
    try {
        const path = await invoke<string | null>('pick_folder');
        if (path) {
            await invoke('switch_project', { workspacePath: path });
            setActiveMenu(null);
        }
    } catch (err) {
        console.error('Failed to switch project:', err);
    }
  };

  const menuItems: Record<string, any[]> = {
    File: [
      { label: "New Project", shortcut: "Ctrl+N", action: handleNewProject },
      { label: "Open Folder...", shortcut: "Ctrl+O", action: handleOpenFolder },
      { type: "separator" },
      { label: "Save All", shortcut: "Ctrl+Shift+S", action: () => console.log("Save") },
      { type: "separator" },
      { label: "Exit", action: () => window.close() },
    ],
    Edit: [
      { label: "Undo", shortcut: "Ctrl+Z" },
      { label: "Redo", shortcut: "Ctrl+Y" },
      { type: "separator" },
      { label: "Cut", shortcut: "Ctrl+X" },
      { label: "Copy", shortcut: "Ctrl+C" },
      { label: "Paste", shortcut: "Ctrl+V" },
    ],
    View: [
      { label: "Project Explorer", shortcut: "Ctrl+Shift+E", action: () => onNavigate?.('kanban') },
      { label: "Workflow Visualizer", shortcut: "Ctrl+Shift+V", action: () => onNavigate?.('planner') },
      { label: "Knowledge Base", action: () => onNavigate?.('knowledge') },
      { label: "Log Panel", action: () => console.log("Toggle Logs") },
      { type: "separator" },
      { label: "Appearance" },
    ],
    Agent: [
      { label: "Manage Team...", action: () => onNavigate?.('roleSettings') },
      { label: "Agent Lab", action: () => onNavigate?.('agent-lab') },
      { type: "separator" },
      { label: "Deploy to IDE" },
    ],
    Help: [
      { label: "Documentation" },
      { label: "Check for Updates" },
      { label: "About TaskRails" },
    ],
  };

  return (
    <div className="h-8 bg-[#1E1E1E] border-b border-white/5 flex items-center justify-between select-none fixed top-0 left-0 right-0 z-[100] text-gray-400">
      {/* Left: Logo & Menus */}
      <div className="flex items-center h-full px-2 gap-4">
        <div data-tauri-drag-region className="flex items-center gap-2 cursor-default h-full shrink-0">
            <img src={icon} alt="TaskRails" className="w-4 h-4 pointer-events-none" />
        </div>
        
        <div className="flex items-center h-full">
            {Object.keys(menuItems).map((menu) => (
                <div 
                    key={menu} 
                    className="relative h-full"
                    onMouseEnter={() => activeMenu && setActiveMenu(menu)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === menu ? null : menu); }}
                        className={clsx(
                            "h-full px-3 text-[11px] hover:bg-white/5 transition-colors",
                            activeMenu === menu ? "bg-white/10 text-white" : "text-gray-400"
                        )}
                    >
                        {menu}
                    </button>
                    
                    {activeMenu === menu && (
                        <div className="absolute top-full left-0 w-56 bg-[#252526] border border-white/10 shadow-2xl py-1 z-[110] rounded-b-md">
                            {menuItems[menu].map((item, idx) => (
                                item.type === 'separator' ? (
                                    <div key={idx} className="h-px bg-white/5 my-1 mx-2" />
                                ) : (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); item.action?.(); setActiveMenu(null); }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-primary/20 flex items-center justify-between group"
                                    >
                                        <span className="text-[11px] text-gray-300 group-hover:text-white flex items-center gap-2">
                                            {item.label}
                                            {item.children && <ChevronRight size={10} />}
                                        </span>
                                        {item.shortcut && <span className="text-[10px] text-gray-500 font-mono">{item.shortcut}</span>}
                                    </button>
                                )
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Middle: Project Title - Draggable */}
      <div 
        data-tauri-drag-region 
        className="flex-1 h-full flex items-center justify-center cursor-default"
        onDoubleClick={handleToggleMaximize}
      >
        <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
            TASKRAILS <span className="text-gray-700">|</span> <span className="text-primary font-bold">{projectName || "NO_PROJECT"}</span>
        </span>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center h-full shrink-0">
        <button onClick={handleMinimize} className="h-full w-10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Minus size={14} /></button>
        <button onClick={handleToggleMaximize} className="h-full w-10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Square size={12} /></button>
        <button onClick={handleClose} className="h-full w-11 flex items-center justify-center hover:bg-[#E81123] hover:text-white transition-colors"><X size={14} /></button>
      </div>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div className="fixed inset-0 z-[105]" onClick={() => setActiveMenu(null)} />
      )}
    </div>
  );
}
