import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { FileText, Download, Clock } from 'lucide-react';

export default function ReportsAutomation() {
  const reports = [
    { title: 'Daily Ecosystem Health', schedule: 'Every day at 00:00 UTC', format: 'PDF & Email', status: 'Active' },
    { title: 'Weekly Growth Forecast', schedule: 'Mondays at 08:00 UTC', format: 'Dashboard', status: 'Active' },
    { title: 'Monthly Strategic Insight', schedule: '1st of Month', format: 'PDF & Presenter View', status: 'Active' }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Automated Reporting"
        description="Configure and download scheduled intelligence reports."
        action={
          <button className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105">
            <FileText className="h-4 w-4" />
            Create Report Rule
          </button>
        }
      />

      <div className="flex flex-col gap-4">
        {reports.map((r, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-5">
            <div>
              <h3 className="mb-1 font-bold text-white flex items-center gap-2">{r.title}</h3>
              <p className="flex items-center gap-2 text-sm text-text-muted">
                <Clock className="h-4 w-4" /> {r.schedule} • {r.format}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">{r.status}</span>
              <button className="flex items-center justify-center rounded-lg bg-white/5 p-2 text-white hover:bg-white/10 hover:text-accent transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
