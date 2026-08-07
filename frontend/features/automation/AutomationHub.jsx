import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  GitBranch,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';
import { PageHeader, LoadingState, EmptyState } from '@frontend/components/ui/UIElements';
import { AIContextPanel } from '../ai/AIContextPanel';
import { useAuth } from '../auth/AuthContext';
import {
  AGENT_TYPES,
  AUTOMATION_ACTIONS,
  AUTOMATION_CONDITIONS,
  AUTOMATION_SCOPES,
  AUTOMATION_TRIGGERS,
  AutomationService,
  EXECUTION_PHASES,
} from '@services/firestore/automation';

const statusStyles = {
  ACTIVE: 'border-status-success/20 bg-status-success/10 text-status-success',
  DRAFT: 'border-white/10 bg-white/5 text-text-soft',
  PAUSED: 'border-status-warning/20 bg-status-warning/10 text-status-warning',
  ARCHIVED: 'border-status-danger/20 bg-status-danger/10 text-status-danger',
  PENDING: 'border-status-warning/20 bg-status-warning/10 text-status-warning',
  SUCCESS: 'border-status-success/20 bg-status-success/10 text-status-success',
  FAILED: 'border-status-danger/20 bg-status-danger/10 text-status-danger',
};

function Badge({ children, status }) {
  return (
    <span className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-bold ${statusStyles[status] || statusStyles.DRAFT}`}>
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return <input {...props} className="h-11 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none" />;
}

function Select(props) {
  return (
    <select {...props} className="h-11 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white focus:border-accent/40 focus:outline-none">
      {props.children}
    </select>
  );
}

function TogglePill({ selected, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${selected ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border bg-white/5 text-text-muted hover:text-white'}`}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, icon: Icon, tone = 'accent' }) {
  const toneMap = {
    accent: 'text-accent bg-accent/10',
    success: 'text-status-success bg-status-success/10',
    warning: 'text-status-warning bg-status-warning/10',
    purple: 'text-accent-alt bg-accent-alt/10',
  };
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>
        <span className={`rounded-lg p-2 ${toneMap[tone] || toneMap.accent}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="font-heading text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function WorkflowCard({ workflow, onRun, busy }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-white">{workflow.title}</h3>
          <p className="mt-1 text-sm leading-6 text-text-muted line-clamp-2">{workflow.description}</p>
        </div>
        <Badge status={workflow.status}>{workflow.status}</Badge>
      </div>
      <div className="grid gap-3 text-sm md:grid-cols-3">
        <Step icon={Zap} label="Trigger" value={workflow.trigger} />
        <Step icon={GitBranch} label="Conditions" value={(workflow.conditions || []).join(', ') || 'None'} />
        <Step icon={Play} label="Actions" value={(workflow.actions || []).join(', ') || 'None'} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{workflow.scope}</Badge>
          <Badge>{workflow.executionPhase}</Badge>
          {workflow.requiresApproval && <Badge status="PENDING">Approval Required</Badge>}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => onRun(workflow)}
          className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition hover:bg-accent/20 disabled:opacity-60"
        >
          <Play className="h-4 w-4" />
          {busy ? 'Running...' : 'Run Test'}
        </button>
      </div>
    </div>
  );
}

function Step({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
        <Icon className="h-3.5 w-3.5 text-accent" />
        {label}
      </div>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface/40">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
        <Icon className="h-4 w-4 text-accent" />
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function AutomationHub() {
  const { user, userProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    scope: 'Projects',
    trigger: 'Task Completed',
    conditions: ['Status Check'],
    actions: ['Create Task'],
    executionPhase: 'HUMAN_APPROVED',
    status: 'DRAFT',
    requiresApproval: true,
  });

  const actor = useMemo(() => ({
    uid: user?.uid,
    name: userProfile?.displayName || userProfile?.username || user?.email || 'Member',
    email: user?.email,
  }), [user, userProfile]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      setData(await AutomationService.getAutomationHome(user.uid));
    } catch (err) {
      console.error('Automation home failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      if (!user?.uid) return;
      try {
        const result = await AutomationService.getAutomationHome(user.uid);
        if (!cancelled) setData(result);
      } catch (err) {
        console.error('Automation home failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadInitial();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const toggleList = (key, value) => {
    setForm(prev => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter(item => item !== value) : [...current, value],
      };
    });
  };

  const createWorkflow = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await AutomationService.createWorkflow(form, actor);
      setMessage('Workflow created. It will stay human-approved until leadership enables stronger automation.');
      setForm(prev => ({ ...prev, title: '', description: '', status: 'DRAFT' }));
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const runWorkflow = async (workflow) => {
    setRunningId(workflow.id);
    setMessage('');
    try {
      await AutomationService.executeWorkflow(workflow, user.uid, { trigger: workflow.trigger });
      setMessage(workflow.requiresApproval ? 'Workflow execution queued for approval.' : 'Workflow test execution completed.');
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setRunningId('');
    }
  };

  const runAgent = async (agentType) => {
    setMessage('');
    try {
      await AutomationService.runAgent({
        agentType,
        targetType: agentType.replace(' Agent', ''),
        summary: `${agentType} scanned recent activity and proposed human-approved follow-up actions.`,
      }, user.uid);
      setMessage(`${agentType} generated a recommendation for review.`);
      await load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <LoadingState text="Loading automation workflows..." />;

  const workflows = data?.workflows || [];
  const stats = {
    active: data?.activeWorkflows?.length || 0,
    templates: data?.templates?.length || 0,
    approvals: (data?.approvals || []).filter(item => item.status === 'PENDING').length,
    agents: (data?.agentTasks || []).filter(item => ['PROPOSED', 'PENDING'].includes(item.status)).length,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Automation OS"
        description="Build human-approved workflows, scheduled operations, AI agent recommendations, smart notifications, and platform-wide processes."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Workflow className="h-6 w-6" /></div>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active Automations" value={stats.active} icon={Workflow} tone="success" />
        <Metric label="Templates" value={stats.templates} icon={FileText} />
        <Metric label="Pending Approvals" value={stats.approvals} icon={ShieldCheck} tone="warning" />
        <Metric label="Agent Recommendations" value={stats.agents} icon={Bot} tone="purple" />
      </div>

      {message && (
        <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm font-bold text-accent">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Panel title="Workflow Builder" icon={GitBranch}>
          <form className="space-y-5" onSubmit={createWorkflow}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title"><Input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Weekly venture risk review" /></Field>
              <Field label="Scope">
                <Select value={form.scope} onChange={event => setForm({ ...form, scope: event.target.value })}>
                  {AUTOMATION_SCOPES.map(scope => <option key={scope}>{scope}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} rows={3} placeholder="Describe the operational process this workflow should run." className="w-full rounded-xl border border-border bg-white/5 px-3 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Trigger">
                <Select value={form.trigger} onChange={event => setForm({ ...form, trigger: event.target.value })}>
                  {AUTOMATION_TRIGGERS.map(trigger => <option key={trigger}>{trigger}</option>)}
                </Select>
              </Field>
              <Field label="Execution Model">
                <Select value={form.executionPhase} onChange={event => setForm({ ...form, executionPhase: event.target.value })}>
                  {EXECUTION_PHASES.map(phase => <option key={phase}>{phase}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {AUTOMATION_CONDITIONS.map(condition => (
                    <TogglePill key={condition} selected={form.conditions.includes(condition)} onClick={() => toggleList('conditions', condition)}>
                      {condition}
                    </TogglePill>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {AUTOMATION_ACTIONS.map(action => (
                    <TogglePill key={action} selected={form.actions.includes(action)} onClick={() => toggleList('actions', action)}>
                      {action}
                    </TogglePill>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
              <label className="flex items-center gap-2 text-sm font-bold text-text-soft">
                <input type="checkbox" checked={form.requiresApproval} onChange={event => setForm({ ...form, requiresApproval: event.target.checked })} className="h-4 w-4 accent-cyan-400" />
                Require human approval
              </label>
              <button type="submit" disabled={saving || !user?.uid} className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition hover:bg-accent/20 disabled:opacity-60">
                <Plus className="h-4 w-4" />
                {saving ? 'Creating...' : 'Create Workflow'}
              </button>
            </div>
          </form>
        </Panel>

        <AIContextPanel
          title="Automation AI Assistant"
          actions={[
            { label: 'Generate Workflow', prompt: 'Design a BeastBuck human-approved automation workflow with trigger, conditions, actions, approvals, logs, and safety checks for onboarding, research, ventures, academy, marketplace, and workspace.', mode: 'general' },
            { label: 'Analyze Risks', prompt: `Analyze risks for this automation: trigger ${form.trigger}, conditions ${form.conditions.join(', ')}, actions ${form.actions.join(', ')}. Include permission validation and approval gates.`, mode: 'general' },
            { label: 'Create Report Plan', prompt: 'Create a daily, weekly, monthly, and department report automation plan for BeastBuck Mission Control and Command Center.', mode: 'general' },
          ]}
        />
      </div>

      <Panel title="Workflow Templates" icon={FileText}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data?.templates || []).map(template => (
            <button
              type="button"
              key={template.id}
              onClick={() => setForm(prev => ({ ...prev, title: template.title, description: template.description, scope: template.category, trigger: template.trigger, conditions: template.conditions || [], actions: template.actions || [] }))}
              className="rounded-xl border border-border bg-white/[0.03] p-4 text-left transition hover:border-accent/40 hover:bg-white/[0.06]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-heading text-sm font-bold text-white">{template.title}</h3>
                <Badge>{template.category}</Badge>
              </div>
              <p className="text-sm leading-6 text-text-muted line-clamp-3">{template.description}</p>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Scheduled Automations" icon={CalendarClock}>
          <div className="space-y-3">
            {(data?.scheduledJobs || []).slice(0, 5).map(job => <CompactRow key={job.id} title={job.title} meta={`${job.cadence} - ${job.status}`} icon={Clock} />)}
            {(data?.scheduledJobs || []).length === 0 && <p className="text-sm text-text-muted">Create scheduled jobs in Command Center for reports, inactive member detection, analytics, and digests.</p>}
          </div>
        </Panel>
        <Panel title="Agent Recommendations" icon={Bot}>
          <div className="space-y-3">
            {AGENT_TYPES.slice(0, 4).map(agent => (
              <button key={agent} type="button" onClick={() => runAgent(agent)} className="flex w-full items-center justify-between rounded-lg border border-border bg-white/5 px-3 py-2 text-left text-sm transition hover:border-accent/40">
                <span className="font-bold text-white">{agent}</span>
                <Sparkles className="h-4 w-4 text-accent" />
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Approval Queue" icon={ShieldCheck}>
          <div className="space-y-3">
            {(data?.approvals || []).slice(0, 5).map(item => <CompactRow key={item.id} title={item.actionSummary || item.workflowId} meta={item.status} icon={ShieldCheck} />)}
            {(data?.approvals || []).length === 0 && <p className="text-sm text-text-muted">Sensitive AI and workflow actions will queue here before execution.</p>}
          </div>
        </Panel>
      </div>

      <Panel title="Your Workflows" icon={Workflow}>
        {workflows.length === 0 ? (
          <EmptyState icon={Workflow} title="No workflows yet" description="Create the first BeastBuck automation or start from a template." />
        ) : (
          <div className="grid gap-4">
            {workflows.map(workflow => <WorkflowCard key={workflow.id} workflow={workflow} onRun={runWorkflow} busy={runningId === workflow.id} />)}
          </div>
        )}
      </Panel>

      <Panel title="Recent Execution Logs" icon={Bell}>
        <div className="space-y-3">
          {(data?.logs || []).slice(0, 8).map(log => (
            <CompactRow
              key={log.id}
              title={log.message || log.trigger}
              meta={`${log.status} - ${(log.actions || []).join(', ') || 'No actions'}`}
              icon={log.status === 'SUCCESS' ? CheckCircle2 : log.status === 'FAILED' ? AlertTriangle : Clock}
            />
          ))}
          {(data?.logs || []).length === 0 && <p className="text-sm text-text-muted">Workflow executions, failures, approvals, actors, and affected resources will appear here.</p>}
        </div>
      </Panel>
    </div>
  );
}

function CompactRow({ title, meta, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-white/[0.03] px-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{title}</p>
        <p className="truncate text-xs text-text-muted">{meta}</p>
      </div>
    </div>
  );
}
