import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { History, Heart, Bookmark, Tag, Users, TrendingUp, Sparkles, Clock, Flame } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function Recommendations() {
  const { user } = useAuth();

  const sources = [
    { id: 'history', name: 'Watching History', icon: History, color: 'purple', count: 45 },
    { id: 'likes', name: 'Likes', icon: Heart, color: 'cyan', count: 23 },
    { id: 'bookmarks', name: 'Bookmarks', icon: Bookmark, color: 'emerald', count: 12 },
    { id: 'categories', name: 'Favorite Categories', icon: Tag, color: 'amber', count: 8 },
    { id: 'creators', name: 'Followed Creators', icon: Users, color: 'pink', count: 15 },
    { id: 'friends', name: 'Friends Activity', icon: Users, color: 'red', count: 34 },
    { id: 'trending', name: 'Trending', icon: TrendingUp, color: 'blue', count: 67 },
    { id: 'community', name: 'Community', icon: Sparkles, color: 'violet', count: 89 },
  ];

  const recommendations = [
    { id: 1, title: 'The AI Revolution', creator: 'Dr. Sarah Chen', reason: 'Based on your history', match: 95 },
    { id: 2, title: 'Startup Journey', creator: 'Alex Johnson', reason: 'Trending in Science', match: 88 },
    { id: 3, title: 'Comedy Night', creator: 'Emma Williams', reason: 'You liked similar', match: 92 },
    { id: 4, title: 'Research Stories', creator: 'James Brown', reason: 'From followed creators', match: 85 },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Recommendations" 
        description="AI-powered recommendations using watching history, likes, bookmarks, categories, creators, friends, trending, and community."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {sources.map((source) => {
          const Icon = source.icon;
          return (
            <Card key={source.id}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(source.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{source.name}</h3>
                <p className="text-accent font-bold">{source.count} Items</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Recommended for You</h3>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <div className="text-4xl">🎬</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{rec.title}</h3>
                  <p className="text-text-muted text-sm">{rec.creator}</p>
                  <p className="text-accent text-xs">{rec.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{rec.match}%</p>
                  <p className="text-text-muted text-xs">Match</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
