import clsx from 'clsx';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { CompletenessCheck } from '../../../utils/projectConfig';

interface ProgressIndicatorProps {
    completenessCheck: CompletenessCheck;
}

export const ProgressIndicator = ({ completenessCheck }: ProgressIndicatorProps) => (
    <div className="space-y-3">
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={clsx(
                        "h-full rounded-full transition-all duration-500",
                        completenessCheck.progress === 100 
                            ? "bg-green-500" 
                            : completenessCheck.progress >= 50 
                                ? "bg-yellow-500" 
                                : "bg-red-500"
                    )}
                    style={{ width: `${completenessCheck.progress}%` }}
                />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase w-12 text-right select-text">
                {completenessCheck.progress}%
            </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
            {completenessCheck.items.map((item, i) => (
                <div 
                    key={i}
                    className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold select-text",
                        item.completed 
                            ? "bg-green-500/10 text-green-400" 
                            : item.required 
                                ? "bg-red-500/10 text-red-400"
                                : "bg-white/5 text-gray-500"
                    )}
                >
                    {item.completed 
                        ? <CheckCircle2 size={12} /> 
                        : item.required 
                            ? <XCircle size={12} /> 
                            : <AlertCircle size={12} />
                    }
                    <span className="flex-1 truncate">{item.name}</span>
                </div>
            ))}
        </div>
    </div>
);
