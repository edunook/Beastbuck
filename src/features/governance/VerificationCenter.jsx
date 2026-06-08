import { Shield, Code, Lightbulb, PenTool, Award, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const verifications = [
  { id: 'identity', title: 'Identity Verified', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Confirm your real-world identity to increase trust.' },
  { id: 'skill', title: 'Skill Verified', icon: Code, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Pass technical assessments to prove your expertise.' },
  { id: 'founder', title: 'Founder', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Recognized for creating successful ecosystem projects.' },
  { id: 'mentor', title: 'Mentor', icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'Help guide and onboard new community members.' },
  { id: 'creator', title: 'Creator', icon: PenTool, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', desc: 'Produce high-quality content for the community.' },
];

export default function VerificationCenter() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 text-center md:text-left">
          <p className="text-zinc-400 font-medium uppercase tracking-widest text-sm mb-2">Current Trust Level</p>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600">Gold</h1>
            <CheckCircle className="text-amber-400 w-8 h-8" />
          </div>
        </div>
        <div className="relative z-10 text-zinc-400 text-sm max-w-xs text-center md:text-right">
          Unlock higher trust levels by collecting more verification badges below.
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white px-2">Available Verifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifications.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className={cn("relative flex flex-col bg-zinc-900/60 backdrop-blur-xl border rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl", item.border, "hover:bg-zinc-800/80")}>
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6", item.bg)}>
                  <Icon className={cn("w-7 h-7", item.color)} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm flex-grow mb-6">{item.desc}</p>
                <button className={cn("w-full py-2.5 rounded-lg font-semibold text-sm transition-colors border", item.bg, item.color, item.border, "hover:opacity-80")}>
                  Apply for Verification
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
