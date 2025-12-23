import { Book, ShieldCheck, Zap, Cpu, Terminal, Globe, Palette } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function InstructionPage() {
    const t = useTranslation().instruction;

    return (
        <div className="h-full flex flex-col overflow-y-auto custom-scrollbar p-8 lg:p-12 space-y-16 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] animate-pulse"></div>
                <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(242,153,74,0.8)]"></div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Operational_Manual_v1.0</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase">
                        {t.title.split(' ')[0]} <span className="text-primary underline decoration-primary/30 decoration-8 underline-offset-10">{t.title.split(' ')[1] || 'Protocols'}</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl font-medium leading-relaxed mt-4">
                        {t.banner}
                    </p>
                </div>
            </div>

            {/* Core Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ModuleCard 
                    icon={Cpu} 
                    title={t.modules.objectives.title} 
                    desc={t.modules.objectives.desc}
                />
                <ModuleCard 
                    icon={Zap} 
                    title={t.modules.board.title} 
                    desc={t.modules.board.desc}
                />
                <ModuleCard 
                    icon={ShieldCheck} 
                    title={t.modules.role.title} 
                    desc={t.modules.role.desc}
                />
            </div>

            {/* Workflow Section */}
            <div className="space-y-10">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{t.workflow.title.split(' ')[0]} <span className="text-primary">{t.workflow.title.split(' ')[1] || ''}</span></h3>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <WorkflowStep num="01" title={t.workflow.step1.title} text={t.workflow.step1.desc} />
                    <WorkflowStep num="02" title={t.workflow.step2.title} text={t.workflow.step2.desc} />
                    <WorkflowStep num="03" title={t.workflow.step3.title} text={t.workflow.step3.desc} />
                    <WorkflowStep num="04" title={t.workflow.step4.title} text={t.workflow.step4.desc} />
                </div>
            </div>

            {/* Advanced Features */}
            <div className="bg-[#0D0D0F] border border-white/5 rounded-[40px] p-10 lg:p-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Book size={200} className="text-white" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                    <div className="space-y-8">
                        <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">{t.advanced.title.split(' ')[0]} <span className="text-primary">{t.advanced.title.split(' ')[1] || ''}</span></h4>
                        <div className="space-y-6">
                            <Tactic icon={Terminal} title={t.advanced.mcp.title} desc={t.advanced.mcp.desc} />
                            <Tactic icon={Globe} title={t.advanced.lang.title} desc={t.advanced.lang.desc} />
                            <Tactic icon={Palette} title={t.advanced.ui.title} desc={t.advanced.ui.desc} />
                        </div>
                    </div>
                    <div className="bg-black/40 rounded-3xl p-8 border border-white/5 flex flex-col justify-center gap-4">
                        <div className="text-primary font-black text-[10px] uppercase tracking-widest">System_Tip</div>
                        <p className="text-gray-300 italic text-sm leading-relaxed font-medium">
                            {t.advanced.tip}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="h-20"></div>
        </div>
    );
}

function ModuleCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-8 bg-[#0F0F12] border border-white/5 rounded-3xl hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all mb-6">
                <Icon size={24} />
            </div>
            <h4 className="text-lg font-black text-white mb-3 uppercase italic tracking-tight">{title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function WorkflowStep({ num, title, text }: { num: string, title: string, text: string }) {
    return (
        <div className="relative p-8 bg-[#070708] border border-white/5 rounded-3xl">
            <span className="absolute top-6 right-6 text-[40px] font-black text-white/5 leading-none italic">{num}</span>
            <h5 className="text-white font-black mb-3 text-sm uppercase tracking-wide">{title}</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-medium">{text}</p>
        </div>
    );
}

function Tactic({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex gap-6">
            <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Icon size={20} />
            </div>
            <div className="space-y-1">
                <h6 className="text-white font-black text-sm uppercase">{title}</h6>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
