import React from 'react';
import { Star, Trophy, Medal } from 'lucide-react';
import { cn } from '@shared/lib/utils';

const categories = [
  { id: 'research', label: 'Research Legends' },
  { id: 'innovation', label: 'Innovation Legends' },
  { id: 'venture', label: 'Venture Legends' },
  { id: 'community', label: 'Community Legends' },
];

const legends = [
  {
    id: 1,
    name: 'Dr. Elena Rostova',
    title: 'Chief Scientist',
    category: 'research',
    achievement: 'Pioneered the Neural Matrix framework.',
    year: 2024,
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: 2,
    name: 'Marcus Vance',
    title: 'Founder, AeroSpace X',
    category: 'venture',
    achievement: 'First commercial Mars payload delivery.',
    year: 2025,
    avatar: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: 3,
    name: 'Sarah Chen',
    title: 'Community Director',
    category: 'community',
    achievement: 'Grew the network to 10M active researchers.',
    year: 2023,
    avatar: 'https://i.pravatar.cc/150?u=3'
  },
  {
    id: 4,
    name: 'Nova Dynamics',
    title: 'Engineering Team',
    category: 'innovation',
    achievement: 'Developed the first stable fusion reactor prototype.',
    year: 2026,
    avatar: 'https://i.pravatar.cc/150?u=4'
  }
];

export default function HallOfFame() {
  const [activeTab, setActiveTab] = React.useState('research');

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />
          <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <h1 className="text-6xl font-black tracking-tight">
            Hall of <span className="bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent">Fame</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Honoring the titans and pioneers who forged the legacy of BeastBuck. Their achievements echo through eternity.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border",
                activeTab === cat.id 
                  ? "bg-yellow-500 text-black border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-neutral-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {legends.filter(l => l.category === activeTab || activeTab === 'all').map(legend => (
            <div key={legend.id} className="group relative rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-yellow-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]">
              
              <div className="h-32 bg-gradient-to-br from-neutral-800 to-neutral-950 relative">
                 <div className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 backdrop-blur-md">
                   <Star className="w-3 h-3 fill-yellow-500" />
                   <span>LEGEND</span>
                 </div>
              </div>
              
              <div className="px-6 pb-8 -mt-12 relative z-10 flex flex-col items-center text-center">
                <img 
                  src={legend.avatar} 
                  alt={legend.name} 
                  className="w-24 h-24 rounded-full border-4 border-neutral-900 object-cover shadow-xl mb-4 group-hover:scale-105 transition-transform duration-500"
                />
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">{legend.name}</h3>
                <p className="text-sm font-medium text-yellow-500/80 mb-4">{legend.title}</p>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-4" />
                
                <p className="text-sm text-neutral-400 line-clamp-3 mb-4">
                  {legend.achievement}
                </p>
                
                <div className="mt-auto pt-4 flex items-center space-x-2 text-neutral-500 text-sm font-semibold">
                  <Medal className="w-4 h-4" />
                  <span>Class of {legend.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
