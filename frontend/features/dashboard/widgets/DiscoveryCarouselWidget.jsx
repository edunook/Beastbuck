import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, ShoppingBag, FlaskConical, BookOpen, Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

const DISCOVERY_TYPES = {
  ai: { label: 'Featured AI', icon: Sparkles, path: '/ai' },
  funflix: { label: 'FunFlix Highlight', icon: Play, path: '/funflix' },
  marketplace: { label: 'Marketplace Discovery', icon: ShoppingBag, path: '/marketplace' },
  experiment: { label: 'New Experiment', icon: FlaskConical, path: '/workspace/experiments' },
  research: { label: 'Interesting Research', icon: BookOpen, path: '/research' },
  creator: { label: 'Featured Creator', icon: Users, path: '/community' },
};

export function DiscoveryCarouselWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadDiscoveries = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const discoveries = await GamificationService.getDailyDiscoveries(user.uid);
        setItems(discoveries || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    
    loadDiscoveries();
  }, [user?.uid]);

  const nextIndex = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prevIndex = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  if (loading) {
    return (
      <Card className="group h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Discover Something New
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 animate-pulse rounded-xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="group h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
            <div className="relative h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500/20">
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
            Discover Something New
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicEmptyState 
            type="generic"
            title="Discovery coming soon!" 
            subtitle="New amazing content discovered daily." 
          />
        </CardContent>
      </Card>
    );
  }

  const currentItem = items[currentIndex];
  const config = DISCOVERY_TYPES[currentItem.type] || DISCOVERY_TYPES.ai;
  const Icon = config.icon;

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500/20">
              <Icon className="h-4 w-4 text-cyan-400" />
            </div>
            {config.label}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevIndex}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
              disabled={items.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={nextIndex}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
              disabled={items.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 rounded-xl overflow-hidden border border-white/10 mb-3">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
          <div className="relative p-4 flex flex-col h-full justify-between">
            <div>
              <h4 className="font-bold text-white text-base line-clamp-2 mb-2">{currentItem.title}</h4>
              {currentItem.creator && (
                <p className="text-xs text-cyan-300">by {currentItem.creator}</p>
              )}
            </div>
            <div>
              <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-medium text-text-muted">
                {currentItem.category || 'Featured'}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => navigate(config.path)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300"
        >
          <span>Explore</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-3">
            {items.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-4 bg-cyan-400' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}