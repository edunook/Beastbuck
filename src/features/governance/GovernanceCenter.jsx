import { useState, useEffect } from 'react';
import { ChevronRight, Plus, Trophy, Vote } from 'lucide-react';
import { GovernanceService } from '../../services/firebase/governance';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

export default function GovernanceCenter() {
  const [proposals, setProposals] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedProposals, usersSnap] = await Promise.all([
          GovernanceService.getActiveProposals(),
          getDocs(query(collection(db, 'users'), orderBy('stats.reputationScore', 'desc'), limit(5)))
        ]);
        setProposals(fetchedProposals || []);
        
        const contributors = usersSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || data.displayName || 'Unknown Member',
            rep: data.stats?.reputationScore || 0,
            role: data.role || 'Member'
          };
        });
        setTopContributors(contributors);
      } catch (error) {
        console.error("Error loading governance data:", error);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Governance Center</h1>
          <p className="text-zinc-400 mt-2">Shape the future of BeastBuck through community proposals.</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
          <Plus size={20} />
          Create Proposal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Vote className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Active Proposals</h2>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-zinc-500">Loading proposals...</div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">No active proposals found.</div>
            ) : (
              proposals.map((prop) => (
              <div key={prop.id} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 hover:bg-zinc-800/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{prop.title}</h3>
                    <p className="text-zinc-400 text-sm">{prop.description}</p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full shrink-0">
                    {prop.endsAt ? new Date(prop.endsAt.toMillis ? prop.endsAt.toMillis() : prop.endsAt).toLocaleDateString() : 'Ongoing'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-emerald-400">Yes {prop.votesYes || 0}</span>
                    <span className="text-rose-400">No {prop.votesNo || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${(prop.votesYes || 0) + (prop.votesNo || 0) === 0 ? 50 : ((prop.votesYes || 0) / ((prop.votesYes || 0) + (prop.votesNo || 0))) * 100}%` }} />
                    <div className="h-full bg-rose-500" style={{ width: `${(prop.votesYes || 0) + (prop.votesNo || 0) === 0 ? 50 : ((prop.votesNo || 0) / ((prop.votesYes || 0) + (prop.votesNo || 0))) * 100}%` }} />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors font-medium">Vote Yes</button>
                  <button className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors font-medium">Vote No</button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Top Contributors</h2>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6">
            <div className="space-y-6">
              {topContributors.length === 0 ? (
                <div className="text-center text-zinc-500 py-4">No contributors found.</div>
              ) : (
                topContributors.map((contributor) => (
                  <div key={contributor.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                        {contributor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-100 group-hover:text-blue-400 transition-colors">{contributor.name}</div>
                        <div className="text-xs text-zinc-500">{contributor.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-400">{contributor.rep}</div>
                      <div className="text-xs text-zinc-500">Reputation</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full mt-6 py-3 text-sm font-medium text-zinc-400 hover:text-white flex items-center justify-center gap-1 transition-colors">
              View All Members <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
