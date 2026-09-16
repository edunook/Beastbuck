import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@frontend/components/ui/DashboardCard';
import { CheckSquare, Zap, FlaskConical, ArrowRight, Sparkles, Crown, Palette, Film, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { TasksService } from '@services/firestore/tasks';
import { useAuth } from '../../auth/AuthContext';

export function ActiveTasksPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, highPriority: 0, subtitle: 'Loading...' });

  useEffect(() => {
    if (!user) return;
    TasksService.getTasksForUser(user.uid).then(tasks => {
      const active = tasks.filter(t => ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(t.status));
      const high   = active.filter(t => ['HIGH', 'URGENT'].includes(t.priority));
      setStats({
        total: active.length,
        highPriority: high.length,
        subtitle: high.length > 0 ? `${high.length} high priority` : 'All on track',
      });
    }).catch(() => setStats({ total: 0, highPriority: 0, subtitle: 'Tasks ready' }));
  }, [user]);

  return (
    <DashboardCard
      title="Active Tasks"
      icon={CheckSquare}
      value={String(stats.total)}
      subtitle={stats.subtitle}
      trend={stats.highPriority > 0 ? `${stats.highPriority} urgent` : 'On track'}
      trendUp={stats.highPriority === 0}
      depth={1}
    />
  );
}

export function QuickActionsPanel() {
  const navigate = useNavigate();
  const { roleData } = useAuth();

  const isApproved = roleData?.membershipStatus === 'approved';
  const isCeo = roleData?.role === 'Main CEO' || roleData?.role === 'Co-CEO';

  const actions = [];

  if (!isApproved && !isCeo) {
    actions.push({
      label: 'Apply for Membership',
      path: '/membership/apply',
      icon: Sparkles,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    });
  }

  actions.push({
    label: 'Tasks & Missions',
    path: '/tasks',
    icon: CheckSquare,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  });

  actions.push({
    label: 'Creative Studio',
    path: '/creative',
    icon: Palette,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  });

  actions.push({
    label: 'FunFlix Cinema',
    path: '/funflix',
    icon: Film,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  });

  actions.push({
    label: 'Experiments Lab',
    path: '/experiments',
    icon: FlaskConical,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  });

  if (isCeo) {
    actions.push({
      label: 'CEO Command Board',
      path: '/ceo-panel',
      icon: Crown,
      color: 'text-amber-300 bg-amber-500/15 border-amber-400/40',
    });
  }

  return (
    <Card className="group relative overflow-hidden h-full border border-accent/20 bg-gradient-to-br from-slate-900/90 via-purple-950/15 to-cyan-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent">
          <div className="p-1.5 rounded-xl bg-accent/10 border border-accent/30 text-accent">
            <Zap className="h-4 w-4" />
          </div>
          Quick Teleport
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map(({ label, path, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="group/action relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-2.5 text-left transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover/action:scale-105 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-white group-hover/action:text-accent transition-colors">{label}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-text-muted transition-all duration-300 group-hover/action:translate-x-0.5 group-hover/action:text-accent" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export function TrendingExperimentsPanel() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadExperiments() {
      if (!user?.uid) return;
      try {
        const { ExperimentsService } = await import('@services/firestore/experiments');
        const nextExperiments = await ExperimentsService.searchExperiments({});
        if (!cancelled) setExperiments(nextExperiments.slice(0, 5));
      } catch (err) {
      }
    }

    loadExperiments();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return (
    <DashboardCard
      title="Experiments"
      icon={FlaskConical}
      value={experiments.length}
      subtitle="Total experiments"
      trend={experiments.length > 0 ? `${experiments.length} active` : 'No experiments yet'}
      trendUp={experiments.length > 0}
      depth={1}
    />
  );
}
