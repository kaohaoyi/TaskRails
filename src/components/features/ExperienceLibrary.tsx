import { useState, useEffect } from 'react';
import { BrainCircuit, Search, Save, Clock } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface Experience {
    id: string;
    content: string;
    solution?: string;
    tags: string[];
    status: 'pending' | 'verified' | 'rejected';
}

export default function ExperienceLibrary() {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [experiments, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(false);
    
    // New Entry State
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [newTags, setNewTags] = useState('');
    const [newSolution, setNewSolution] = useState('');

    // Fetch Experiences
    const fetchExperiences = async (query: string = "") => {
        setLoading(true);
        try {
            const results = await invoke<Experience[]>('search_experiences', { query });
            setExperiences(results);
        } catch (err) {
            console.error("Failed to fetch experiences:", err);
            // Fallback for UI visualization if backend fails (dev mode)
            setExperiences([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchExperiences(searchQuery);
    };

    const handleAddExperience = async () => {
        if (!newContent) return;
        try {
            await invoke('log_experience', {
                content: newContent,
                solution: newSolution,
                tags: newTags.split(',').map(t => t.trim()).filter(t => t)
            });
            setIsAddingMode(false);
            setNewContent('');
            setNewTags('');
            setNewSolution('');
            fetchExperiences(); // Refresh
        } catch (err) {
            console.error("Failed to add experience:", err);
            alert("Failed to log experience");
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white overflow-hidden relative">
            {/* Header */}
            <div className="p-8 pb-0">
                 <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 mb-2">
                    <BrainCircuit className="text-primary" size={32} />
                    Knowledge Base
                </h1>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest pl-11">
                    Organizational Memory & Architectural Patterns
                </p>
            </div>

            {/* Controls */}
            <div className="p-8 flex items-center gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH MEMORY PATTERNS..." 
                        className="w-full bg-[#16161A] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-bold tracking-wide text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-[#1A1A20] transition-all placeholder:text-gray-700"
                    />
                </form>
                <button 
                    onClick={() => setIsAddingMode(!isAddingMode)}
                    className={clsx(
                        "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border",
                        isAddingMode 
                            ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(242,153,74,0.3)]" 
                            : "bg-[#16161A] text-gray-400 hover:text-white border-white/5 hover:bg-[#202025]"
                    )}
                >
                    {isAddingMode ? 'Cancel Entry' : '+ Log Experience'}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
                {isAddingMode && (
                    <div className="mb-8 bg-[#16161A] border border-primary/20 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest">New Memory Entry</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Context / Problem</label>
                                <textarea 
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Describe the architectural pattern or issue encountered..."
                                    className="w-full h-24 bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                             <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Solution / Snippet</label>
                                <textarea 
                                    value={newSolution}
                                    onChange={(e) => setNewSolution(e.target.value)}
                                    placeholder="Paste the solution code or pattern here..."
                                    className="w-full h-32 bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-xs font-mono text-green-400 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Metadata Tags (Comma separated)</label>
                                <input 
                                    type="text" 
                                    value={newTags}
                                    onChange={(e) => setNewTags(e.target.value)}
                                    placeholder="e.g. rust, auth, security, optimized"
                                    className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={handleAddExperience}
                                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                                >
                                    <Save size={14} /> Commit to Memory
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {experiments.length === 0 && !loading && (
                        <div className="text-center py-20 opacity-30">
                            <BrainCircuit size={64} className="mx-auto mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No Patterns Found</p>
                        </div>
                    )}
                    
                    {experiments.map(exp => (
                        <div key={exp.id} className="group bg-[#16161A] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:translate-x-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-2 flex-wrap">
                                    {exp.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400 uppercase group-hover:border-primary/30 group-hover:text-primary transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                        exp.status === 'verified' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                    )}>
                                        {exp.status}
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 leading-relaxed font-medium mb-4">{exp.content}</p>
                            
                            {exp.solution && (
                                <div className="bg-[#0A0A0C] rounded-lg p-4 font-mono text-xs text-gray-400 overflow-x-auto border-l-2 border-primary/20 group-hover:border-primary transition-colors">
                                    <pre>{exp.solution}</pre>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                <Clock size={12} /> Sync: Just now
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
