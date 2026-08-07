import { useState, useEffect } from 'react';
import { FlaskConical, Calendar, User, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { GamificationService } from '@services/firestore/gamification';

export function ExperimentsWidget() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadExperiments = async () => {
      try {
        const data = await GamificationService.getActiveExperiments(user.uid);
        setExperiments(data || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    loadExperiments();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">My Experiments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <FlaskConical className="text-cyan-400 animate-pulse" />
          My Experiments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {experiments.length === 0 ? (
          <DynamicEmptyState type="experiments" title="No experiments yet" subtitle="Time to discover something new!" />
        ) : (
          <div className="space-y-3">
            {experiments.map((exp, index) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/50 hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{exp.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                      <User className="text-[10px]" />
                      <span>{exp.mentor || 'Self-directed'}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${exp.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-cyan-300">{exp.progress || 0}%</span>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold ${
                    exp.stage === 'Completed' ? 'bg-status-success/10 text-status-success' :
                    exp.stage === 'In Progress' ? 'bg-status-warning/10 text-status-warning' :
                    'bg-white/10 text-text-muted'
                  }`}>
                    {exp.stage || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}