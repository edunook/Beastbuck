import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Play, Plus, Clock, Eye, Heart } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function HoverExperience() {
  const { user } = useAuth();
  const [hoveredMovie, setHoveredMovie] = useState(null);

  const movies = [
    { id: 1, title: 'The AI Revolution', creator: 'Dr. Sarah Chen', duration: '1h 45m', views: '1.2M', likes: '45K', thumbnail: '🎬' },
    { id: 2, title: 'Startup Journey', creator: 'Alex Johnson', duration: '2h 10m', views: '890K', likes: '32K', thumbnail: '🎥' },
    { id: 3, title: 'Comedy Night', creator: 'Emma Williams', duration: '1h 30m', views: '2.1M', likes: '78K', thumbnail: '😂' },
    { id: 4, title: 'Research Stories', creator: 'James Brown', duration: '1h 55m', views: '567K', likes: '21K', thumbnail: '🔬' },
    { id: 5, title: 'Adventure Time', creator: 'Lisa Anderson', duration: '2h 05m', views: '1.5M', likes: '56K', thumbnail: '🌍' },
    { id: 6, title: 'Music Vibes', creator: 'David Kim', duration: '1h 20m', views: '3.2M', likes: '120K', thumbnail: '🎵' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Hover Experience" 
        description="Desktop hover preview and mobile touch preview with smooth animations."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie) => (
          <Card 
            key={movie.id}
            className="hover:border-accent/50 transition-all cursor-pointer"
            onMouseEnter={() => setHoveredMovie(movie.id)}
            onMouseLeave={() => setHoveredMovie(null)}
          >
            <CardContent className="p-6">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-6xl mb-4 relative overflow-hidden">
                {movie.thumbnail}
                {hoveredMovie === movie.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-white mb-1">{movie.title}</h3>
              <p className="text-text-muted text-sm mb-4">{movie.creator}</p>
              <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{movie.views}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{movie.likes}</span>
                </div>
              </div>
              {hoveredMovie === movie.id && (
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Play className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
