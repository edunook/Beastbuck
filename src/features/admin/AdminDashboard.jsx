import { useEffect, useState } from 'react';
import {
  Activity,
  Bot,
  CheckSquare,
  ClipboardList,
  FlaskConical,
  FolderKanban,
  Package,
  RefreshCw,
  Users,
  Wifi,
  Shield } from 'lucide-react';
import { AdminService } from '../../services/firebase/admin';
import { AdminMetric, AdminPanel, StatusBadge, LoadingRows } from './adminUtils';
import { formatDistanceToNow } from '../../lib/dateUtils';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const result = await AdminService.getDashboardData();
      setData(result);
    } catch (err) {
      console.error('Admin dashboard failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const metrics = data ? [
    { label: 'Total Members', value: data.metrics.totalMembers, icon: Users, color: 'accent' },
    { label: 'Online Now', value: data.metrics.onlineMembers, icon: Wifi, color: 'success' },
    { label: 'Active Projects', value: data.metrics.activeProjects, icon: FolderKanban, color: 'accent' },
    { label: 'Experiments', value: data.metrics.experiments, icon: FlaskConical, color: 'purple' },
    { label: 'Products', value: data.metrics.products, icon: Package, color: 'accent' },
    { label: 'Tasks', value: data.metrics.tasks, icon: CheckSquare, color: 'warning' },
    { label: 'Applications', value: data.metrics.applications, icon: ClipboardList, color: 'warning' },
    { label: 'AI Usage', value: data.metrics.aiUsage, icon: Bot, color: 'purple' },
  ] : [];

  const getAuditTypeColor = (type) => {
    if (type?.includes('XP')) return 'warning';
    if (type?.includes('ROLE')) return 'purple';
    if (type?.includes('SECURITY')) return 'danger';
    if (type?.includes('MEMBER')) return 'success';
    return 'accent';
  };

  const getActivityIcon = (type) => {
    const icons = {
      XP_CHANGED: '⚡',
      ROLE_CHANGED: '🛡️',
      MEMBER_UPDATED: '👤',
      CONTENT_MODERATED: '📋',
      SECURITY_CHANGED: '🔒',
      ACHIEVEMENT_GRANTED: '🏆',
      BADGE_GRANTED: '🎖️',
    };
    return icons[type] || '📌';
  };

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-section-title font-bold text-white">Platform Overview</h2>
          <p className="text-caption text-text-muted">Live stats across all BeastBuck systems</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-caption font-bold text-text-soft transition-all hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5 border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(m => <AdminMetric key={m.label} {...m} />)}
        </div>
      )}

      {/* Activity & Audit Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Recent Activity" icon={Activity}>
          {loading ? <LoadingRows count={4} /> : (
            <div className="space-y-2">
              {data?.recentActivity.length === 0 ? (
                <p className="py-6 text-center text-caption text-text-muted">No recent activity recorded.</p>
              ) : data?.recentActivity.map(item => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/15 hover:shadow-depth-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm">
                    📌
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-caption font-bold text-white">{item.title || item.type || 'Activity'}</p>
                    <p className="mt-0.5 truncate text-badge text-text-muted">{item.description || 'Activity recorded'}</p>
                  </div>
                  <span className="shrink-0 text-badge text-text-muted">
                    {item.timestamp ? formatDistanceToNow(item.timestamp) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Audit Trail" icon={ClipboardList}>
          {loading ? <LoadingRows count={4} /> : (
            <div className="space-y-2">
              {data?.auditLogs.length === 0 ? (
                <p className="py-6 text-center text-caption text-text-muted">No audit logs yet.</p>
              ) : data?.auditLogs.map(item => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/15 hover:shadow-depth-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-caption font-bold text-white">{item.summary || item.type}</p>
                      <StatusBadge variant={getAuditTypeColor(item.type)}>
                        {item.type?.replace(/_/g, ' ')}
                      </StatusBadge>
                    </div>
                    <p className="mt-0.5 truncate text-badge text-text-muted">
                      Target: {item.targetId || 'system'} · Actor: {item.actorId?.slice(0, 8)}…
                    </p>
                  </div>
                  <span className="shrink-0 text-badge text-text-muted">
                    {item.createdAt ? formatDistanceToNow(item.createdAt) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>

      {/* System Status */}
      <AdminPanel title="System Health" icon={Shield}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Firebase Auth', status: 'Operational', color: 'success' },
            { label: 'Firestore DB', status: 'Operational', color: 'success' },
            { label: 'Realtime DB', status: 'Operational', color: 'success' },
          ].map(({ label, status, color }) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/15">
              <span className="text-caption text-text-soft">{label}</span>
              <StatusBadge variant={color}>{status}</StatusBadge>
            </div>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}
