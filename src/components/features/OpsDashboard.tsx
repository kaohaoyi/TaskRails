import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Shield, GitBranch, Terminal, RefreshCw, AlertTriangle, Activity, CheckCircle, XCircle } from 'lucide-react';
// import { useTranslation } from '../../hooks/useTranslation';
import clsx from 'clsx';

export default function OpsDashboard() {
    // const t = useTranslation();
    
    // Sentinel State
    const [environment, setEnvironment] = useState<'Native' | 'Container'>('Native');
    const [linterStatus] = useState<'idle' | 'running' | 'error'>('idle'); // setLinterStatus removed
    
    // Git Ops State
    // const [gitStatus, setGitStatus] = useState<any>(null); // Placeholder for GitStatus struct
    const [appVersion, setAppVersion] = useState('1.0.0');

    // Load Initial Data
    useEffect(() => {
        const load = async () => {
            try {
                const env = await invoke<'Native' | 'Container'>('check_environment');
                setEnvironment(env);
                
                // Fetch version from tauri config or backend (mock for now)
                const ver = await invoke<string>('get_setting', { key: 'app_version' }) || '1.0.0';
                setAppVersion(ver);

                // TODO: Invoke check_git_status when exposed
            } catch (err) {
                console.error('Failed to load Ops data:', err);
            }
        };
        load();
    }, []);

    // Heartbeat Effect
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame = 0;
        let data: number[] = Array(50).fill(50);

        const draw = () => {
            frame++;
            if (frame % 5 === 0) {
                // Mock Heartbeat
                data.shift();
                data.push(50 + (Math.random() * 40 - 20));
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            
            // Draw Line
            for (let i = 0; i < data.length; i++) {
                const x = (i / data.length) * canvas.width;
                const y = data[i];
                ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = '#3B82F6'; // Blue-500
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Gradient Fill
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.fill();

            requestAnimationFrame(draw);
        };
        draw();
    }, []);

    const handleBumpVersion = async (level: 'patch' | 'minor' | 'major') => {
        if (!confirm(`Are you sure you want to bump ${level} version? This will trigger Git commit.`)) return;
        // await invoke('bump_version', { level });
        alert('Git Ops: Version Bump Triggered (Backend Pending)');
    };

    const handleHardReset = async () => {
        const confirmText = "HARD RESET";
        const input = prompt(`DANGER: This will discard ALL uncommitted changes.\nType "${confirmText}" to confirm:`);
        if (input === confirmText) {
            // await invoke('hard_reset_git');
            alert('Airlock: Hard Reset Executed (Backend Pending)');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0C] text-white overflow-y-auto custom-scrollbar p-8 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Activity className="text-primary" /> 
                        Operations Center
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-wider">Sentinel Monitoring & Git Ops Control</p>
                </div>
                <div className="flex items-center gap-4">
                     {/* Heartbeat Canvas */}
                     <div className="w-48 h-12 bg-[#0F0F12] border border-white/5 rounded-lg overflow-hidden relative">
                        <canvas ref={canvasRef} width={200} height={50} className="w-full h-full opacity-60" />
                        <div className="absolute top-1 right-2 text-[8px] font-mono text-blue-500 animate-pulse">LIVE NODE STATUS</div>
                     </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#16161A] rounded-full border border-white/5">
                        <div className={clsx("w-2 h-2 rounded-full animate-pulse", environment === 'Container' ? "bg-green-500" : "bg-blue-500")} />
                        <span className="text-[10px] font-bold text-gray-300 uppercase">{environment} ENV</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentinel Panel */}
                <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/20 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield size={120} />
                    </div>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Shield size={16} /> Sentinel Status
                    </h2>

                    <div className="space-y-4 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 bg-[#0A0A0C] rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                                <span className="text-[10px] font-bold text-gray-400 mb-1">INTEGRITY</span>
                                <span className="text-sm font-black text-green-500 flex items-center gap-1"><CheckCircle size={14}/> SECURE</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-[#0A0A0C] rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                                <span className="text-[10px] font-bold text-gray-400 mb-1">LINTER</span>
                                <span className="text-sm font-black text-blue-500 flex items-center gap-1"><RefreshCw size={14}/> {linterStatus.toUpperCase()}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-[#0A0A0C] rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-400">Satellite WebSocket</span>
                                <span className="text-[10px] font-mono text-primary">PORT: 3002</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-2/3 animate-pulse"></div>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-2 font-mono">Listening for IDE connections...</p>
                        </div>
                    </div>
                </div>

                {/* Git Ops Panel */}
                <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/20 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <GitBranch size={120} />
                    </div>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <GitBranch size={16} /> Git Operations (Airlock)
                    </h2>

                    <div className="space-y-6 relative z-10">
                         {/* Version Control */}
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase">Current Version</label>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-black font-mono tracking-tighter text-white">v{appVersion}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleBumpVersion('patch')} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold border border-white/10 uppercase transition-colors">Patch</button>
                                    <button onClick={() => handleBumpVersion('minor')} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold border border-white/10 uppercase transition-colors">Minor</button>
                                </div>
                            </div>
                         </div>

                         <div className="h-px bg-white/5"></div>

                         {/* Dangerous Zone */}
                         <div className="space-y-3">
                             <div className="flex items-center gap-2 text-red-500">
                                 <AlertTriangle size={14} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Danger Zone</span>
                             </div>
                             <p className="text-[10px] text-gray-500 leading-relaxed">
                                 Airlock Protocol: Execute Hard Reset to discard all unauthorized changes and restore system integrity.
                             </p>
                             <button 
                                onClick={handleHardReset}
                                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                             >
                                 <XCircle size={14} /> Execute Hard Reset
                             </button>
                         </div>
                    </div>
                </div>
            </div>
            
            {/* Terminal / Logs Area Preview */}
            <div className="flex-1 bg-[#0A0A0C] border border-white/5 rounded-2xl p-4 font-mono text-[10px]">
                <div className="flex items-center gap-2 text-gray-500 mb-2 pb-2 border-b border-white/5">
                    <Terminal size={12} />
                    <span>SYSTEM LOGS</span>
                </div>
                <div className="space-y-1 text-gray-400">
                    <div className="flex gap-2"><span className="text-primary">[14:02:11]</span> [Satellite] WebSocket Server started on :3002</div>
                    <div className="flex gap-2"><span className="text-primary">[14:02:12]</span> [Sentinel] Environment detected: {environment.toUpperCase()}</div>
                    <div className="flex gap-2"><span className="text-blue-400">[14:02:15]</span> [GitOps] Repo status: CLEAN (branch: main)</div>
                </div>
            </div>
        </div>
    );
}
