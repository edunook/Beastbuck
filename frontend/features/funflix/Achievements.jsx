import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Award, Film, Heart, Star, Trophy, Crown, Zap, Users, Mic, Eye, Laugh, BookOpen } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function Achievements() {
  const { user } = useAuth();

  const achievements = [
    { id: 'first', name: 'First Movie', icon: Film, color: 'purple', description: 'Upload your first movie', unlocked: true },
    { id: '100-views', name: '100 Views', icon: Eye, color: 'cyan', description: 'Reach 100 views', unlocked: true },
    { id: '1000-views', name: '1000 Views', icon: Eye, color: 'emerald', description: 'Reach 1000 views', unlocked: true },
    { id: '10000-views', name: '10000 Views', icon: Eye, color: 'amber', description: 'Reach 10000 views', unlocked: false },
    { id: 'comedy', name: 'Comedy King', icon: Laugh, color: 'pink', description: 'Win comedy challenge', unlocked: true },
    { id: 'story', name: 'Story Master', icon: BookOpen, color: 'red', description: 'Complete story challenge', unlocked: false },
    { id: 'director', name: 'Top Director', icon: Trophy, color: 'blue', description: 'Top 10 director', unlocked: false },
    { id: 'audience', name: 'Audience Favorite', icon: Heart, color: 'violet', description: 'Most liked creator', unlocked: false },
    { id: 'community', name: 'Community Choice', icon: Users, color: 'orange', description: 'Community favorite', unlocked: false },
    { id: 'legend', name: 'Creator Legend', icon: Crown, color: 'teal', description: 'Achieve legendary status', unlocked: false },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Achievements" 
        description="Achievement system for first movie, views, comedy king, story master, top director, audience favorite, community choice, and creator legend."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Card key={achievement.id} className={`transition-all ${achievement.unlocked ? 'hover:border-accent/50' : 'opacity-50'}`}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(achievement.color)} mb-4 ${!achievement.unlocked ? 'grayscale' : ''}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{achievement.name}</h3>
                  {achievement.unlocked && (
                    <Award className="h-5 w-5 text-accent" />
                  )}
                </div>
                <p className="text-text-muted text-sm">{achievement.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
