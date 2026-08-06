import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Film, TrendingUp, Clock, Play, Eye, Heart } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function FunFlixPreview() {
  const { user } = useAuth();

  const videos = [
    { id: 1, title: 'Comedy Shorts', type: 'Trending', views: 12345, likes: 2345, thumbnail: '🎬' },
    { id: 2, title: 'Tech Tutorial Series', type: 'Recently Uploaded', views: 8901, likes: 1567, thumbnail: '📺' },
    { id: 3, title: 'Challenge Entry', type: 'Challenges', views: 5678, likes: 890, thumbnail: '🏆' },
    { id: 4, title: 'Documentary', type: 'Continue Watching', views: 3456, likes: 567, thumbnail: '🎥' },
  ];

  const getTypeColor = (type) => {
    const colors = {
      Trending: 'bg-amber-500/10 text-amber-400',
      'Recently Uploaded': 'bg-blue-500/10 text-blue-400',
      Challenges: 'bg-purple-500/10 text-purple-400',
      'Continue Watching': 'bg-emerald-500/10 text-emerald-400',
    };
    return colors[type] || colors.Trending;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="FunFlix Preview" 
        description="Video preview showing latest public or member-only videos based on permissions, trending, recently uploaded, challenges, and continue watching."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="hover:border-accent/50 transition-all">
            <CardContent className="p-6">
              <div className="text-5xl mb-4 text-center">{video.thumbnail}</div>
              <h3 className="font-bold text-white text-lg mb-2">{video.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTypeColor(video.type)}`}>
                {video.type}
              </span>
              <div className="flex gap-4 text-sm text-text-muted mt-4 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{video.likes.toLocaleString()}</span>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
