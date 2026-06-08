import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { GitMerge, GitCommit, Play, RotateCcw } from 'lucide-react';

const RELEASES = [
  { version: 'v1.0.0-rc.2', date: 'Oct 14, 2026', type: 'Release Candidate', status: 'Staged' },
  { version: 'v1.0.0-rc.1', date: 'Oct 10, 2026', type: 'Release Candidate', status: 'Active' },
  { version: 'v0.9.9', date: 'Sep 28, 2026', type: 'Beta Update', status: 'Archived' },
  { version: 'v0.9.8', date: 'Sep 15, 2026', type: 'Beta Update', status: 'Archived' },
];

export default function ReleaseManager() {
  return (
    <PageContainer>
      <PageHeader title="Release Manager" description="Manage deployments, version tracking, and rollbacks for BeastBuck OS." />
      
      <div className="mb-8 flex items-center justify-between bg-accent/10 border border-accent/20 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <GitMerge className="h-10 w-10 text-accent" />
          <div>
            <h2 className="text-xl font-bold text-white">Current Target: v1.0.0 (Production)</h2>
            <p className="text-text-muted text-sm mt-1">Pending final sign-off from Quality Assurance.</p>
          </div>
        </div>
        <button className="bg-accent hover:bg-accent/80 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Play className="w-4 h-4" /> Deploy v1.0.0
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-heading font-bold text-white">Deployment History</h3>
        <div className="space-y-4">
          {RELEASES.map((r, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <GitCommit className="w-5 h-5 text-text-muted" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg font-mono">{r.version}</h4>
                  <p className="text-xs text-text-muted">{r.date} · {r.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${r.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : r.status === 'Staged' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-text-muted'}`}>
                  {r.status}
                </span>
                {r.status !== 'Archived' && (
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted transition-colors" title="Rollback">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
