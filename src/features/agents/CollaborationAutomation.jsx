import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Users, FileText, ListChecks, FolderKanban, Bell } from 'lucide-react';

const STATS = [
  { label: 'Summaries', value: '234', color: 'text-emerald-400' },
  { label: 'Actions Extracted', value: '567', color: 'text-blue-400' },
  { label: 'Tasks Created', value: '312', color: 'text-purple-400' },
  { label: 'Time Saved', value: '45h', color: 'text-accent' },
];

const CAPABILITIES = [
  { icon: FileText, title: 'Meeting Summaries', desc: 'Auto-generate concise summaries from meeting transcripts.', status: 'Active', lastRun: '1h ago', results: '6 summaries' },
  { icon: ListChecks, title: 'Action Item Extraction', desc: 'Identify and extract action items from conversations.', status: 'Active', lastRun: '1h ago', results: '14 actions' },
  { icon: FolderKanban, title: 'Task Creation', desc: 'Auto-create tasks from extracted action items.', status: 'Active', lastRun: '2h ago', results: '8 tasks' },
  { icon: Users, title: 'Workspace Organization', desc: 'Keep workspaces organized with auto-filing and tagging.', status: 'Paused', lastRun: '1 day ago', results: '23 files' },
  { icon: Bell, title: 'Team Notifications', desc: 'Send contextual notifications to relevant team members.', status: 'Active', lastRun: '30 min ago', results: '12 sent' },
];

export default function CollaborationAutomation() {
  return (
    <PageContainer>
      <PageHeader title="Collaboration Automation" description="AI-powered workflows for meetings, tasks, and team coordination." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (<div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-text-muted">{s.label}</p></div>))}
      </div>
      <div className="space-y-4">
        {CAPABILITIES.map((c, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><c.icon className="h-6 w-6" /></div>
            <div className="flex-1"><h3 className="font-heading font-bold text-white">{c.title}</h3><p className="text-xs text-text-muted">{c.desc}</p><p className="mt-1 text-xs text-text-muted">Last run: {c.lastRun} · Results: {c.results}</p></div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>{c.status}</span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
