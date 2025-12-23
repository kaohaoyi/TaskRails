import { Bug, GitCommit, Play, Hammer, Terminal, Code, Clock } from 'lucide-react';
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
    type: 'issues' | 'commits' | 'history';
    tasks?: TaskData[];
    onShowToast?: (message: string, type: ToastType) => void;
}

export default function EngineeringPage({ type, tasks = [], onShowToast }: EngineeringPageProps) {
    const t = useTranslation();
    const [lastCommand, setLastCommand] = useState<string | null>(null);
    const [activities, setActivities] = useState<ActivityRecord[]>([]);

    useEffect(() => {
        if (type === 'history') {
            fetchActivities();
        }
    }, [type]);

    const fetchActivities = async () => {
        try {
            const result = await invoke<ActivityRecord[]>('get_activity');
            setActivities(result);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
        }
    };

    const getTitle = () => {
        switch(type) {
            case 'issues': return t.sidebar.issues;
            case 'commits': return t.sidebar.commits;
            case 'history': return t.sidebar.history;
            default: return t.sidebar.engineering;
        }
    };

    const getProposal = () => {
        switch(type) {
            case 'issues': return t.engineering.proposal.issues;
            case 'commits': return t.engineering.proposal.commits;
            case 'history': return t.engineering.proposal.history;
            default: return '';
        }
    };

    const handleIdeCommand = async (cmdType: string) => {
        try {
            await invoke('execute_ide_command', { cmdType });
            setLastCommand(cmdType);
            onShowToast?.(`${t.engineering.commandSent} ${cmdType}`, 'success');
            if (type === 'history') fetchActivities();
            setTimeout(() => setLastCommand(null), 3000);
        } catch (err) {
            console.error('Failed to execute IDE command:', err);
            onShowToast?.('指令執行失敗', 'error');
        }
    };

    // Filter tasks for issues (Bug tag)
    const issueTasks = tasks.filter(task => task.tag === 'Bug');

    return (
        <div className="h-full flex flex-col p-8 space-y-8 overflow-y-auto custom-scrollbar">
            {/* IDE Control Center */}
            <div className="bg-[#141419] border border-border-dark rounded-xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Code size={120} />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Terminal size={18} className="text-primary" />
                    {t.engineering.ideControl}
                </h3>

                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => handleIdeCommand('DEBUG')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all font-mono font-bold text-sm"
                    >
                        <Bug size={16} />
                        {t.engineering.debug}
                    </button>
                    <button 
                        onClick={() => handleIdeCommand('BUILD')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg transition-all font-mono font-bold text-sm"
                    >
                        <Hammer size={16} />
                        {t.engineering.build}
                    </button>
                    <button 
                        onClick={() => handleIdeCommand('RUN_APP')}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg transition-all font-mono font-bold text-sm"
                    >
                        <Play size={16} />
                        {t.engineering.runApp}
                    </button>
                </div>

                {lastCommand && (
                    <div className="mt-4 text-xs font-mono text-primary/70 animate-in fade-in slide-in-from-left-2 transition-all">
                        {t.engineering.commandSent} <span className="text-white bg-white/5 px-2 py-0.5 rounded ml-1">{lastCommand}</span>
                    </div>
                )}
            </div>

            {/* Module Specific Content */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary block"></span>
                        <h2 className="text-3xl font-bold text-white tracking-tight uppercase">
                            {getTitle()}
                        </h2>
                    </div>
                    <span className="text-xs font-mono text-gray-700 bg-black/40 px-3 py-1 rounded border border-white/5">TYPE: {type.toUpperCase()}</span>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-gray-400 leading-relaxed italic">
                    <span className="text-primary font-bold mr-2">PROPOSAL:</span>
                    {getProposal()}
                </div>

                {type === 'issues' && (
                    <div className="space-y-4">
                        {issueTasks.length === 0 ? (
                            <div className="text-center py-12 bg-black/20 rounded-lg border border-dashed border-border-dark text-gray-600">
                                {t.engineering.noIssues}
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {issueTasks.map(task => (
                                    <div key={task.id} className="bg-[#1A1A1F] border border-border-dark rounded-lg p-4 flex items-center justify-between hover:border-red-500/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                                                <Bug size={20} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-mono text-gray-500 mb-1">{task.id} · {task.phase}</div>
                                                <div className="text-white font-medium">{task.title}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Priority</div>
                                                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/20">P{task.priority}</span>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</div>
                                                <span className="text-xs text-gray-400 uppercase">{task.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {type === 'history' && (
                    <div className="bg-[#1A1A1F] border border-border-dark rounded-lg overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            {activities.length === 0 ? (
                                <div className="text-center py-12 text-gray-600">
                                    {t.engineering.noHistory}
                                </div>
                            ) : (
                                <div className="divide-y divide-border-dark/50">
                                    {activities.map(log => (
                                        <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4">
                                            <div className={clsx(
                                                "p-2 rounded mt-0.5",
                                                log.event_type === 'IDE_CONTROL' ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-400"
                                            )}>
                                                {log.event_type === 'IDE_CONTROL' ? <Terminal size={14} /> : <Clock size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{log.event_type}</span>
                                                    <span className="text-[10px] font-mono text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-300">{log.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {type === 'commits' && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <GitCommit size={48} className="mb-4 text-blue-500" />
                        <p className="text-gray-500 text-sm">{t.engineering.commitsDeveloping}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
