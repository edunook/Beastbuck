import { useEffect, useState } from 'react';
import { AlertTriangle, Bot, CalendarClock, CheckCircle2, ClipboardList, FileText, ShieldCheck, Workflow } from 'lucide-react';
import { LoadingState } from '@frontend/components/ui/UIElements';
import { AIContextPanel } from '../ai/AIContextPanel';
import { AutomationService } from '@services/firestore/automation';

function Metric({ label, value, icon: Icon, warning }) {
  return (
    <div className={`rounded-xl border p-4 ${warning ? 'border-status-warning/40 bg-status-warning/5' : 'border-border/50 bg-white/[0.02]'}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>
        <Icon className={`h-4 w-4 ${warning ? 'text-status-warning' : 'text-accent'}`} />
      </div>
      <p className={`font-heading text-3xl font-black ${warning ? 'text-status-warning' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface/40 p-5">
      <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ title, value }) {
  return (
    <div className="flex justify-between gap-3 rounded-lg border border-border bg-white/5 px-3 py-2 text-sm">
      <span className="min-w-0 truncate font-bold text-white">{title}</span>
      <span className="shrink-0 text-text-muted">{value}</span>
    </div>
  );
}

export default function AutomationHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setHealth(await AutomationService.getAutomationHealth());
      } catch (err) {
        console.error('Automation health failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState text="Analyzing automation operations..." />;
  if (!health) return null;
  const healthy = health.automationHealthLabel === 'Healthy';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-surface/30 p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">Automation Health</h2>
            <p className="text-sm text-text-muted">Active automations, failed executions, agent recommendations, approvals, schedules, logs, and workflow analytics.</p>
          </div>
          <span className={`flex w-fit items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${healthy ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
            {healthy ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {health.automationHealthLabel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          <Metric label="Automations" value={health.totalAutomations} icon={Workflow} />
          <Metric label="Active" value={health.activeAutomations} icon={CheckCircle2} />
          <Metric label="Executions" value={health.workflowExecutions} icon={ClipboardList} />
          <Metric label="Success Rate" value={`${health.successRate}%`} icon={CheckCircle2} />
          <Metric label="Approvals" value={health.pendingApprovals} icon={ShieldCheck} warning={health.pendingApprovals > 10} />
          <Metric label="Failures" value={health.failedAutomations} icon={AlertTriangle} warning={health.failedAutomations > 0} />
          <Metric label="Templates" value={health.workflowTemplates} icon={FileText} />
          <Metric label="Scheduled Jobs" value={health.scheduledJobs} icon={CalendarClock} />
          <Metric label="Agent Tasks" value={health.agentTasks} icon={Bot} />
          <Metric label="Agent Runs" value={health.agentExecutions} icon={Bot} />
          <Metric label="Stalled" value={health.stalledWorkflows} icon={AlertTriangle} warning={health.stalledWorkflows > 0} />
          <Metric label="Logs" value={health.workflowLogs} icon={ClipboardList} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Top Workflows">
          {health.topWorkflows.length === 0 ? <p className="text-sm text-text-muted">No workflows yet.</p> : health.topWorkflows.map(item => <Row key={item.id} title={item.title} value={`${item.runCount || 0} runs`} />)}
        </Panel>
        <Panel title="Scope Distribution">
          {health.scopeDistribution.length === 0 ? <p className="text-sm text-text-muted">No scope data yet.</p> : health.scopeDistribution.map(item => <Row key={item.name} title={item.name} value={item.count} />)}
        </Panel>
        <Panel title="Recent Logs">
          {health.recentLogs.length === 0 ? <p className="text-sm text-text-muted">No executions logged.</p> : health.recentLogs.map(item => <Row key={item.id} title={item.message || item.trigger} value={item.status} />)}
        </Panel>
      </div>

      <AIContextPanel
        title="Automation Intelligence"
        actions={[
          { label: 'Analyze Automation Health', prompt: `Analyze BeastBuck automation health: ${health.totalAutomations} automations, ${health.workflowExecutions} executions, ${health.failedAutomations} failures, ${health.pendingApprovals} approvals, ${health.agentRecommendations} agent recommendations, ${health.successRate}% success rate. Recommend improvements.`, mode: 'general' },
          { label: 'Detect Operational Risks', prompt: 'Detect risks in a human-approved automation platform spanning users, teams, departments, labs, projects, research, ventures, academy, marketplace, community, and workspace. Include approval and permission controls.', mode: 'general' },
        ]}
      />
    </div>
  );
}
