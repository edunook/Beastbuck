import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { ShieldCheck, Check, X } from 'lucide-react';

const TABS = ['Pending', 'Approved', 'Rejected', 'All'];

const APPROVALS = [
  { id: 1, agent: 'Governance Watcher', action: 'Publish proposal summary to community feed', risk: 'Low', time: '5 min ago', status: 'pending' },
  { id: 2, agent: 'Venture Tracker', action: 'Send milestone warning to NovaTech leadership', risk: 'Medium', time: '30 min ago', status: 'pending' },
  { id: 3, agent: 'Operations Agent', action: 'Reassign 3 team members to Project Omega', risk: 'High', time: '1h ago', status: 'pending' },
  { id: 4, agent: 'Research Sentinel', action: 'Auto-cite 12 papers in quarterly report', risk: 'Low', time: '2h ago', status: 'approved' },
  { id: 5, agent: 'Community Agent', action: 'Flag 2 accounts for suspicious activity', risk: 'Critical', time: '3h ago', status: 'approved' },
  { id: 6, agent: 'Marketplace Agent', action: 'Remove listing flagged for policy violation', risk: 'High', time: '4h ago', status: 'rejected' },
];

const RISK = { Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30', Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', High: 'bg-orange-500/20 text-orange-400 border-orange-500/30', Critical: 'bg-red-500/20 text-red-400 border-red-500/30' };

export default function ApprovalCenter() {
  const [tab, setTab] = useState(0);

  const filtered = tab === 3 ? APPROVALS : APPROVALS.filter(a => {
    if (tab === 0) return a.status === 'pending';
    if (tab === 1) return a.status === 'approved';
    return a.status === 'rejected';
  });

  return (
    <PageContainer>
      <PageHeader title="Approval Center" description="Review and approve critical agent actions before they execute." />

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Pending', value: '3', color: 'text-yellow-400' },
          { label: 'Approved Today', value: '12', color: 'text-emerald-400' },
          { label: 'Rejected', value: '1', color: 'text-red-400' },
          { label: 'Auto-Approved', value: '45', color: 'text-accent' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-2">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${tab === i ? 'bg-accent text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span className="font-bold text-white">{a.agent}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${RISK[a.risk]}`}>{a.risk}</span>
              </div>
              <p className="text-sm text-text-muted">{a.action}</p>
              <p className="mt-1 text-xs text-text-muted">{a.time}</p>
            </div>
            {a.status === 'pending' ? (
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/40"><Check className="h-3 w-3" /> Approve</button>
                <button className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/40"><X className="h-3 w-3" /> Reject</button>
              </div>
            ) : (
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${a.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{a.status}</span>
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
