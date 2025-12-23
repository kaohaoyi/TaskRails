import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        success: <CheckCircle className="text-green-400" size={18} />,
        error: <AlertCircle className="text-red-400" size={18} />,
        info: <Info className="text-blue-400" size={18} />,
    };

    const colors = {
        success: "border-green-500/30 bg-green-500/10",
        error: "border-red-500/30 bg-red-500/10",
        info: "border-blue-500/30 bg-blue-500/10",
    };

    return (
        <div className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto min-w-[300px]",
            colors[type]
        )}>
            {icons[type]}
            <p className="text-sm font-medium text-white flex-1">{message}</p>
            <button 
                onClick={() => onClose(id)}
                className="text-gray-500 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
}
