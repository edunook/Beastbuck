import { Globe, Users, Building, Map, Award, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function EcosystemHub() {
  const stats = [
    { label: 'Active Partners', value: '450+', icon: Users, color: 'text-blue-400' },
    { label: 'Global Chapters', value: '120', icon: Map, color: 'text-purple-400' },
    { label: 'Total Reach', value: '2.5M+', icon: Globe, color: 'text-green-400' },
    { label: 'Institutions', value: '85', icon: Building, color: 'text-orange-400' },
  ];

  const sections = [
    { title: 'Partner Directory', desc: 'Explore official BeastBuck partners.', icon: Users, color: 'from-blue-500/20 to-blue-600/10' },
    { title: 'Global Communities', desc: 'Connect with communities worldwide.', icon: Globe, color: 'from-purple-500/20 to-purple-600/10' },
    { title: 'Institution Directory', desc: 'Schools, Labs & Nonprofits.', icon: Building, color: 'from-orange-500/20 to-orange-600/10' },
    { title: 'Global Chapters', desc: 'Local and regional chapters.', icon: Map, color: 'from-green-500/20 to-green-600/10' },
    { title: 'Ambassador Network', desc: 'Leaders driving the ecosystem.', icon: Award, color: 'from-pink-500/20 to-pink-600/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium">
            <Globe className="w-4 h-4" />
            <span>Global Ecosystem</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ecosystem Hub
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            The central command for the BeastBuck global network. Explore partners, communities, and chapters worldwide.
          </p>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex items-center space-x-4 hover:border-slate-700 transition-colors">
              <div className={cn("p-3 rounded-xl bg-slate-800/50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:bg-slate-800/60 transition-all cursor-pointer backdrop-blur-md">
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", section.color)} />
              <div className="relative z-10">
                <section.icon className="w-8 h-8 mb-4 text-slate-300 group-hover:text-white transition-colors" />
                <h3 className="text-xl font-semibold mb-2 text-white">{section.title}</h3>
                <p className="text-slate-400 text-sm mb-6">{section.desc}</p>
                <div className="flex items-center text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
