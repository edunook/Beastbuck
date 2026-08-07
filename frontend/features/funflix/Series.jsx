import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Film, PlayCircle, Clock, ChevronRight, List } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function Series() {
  const { user } = useAuth();
  const [selectedSeries, setSelectedSeries] = useState(null);

  const series = [
    { id: 1, title: 'The AI Revolution', creator: 'Dr. Sarah Chen', seasons: 3, episodes: 24, totalDuration: '12h', poster: '🎬' },
    { id: 2, title: 'Startup Journey', creator: 'Alex Johnson', seasons: 2, episodes: 16, totalDuration: '8h', poster: '🚀' },
    { id: 3, title: 'Comedy Nights', creator: 'Emma Williams', seasons: 4, episodes: 32, totalDuration: '16h', poster: '😂' },
    { id: 4, title: 'Research Stories', creator: 'James Brown', seasons: 1, episodes: 8, totalDuration: '4h', poster: '🔬' },
  ];

  const episodes = [
    { id: 1, title: 'Introduction to AI', duration: '45m', watched: true },
    { id: 2, title: 'Machine Learning Basics', duration: '50m', watched: true },
    { id: 3, title: 'Neural Networks', duration: '55m', watched: false },
    { id: 4, title: 'Deep Learning', duration: '60m', watched: false },
    { id: 5, title: 'Applications', duration: '40m', watched: false },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Series" 
        description="Series management with seasons, episodes, collections, playlists, trailers, and automatic next episode."
        hero={true}
      />

      {!selectedSeries ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {series.map((item) => (
            <Card key={item.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-6xl mb-4">
                  {item.poster}
                </div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-text-muted text-sm mb-4">{item.creator}</p>
                <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    <span>{item.seasons} Seasons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{item.totalDuration}</span>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedSeries(item)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <List className="h-4 w-4 mr-2" />
                  View Episodes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <button onClick={() => setSelectedSeries(null)} className="text-text-muted hover:text-white">
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              {selectedSeries.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {episodes.map((episode) => (
                <div key={episode.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <div className={`p-3 rounded-xl ${episode.watched ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    <PlayCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{episode.title}</h3>
                    <p className="text-text-muted text-sm">{episode.duration}</p>
                  </div>
                  {episode.watched && (
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      Watched
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
