import { useState, useEffect } from 'react';
import { BookOpen, Clock, Zap, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { GamificationService } from '@services/firestore/gamification';

export function LearningJourneyWidget() {
  const { user } = useAuth();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadJourney = async () => {
      try {
        const data = await GamificationService.getLearningJourney(user.uid);
        setJourney(data);
      } catch (err) {
        console.log('Learning journey failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadJourney();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">Learning Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  if (!journey) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-sm transition-all duration-500 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <BookOpen className="text-green-400 animate-pulse" />
            Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicEmptyState type="generic" title="Start learning!" subtitle="Begin your first course to see progress here." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-sm transition-all duration-500 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <BookOpen className="text-green-400 animate-pulse" />
          Learning Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-green-500/50 transition-all duration-300">
          <h4 className="font-bold text-white line-clamp-2 mb-3">{journey.currentLesson || 'Continue Learning'}</h4>
          <div className="mb-3 flex items-center justify-between text-xs text-text-muted">
            <span>Progress</span>
            <span className="font-bold text-green-300">{journey.progress || 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${journey.progress || 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="text-[10px]" />
              <span>{journey.estimatedTime || '10 min'} left</span>
            </div>
            <span className="text-xs font-bold text-yellow-300">{journey.xpReward || 50} XP</span>
          </div>
          <button className="mt-3 w-full py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-300 hover:bg-green-500/20 transition-all duration-300 flex items-center justify-center gap-2">
            <Play className="text-[10px]" />
            <span>Resume</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}