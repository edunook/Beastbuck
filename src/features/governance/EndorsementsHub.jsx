import { Star, MessageSquareQuote, TrendingUp, Medal } from 'lucide-react';

const recentEndorsements = [
  { id: 1, from: 'Alex Dev', to: 'Sarah Jenkins', skill: 'React Engineering', msg: 'Outstanding work on the new dashboard architecture. Incredibly clean code.', time: '2 hours ago' },
  { id: 2, from: 'Marcus T', to: 'Elena R', skill: 'Community Leadership', msg: 'Elena always steps up to help newcomers navigate the platform. A true asset.', time: '5 hours ago' },
  { id: 3, from: 'System', to: 'David K', skill: 'Security Auditing', msg: 'Successfully patched 3 critical vulnerabilities during the latest bounty program.', time: '1 day ago' },
];

const topEndorsed = [
  { name: 'Sarah Jenkins', score: 142, topSkill: 'React' },
  { name: 'Elena R', score: 118, topSkill: 'Leadership' },
  { name: 'Mike Chen', score: 95, topSkill: 'UI/UX' },
];

export default function EndorsementsHub() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
            <Star className="text-yellow-400 fill-yellow-400" /> Endorsements
          </h1>
          <p className="text-zinc-400 mt-2">Recognize and celebrate the skills of your peers.</p>
        </div>
        <button className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-white/10 flex items-center gap-2">
          <MessageSquareQuote size={20} />
          Endorse a Colleague
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-zinc-300 flex items-center gap-2">
            <TrendingUp className="text-blue-400" /> Recent Activity
          </h2>
          
          <div className="space-y-4">
            {recentEndorsements.map((item) => (
              <div key={item.id} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:bg-zinc-800/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm">
                    <span className="font-bold text-white">{item.from}</span>
                    <span className="text-zinc-500 mx-2">endorsed</span>
                    <span className="font-bold text-blue-400">{item.to}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{item.time}</span>
                </div>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-md border border-zinc-700">
                    {item.skill}
                  </span>
                </div>
                
                <div className="relative">
                  <MessageSquareQuote className="absolute -top-1 -left-2 w-6 h-6 text-zinc-700/50 -z-10" />
                  <p className="text-zinc-400 italic pl-4 border-l-2 border-zinc-700 text-sm leading-relaxed">
                    "{item.msg}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-300 flex items-center gap-2">
            <Medal className="text-amber-400" /> Top Endorsed
          </h2>
          
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-900/50 rounded-2xl border border-zinc-800/50 p-1">
            {topEndorsed.map((user, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs border border-zinc-700">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-blue-400">{user.topSkill}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md text-yellow-500 font-bold text-sm">
                  <Star size={14} className="fill-yellow-500" /> {user.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
