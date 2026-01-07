import { useState, useEffect, useMemo } from 'react';
import { Brain, FileText, Save, RefreshCw, Trash2, Search, Plus, Pin, Bot } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface MemoryEntry {
    name: string;
    content: string;
    path: string;
}

export default function MemoryBankViewer() {
    const [memories, setMemories] = useState<string[]>([]);
    const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const workspace = '.';

    const fetchMemoryList = async () => {
        setLoading(true);
        try {
            const list = await invoke<string[]>('get_memory_list', { workspace });
            setMemories(list);
            if (list.length > 0 && !selectedMemory) {
                // Keep current selection if valid, else pick first
                if (!list.includes(selectedMemory || '')) {
                    setSelectedMemory(list[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch memory list:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMemoryContent = async (name: string) => {
        try {
            const entry = await invoke<MemoryEntry>('get_memory', { workspace, name });
            setContent(entry.content);
        } catch (err) {
            console.error('Failed to fetch memory:', err);
            setContent('# Error loading memory file');
        }
    };

    const saveMemory = async () => {
        if (!selectedMemory) return;
        setSaving(true);
        try {
            await invoke('update_memory', { workspace, name: selectedMemory, content });
        } catch (err) {
            console.error('Failed to save memory:', err);
        } finally {
            setSaving(false);
        }
    };

    const deleteMemory = async (name: string) => {
        if (!confirm(`確定要刪除 @${name}.md 嗎？此操作不可恢復。`)) return;
        try {
            await invoke('delete_memory', { workspace, name });
            if (selectedMemory === name) {
                setSelectedMemory(null);
                setContent('');
            }
            await fetchMemoryList();
        } catch (err) {
            console.error('Failed to delete memory:', err);
        }
    };

    useEffect(() => {
        fetchMemoryList();
    }, []);

    useEffect(() => {
        if (selectedMemory) {
            fetchMemoryContent(selectedMemory);
        }
    }, [selectedMemory]);

    const pinnedMemories = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('taskrails_pinned_memories') || '[]');
        } catch { return []; }
    }, [selectedMemory, memories]); // Trigger refresh on selection/list change

    const filteredMemories = memories.filter(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 bg-[#0D0D0F]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Brain className="text-primary" size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight italic">Memory <span className="text-primary">Bank</span></h1>
                            <p className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">Vibe Coding - Context Management</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search memories..."
                                className="bg-[#16161A] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-300 focus:outline-none focus:border-primary/50 w-64 transition-all"
                            />
                        </div>
                        <button 
                            onClick={fetchMemoryList}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        >
                            <RefreshCw size={16} className={clsx(loading && 'animate-spin')} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden p-8 gap-8">
                {/* File Grid Side */}
                <div className="w-[350px] flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Knowledge Clusters</h2>
                        <span className="text-[10px] font-mono text-gray-700">{filteredMemories.length} FILES</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {filteredMemories.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl">
                                <FileText className="mx-auto mb-3 opacity-10" size={32} />
                                <p className="text-[10px] font-bold text-gray-700 uppercase">No Matches Found</p>
                            </div>
                        )}
                        {filteredMemories.map(name => {
                            const isPinned = pinnedMemories.includes(name);
                            const isActive = selectedMemory === name;
                            
                            return (
                                <div 
                                    key={name}
                                    className={clsx(
                                        "group relative flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer",
                                        isActive 
                                            ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                                            : "bg-[#0F0F12] border-white/5 hover:border-white/20 hover:bg-[#131317]"
                                    )}
                                    onClick={() => setSelectedMemory(name)}
                                >
                                    <div className={clsx(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-primary text-white" : "bg-white/5 text-gray-500 group-hover:text-gray-300"
                                    )}>
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx("font-bold text-sm truncate", isActive ? "text-white" : "text-gray-400")}>
                                                @{name}
                                            </span>
                                            {isPinned && <Pin size={10} className="text-primary fill-primary" />}
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-mono mt-0.5 uppercase truncate tracking-tight">Active Context</p>
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteMemory(name); }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-lg"
                                        title="Delete Memory"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Editor Surface */}
                <div className="flex-1 flex flex-col bg-[#0D0D11] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    {selectedMemory ? (
                        <>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111116]">
                                <div className="flex items-center gap-3">
                                    <Bot size={16} className="text-primary animate-pulse" />
                                    <span className="text-xs font-mono font-bold text-gray-400">
                                        editing: <span className="text-primary">@{selectedMemory}.md</span>
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            const pinned = [...pinnedMemories];
                                            let newPinned;
                                            if (pinned.includes(selectedMemory)) {
                                                newPinned = pinned.filter(m => m !== selectedMemory);
                                            } else {
                                                newPinned = [...pinned, selectedMemory];
                                            }
                                            localStorage.setItem('taskrails_pinned_memories', JSON.stringify(newPinned));
                                            // Trigger refresh via dummy selection change or logic
                                            setSelectedMemory(selectedMemory);
                                        }}
                                        className={clsx(
                                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                                            pinnedMemories.includes(selectedMemory)
                                                ? "bg-primary border-primary text-white"
                                                : "bg-[#16161A] border-white/10 text-gray-500 hover:text-white"
                                        )}
                                    >
                                        <Pin size={12} />
                                        {pinnedMemories.includes(selectedMemory) ? 'Priority Context' : 'Pin to Context'}
                                    </button>
                                    <button
                                        onClick={saveMemory}
                                        disabled={saving}
                                        className={clsx(
                                            "h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg",
                                            saving 
                                                ? "bg-gray-800 text-gray-600 cursor-not-allowed" 
                                                : "bg-white text-black hover:bg-gray-200"
                                        )}
                                    >
                                        <Save size={12} />
                                        {saving ? 'Saving...' : 'Commit Changes'}
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="flex-1 bg-transparent p-8 text-[13px] font-mono text-gray-300 resize-none focus:outline-none leading-loose custom-scrollbar selection:bg-primary/30"
                                placeholder="Start vibe coding here..."
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                            <Brain size={64} className="mb-4" />
                            <p className="text-sm font-black uppercase tracking-[0.3em]">Neural Interface Offline</p>
                            <p className="text-[10px] mt-2">Pick a memory cluster from the left to begin syncing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
