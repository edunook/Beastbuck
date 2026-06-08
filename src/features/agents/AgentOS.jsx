import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Bot, Plus, Store, Zap, Clock, CheckCircle2, Pause, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AGENTS = [
  { id: 'agent_001', name: 'Research Sentinel', type: 'Research', icon: '🔬', status: 'active', executions: 347, successRate: 98.2, timeSaved: '42h' },
  { id: 'agent_002', name: 'Venture Tracker', type: 'Venture', icon: '🚀', status: 'active', executions: 189, successRate: 95.7, timeSaved: '28h' },
  { id: 'agent_003', name: 'Market Optimizer', type: 'Marketplace', icon: '🏪', status: 'idle', executions: 256, successRate: 97.1, timeSaved: '35h' },
  { id: 'agent_004', name: 'Study Planner', type: 'Learning', icon: '📚', status: 'active', executions: 512, successRate: 99.0, timeSaved: '61h' },
  { id: 'agent_005', name: 'Governance Watcher', type: 'Governance', icon: '⚖️', status: 'active', executions: 78, successRate: 100, timeSaved: '12h' },
  { id: 'agent_006', name: 'Collab Coordinator', type: 'Collaboration', icon: '🤝', status: 'paused', executions: 134, successRate: 94.0, timeSaved: '19h' },
];

const STATUS_STYLES = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  idle: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  paused: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const STATS = [
  { label: 'Total Agents', value: '6', icon: Bot },
  { label: 'Active', value: '4', icon: Activity },
  { label: 'Workflows Running', value: '12', icon: Zap },
  { label: 'Time Saved', value: '197h', icon: Clock },
  { label: 'Success Rate', value: '97.3%', icon: CheckCircle2 },
];

export default function AgentOS() {
  return (
    <PageContainer>
      <PageHeader
        title="Agent OS — Digital Workforce"
        description="Create, deploy, and monitor AI agents that automate work across BeastBuck."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STATS.map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className="mx-auto mb-2 h-5 w-5 text-accent" />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/agents/builder" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-accent/80">
          <Plus className="h-4 w-4" /> Create New Agent
        </Link>
        <Link to="/agents/marketplace" className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/5 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10">
          <Store className="h-4 w-4" /> Browse Marketplace
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <div key={agent.id} className={`group relative overflow-hidden rounded-xl border bg-surface/40 p-6 backdrop-blur-sm transition-all hover:bg-white/5 ${agent.status === 'active' ? 'border-accent/30 shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.1)]' : 'border-border'}`}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-3xl">{agent.icon}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[agent.status]}`}>
                {agent.status === 'active' && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />}
                {agent.status}
              </span>
            </div>
            <h3 className="mb-1 font-heading text-lg font-bold text-white">{agent.name}</h3>
            <p className="mb-4 text-xs text-text-muted">{agent.type} Agent</p>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-black/20 p-3 text-center">
              <div>
                <p className="text-sm font-bold text-white">{agent.executions}</p>
                <p className="text-[10px] text-text-muted">Runs</p>
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-400">{agent.successRate}%</p>
                <p className="text-[10px] text-text-muted">Success</p>
              </div>
              <div>
                <p className="text-sm font-bold text-accent">{agent.timeSaved}</p>
                <p className="text-[10px] text-text-muted">Saved</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent hover:text-black">
                {agent.status === 'paused' ? 'Resume' : 'Configure'}
              </button>
              <button className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-red-500/20 hover:text-red-400">
                {agent.status === 'active' ? <Pause className="h-3 w-3" /> : '•••'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
