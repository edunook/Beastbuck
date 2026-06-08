import { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Filter } from 'lucide-react';
import { IntelligencePanel } from './missionControlUtils';
import { IntelligenceService } from '../../services/firebase/intelligence';

export default function ReportsCenter() {
  const [generating, setGenerating] = useState(false);

  const handleExport = async (type) => {
    setGenerating(true);
    try {
      // Simulate real report generation by getting latest snapshot
      const snapshot = await IntelligenceService.getLatestSnapshot();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `beastbuck-report-${new Date().toISOString().split('T')[0]}.${type === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-heading text-lg font-bold text-white">Reports Center</h2>
        <p className="text-xs text-text-muted">Generate scheduled and on-demand reports for leadership review.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <IntelligencePanel title="Weekly Snapshot" icon={FileText}>
          <p className="text-sm text-text-muted mb-4">
            A comprehensive overview of platform activity, member growth, and project milestones achieved over the last 7 days.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport('pdf')}
              disabled={generating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 font-bold text-black transition-all hover:bg-accent-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={generating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2 font-bold text-white transition-all hover:bg-white/10 disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" /> CSV Data
            </button>
          </div>
        </IntelligencePanel>

        <IntelligencePanel title="Department Performance" icon={Filter}>
          <p className="text-sm text-text-muted mb-4">
            Detailed breakdown of XP generation, active projects, and member contributions grouped by department.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport('pdf')}
              disabled={generating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 font-bold text-black transition-all hover:bg-accent-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={generating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2 font-bold text-white transition-all hover:bg-white/10 disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" /> CSV Data
            </button>
          </div>
        </IntelligencePanel>
      </div>
    </div>
  );
}
