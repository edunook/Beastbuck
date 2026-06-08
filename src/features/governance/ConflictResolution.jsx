import { Scale, FileText, AlertCircle, ShieldAlert, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const activeCases = [
  { id: 'CAS-092', title: 'Bounty Distribution Dispute', status: 'Under Review', type: 'Financial', date: 'Oct 24, 2026' },
  { id: 'CAS-104', title: 'Code of Conduct Violation', status: 'Awaiting Response', type: 'Behavioral', date: 'Oct 26, 2026' }
];

export default function ConflictResolution() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Scale className="text-indigo-400" size={32} />
            Conflict Resolution
          </h1>
          <p className="text-zinc-400 mt-2 max-w-2xl text-sm leading-relaxed">
            A fair, transparent, and neutral ground for mediating disputes within the BeastBuck community. All cases are handled with strict confidentiality.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <AlertCircle size={20} />
          Open a Case
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">My Active Cases</h2>
          
          {activeCases.length > 0 ? (
            <div className="space-y-4">
              {activeCases.map((c) => (
                <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-zinc-700 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-indigo-400 transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-zinc-500">{c.id}</span>
                        <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                        <span className="text-xs text-zinc-400">{c.date}</span>
                      </div>
                      <h3 className="font-medium text-zinc-200">{c.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-xs text-zinc-500 mb-1">{c.type}</span>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-md",
                        c.status === 'Under Review' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      )}>
                        {c.status}
                      </span>
                    </div>
                    <ChevronRight size={20} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
              <ShieldAlert className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-zinc-300 mb-1">No active cases</h3>
              <p className="text-zinc-500 text-sm">You don't have any open disputes at this time.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">Policy & Guidelines</h2>
          
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-4">
            <p className="text-sm text-zinc-400">
              Before opening a case, please review our community guidelines to understand the mediation process.
            </p>
            
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                  <FileText size={16} /> Code of Conduct
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                  <FileText size={16} /> Mediation Process
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                  <FileText size={16} /> Financial Dispute Rules
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
