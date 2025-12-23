import { Terminal, Maximize2, XCircle } from "lucide-react";

export default function LogPanel() {
  const logs = [
    { time: "10:42:01", level: "INFO", message: "System initialized. MCP Server connected.", color: "text-blue-400" },
    { time: "10:42:05", level: "SUCCESS", message: "Loaded plugin: @taskrails/core-v1", color: "text-green-400" },
    { time: "10:45:12", level: "WARN", message: "High latency detected on local socket interaction.", color: "text-primary" },
    { time: "10:46:00", level: "DEBUG", message: "Garbage collection triggered [7MB freed]", color: "text-gray-500" },
  ];

  return (
    <div className="h-48 border-t border-border-dark bg-[#0a0a0c] flex flex-col shrink-0">
      {/* Header */}
      <div className="h-8 flex items-center justify-between px-4 border-b border-border-dark bg-surface-dark select-none">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Terminal size={12} />
            <span className="font-bold tracking-wider">SYSTEM_LOG_STREAM</span>
            <span className="flex h-1.5 w-1.5 ml-2">
                <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
        </div>
        <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-gray-300 transition-colors"><Maximize2 size={12} /></button>
            <button className="text-gray-500 hover:text-gray-300 transition-colors"><XCircle size={12} /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
        {logs.map((log, i) => (
            <div key={i} className="flex gap-2 hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                <span className="text-gray-600">[{log.time}]</span>
                <span className={`font-bold w-16 ${log.color}`}>{log.level}:</span>
                <span className="text-gray-400">{log.message}</span>
            </div>
        ))}
        {/* Cursor Line */}
        <div className="flex gap-2 px-2 py-0.5 animate-pulse">
            <span className="text-primary">&gt;</span>
            <span className="text-gray-500">_</span>
        </div>
      </div>
    </div>
  );
}
