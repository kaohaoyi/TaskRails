import { LayoutDashboard, ClipboardList, Settings, History, Bug, GitCommit, Users, FileText } from "lucide-react";
import logo from "../../assets/LOGO.png"; // Full Logo
import { useTranslation } from "../../hooks/useTranslation";

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const t = useTranslation().sidebar;

  return (
    <aside className="w-64 bg-surface-dark border-r border-border-dark flex flex-col shrink-0 z-10 pt-[32px]">
        <div className="px-4 mb-6 mt-2">
            <img src={logo} alt="TaskRails" className="h-8 object-contain" />
        </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 text-sm">
        <div className="px-2 mb-2 text-xs font-bold text-gray-500 tracking-widest flex items-center justify-between">
          <span>{t.main}</span>
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span>
        </div>
        
        <NavItem active={currentView === 'specs'} icon={FileText} label={t.specs} onClick={() => onNavigate('specs')} />
        <NavItem active={currentView === 'roleSettings'} icon={Users} label={t.roleSettings} onClick={() => onNavigate('roleSettings')} />
        <NavItem active={currentView === 'kanban'} icon={LayoutDashboard} label={t.kanban} onClick={() => onNavigate('kanban')} />
        <NavItem active={currentView === 'missions'} icon={ClipboardList} label={t.missions} onClick={() => onNavigate('missions')} />
        
        <div className="mt-6 mb-2 px-2 text-xs font-bold text-gray-500 tracking-widest flex items-center justify-between border-t border-border-dark pt-4">
          <span>{t.engineering}</span>
        </div>
        
        <NavItem active={currentView === 'issues'} icon={Bug} label={t.issues} onClick={() => onNavigate('issues')} />
        <NavItem active={currentView === 'commits'} icon={GitCommit} label={t.commits} onClick={() => onNavigate('commits')} />
        <NavItem active={currentView === 'history'} icon={History} label={t.history} onClick={() => onNavigate('history')} />
      </nav>

      {/* User / Bottom */}
      <div className="border-t border-border-dark bg-[#111115] p-3">
        <div 
            className={`flex items-center gap-3 hover:bg-white/5 p-2 rounded cursor-pointer transition-colors group ${currentView === 'settings' ? 'bg-white/5' : ''}`}
            onClick={() => onNavigate('settings')}
        >
            <div className="w-8 h-8 rounded bg-gray-700 overflow-hidden border border-gray-600 group-hover:border-primary/50">
                <img src={logo} alt="User" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-200 truncate group-hover:text-primary">{t.admin}</div>
                <div className="text-[10px] text-gray-500">{t.system_op}</div>
            </div>
            <Settings size={14} className="text-gray-500 group-hover:text-primary" />
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, badge, onClick }: { icon: any, label: string, active?: boolean, badge?: string, onClick?: () => void }) {
    return (
        <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }} className={`flex items-center gap-3 px-3 py-2 rounded border-l-2 transition-all group ${
            active 
            ? "bg-primary/10 text-primary border-primary" 
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border-transparent"
        }`}>
            <Icon size={18} className={active ? "" : "group-hover:text-primary transition-colors"} />
            <span className="font-medium tracking-wide">{label}</span>
            {badge && <span className="ml-auto text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">{badge}</span>}
        </a>
    )
}
