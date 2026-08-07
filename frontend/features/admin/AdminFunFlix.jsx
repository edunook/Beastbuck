import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminFunFlix() {
  return (
    <PageContainer>
      <PageHeader title="FunFlix Moderation" description="Approve content, review reports, and manage categories." />
      
      <div className="mb-8">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert className="text-yellow-400 w-5 h-5" /> Pending Review (Flagged Content)</h3>
        <div className="bg-surface/40 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 text-text-muted bg-black/20">
                <th className="py-3 px-4">Video Title</th>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2].map(i => (
                <tr key={i} className="border-b border-border/20 text-white last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold">Inappropriate Skit Title {i}</td>
                  <td className="py-3 px-4 text-text-muted">User_{i}42</td>
                  <td className="py-3 px-4 text-yellow-400">Multiple User Reports (Spam)</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition">
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                      <button className="bg-red-500/20 text-red-400 hover:bg-red-500/40 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
