import { useEffect, useMemo, useState } from 'react';
import {
  Activity, BarChart3, TrendingUp, Users, FlaskConical, Package,
  RefreshCw, Zap } from 'lucide-react';
import { AdminService } from '@services/firestore/admin';
import { AdminMetric, AdminPanel, LoadingRows } from './adminUtils';

// Simple bar chart renderer
function BarChart({ data, height = 80, color = 'rgba(0,240,255,0.7)', label }) {
  if (!data || data.length === 0) return <p className="text-sm text-text-muted">No data</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      {label && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>}
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex-1 flex flex-col items-center justify-end">
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${Math.max((d.value / max) * height, d.value > 0 ? 4 : 0)}px`,
                background: color,
                opacity: 0.7 + (i / data.length) * 0.3,
              }}
            />
            <div className="absolute -top-6 hidden rounded bg-black px-1.5 py-0.5 text-[10px] text-white group-hover:block">
              {d.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-text-muted">
        {data.map((d, i) => (
          <span key={i} className="flex-1 truncate text-center">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function groupByMonth(items, dateField = 'createdAt') {
  const counts = {};
  const now = new Date();
  // last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    counts[key] = 0;
  }
  for (const item of items) {
    try {
      let d;
      const val = item[dateField];
      if (val && typeof val.toDate === 'function') d = val.toDate();
      else if (val) d = new Date(val);
      else continue;
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      if (key in counts) counts[key]++;
    } catch {
      continue;
    }
  }
  return Object.entries(counts).map(([label, value]) => ({ label: label.split(' ')[0], value }));
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      setData(await AdminService.getAnalytics());
    } catch (err) {
      console.error('Admin analytics failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    if (!data) return [];
    const totalXP = data.members.reduce((sum, m) => sum + Number(m.xp || 0), 0);
    const activeMembers = data.members.filter(m => !m.suspended && !m.removed).length;
    return [
      { label: 'Total Members', value: data.members.length, icon: Users, color: 'accent' },
      { label: 'Active Members', value: activeMembers, icon: Users, color: 'success' },
      { label: 'Total Projects', value: data.projects.length, icon: TrendingUp, color: 'accent' },
      { label: 'Experiments', value: data.experiments.length, icon: FlaskConical, color: 'purple' },
      { label: 'Products', value: data.products.length, icon: Package, color: 'accent' },
      { label: 'Total XP Awarded', value: totalXP.toLocaleString(), icon: Zap, color: 'warning' },
      { label: 'XP Log Entries', value: data.xpLogs.length, icon: BarChart3, color: 'accent' },
      { label: 'Activity Logs', value: data.activity.length, icon: Activity, color: 'accent' },
    ];
  }, [data]);

  const memberGrowth = useMemo(() => data ? groupByMonth(data.members) : [], [data]);
  const projectGrowth = useMemo(() => data ? groupByMonth(data.projects) : [], [data]);
  const xpGrowth = useMemo(() => data ? groupByMonth(data.xpLogs) : [], [data]);
  const activityGrowth = useMemo(() => data ? groupByMonth(data.activity, 'timestamp') : [], [data]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    if (!data) return [];
    const counts = {};
    for (const m of data.members) {
      const r = m.role || 'Unknown';
      counts[r] = (counts[r] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [data]);

  // Top XP earners
  const topEarners = useMemo(() => {
    if (!data) return [];
    return [...data.members]
      .filter(m => m.xp > 0)
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, 5);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Platform Analytics</h2>
          <p className="text-xs text-text-muted">Growth metrics, activity trends, and member stats</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-bold text-text-soft hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(m => <AdminMetric key={m.label} {...m} />)}
        </div>
      )}

      {/* Growth Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Member Growth" icon={Users}>
          {loading ? <LoadingRows count={1} /> : (
            <BarChart
              data={memberGrowth}
              height={100}
              color="rgba(0,240,255,0.7)"
              label="New Members — Last 6 Months"
            />
          )}
        </AdminPanel>

        <AdminPanel title="Project Growth" icon={TrendingUp}>
          {loading ? <LoadingRows count={1} /> : (
            <BarChart
              data={projectGrowth}
              height={100}
              color="rgba(176,38,255,0.7)"
              label="New Projects — Last 6 Months"
            />
          )}
        </AdminPanel>

        <AdminPanel title="XP Activity" icon={Zap}>
          {loading ? <LoadingRows count={1} /> : (
            <BarChart
              data={xpGrowth}
              height={100}
              color="rgba(255,170,0,0.7)"
              label="XP Log Entries — Last 6 Months"
            />
          )}
        </AdminPanel>

        <AdminPanel title="Activity Metrics" icon={Activity}>
          {loading ? <LoadingRows count={1} /> : (
            <BarChart
              data={activityGrowth}
              height={100}
              color="rgba(0,255,136,0.7)"
              label="Activity Logs — Last 6 Months"
            />
          )}
        </AdminPanel>
      </div>

      {/* Role Distribution & Top Earners */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Role Distribution" icon={Users}>
          {loading ? <LoadingRows count={4} /> : (
            <div className="space-y-2">
              {roleDistribution.map(([role, count]) => {
                const pct = data.members.length > 0 ? Math.round((count / data.members.length) * 100) : 0;
                return (
                  <div key={role} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-white">{role}</span>
                      <span className="text-text-muted">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-alt transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Top XP Earners" icon={Zap}>
          {loading ? <LoadingRows count={5} /> : (
            <div className="space-y-2">
              {topEarners.length === 0 ? (
                <p className="text-sm text-text-muted">No XP data yet.</p>
              ) : topEarners.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-3">
                  <span className={`shrink-0 w-7 text-center font-heading text-sm font-black ${i < 3 ? 'text-status-warning' : 'text-text-muted'}`}>
                    #{i + 1}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 font-heading text-sm font-black text-accent">
                    {(m.displayName || m.username || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{m.displayName || m.username}</p>
                    <p className="text-xs text-text-muted">{m.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-sm font-black text-accent">{(m.xp || 0).toLocaleString()}</p>
                    <p className="text-xs text-text-muted">XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
