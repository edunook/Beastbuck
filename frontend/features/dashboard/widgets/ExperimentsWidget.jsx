import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, User, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

export function ExperimentsWidget() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadExperiments = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const data = await GamificationService.getActiveExperiments(user.uid);
        if (!cancelled) {
          setExperiments(data || []);
        }
      } catch (err) {
        console.warn('ExperimentsWidget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadExperiments();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">My Experiments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden h-full border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-cyan-950/15 to-blue-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FlaskConical className="h-4 w-4" />
          </div>
          Lab Experiments
        </CardTitle>
        <Link
          to="/experiments"
          className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors group/link"
        >
          <span>Open Lab</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {experiments.length === 0 ? (
          <div className="text-center py-6">
            <DynamicEmptyState type="experiments" title="No active experiments" subtitle="Launch your hypothesis and run cutting-edge tests!" />
            <Link
              to="/experiments"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              New Experiment
            </Link>
          </div>
        ) : (
          experiments.slice(0, 3).map((exp, index) => (
            <Link
              key={exp.id || index}
              to={`/experiments/${exp.id}`}
              className="group/item block p-3 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-cyan-500/[0.06] transition-all duration-300 hover:-translate-y-0.5"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 80}ms both` }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold text-white truncate group-hover/item:text-cyan-300 transition-colors">
                  {exp.name || exp.title || 'Untitled Experiment'}
                </h4>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black ${
                  exp.stage === 'Completed' ? 'bg-status-success/15 text-status-success border border-status-success/30' :
                  exp.stage === 'In Progress' ? 'bg-status-warning/15 text-status-warning border border-status-warning/30' :
                  'bg-white/10 text-text-muted border border-white/10'
                }`}>
                  {exp.stage || 'Active'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-text-muted mb-2">
                <User className="h-3 w-3 text-cyan-400" />
                <span>{exp.mentor || 'Self-directed Lab'}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                    style={{ width: `${exp.progress || 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-cyan-300 font-mono">{exp.progress || 0}%</span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}