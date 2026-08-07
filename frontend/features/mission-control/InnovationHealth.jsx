import { useState, useEffect } from 'react';
import { FlaskConical, Lightbulb, Sparkles, Box, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { MissionControlService } from '@services/firestore/missionControl';
import { LoadingState } from '@frontend/components/ui/UIElements';

function MetricCard({ label, value, icon: Icon, status }) {
  const isWarning = status === 'warning';
  return (
    <div className={`rounded-xl border p-4 ${isWarning ? 'border-status-warning/40 bg-status-warning/5' : 'border-border/50 bg-white/[0.02]'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>
        <Icon className={`h-4 w-4 ${isWarning ? 'text-status-warning' : 'text-accent'}`} />
      </div>
      <p className={`text-3xl font-black ${isWarning ? 'text-status-warning' : 'text-white'}`}>{value}</p>
    </div>
  );
}

export default function InnovationHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await MissionControlService.getInnovationHealth();
        setHealth(data);
      } catch (err) {
        console.error('Failed to load innovation health:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState />;
  if (!health) return null;

  const isHealthy = health.innovationHealthLabel === 'Healthy';

  return (
    <div className="rounded-2xl border border-border/40 bg-surface/30 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-white">Innovation Health</h3>
          <p className="text-sm text-text-muted">Real-time innovation ecosystem metrics</p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${isHealthy ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
          {isHealthy ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {health.innovationHealthLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Active Research" value={health.activeResearch} icon={FlaskConical} />
        <MetricCard label="Stalled Research" value={health.stalledResearch} icon={Activity} status={health.stalledResearch > 0 ? 'warning' : ''} />
        <MetricCard label="Inventions" value={health.inventionCount} icon={Lightbulb} />
        <MetricCard label="Discoveries" value={health.discoveryCount} icon={Sparkles} />
        <MetricCard label="Prototypes" value={health.prototypeCompletionRate + '%'} icon={Box} />
        <MetricCard label="Approved Discoveries" value={health.approvedDiscoveries} icon={CheckCircle2} />
        <MetricCard label="Total Innovation" value={health.totalInnovationProjects} icon={FlaskConical} />
      </div>
    </div>
  );
}
