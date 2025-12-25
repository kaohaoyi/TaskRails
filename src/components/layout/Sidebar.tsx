import { LayoutDashboard, ClipboardList, Settings, History, Bug, GitCommit, FileText, BookOpen, Activity, BrainCircuit, Bot, Brain } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { invoke } from "@tauri-apps/api/core";
import clsx from "clsx";

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const t = useTranslation().sidebar;

  return (
    <aside className="w-64 bg-[#0A0A0C] border-r border-white/5 flex flex-col shrink-0 z-10 pt-8 shadow-[10px_0_30px_rgba(0,0,0,0.2)]">
        <div className="px-6 mb-10 group cursor-pointer" onClick={() => onNavigate('kanban')}>
            <div className="h-12 flex items-center justify-start overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                <img src="/LOGO.png" alt="TaskRails" className="h-full w-auto object-contain" />
            </div>
        </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar">
        
        {/* Orchestration Phase */}
        <div>
           <div className="px-3 mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">Orchestration</span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
           </div>
           
            <div className="space-y-1">
                    <NavItem 
                        icon={BrainCircuit} 
                        label="Knowledge" 
                        active={currentView === 'knowledge'} 
                        onClick={() => onNavigate('knowledge')} 
                    />
                    <NavItem 
                        icon={Bot} 
                        label="Agent Lab" 
                        active={currentView === 'agent-lab'} 
                        onClick={() => onNavigate('agent-lab')}
                        badge="V1.0"
                    />
                <NavItem active={currentView === 'planner'} icon={LayoutDashboard} label="Planner" onClick={() => onNavigate('planner')} />
                <NavItem 
                    icon={Brain} 
                    label="Memory Bank" 
                    active={currentView === 'memory-bank'} 
                    onClick={() => onNavigate('memory-bank')}
                    badge="V1.1"
                />
                <NavItem active={currentView === 'specs'} icon={FileText} label={t.specs} onClick={() => onNavigate('specs')} />
            </div>
        </div>

        {/* Execution Phase */}
        <div>
           <div className="px-3 mb-3">
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">Execution</span>
           </div>
           
            <div className="space-y-1">
                <NavItem active={currentView === 'kanban'} icon={ClipboardList} label={t.kanban} onClick={() => onNavigate('kanban')} />
                <NavItem active={currentView === 'missions'} icon={BookOpen} label={t.missions} onClick={() => onNavigate('missions')} />
                <NavItem active={false} icon={Activity} label="AI Architect" onClick={() => invoke('open_chat_window')} />
            </div>
        </div>
        
        {/* Engineering Support */}
        <div>
           <div className="px-3 mb-3">
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">{t.engineering}</span>
           </div>
           
           <div className="space-y-1">
               <NavItem active={currentView === 'issues'} icon={Bug} label={t.issues} onClick={() => onNavigate('issues')} />
               <NavItem active={currentView === 'commits'} icon={GitCommit} label={t.commits} onClick={() => onNavigate('commits')} />
               <NavItem active={currentView === 'history'} icon={History} label={t.history} onClick={() => onNavigate('history')} />
           </div>
        </div>

        {/* Operations & Sentinel */}
        <div>
           <div className="px-3 mb-3">
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">Operations</span>
           </div>
           
           <div className="space-y-1">
               <NavItem active={currentView === 'ops'} icon={Activity} label="Ops Center" onClick={() => onNavigate('ops')} />
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
