import { Crown, Users, Clock, ArrowRight, UserPlus } from 'lucide-react';

const activeElections = [
  { id: 1, role: 'Community Treasury Manager', candidates: 4, endsIn: '3 days', description: 'Oversee community funds and grant distributions.' },
  { id: 2, role: 'Technical Council Lead', candidates: 2, endsIn: '12 hours', description: 'Lead architectural decisions for the BeastBuck protocol.' }
];

const historicalLeaders = [
  { name: 'Diana Prince', role: 'Treasury Manager', term: '2025 - 2026' },
  { name: 'Evan Wright', role: 'Council Lead', term: '2024 - 2025' }
];

export default function ElectionsHub() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="text-amber-400 w-8 h-8" />
            <h1 className="text-4xl font-extrabold text-white">Leadership Elections</h1>
          </div>
          <p className="text-zinc-400 max-w-xl">Elect the next generation of leaders to guide the BeastBuck ecosystem forward.</p>
        </div>
        <button className="relative z-10 flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
          <UserPlus size={20} />
          Apply for Candidacy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="text-blue-400" /> Active Elections
          </h2>
          
          <div className="grid gap-6">
            {activeElections.map((election) => (
              <div key={election.id} className="group bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-amber-300 group-hover:text-amber-400 transition-colors">{election.role}</h3>
                    <p className="text-zinc-400 mt-1 text-sm">{election.description}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold px-3 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                      Ends in {election.endsIn}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Users size={18} className="text-zinc-500" />
                    <span className="font-medium">{election.candidates} Candidates</span>
                  </div>
                  <button className="ml-auto flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    View Candidates <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="text-zinc-500" /> Historical Leaders
          </h2>
          
          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 space-y-4">
            {historicalLeaders.map((leader, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-colors">
                <div>
                  <div className="font-bold text-zinc-200">{leader.name}</div>
                  <div className="text-sm text-zinc-500">{leader.role}</div>
                </div>
                <div className="text-xs font-medium text-zinc-600 bg-zinc-900 px-2 py-1 rounded-md">
                  {leader.term}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
