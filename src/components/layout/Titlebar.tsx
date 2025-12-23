import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Square, Minus } from "lucide-react";
import icon from "../../assets/ICON.png";

export default function Titlebar() {
  console.log("[Titlebar] Component rendered");

  const handleMinimize = async (e: React.MouseEvent) => {
    console.log("[Titlebar] Minimize button clicked!");
    e.stopPropagation();
    e.preventDefault();
    try {
      console.log("[Titlebar] Getting current window...");
      const appWindow = getCurrentWindow();
      console.log("[Titlebar] Got window:", appWindow);
      console.log("[Titlebar] Calling minimize...");
      await appWindow.minimize();
      console.log("[Titlebar] Minimize called successfully");
    } catch (err) {
      console.error("[Titlebar] Minimize failed:", err);
    }
  };

  const handleToggleMaximize = async (e: React.MouseEvent) => {
    console.log("[Titlebar] Maximize button clicked!");
    e.stopPropagation();
    e.preventDefault();
    try {
      console.log("[Titlebar] Getting current window...");
      const appWindow = getCurrentWindow();
      console.log("[Titlebar] Got window:", appWindow);
      console.log("[Titlebar] Calling toggleMaximize...");
      await appWindow.toggleMaximize();
      console.log("[Titlebar] ToggleMaximize called successfully");
    } catch (err) {
      console.error("[Titlebar] Toggle maximize failed:", err);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    console.log("[Titlebar] Close button clicked!");
    e.stopPropagation();
    e.preventDefault();
    try {
      console.log("[Titlebar] Getting current window...");
      const appWindow = getCurrentWindow();
      console.log("[Titlebar] Got window:", appWindow);
      console.log("[Titlebar] Calling close...");
      await appWindow.close();
      console.log("[Titlebar] Close called successfully");
    } catch (err) {
      console.error("[Titlebar] Close failed:", err);
    }
  };

  // Log when mouse enters button area
  const handleMouseEnter = (buttonName: string) => {
    console.log(`[Titlebar] Mouse entered ${buttonName} button`);
  };

  return (
    <div className="h-8 bg-surface-dark border-b border-border-dark flex items-center justify-between select-none fixed top-0 left-0 right-0 z-50 text-gray-400">
      {/* Left: Logo + Title - This part is draggable */}
      <div 
        data-tauri-drag-region 
        className="flex-1 h-full flex items-center gap-2 px-2 cursor-default"
        onDoubleClick={handleToggleMaximize}
      >
        <img src={icon} alt="TaskRails" className="w-4 h-4 pointer-events-none" />
        <span className="text-xs font-mono font-bold tracking-wider text-primary pointer-events-none">
          TASKRAILS_
          <span className="text-gray-500">CORE</span>
        </span>
      </div>

      {/* Right: Window Controls - NOT inside drag region */}
      <div className="flex items-center h-full shrink-0">
        <button
          type="button"
          onMouseDown={(e) => { console.log("[Titlebar] Minimize mousedown"); e.stopPropagation(); }}
          onMouseEnter={() => handleMouseEnter("Minimize")}
          onClick={handleMinimize}
          className="h-full w-10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { console.log("[Titlebar] Maximize mousedown"); e.stopPropagation(); }}
          onMouseEnter={() => handleMouseEnter("Maximize")}
          onClick={handleToggleMaximize}
          className="h-full w-10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <Square size={12} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { console.log("[Titlebar] Close mousedown"); e.stopPropagation(); }}
          onMouseEnter={() => handleMouseEnter("Close")}
          onClick={handleClose}
          className="h-full w-10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
