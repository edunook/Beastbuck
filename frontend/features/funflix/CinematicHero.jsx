import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Play, Plus, Info, RefreshCw } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function CinematicHero() {
  const { user } = useAuth();
  const [currentMovie, setCurrentMovie] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const movies = [
    { id: 1, title: 'The AI Revolution', creator: 'Dr. Sarah Chen', views: '1.2M', likes: '45K', category: 'Science' },
    { id: 2, title: 'Startup Journey', creator: 'Alex Johnson', views: '890K', likes: '32K', category: 'Business' },
    { id: 3, title: 'Comedy Night', creator: 'Emma Williams', views: '2.1M', likes: '78K', category: 'Comedy' },
    { id: 4, title: 'Research Stories', creator: 'James Brown', views: '567K', likes: '21K', category: 'Education' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMovie((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const movie = movies[currentMovie];

  return (
    <PageContainer>
      <PageHeader 
        title="Cinematic Hero" 
        description="Auto-playing cinematic trailer with beautiful gradients and smooth animations."
        hero={true}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-[500px] bg-gradient-to-br from-purple-900 via-pink-800 to-cyan-900">
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center z-10">
                <h1 className="text-5xl font-bold text-white mb-4">{movie.title}</h1>
                <p className="text-xl text-white/80 mb-2">by {movie.creator}</p>
                <div className="flex items-center justify-center gap-6 text-white/70 mb-8">
                  <span>{movie.views} views</span>
                  <span>{movie.likes} likes</span>
                  <span>{movie.category}</span>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-white text-black hover:bg-white/90">
                    <Play className="h-5 w-5 mr-2" />
                    Watch Now
                  </Button>
                  <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    <Plus className="h-5 w-5 mr-2" />
                    Add to Watchlist
                  </Button>
                  <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    <Info className="h-5 w-5 mr-2" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 right-4">
              <Button variant="secondary" size="sm" onClick={() => setCurrentMovie((prev) => (prev + 1) % movies.length)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
