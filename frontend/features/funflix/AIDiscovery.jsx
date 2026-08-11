import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Sparkles, TrendingDown, TrendingUp, User, Award, Calendar, Flame, Gem } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function AIDiscovery() {
  const { user } = useAuth();

  const discoveries = [
    { id: 'hidden', name: 'Hidden Gems', icon: Gem, color: 'purple', count: 45, description: 'Underrated masterpieces' },
    { id: 'underrated', name: 'Underrated Movies', icon: TrendingDown, color: 'cyan', count: 67, description: 'Deserve more attention' },
    { id: 'new', name: 'New Creators', icon: User, color: 'emerald', count: 89, description: 'Fresh talent' },
    { id: 'popular', name: 'Popular Categories', icon: TrendingUp, color: 'amber', count: 23, description: 'Trending now' },
    { id: 'upcoming', name: 'Upcoming Premieres', icon: Calendar, color: 'pink', count: 12, description: 'Coming soon' },
    { id: 'challenges', name: 'Challenge Entries', icon: Flame, color: 'red', count: 156, description: 'Competition highlights' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Discovery" 
        description="AI recommendations for hidden gems, underrated movies, new creators, popular categories, upcoming premieres, and challenge entries."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {discoveries.map((discovery) => {
          const Icon = discovery.icon;
          return (
            <Card key={discovery.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(discovery.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{discovery.name}</h3>
                <p className="text-text-muted text-sm mb-4">{discovery.description}</p>
                <span className="text-accent font-bold">{discovery.count} Items</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
