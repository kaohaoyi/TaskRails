import clsx from 'clsx';
import { Hammer, Shield, Ruler } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export type Role = 'coder' | 'reviewer' | 'architect';

interface RoleTabsProps {
    currentRole: Role;
    onRoleChange: (role: Role) => void;
}

export default function RoleTabs({ currentRole, onRoleChange }: RoleTabsProps) {
    const t = useTranslation().roles;
    
    const tabs = [
        { id: 'coder' as Role, label: t.coder, icon: Hammer, color: 'text-primary' },
        { id: 'reviewer' as Role, label: t.reviewer, icon: Shield, color: 'text-red-500' },
        { id: 'architect' as Role, label: t.architect, icon: Ruler, color: 'text-blue-500' },
    ];

    return (
        <div className="flex border-b border-border-dark bg-surface-dark">
            {tabs.map((tab) => {
                const isActive = currentRole === tab.id;
                const Icon = tab.icon;
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => onRoleChange(tab.id)}
                        className={clsx(
                            "flex-1 py-3 flex flex-col items-center justify-center gap-1 relative group transition-colors",
                            isActive ? "bg-white/5" : "hover:bg-white/5 opacity-60 hover:opacity-100"
                        )}
                    >
                        <Icon 
                            size={18} 
                            className={clsx(
                                "transition-colors",
                                isActive ? tab.color : "text-gray-400 group-hover:text-gray-200"
                            )} 
                        />
                        <span className={clsx(
                            "text-[10px] font-mono font-bold tracking-widest transition-colors",
                            isActive ? tab.color : "text-gray-500 group-hover:text-gray-300"
                        )}>
                            {tab.label}
                        </span>
                        
                        {isActive && (
                            <div className={clsx(
                                "absolute bottom-0 left-0 w-full h-[2px] shadow-[0_0_8px]",
                                tab.id === 'coder' && "bg-primary shadow-primary/50",
                                tab.id === 'reviewer' && "bg-red-500 shadow-red-500/50",
                                tab.id === 'architect' && "bg-blue-500 shadow-blue-500/50",
                            )} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
