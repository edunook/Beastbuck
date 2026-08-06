import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { List, Heart, Plane, FlaskConical, Clock, Star, Bookmark, PlayCircle, Laugh } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function Playlists() {
  const { user } = useAuth();

  const playlists = [
    { id: 'comedy', name: 'Comedy Collection', icon: Laugh, color: 'purple', count: 23, description: 'Best comedy videos' },
    { id: 'travel', name: 'Travel Collection', icon: Plane, color: 'cyan', count: 15, description: 'Adventure around the world' },
    { id: 'research', name: 'Research Stories', icon: FlaskConical, color: 'emerald', count: 18, description: 'Scientific discoveries' },
    { id: 'family', name: 'Family Memories', icon: Heart, color: 'amber', count: 12, description: 'Precious moments' },
    { id: 'weekend', name: 'Weekend Watch', icon: Clock, color: 'pink', count: 34, description: 'Perfect for weekends' },
    { id: 'favorites', name: 'Favorites', icon: Star, color: 'red', count: 45, description: 'All-time favorites' },
    { id: 'watchlater', name: 'Watch Later', icon: Bookmark, color: 'blue', count: 28, description: 'Save for later' },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Playlists" 
        description="Playlist creation including comedy collection, travel collection, research stories, family memories, weekend watch, favorites, and watch later."
        hero={true}
        action={
          <Button className="bg-purple-600 hover:bg-purple-700">
            <List className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => {
          const Icon = playlist.icon;
          return (
            <Card key={playlist.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(playlist.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{playlist.name}</h3>
                <p className="text-text-muted text-sm mb-4">{playlist.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-accent font-bold">{playlist.count} Videos</span>
                  <Button size="sm" variant="secondary">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
