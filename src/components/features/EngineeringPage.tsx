import { Bug, Play, Hammer, Terminal, Code, Clock, History as HistoryIcon } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from '../../hooks/useTranslation';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { TaskData } from './TaskDetailModal';
import { ToastType } from '../common/Toast';

interface ActivityRecord {
    id: number;
    event_type: string;
    message: string;
    user_id: string | null;
    timestamp: string;
}

interface EngineeringPageProps {
    tasks?: TaskData[];
    onShowToast?: (message: string, type: ToastType) => void;
}

export default function EngineeringPage({ tasks = [], onShowToast }: EngineeringPageProps) {
    const t = useTranslation();
    const [lastCommand, setLastCommand] = useState<string | null>(null);
    const [activities, setActivities] = useState<ActivityRecord[]>([]);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const result = await invoke<ActivityRecord[]>('get_activity');
            setActivities(result);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
        }
    };

    const handleIdeCommand = async (cmdType: string) => {
        try {
            await invoke('execute_ide_command', { cmdType });
            setLastCommand(cmdType);
            onShowToast?.(`${t.engineering.commandSent} ${cmdType}`, 'success');
            fetchActivities();
            setTimeout(() => setLastCommand(null), 3000);
        } catch (err) {
            console.error('Failed to execute IDE command:', err);
            onShowToast?.('指令執行失敗', 'error');
        }
    };

    // Filter tasks for issues (Bug tag)
    const issueTasks = tasks.filter(task => task.tag === 'Bug');

    return (
        <div className="h-full flex flex-col p-8 space-y-8 overflow-y-auto custom-scrollbar bg-[#0A0A0C]">
            {/* Header Section */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-10 bg-primary block rounded-full"></span>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                            Engineering Hub
                        </h2>
                        <p className="text-xs font-mono text-gray-500">Integrated Control & Diagnostics</p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-3 py-1 rounded border border-white/10 uppercase tracking-widest">
                        Status: Nominal
                     </span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* LEFT: Controls & Issues (8 cols) */}
                <div className="xl:col-span-8 space-y-8">
                    {/* IDE Control Center */}
                    <div className="bg-[#141419] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Code size={120} />
                        </div>
                        
                        <h3 className="text-sm font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <Terminal size={14} className="text-primary" />
                            {t.engineering.ideControl}
                        </h3>

                        <div className="flex flex-wrap gap-4 relative z-10">
                            <button 
                                onClick={() => handleIdeCommand('DEBUG')}
                                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl transition-all font-mono font-bold text-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                                < Bug size={16} />
                                {t.engineering.debug}
                            </button>
                            <button 
                                onClick={() => handleIdeCommand('BUILD')}
                                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl transition-all font-mono font-bold text-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Hammer size={16} />
                                {t.engineering.build}
                            </button>
                            <button 
                                onClick={() => handleIdeCommand('RUN_APP')}
                                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-4 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl transition-all font-mono font-bold text-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Play size={16} />
                                {t.engineering.runApp}
                            </button>
                        </div>

                        {lastCommand && (
                            <div className="mt-4 text-[10px] font-mono text-primary/70 animate-pulse">
                                {`>>`} EXECUTING_{lastCommand}_...
                            </div>
                        )}
                    </div>

                    {/* Active Issues Section */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-black text-gray-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <Bug size={14} className="text-red-500" />
                            {t.sidebar.issues}
                        </h3>
                        {issueTasks.length === 0 ? (
                            <div className="text-center py-12 bg-[#141419]/50 rounded-2xl border border-dashed border-white/5 text-gray-600 text-sm italic">
                                {t.engineering.noIssues}
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {issueTasks.map(task => (
                                    <div key={task.id} className="bg-[#141419] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-red-500/30 transition-all hover:translate-x-1 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-red-500/5 flex items-center justify-center text-red-500 border border-red-500/10">
                                                <Bug size={20} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-mono text-gray-500 mb-1">{task.id} · {task.phase}</div>
                                                <div className="text-white font-bold text-sm">{task.title}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-[9px] text-gray-600 uppercase font-black mb-1">Priority</div>
                                                <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/10 font-bold tracking-tighter">P{task.priority || 'N/A'}</span>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <div className="text-[9px] text-gray-600 uppercase font-black mb-1">Status</div>
                                                <span className="text-[10px] text-white/50 uppercase font-mono">{task.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Activity History (4 cols) */}
                <div className="xl:col-span-4 space-y-4">
                    <h3 className="text-sm font-black text-gray-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <HistoryIcon size={14} className="text-blue-500" />
                        {t.sidebar.history}
                    </h3>
                    <div className="bg-[#141419] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
                            {activities.length === 0 ? (
                                <div className="text-center py-12 text-gray-600 text-sm italic">
                                    {t.engineering.noHistory}
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {activities.map(log => (
                                        <div key={log.id} className="p-4 hover:bg-white/2 transition-colors flex items-start gap-4">
                                            <div className={clsx(
                                                "p-2 rounded-lg mt-0.5 border",
                                                log.event_type === 'IDE_CONTROL' 
                                                    ? "bg-primary/10 text-primary border-primary/20" 
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            )}>
                                                {log.event_type === 'IDE_CONTROL' ? <Terminal size={12} /> : <Clock size={12} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{log.event_type}</span>
                                                    <span className="text-[9px] font-mono text-gray-700">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{log.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

