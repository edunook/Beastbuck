import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '../../../components/ui/DashboardCard';
import { CheckSquare, Zap, FlaskConical, ArrowRight } from 'lucide-react';
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
    { label: 'My Tasks',     path: '/tasks',       variant: 'secondary' },
    { label: 'Experiments',  path: '/workspace/experiments', variant: 'secondary' },
    { label: 'AI Assistant', path: '/ai',          variant: 'secondary' },
  ];

  return (
    <Card className="h-full depth={1}" hoverable={true}>
      <CardHeader>
        <CardTitle className="text-caption font-medium text-text-muted flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map(({ label, path, variant }) => (
          <Button
            key={label}
            variant={variant}
            size="sm"
            className="w-full text-badge justify-between"
            onClick={() => navigate(path)}
          >
            {label}
            <ArrowRight className="w-3 h-3 opacity-50" />
          </Button>
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
