import { useState, useEffect } from 'react';
import { Brain, FileText, Save, RefreshCw } from 'lucide-react';
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

    // Get workspace path (simplified for MVP)
    const workspace = '.';

    const fetchMemoryList = async () => {
        setLoading(true);
        try {
            const list = await invoke<string[]>('get_memory_list', { workspace });
            setMemories(list);
            if (list.length > 0 && !selectedMemory) {
                setSelectedMemory(list[0]);
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
            await invoke('update_memory', { 
                workspace, 
                name: selectedMemory, 
                content 
            });
        } catch (err) {
            console.error('Failed to save memory:', err);
            alert('Failed to save memory');
        } finally {
            setSaving(false);
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

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="text-primary" size={28} />
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight">Memory Bank</h1>
                            <p className="text-gray-500 text-xs font-mono">Vibe Coding - 文檔即上下文</p>
                        </div>
                    </div>
                    <button 
                        onClick={fetchMemoryList}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={16} className={clsx(loading && 'animate-spin')} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* File List */}
                <div className="w-48 border-r border-white/5 p-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Files</p>
                    {memories.map(name => (
                        <button
                            key={name}
                            onClick={() => setSelectedMemory(name)}
                            className={clsx(
                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                                selectedMemory === name 
                                    ? "bg-primary/20 text-primary border border-primary/30" 
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <FileText size={14} />
                            @{name}
                        </button>
                    ))}
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                        <span className="text-xs font-mono text-gray-500">
                            {selectedMemory ? `@${selectedMemory}.md` : 'Select a file'}
                        </span>
                        <button
                            onClick={saveMemory}
                            disabled={!selectedMemory || saving}
                            className={clsx(
                                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                                saving 
                                    ? "bg-gray-700 text-gray-400" 
                                    : "bg-primary hover:bg-primary-hover text-white"
                            )}
                        >
                            <Save size={12} />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Select a memory file to edit..."
                        className="flex-1 bg-[#0A0A0C] p-4 text-sm font-mono text-gray-300 resize-none focus:outline-none leading-relaxed"
                    />
                </div>
            </div>
        </div>
    );
}
