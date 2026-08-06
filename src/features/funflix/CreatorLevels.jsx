import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Star, Award, Crown, Sparkles, Trophy, Zap, Flame, Gem, Compass, Heart, BookOpen } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function CreatorLevels() {
  const { user } = useAuth();

  const levels = [
    { id: 'new', name: 'New Creator', icon: Star, color: 'gray', xp: 0, description: 'Just starting your journey' },
    { id: 'rising', name: 'Rising Star', icon: Sparkles, color: 'cyan', xp: 1000, description: 'Gaining momentum' },
    { id: 'explorer', name: 'Creative Explorer', icon: Compass, color: 'emerald', xp: 5000, description: 'Exploring creativity' },
    { id: 'popular', name: 'Popular Creator', icon: Heart, color: 'amber', xp: 15000, description: 'Building an audience' },
    { id: 'storyteller', name: 'Top Storyteller', icon: BookOpen, color: 'pink', xp: 35000, description: 'Master storyteller' },
    { id: 'legend', name: 'Creative Legend', icon: Trophy, color: 'purple', xp: 75000, description: 'Legendary creator' },
    { id: 'icon', name: 'FunFlix Icon', icon: Crown, color: 'red', xp: 150000, description: 'Platform icon' },
    { id: 'master', name: 'Entertainment Master', icon: Gem, color: 'violet', xp: 300000, description: 'Master of entertainment' },
  ];

  const getColorClass = (color) => {
    const colors = {
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
    };
    return colors[color] || colors.gray;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Creator Levels" 
        description="Creator progression system with 8 levels from New Creator to Entertainment Master."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {levels.map((level) => {
          const Icon = level.icon;
          return (
            <Card key={level.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(level.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{level.name}</h3>
                <p className="text-text-muted text-sm mb-2">{level.description}</p>
                <p className="text-accent font-bold">{level.xp.toLocaleString()} XP</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
