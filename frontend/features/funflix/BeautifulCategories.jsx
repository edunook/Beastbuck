import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Smile, Film, Drama, Zap, FlaskConical, GraduationCap, Cpu, Palette, Globe, Skull, Compass, Plane, Gamepad2, Music, Trophy, Heart, Video, Sparkles, BriefcaseBusiness, Rocket, Laugh, Camera, Target, Bot, Plus } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function BeautifulCategories() {
  const { user } = useAuth();

  const categories = [
    { id: 'comedy', name: 'Comedy', icon: Smile, color: 'purple' },
    { id: 'funny', name: 'Funny Moments', icon: Laugh, color: 'cyan' },
    { id: 'mini', name: 'Mini Movies', icon: Film, color: 'emerald' },
    { id: 'drama', name: 'Drama', icon: Drama, color: 'amber' },
    { id: 'action', name: 'Action', icon: Zap, color: 'pink' },
    { id: 'science', name: 'Science', icon: FlaskConical, color: 'red' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: 'blue' },
    { id: 'tech', name: 'Technology', icon: Cpu, color: 'violet' },
    { id: 'animation', name: 'Animation', icon: Palette, color: 'orange' },
    { id: 'documentary', name: 'Documentary', icon: Globe, color: 'teal' },
    { id: 'horror', name: 'Horror', icon: Skull, color: 'rose' },
    { id: 'adventure', name: 'Adventure', icon: Compass, color: 'indigo' },
    { id: 'travel', name: 'Travel', icon: Plane, color: 'sky' },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'lime' },
    { id: 'music', name: 'Music', icon: Music, color: 'fuchsia' },
    { id: 'sports', name: 'Sports', icon: Trophy, color: 'yellow' },
    { id: 'lifestyle', name: 'Lifestyle', icon: Heart, color: 'pink' },
    { id: 'vlogs', name: 'Vlogs', icon: Video, color: 'cyan' },
    { id: 'experiments', name: 'Experiments Innovation', icon: Sparkles, color: 'purple' },
    { id: 'bts', name: 'Behind The Scenes', icon: Camera, color: 'amber' },
    { id: 'challenges', name: 'Challenges', icon: Target, color: 'red' },
    { id: 'research', name: 'Research Stories', icon: FlaskConical, color: 'emerald' },
    { id: 'projects', name: 'Projects', icon: BriefcaseBusiness, color: 'blue' },
    { id: 'startups', name: 'Startups', icon: Rocket, color: 'violet' },
    { id: 'ai', name: 'AI', icon: Bot, color: 'pink' },
    { id: 'open', name: 'Open Category', icon: Plus, color: 'gray' },
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
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      lime: 'bg-lime-500/20 border-lime-500/30 text-lime-400',
      fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Beautiful Categories" 
        description="Comprehensive category system covering all video types."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(category.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white">{category.name}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
