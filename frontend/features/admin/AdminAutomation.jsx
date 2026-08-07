import { useEffect, useState } from 'react';
import { AlertTriangle, Bot, CalendarClock, CheckCircle2, FileText, Play, ShieldCheck, Workflow } from 'lucide-react';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { AGENT_TYPES, AutomationService } from '@services/firestore/automation';
import { useAuth } from '../auth/AuthContext';
import { AdminActionButton, AdminEmptyState, AdminMetric, AdminPanel, LoadingRows, StatusBadge } from './adminUtils';

export default function AdminAutomation() {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [healthData, workflowData] = await Promise.all([
        AutomationService.getAutomationHealth(),
        AutomationService.listWorkflows({ includeArchived: true, limit: 120 }),
      ]);
      setHealth(healthData);
      setWorkflows(workflowData);
    } catch (err) {
      console.error('Admin automation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadInitial() {
      try {
        const [healthData, workflowData] = await Promise.all([
          AutomationService.getAutomationHealth(),
          AutomationService.listWorkflows({ includeArchived: true, limit: 120 }),
        ]);
        setHealth(healthData);
        setWorkflows(workflowData);
      } catch (err) {
        console.error('Admin automation failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  const update = async (id, updates) => {
    setBusy(id);
    try {
      await AutomationService.updateWorkflow(id, updates);
      await load();
    } finally {
      setBusy('');
    }
  };

  const approve = async (approvalId, decision) => {
    setBusy(approvalId);
    try {
      await AutomationService.approveWorkflowAction(approvalId, user.uid, decision);
      await load();
    } finally {
      setBusy('');
    }
  };

  const runAgent = async (agentType) => {
    setBusy(agentType);
    try {
      await AutomationService.runAgent({
        agentType,
        targetType: agentType.replace(' Agent', ''),
        summary: `${agentType} generated a leadership review recommendation from Command Center.`,
      }, user.uid);
      await load();
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Automation Command Center"
        description="Build workflows, monitor logs, run agents, manage templates, review approvals, and validate smart operations."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Workflow className="h-6 w-6" /></div>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <AdminMetric label="Automations" value={health?.totalAutomations || 0} icon={Workflow} />
        <AdminMetric label="Active" value={health?.activeAutomations || 0} icon={CheckCircle2} color="success" />
        <AdminMetric label="Approvals" value={health?.pendingApprovals || 0} icon={ShieldCheck} color={health?.pendingApprovals ? 'warning' : 'accent'} />
        <AdminMetric label="Failed" value={health?.failedAutomations || 0} icon={AlertTriangle} color={health?.failedAutomations ? 'danger' : 'success'} />
        <AdminMetric label="Agents" value={health?.agentRecommendations || 0} icon={Bot} color="purple" />
        <AdminMetric label="Success Rate" value={`${health?.successRate ?? 100}%`} icon={Play} color="success" />
      </div>

      <AdminPanel title="Workflow Builder & Registry" icon={Workflow}>
        {loading ? <LoadingRows count={5} /> : workflows.length === 0 ? <AdminEmptyState icon={Workflow} title="No workflows" message="Created automations will appear here." /> : (
          <div className="space-y-4">
            {workflows.map(workflow => (
              <div key={workflow.id} className="rounded-xl border border-border/60 bg-white/[0.02] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-bold text-white">{workflow.title}</h3>
                      <StatusBadge variant={workflow.status === 'ACTIVE' ? 'success' : workflow.status === 'PAUSED' ? 'warning' : workflow.status === 'ARCHIVED' ? 'danger' : 'default'}>{workflow.status}</StatusBadge>
                      <StatusBadge>{workflow.scope}</StatusBadge>
                      {workflow.requiresApproval && <StatusBadge variant="warning">Approval</StatusBadge>}
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2">{workflow.description}</p>
                    <p className="mt-2 text-xs text-text-soft">{workflow.trigger} {'->'} {(workflow.actions || []).join(', ')} - {workflow.runCount || 0} runs - {workflow.executionPhase}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminActionButton disabled={busy === workflow.id} onClick={() => update(workflow.id, { status: 'ACTIVE' })} variant="success">Activate</AdminActionButton>
                    <AdminActionButton disabled={busy === workflow.id} onClick={() => update(workflow.id, { status: 'PAUSED' })} variant="warning">Pause</AdminActionButton>
                    <AdminActionButton disabled={busy === workflow.id} onClick={() => update(workflow.id, { status: 'ARCHIVED' })} variant="danger">Archive</AdminActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPanel title="Approval Center" icon={ShieldCheck}>
          <div className="space-y-3">
            {(health?.recentApprovals || []).length === 0 ? <p className="text-sm text-text-muted">No pending workflow or AI action approvals.</p> : health.recentApprovals.map(item => (
              <div key={item.id} className="rounded-lg border border-border bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white line-clamp-1">{item.actionSummary || item.workflowId}</p>
                  <StatusBadge variant={item.status === 'PENDING' ? 'warning' : item.status === 'APPROVED' ? 'success' : 'danger'}>{item.status}</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminActionButton disabled={busy === item.id} onClick={() => approve(item.id, 'APPROVED')} variant="success" size="xs">Approve</AdminActionButton>
                  <AdminActionButton disabled={busy === item.id} onClick={() => approve(item.id, 'REJECTED')} variant="danger" size="xs">Reject</AdminActionButton>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Agent Dashboard" icon={Bot}>
          <div className="grid gap-2">
            {AGENT_TYPES.slice(0, 7).map(agent => (
              <AdminActionButton key={agent} disabled={busy === agent} onClick={() => runAgent(agent)} variant="accent" className="justify-between">
                <span>{agent}</span><Bot className="h-3.5 w-3.5" />
              </AdminActionButton>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Template & Schedule Manager" icon={CalendarClock}>
          <div className="space-y-3">
            <MetricRow label="Templates" value={health?.workflowTemplates || 0} icon={FileText} />
            <MetricRow label="Scheduled Jobs" value={health?.scheduledJobs || 0} icon={CalendarClock} />
            <MetricRow label="Execution Logs" value={health?.workflowLogs || 0} icon={Workflow} />
            <MetricRow label="Agent Memory" value={health?.agentMemoryItems || 0} icon={Bot} />
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

function MetricRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white/5 px-3 py-2 text-sm">
      <span className="flex items-center gap-2 font-bold text-white"><Icon className="h-4 w-4 text-accent" />{label}</span>
      <span className="text-text-muted">{value}</span>
    </div>
  );
}
