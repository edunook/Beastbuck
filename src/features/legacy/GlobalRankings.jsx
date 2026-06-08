import React from 'react';
import { Globe, TrendingUp, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

const rankingCategories = [
  'Members', 'Teams', 'Labs', 'Departments', 'Ventures', 'Chapters'
];

import { GamificationService } from '../../services/firebase/gamification';

export default function GlobalRankings() {
  const [activeCategory, setActiveCategory] = React.useState('Members');
  const [rankings, setRankings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (activeCategory === 'Members') {
        try {
          const members = await GamificationService.getLeaderboard({ type: 'xp', maxCount: 20 });
          const mapped = members.map((m, i) => ({
            rank: i + 1,
            name: m.displayName || m.username || 'Anonymous',
            entityType: 'Member',
            score: m.xp || 0,
            trend: '+0%', // Can be calculated based on past logs if needed
            location: m.location || 'Global',
          }));
          setRankings(mapped);
        } catch (err) {
          console.error('Failed to load member rankings', err);
        }
      } else {
        // Fallback or empty state for other entities until they are fully integrated
        setRankings([]);
      }
      setLoading(false);
    }
    loadData();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Global Rankings</h1>
            </div>
            <p className="text-neutral-400 text-lg">Comprehensive leaderboard of impact scores across the BeastBuck network.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search rankings..." 
                className="bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder:text-neutral-600"
              />
            </div>
            <button className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 transition-colors">
              <Filter className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
          {rankingCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200",
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table List */}
        <div className="bg-neutral-900/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-depth-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-neutral-900/50 text-neutral-400 text-caption font-semibold uppercase tracking-wider">
                <th className="p-6 font-semibold w-24 text-center">Rank</th>
                <th className="p-6 font-semibold">Entity Name</th>
                <th className="p-6 font-semibold">Location</th>
                <th className="p-6 font-semibold text-right">Impact Score</th>
                <th className="p-6 font-semibold text-right">30d Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-neutral-500">Loading rankings...</td>
                </tr>
              ) : rankings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-neutral-500">No data available for {activeCategory} yet.</td>
                </tr>
              ) : rankings.map((item, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="p-6">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto text-lg",
                      item.rank === 1 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]" :
                      item.rank === 2 ? "bg-white/20 text-white border border-white/30" :
                      item.rank === 3 ? "bg-amber-700/20 text-amber-600 border border-amber-700/30" :
                      "bg-neutral-800 text-neutral-500"
                    )}>
                      {item.rank}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-lg text-neutral-100 group-hover:text-blue-400 transition-colors">{item.name}</div>
                    <div className="text-sm text-neutral-500 mt-1">{item.entityType}</div>
                  </td>
                  <td className="p-6 text-neutral-400">
                    {item.location}
                  </td>
                  <td className="p-6 text-right">
                    <span className="font-mono text-xl font-semibold text-neutral-100">{item.score.toLocaleString()}</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className={cn(
                      "inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium",
                      item.trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      <TrendingUp className={cn("w-4 h-4", item.trend.startsWith('-') && "rotate-180")} />
                      <span>{item.trend}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
