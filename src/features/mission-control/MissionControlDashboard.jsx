import { useEffect, useState } from 'react';
import { RefreshCw, Users, Activity, BarChart3, TrendingUp, Zap, HeartHandshake, BriefcaseBusiness, PackageOpen, Workflow } from 'lucide-react';
import { MissionControlService } from '../../services/firebase/missionControl';
import { CommunityService } from '../../services/firebase/community';
import { useAuth } from '../auth/AuthContext';
import { IntelligenceMetric, IntelligencePanel, LoadingRows } from './missionControlUtils';
import { formatDistanceToNow } from '../../lib/dateUtils';

function SimpleLineChart({ data, color, height = 100 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = 100 - (((d.value - min) / (range || 1)) * 100);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`${0},${100} ${points} ${100},${100}`}
          fill={`url(#grad-${color})`}
          stroke="none"
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-md"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * 100;
          const y = 100 - (((d.value - min) / (range || 1)) * 100);
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill="#111"
              stroke={color}
              strokeWidth="2"
              className="transition-all hover:r-6 hover:fill-current"
            />
          );
        })}
      </svg>
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export default function MissionControlDashboard() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    try {
      let snaps = await MissionControlService.getAnalyticsSnapshots(14); // Last 14 days
      // If no snaps exist, generate an initial one
      if (snaps.length === 0) {
        setGenerating(true);
        await MissionControlService.generateAnalyticsSnapshot(user.uid);
        snaps = await MissionControlService.getAnalyticsSnapshots(14);
      }
      setSnapshots(snaps);
    } catch (err) {
      console.error('Mission Control Dashboard load failed:', err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadInitialSnapshots() {
      try {
        let snaps = await MissionControlService.getAnalyticsSnapshots(14);
        if (snaps.length === 0 && user?.uid) {
          if (!cancelled) setGenerating(true);
          await MissionControlService.generateAnalyticsSnapshot(user.uid);
          snaps = await MissionControlService.getAnalyticsSnapshots(14);
        }
        if (!cancelled) setSnapshots(snaps);
      } catch (err) {
        console.error('Mission Control Dashboard load failed:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setGenerating(false);
        }
      }
    }
    loadInitialSnapshots();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const latest = snapshots[snapshots.length - 1] || null;
  const previous = snapshots[snapshots.length - 2] || null;

  const getTrend = (key) => {
    if (!latest || !previous) return 0;
    const l = latest.metrics[key] || 0;
    const p = previous.metrics[key] || 0;
    if (p === 0) return l > 0 ? 100 : 0;
    return Math.round(((l - p) / p) * 100);
  };

  const chartData = (key) => {
    return snapshots.map(s => {
      const d = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
      return {
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: s.metrics[key] || 0
      };
    });
  };

  const generateSnapshot = async () => {
    setGenerating(true);
    try {
      await MissionControlService.generateAnalyticsSnapshot(user.uid);
      await load();
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Executive Dashboard</h2>
          <p className="text-xs text-text-muted">
            {latest ? `Last updated ${formatDistanceToNow(latest.timestamp)}` : 'No data available'}
          </p>
        </div>
        <button
          onClick={generateSnapshot}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-bold text-text-soft hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating Snapshot...' : 'Refresh Snapshot'}
        </button>
      </div>

      {/* Metrics */}
      {latest && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <IntelligenceMetric
            label="Total Members"
            value={latest.metrics.totalMembers || 0}
            trend={getTrend('totalMembers')}
            icon={Users}
            color="accent"
          />
          <IntelligenceMetric
            label="Active Projects"
            value={latest.metrics.activeProjects || 0}
            trend={getTrend('activeProjects')}
            icon={Activity}
            color="success"
          />
          <IntelligenceMetric
            label="Platform XP"
            value={(latest.metrics.totalXP || 0).toLocaleString()}
            trend={getTrend('totalXP')}
            icon={Zap}
            color="warning"
          />
          <IntelligenceMetric
            label="Workspaces"
            value={(latest.metrics.totalWorkspaces || 0)}
            trend={getTrend('totalWorkspaces')}
            icon={BarChart3}
            color="purple"
          />
          <IntelligenceMetric
            label="Ventures"
            value={(latest.metrics.totalVentures || 0)}
            trend={getTrend('totalVentures')}
            icon={BriefcaseBusiness}
            color="accent"
          />
          <IntelligenceMetric
            label="Resources"
            value={(latest.metrics.totalMarketplaceResources || 0)}
            trend={getTrend('totalMarketplaceResources')}
            icon={PackageOpen}
            color="warning"
          />
          <IntelligenceMetric
            label="Automations"
            value={(latest.metrics.totalAutomations || 0)}
            trend={getTrend('totalAutomations')}
            icon={Workflow}
            color="purple"
          />
        </div>
      )}

      {/* Growth Charts */}
      <div className="grid gap-6 pt-4 lg:grid-cols-2">
        <IntelligencePanel title="Member Growth" icon={TrendingUp}>
          <div className="mt-4 pb-6">
            <SimpleLineChart data={chartData('totalMembers')} color="#00f0ff" />
          </div>
        </IntelligencePanel>

        <IntelligencePanel title="XP Accumulation" icon={Zap}>
          <div className="mt-4 pb-6">
            <SimpleLineChart data={chartData('totalXP')} color="#ffaa00" />
          </div>
        </IntelligencePanel>
      </div>

      <CommunityEcosystemMetrics />
    </div>
  );
}

function CommunityEcosystemMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadCommunityMetrics() {
      try {
        const [communities, activity] = await Promise.all([
          CommunityService.getCommunities(),
          CommunityService.getActivityFeed({}),
        ]);
        if (cancelled) return;

        const memberCount = communities.reduce((sum, community) => sum + (community.memberCount || 0), 0);
        const postCount = communities.reduce((sum, community) => sum + (community.postCount || 0), 0);
        const engagementRate = memberCount ? Math.round((postCount / memberCount) * 100) : 0;
        const reputationEvents = activity.filter(item => ['COMMUNITY_POST', 'FOLLOW', 'SHOWCASE'].includes(item.type)).length;
        const retentionSignals = activity.filter(item => item.type === 'COMMUNITY_JOINED' || item.type === 'FOLLOW').length;

        setMetrics({
          communityGrowth: memberCount,
          engagementRate,
          reputationEvents,
          retentionSignals,
        });
      } catch (err) {
        console.error('Community ecosystem metrics failed:', err);
        if (!cancelled) setMetrics({
          communityGrowth: 0,
          engagementRate: 0,
          reputationEvents: 0,
          retentionSignals: 0,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCommunityMetrics();
    return () => { cancelled = true; };
  }, []);

  return (
    <IntelligencePanel title="Community Ecosystem" icon={HeartHandshake}>
      {loading ? <LoadingRows count={4} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <IntelligenceMetric label="Community Growth" value={metrics.communityGrowth} icon={Users} color="accent" />
          <IntelligenceMetric label="Engagement Rate" value={`${metrics.engagementRate}%`} icon={Activity} color="success" />
          <IntelligenceMetric label="Reputation Trends" value={metrics.reputationEvents} icon={TrendingUp} color="warning" />
          <IntelligenceMetric label="Retention Signals" value={metrics.retentionSignals} icon={BarChart3} color="purple" />
        </div>
      )}
    </IntelligencePanel>
  );
}
