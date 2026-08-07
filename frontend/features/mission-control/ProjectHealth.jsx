import { useEffect, useState, useMemo } from 'react';
import { Activity, RefreshCw, Calendar, Target, CheckSquare } from 'lucide-react';
import { MissionControlService } from '@services/firestore/missionControl';
import { IntelligencePanel, LoadingRows, HealthBadge } from './missionControlUtils';
import { formatDistanceToNow, formatDate } from '@shared/lib/dateUtils';
import { Link } from 'react-router-dom';

export default function ProjectHealth() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await MissionControlService.getProjectHealth();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load project health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      healthy: projects.filter(p => p.health.label === 'Healthy').length,
      needsAttention: projects.filter(p => p.health.label === 'Needs Attention').length,
      atRisk: projects.filter(p => p.health.label === 'At Risk').length,
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Project Health Matrix</h2>
          <p className="text-xs text-text-muted">Algorithms analyze progress, deadlines, tasks, and activity to assign a 0-100 score.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-bold text-text-soft hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {!loading && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-surface/50 p-4">
            <p className="text-xs font-bold text-text-muted">Total Active</p>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-status-success/20 bg-status-success/5 p-4">
            <p className="text-xs font-bold text-status-success">Healthy</p>
            <p className="text-2xl font-black text-status-success">{stats.healthy}</p>
          </div>
          <div className="rounded-xl border border-status-warning/20 bg-status-warning/5 p-4">
            <p className="text-xs font-bold text-status-warning">Needs Attention</p>
            <p className="text-2xl font-black text-status-warning">{stats.needsAttention}</p>
          </div>
          <div className="rounded-xl border border-status-danger/20 bg-status-danger/5 p-4">
            <p className="text-xs font-bold text-status-danger">At Risk</p>
            <p className="text-2xl font-black text-status-danger">{stats.atRisk}</p>
          </div>
        </div>
      )}

      <IntelligencePanel title="Health Radar" icon={Activity}>
        {loading ? <LoadingRows count={5} /> : (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-sm text-text-muted">No active projects found.</p>
            ) : projects.map((p) => {
              const lastUpdate = p.updatedAt?.toDate ? p.updatedAt.toDate() : new Date(p.createdAt);
              const isOverdue = p.targetDate && new Date(p.targetDate) < new Date() && p.progressPercent < 100;

              return (
                <div key={p.id} className="rounded-xl border border-border/60 bg-black/20 p-4 transition-all hover:bg-black/40">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <HealthBadge score={p.health.score} />
                        <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                          {p.status}
                        </span>
                      </div>
                      <Link to={`/workspace/projects/${p.id}`} className="mt-2 block truncate font-bold text-white hover:text-accent">
                        {p.title}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-xs text-text-muted">{p.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 border-t border-border/40 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1 mb-1">
                        <Target className="h-3 w-3" /> Progress
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-accent transition-all" style={{ width: `${p.progressPercent || 0}%` }} />
                        </div>
                        <span className="text-xs font-bold text-white">{p.progressPercent || 0}%</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" /> Target Date
                      </p>
                      <p className={`text-xs font-bold ${isOverdue ? 'text-status-danger' : 'text-white'}`}>
                        {p.targetDate ? formatDate(p.targetDate) : 'Not set'}
                        {isOverdue && ' (Overdue)'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1 mb-1">
                        <RefreshCw className="h-3 w-3" /> Last Active
                      </p>
                      <p className="text-xs text-white">{formatDistanceToNow(lastUpdate)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1 mb-1">
                        <CheckSquare className="h-3 w-3" /> Tasks
                      </p>
                      <p className="text-xs text-white">
                        {p.tasks?.length ? `${p.tasks.filter(t => t.status === 'COMPLETED').length} / ${p.tasks.length} completed` : 'No tasks'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </IntelligencePanel>
    </div>
  );
}
