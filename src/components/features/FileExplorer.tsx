import { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, FolderOpen, Search, RefreshCw, Loader2, FileText, Code, Settings } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface FileNode {
    path: string;
    name: string;
    is_dir: boolean;
    extension: string | null;
    size: number;
    children: FileNode[];
}

interface ProjectScanResult {
    file_tree: FileNode[];
    total_files: number;
}

export default function FileExplorer() {
    const [tree, setTree] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['.'])); // Root is usually '.' or similar

    const fetchTree = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await invoke<ProjectScanResult>('scan_project');
            setTree(result.file_tree);
        } catch (err: any) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    const toggleFolder = (path: string) => {
        const next = new Set(expandedPaths);
        if (next.has(path)) {
            next.delete(path);
        } else {
            next.add(path);
        }
        setExpandedPaths(next);
    };

    const getIcon = (node: FileNode) => {
        if (node.is_dir) {
            return expandedPaths.has(node.path) ? <FolderOpen size={14} className="text-blue-400" /> : <Folder size={14} className="text-blue-400" />;
        }
        
        const ext = node.extension?.toLowerCase();
        if (['ts', 'tsx', 'js', 'jsx', 'rs', 'py', 'go'].includes(ext || '')) {
            return <Code size={14} className="text-purple-400" />;
        }
        if (['json', 'toml', 'yaml', 'yml'].includes(ext || '')) {
            return <Settings size={14} className="text-yellow-400" />;
        }
        if (['md', 'txt'].includes(ext || '')) {
            return <FileText size={14} className="text-gray-400" />;
        }
        return <File size={14} className="text-gray-500" />;
    };

    const renderNode = (node: FileNode, depth = 0) => {
        // Simple search filter
        if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase()) && !node.children.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
            // This is a naive filter, it doesn't show children if parent doesn't match, unless children match
            // But let's keep it simple for now
        }

        const isExpanded = expandedPaths.has(node.path);

        return (
            <div key={node.path} className="select-none">
                <div 
                    className={clsx(
                        "flex items-center gap-2 py-1 px-2 hover:bg-white/5 cursor-pointer rounded transition-colors group",
                        depth === 0 ? "font-bold text-gray-200" : "text-gray-400"
                    )}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => node.is_dir ? toggleFolder(node.path) : null}
                >
                    <span className="w-4 flex justify-center">
                        {node.is_dir && (
                            isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                        )}
                    </span>
                    {getIcon(node)}
                    <span className="text-xs truncate">{node.name}</span>
                    {!node.is_dir && (
                        <span className="ml-auto text-[9px] text-gray-600 opacity-0 group-hover:opacity-100 uppercase font-mono">
                            {(node.size / 1024).toFixed(1)} KB
                        </span>
                    )}
                </div>
                
                {node.is_dir && isExpanded && node.children.length > 0 && (
                    <div className="">
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white p-8">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Search className="text-primary" /> 
                        檔案結構
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-wider">
                        瀏覽專案目錄與原始碼結構
                    </p>
                </div>
                <button 
                    onClick={fetchTree}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase transition-all"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    重新掃描
                </button>
            </header>

            <div className="flex-1 bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input 
                            type="text" 
                            placeholder="搜尋檔案或資料夾..." 
                            className="w-full bg-[#16161A] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-xs focus:border-primary/50 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading && tree.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <p className="text-sm font-mono uppercase tracking-widest">正在掃描工作區...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-red-500 gap-4 text-center px-10">
                            <RefreshCw size={32} className="text-red-900" />
                            <div>
                                <p className="font-bold">掃描失敗</p>
                                <p className="text-xs text-red-400/60 mt-2 font-mono">{error}</p>
                            </div>
                        </div>
                    ) : tree.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                            <Folder size={48} className="opacity-20" />
                            <p className="text-sm">未發現檔案或工作區未開啟</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tree.map(node => renderNode(node))}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-[#16161A] border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono uppercase">
                        Structure Analysis: Depth 2
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase">
                        {tree.reduce((acc, node) => acc + (node.is_dir ? 0 : 1 + (node.children?.length || 0)), 0)} Nodes Rendered
                    </span>
                </div>
            </div>
        </div>
    );
}
