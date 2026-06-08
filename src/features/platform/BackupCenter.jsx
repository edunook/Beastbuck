import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Database, Image as ImageIcon, FileJson, History } from 'lucide-react';

export default function BackupCenter() {
  return (
    <PageContainer>
      <PageHeader title="Disaster Recovery & Backups" description="Manage automated backups for Firestore, Storage, and Configurations." />
      
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: 'Firestore (Nightly)', status: 'Healthy', time: '4 hrs ago', icon: Database },
          { label: 'Cloudinary Assets', status: 'Healthy', time: 'Live Sync', icon: ImageIcon },
          { label: 'Platform Config', status: 'Healthy', time: '1 hr ago', icon: FileJson },
        ].map((b, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <b.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{b.label}</h3>
                <p className="text-xs text-text-muted">Last Backup: {b.time}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase font-bold text-emerald-400">{b.status}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-white">Recovery Simulation Log</h3>
          <button className="bg-white/5 hover:bg-white/10 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <History className="w-4 h-4" /> Run Simulation
          </button>
        </div>
        <div className="space-y-3">
          {[
            { date: 'Oct 15, 2026', type: 'Full Database Restore', duration: '14m 22s', result: 'Success' },
            { date: 'Sep 01, 2026', type: 'Config Rollback', duration: '45s', result: 'Success' },
            { date: 'Aug 12, 2026', type: 'Full Database Restore', duration: '13m 40s', result: 'Success' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0 text-sm">
              <div>
                <p className="font-bold text-white">{log.type}</p>
                <p className="text-xs text-text-muted">{log.date} · Duration: {log.duration}</p>
              </div>
              <span className="text-emerald-400 font-bold">{log.result}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
