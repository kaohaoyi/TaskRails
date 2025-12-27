import { useState, useEffect } from "react";
import { LayoutDashboard, ClipboardList, Settings, FileText, Activity, BrainCircuit, Bot, Brain, Terminal, Rocket, FolderOpen, ChevronDown } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { invoke } from "@tauri-apps/api/core";
import clsx from "clsx";

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const t = useTranslation().sidebar;
  const [projectName, setProjectName] = useState<string>("Select Project");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Initial fetch of workspace
    if (typeof invoke !== 'undefined') {
        invoke<string | null>('get_setting', { key: 'workspace_path' })
            .then(path => {
                if (path) {
                    // Extract last folder name
                    const name = path.split(/[\\/]/).pop() || path;
                    setProjectName(name);
                }
            })
            .catch(console.error);
    }
  }, []);

  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  
  useEffect(() => {
    // Click outside to close menu
    const handleClickOutside = () => setIsProjectMenuOpen(false);
    if (isProjectMenuOpen) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isProjectMenuOpen]);

  const handleOpenFolder = async () => {
    try {
        const path = await invoke<string | null>('pick_folder');
        if (path) {
            // Use switch_project to properly switch database
            await invoke('switch_project', { workspacePath: path });
            const name = path.split(/[\\/]/).pop() || path;
            setProjectName(name);
            window.location.reload(); // Reload to fetch new project data
        }
    } catch (err) {
        console.error('Failed to switch project:', err);
        alert(`無法切換專案: ${err}`);
    }
  };

  return (
    <aside className="w-64 bg-[#0A0A0C] border-r border-white/5 flex flex-col shrink-0 z-10 pt-8 shadow-[10px_0_30px_rgba(0,0,0,0.2)]">
        <div className="px-6 mb-10 relative">
            <div 
                className="group cursor-pointer" 
                onClick={() => onNavigate('kanban')}
            >
                <div className="h-12 flex items-center justify-start overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                    <img src="/LOGO.png" alt="TaskRails" className="h-full w-auto object-contain" />
                </div>
            </div>
            
            {/* Visual Workspace Indicator */}
            <div className="mt-2 flex items-center gap-2 mb-4">
                <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", projectName !== "Select Project" ? "bg-green-500" : "bg-gray-500")}></div>
                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">
                    {projectName !== "Select Project" ? "PROJECT ACTIVE" : "NO PROJECT"}
                </span>
            </div>

            {/* Project Switcher Command */}
            <button 
                onClick={(e) => { e.stopPropagation(); setIsProjectMenuOpen(!isProjectMenuOpen); }}
                className={clsx(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#16161A] border border-white/5 hover:border-primary/50 hover:bg-white/5 transition-all group",
                    isProjectMenuOpen ? "border-primary/50" : ""
                )}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen size={14} className={clsx("shrink-0", projectName !== "Select Project" ? "text-primary" : "text-gray-500")} />
                    <span className={clsx(
                        "text-[11px] font-bold font-mono tracking-tight truncate",
                        projectName !== "Select Project" ? "text-gray-200" : "text-gray-500"
                    )}>
                        {projectName}
                    </span>
                </div>
                <ChevronDown size={12} className={clsx("text-gray-600 transition-transform duration-300", isProjectMenuOpen ? "rotate-180 text-primary" : "")} />
            </button>

            {/* Dropdown Menu */}
            {isProjectMenuOpen && (
                <div className="absolute top-full left-6 right-6 mt-1 bg-[#1E1E24] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button 
                        onClick={() => { onNavigate('project-setup'); setIsProjectMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-gray-300 hover:text-white hover:bg-primary/20 flex items-center gap-2 transition-colors border-b border-white/5"
                    >
                        <Rocket size={12} className="text-primary" />
                        Init New Project
                    </button>
                    <button 
                        onClick={() => { handleOpenFolder(); setIsProjectMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                        <FolderOpen size={12} className="text-blue-400" />
                        Open Existing...
                    </button>
                </div>
            )}
        </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar">
        
        {/* Execution - Primary Workflow */}
        <div>
           <div className="px-3 mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">Execution</span>
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
           </div>
           
            <div className="space-y-1">
                <NavItem active={currentView === 'kanban'} icon={ClipboardList} label="任務看板" onClick={() => onNavigate('kanban')} />
                <NavItem active={currentView === 'project-setup'} icon={Rocket} label="專案設定中心" onClick={() => onNavigate('project-setup')} badge="NEW" />
            </div>
        </div>

        {/* Planning - Design & Setup */}
        <div>
           <div className="px-3 mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">Planning</span>
           </div>
           
            <div className="space-y-1">
                <NavItem active={currentView === 'specs'} icon={FileText} label="專案說明書" onClick={() => onNavigate('specs')} />
                <NavItem active={currentView === 'planner'} icon={LayoutDashboard} label="專案規劃師" onClick={() => onNavigate('planner')} />
                <NavItem 
                    icon={Bot} 
                    label="AI 代理配置" 
                    active={currentView === 'agent-lab'} 
                    onClick={() => onNavigate('agent-lab')}
                />
            </div>
        </div>

        {/* Knowledge - Memory & Experience */}
        <div>
           <div className="px-3 mb-3">
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">Knowledge</span>
           </div>
           
            <div className="space-y-1">
                <NavItem 
                    icon={Brain} 
                    label="記憶庫" 
                    active={currentView === 'memory-bank'} 
                    onClick={() => onNavigate('memory-bank')}
                />
                <NavItem 
                    icon={BrainCircuit} 
                    label="知識庫" 
                    active={currentView === 'knowledge'} 
                    onClick={() => onNavigate('knowledge')} 
                />
            </div>
        </div>
        
        {/* Maintenance - Engineering & Ops */}
        <div>
           <div className="px-3 mb-3">
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">Maintenance</span>
           </div>
           
           <div className="space-y-1">
               <NavItem active={currentView === 'engineering'} icon={Terminal} label="工程中心" onClick={() => onNavigate('engineering')} />
               <NavItem 
                   active={currentView === 'ai-ide-control'} 
                   icon={Bot} 
                   label="AI IDE 控制台" 
                   onClick={() => onNavigate('ai-ide-control')} 
                   badge="NEW"
               />
               <NavItem active={currentView === 'ops'} icon={Activity} label="運維中心" onClick={() => onNavigate('ops')} />
           </div>
        </div>
      </nav>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-white/5 bg-[#0F0F12]">
        <div 
            className={clsx(
               "flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group cursor-pointer",
               currentView === 'settings' ? "bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(242,153,74,0.05)]" : "hover:bg-white/5 border border-transparent"
            )}
            onClick={() => onNavigate('settings')}
        >
            <div className="w-8 h-8 rounded-lg bg-gray-800 border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <Settings size={16} className={clsx("transition-transform duration-500 group-hover:rotate-90", currentView === 'settings' ? "text-primary" : "text-gray-500")} />
            </div>
            <div className="flex-1 min-w-0">
                <div className={clsx("text-[11px] font-black uppercase tracking-wider transition-colors", currentView === 'settings' ? "text-primary" : "text-gray-300 group-hover:text-white")}>
                    {t.admin}
                </div>
                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Status: Nominal</div>
            </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, badge, onClick }: { icon: any, label: string, active?: boolean, badge?: string, onClick?: () => void }) {
    return (
        <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onClick?.(); }} 
            className={clsx(
                "flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                active 
                    ? "bg-primary text-white shadow-[0_8px_20px_rgba(242,153,74,0.25)]" 
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
            )}
        >
            {/* Active Glow Indicator */}
            {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent"></div>
            )}
            
            <Icon size={18} className={clsx("relative z-10 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110 group-hover:text-primary")} />
            <span className="relative z-10 font-bold text-sm tracking-tight">{label}</span>
            
            {badge && (
                <span className="relative z-10 ml-auto text-[10px] font-black bg-black/40 px-2 py-0.5 rounded-full text-gray-200 border border-white/10 group-hover:border-primary/30">
                    {badge}
                </span>
            )}

            {/* Hover Indicator Overlay */}
            {!active && (
                <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-primary/40 transition-all duration-300"></div>
            )}
        </a>
    )
}
