import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '../../../components/ui/DashboardCard';
import { CheckSquare, Zap, FlaskConical, ArrowRight, Target, Rocket, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { TasksService } from '../../../services/firebase/tasks';
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
    }).catch(() => setStats({ total: 0, highPriority: 0, subtitle: 'Could not load' }));
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

  const actions = [
    { label: 'My Tasks',     path: '/tasks',       icon: CheckSquare, color: 'from-accent to-cyan-500' },
    { label: 'Experiments',  path: '/workspace/experiments', icon: FlaskConical, color: 'from-purple-500 to-pink-500' },
    { label: 'AI Assistant', path: '/ai',          icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-accent/5 to-purple-500/5 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map(({ label, path, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="group/action relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all duration-300 hover:border-accent/50 hover:bg-white/10 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-all duration-500 group-hover/action:opacity-100 group-hover/action:translate-x-full" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-accent/10 to-purple-500/10 flex items-center justify-center border border-accent/20 transition-all duration-300 group-hover/action:scale-110 group-hover/action:shadow-lg group-hover/action:shadow-accent/30">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <span className="font-bold text-white group-hover/action:text-accent transition-colors">{label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted transition-all duration-300 group-hover/action:translate-x-1 group-hover/action:text-accent" />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export function TrendingExperimentsPanel() {
  return (
    <DashboardCard
      title="Experiments"
      icon={FlaskConical}
      value="-"
      subtitle="Coming soon"
      trend="Launching next"
      trendUp={true}
      depth={1}
    />
  );
}
