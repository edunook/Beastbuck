import { MapPin, Users, Activity, Plus, ArrowRight, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ChaptersHub() {
  const chapters = [
    { location: 'New York, USA', leader: 'Sarah Jenkins', members: 1240, programs: 3, status: 'Active', color: 'from-blue-500/20 to-cyan-500/10' },
    { location: 'London, UK', leader: 'James Holden', members: 890, programs: 2, status: 'Active', color: 'from-purple-500/20 to-pink-500/10' },
    { location: 'Tokyo, Japan', leader: 'Yuki Tanaka', members: 1560, programs: 5, status: 'Active', color: 'from-orange-500/20 to-red-500/10' },
    { location: 'Berlin, Germany', leader: 'Marcus Weber', members: 620, programs: 1, status: 'Growing', color: 'from-green-500/20 to-emerald-500/10' },
    { location: 'Sydney, AUS', leader: 'Chloe Chen', members: 430, programs: 2, status: 'Active', color: 'from-blue-500/20 to-indigo-500/10' },
    { location: 'Toronto, CAN', leader: 'Alex Rivera', members: 780, programs: 4, status: 'Active', color: 'from-pink-500/20 to-rose-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <span>Global Reach</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chapters Hub
            </h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Connect with local and regional BeastBuck chapters. Join a community near you or start your own.
            </p>
          </div>
          <button className="inline-flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20">
            <Plus className="w-5 h-5" />
            <span>Start a Chapter</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all p-6 backdrop-blur-sm">
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", chapter.color)} />
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    {chapter.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white">{chapter.location}</h3>
                  <p className="text-sm text-slate-400 flex items-center mt-1">
                    <Shield className="w-4 h-4 mr-1 opacity-70" /> Led by {chapter.leader}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Members</p>
                    <p className="text-lg font-semibold text-slate-200 flex items-center">
                      <Users className="w-4 h-4 mr-1.5 text-blue-400" />
                      {chapter.members.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Active Programs</p>
                    <p className="text-lg font-semibold text-slate-200 flex items-center">
                      <Activity className="w-4 h-4 mr-1.5 text-pink-400" />
                      {chapter.programs}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition-colors flex items-center justify-center group/btn">
                    View Chapter <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
