import { Award, Star, TrendingUp, Trophy, UserPlus, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AmbassadorHub() {
  const ambassadors = [
    { name: 'Elena Rodriguez', level: 'Global Ambassador', points: 12500, region: 'Europe', trend: '+15%' },
    { name: 'David Kim', level: 'Senior Ambassador', points: 9800, region: 'Asia-Pacific', trend: '+8%' },
    { name: 'Sarah Jenkins', level: 'Regional Ambassador', points: 7200, region: 'North America', trend: '+12%' },
    { name: 'Omar Hassan', level: 'Regional Ambassador', points: 6400, region: 'Middle East', trend: '+5%' },
    { name: 'Anita Patel', level: 'Senior Ambassador', points: 8900, region: 'South Asia', trend: '+22%' },
  ].sort((a, b) => b.points - a.points);

  const levels = [
    { title: 'Global Ambassador', req: '10,000+ pts', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Senior Ambassador', req: '5,000+ pts', icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Regional Ambassador', req: '1,000+ pts', icon: Award, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-sm font-medium">
              <Star className="w-4 h-4" />
              <span>Leadership Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Ambassador Hub
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Recognizing our top community builders globally. Climb the ranks and earn exclusive perks.
            </p>
          </div>
          <button className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20">
            <UserPlus className="w-5 h-5" />
            <span>Apply Now</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {levels.map((lvl, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex items-center space-x-4">
              <div className={cn("p-4 rounded-xl", lvl.bg, lvl.color)}>
                <lvl.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{lvl.title}</h3>
                <p className="text-sm text-slate-400 font-medium">Requires {lvl.req}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-orange-400" />
              Global Leaderboard
            </h2>
            <span className="text-sm text-slate-400">Based on Community Metrics</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Ambassador</th>
                  <th className="px-6 py-4 font-medium">Level</th>
                  <th className="px-6 py-4 font-medium">Region</th>
                  <th className="px-6 py-4 font-medium text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {ambassadors.map((amb, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        i === 1 ? "bg-slate-400/20 text-slate-300" :
                        i === 2 ? "bg-orange-600/20 text-orange-400" : "text-slate-500"
                      )}>
                        #{i + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">{amb.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                        {amb.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{amb.region}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-white">{amb.points.toLocaleString()}</div>
                      <div className="text-xs text-green-400">{amb.trend}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-800 text-center">
            <button className="text-sm text-slate-400 hover:text-white font-medium inline-flex items-center transition-colors">
              View Full Leaderboard <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
