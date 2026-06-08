import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { ChevronRight, Check, Rocket } from 'lucide-react';

const AGENT_TYPES = [
  { id: 'research', name: 'Research Agent', icon: '🔬', desc: 'Automates literature collection and summaries.' },
  { id: 'venture', name: 'Venture Agent', icon: '🚀', desc: 'Tracks milestones and generates reports.' },
  { id: 'marketplace', name: 'Marketplace Agent', icon: '🏪', desc: 'Optimizes listings and monitors trends.' },
  { id: 'learning', name: 'Learning Agent', icon: '📚', desc: 'Recommends courses and generates study plans.' },
  { id: 'mentor', name: 'Mentor Agent', icon: '🧑‍🏫', desc: 'Matches mentors with mentees.' },
  { id: 'community', name: 'Community Agent', icon: '🌐', desc: 'Monitors community health and sentiment.' },
  { id: 'governance', name: 'Governance Agent', icon: '⚖️', desc: 'Summarizes proposals and voting reports.' },
  { id: 'analytics', name: 'Analytics Agent', icon: '📊', desc: 'Generates dashboards and detects anomalies.' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️', desc: 'Coordinates cross-team workflows.' },
];

const TRIGGERS = [
  { id: 'schedule', label: 'Scheduled', desc: 'Run on a recurring schedule.' },
  { id: 'event', label: 'Event-Based', desc: 'Triggered by a platform event.' },
  { id: 'threshold', label: 'Threshold', desc: 'When a metric crosses a value.' },
  { id: 'manual', label: 'Manual', desc: 'Triggered manually by a user.' },
  { id: 'webhook', label: 'Webhook', desc: 'Triggered by an external call.' },
  { id: 'condition', label: 'Conditional', desc: 'Complex condition evaluates to true.' },
];

const ACTIONS = [
  { id: 'notify', label: 'Send Notification', icon: '🔔' },
  { id: 'create_task', label: 'Create Task', icon: '📋' },
  { id: 'generate_report', label: 'Generate Report', icon: '📊' },
  { id: 'assign_badge', label: 'Assign Badge', icon: '🏅' },
  { id: 'ai_analysis', label: 'Run AI Analysis', icon: '🤖' },
  { id: 'approval_request', label: 'Request Approval', icon: '✅' },
  { id: 'email', label: 'Send Email', icon: '📧' },
  { id: 'update_record', label: 'Update Record', icon: '📝' },
  { id: 'create_alert', label: 'Create Alert', icon: '🚨' },
  { id: 'webhook_call', label: 'Call Webhook', icon: '🌐' },
];

const STEPS = ['Agent Type', 'Trigger', 'Actions', 'Review & Deploy'];

export default function AgentBuilder() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);
  const [agentName, setAgentName] = useState('');

  const toggleAction = (id) => {
    setSelectedActions(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const canProceed = () => {
    if (step === 0) return selectedType !== null;
    if (step === 1) return selectedTrigger !== null;
    if (step === 2) return selectedActions.length > 0;
    return true;
  };

  const chosen = AGENT_TYPES.find(a => a.id === selectedType);

  return (
    <PageContainer>
      <PageHeader title="Agent Builder" description="Create a new AI agent step by step." />

      {/* Step Indicator */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-accent text-black' : 'bg-white/10 text-text-muted'}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden text-xs sm:inline ${i === step ? 'font-bold text-white' : 'text-text-muted'}`}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-text-muted" />}
          </div>
        ))}
      </div>

      {/* Step 0: Choose Agent Type */}
      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AGENT_TYPES.map((t) => (
            <button key={t.id} onClick={() => setSelectedType(t.id)} className={`rounded-xl border p-5 text-left transition-all hover:bg-white/5 ${selectedType === t.id ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.15)]' : 'border-border bg-surface/40'}`}>
              <span className="mb-2 block text-3xl">{t.icon}</span>
              <h3 className="font-heading font-bold text-white">{t.name}</h3>
              <p className="mt-1 text-xs text-text-muted">{t.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Configure Trigger */}
      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRIGGERS.map((t) => (
            <button key={t.id} onClick={() => setSelectedTrigger(t.id)} className={`rounded-xl border p-5 text-left transition-all hover:bg-white/5 ${selectedTrigger === t.id ? 'border-accent bg-accent/10' : 'border-border bg-surface/40'}`}>
              <h3 className="font-heading font-bold text-white">{t.label}</h3>
              <p className="mt-1 text-xs text-text-muted">{t.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Define Actions */}
      {step === 2 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => (
            <button key={a.id} onClick={() => toggleAction(a.id)} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:bg-white/5 ${selectedActions.includes(a.id) ? 'border-accent bg-accent/10' : 'border-border bg-surface/40'}`}>
              <span className="text-2xl">{a.icon}</span>
              <span className="font-bold text-white">{a.label}</span>
              {selectedActions.includes(a.id) && <Check className="ml-auto h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Review & Deploy */}
      {step === 3 && (
        <div className="mx-auto max-w-lg rounded-2xl border border-accent/30 bg-surface/40 p-8 text-center backdrop-blur-sm">
          <span className="mb-4 block text-5xl">{chosen?.icon}</span>
          <h2 className="mb-2 font-heading text-2xl font-bold text-white">{chosen?.name}</h2>
          <p className="mb-6 text-sm text-text-muted">{chosen?.desc}</p>
          <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Give your agent a name..." className="mb-6 w-full rounded-lg border border-border bg-black/30 px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent" />
          <div className="mb-6 space-y-2 text-left text-sm">
            <p className="text-text-muted">Trigger: <span className="font-bold text-white">{TRIGGERS.find(t => t.id === selectedTrigger)?.label}</span></p>
            <p className="text-text-muted">Actions: <span className="font-bold text-white">{selectedActions.map(id => ACTIONS.find(a => a.id === id)?.label).join(', ')}</span></p>
          </div>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-bold text-black transition-colors hover:bg-accent/80">
            <Rocket className="h-5 w-5" /> Deploy Agent
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="rounded-lg border border-border bg-white/5 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-30">
          Back
        </button>
        {step < 3 && (
          <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="rounded-lg bg-accent px-6 py-2 text-sm font-bold text-black transition-colors hover:bg-accent/80 disabled:opacity-30">
            Next
          </button>
        )}
      </div>
    </PageContainer>
  );
}
