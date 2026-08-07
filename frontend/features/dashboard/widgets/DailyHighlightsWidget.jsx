import { useState, useEffect } from 'react';
import { Star, Flame, Trophy, Bolt, BookOpen, FlaskConical, Gamepad2, Palette, Bot, ShoppingBag, Users, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { GamificationService } from '@services/firestore/gamification';

const HIGHLIGHT_TYPES = [
  { id: 'project', label: 'Featured Project', icon: Palette, color: 'from-purple-500/20 to-pink-500/20' },
  { id: 'ai', label: 'Popular AI', icon: Bot, color: 'from-accent/20 to-cyan-500/20' },
  { id: 'funflix', label: 'Trending FunFlix', icon: Gamepad2, color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'challenge', label: 'Community Challenge', icon: Trophy, color: 'from-yellow-500/20 to-orange-500/20' },
  { id: 'experiment', label: 'Interesting Experiment', icon: FlaskConical, color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 'event', label: 'New Event', icon: Users, color: 'from-purple-500/20 to-indigo-500/20' },
  { id: 'showcase', label: 'Outstanding Showcase', icon: Star, color: 'from-yellow-500/20 to-pink-500/20' },
  { id: 'leaderboard', label: 'Leaderboard Movement', icon: Bolt, color: 'from-orange-500/20 to-yellow-500/20' },
];

export function DailyHighlightsWidget() {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadHighlights = async () => {
      try {
        const data = await GamificationService.getDailyHighlights(user.uid);
        setHighlights(data || []);
      } catch (err) {
        console.log('Daily highlights failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHighlights();
  }, [user?.uid]);

  useEffect(() => {
    if (highlights.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [highlights.length]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Daily Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse rounded-xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  const current = highlights[currentIndex];
  if (!current) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm transition-all duration-500 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Daily Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicEmptyState type="generic" title="Check back soon!" subtitle="New highlights appear every day." />
        </CardContent>
      </Card>
    );
  }

  const config = HIGHLIGHT_TYPES.find(t => t.id === current.type) || HIGHLIGHT_TYPES[0];
  const Icon = config.icon;

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm transition-all duration-500 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <Star className="text-yellow-400 animate-pulse" />
          Daily Highlights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`relative rounded-xl border border-white/10 bg-gradient-to-br ${config.color} p-5 transition-all duration-500`}>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">{config.label}</span>
              <h4 className="font-bold text-white mt-1 line-clamp-2">{current.title}</h4>
              <p className="text-xs text-text-soft mt-1">{current.description}</p>
            </div>
          </div>
        </div>
        {highlights.length > 1 && (
          <div className="flex gap-1 mt-3">
            {highlights.map((_, i) => (
              <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-300 ${i === currentIndex ? 'bg-purple-400' : 'bg-white/10'}`} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}