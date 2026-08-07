import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Database, FileText, Upload, CheckCircle2, BookOpen } from 'lucide-react';

export default function AITrainingCenter() {
  return (
    <PageContainer>
      <PageHeader title="AI Training Center" description="Enhance your AI's knowledge with documents, research, and custom data." />

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[
          { label: 'Knowledge Sources', value: '12', icon: Database, color: 'text-purple-400' },
          { label: 'Documents Indexed', value: '45', icon: FileText, color: 'text-blue-400' },
          { label: 'Training Sessions', value: '8', icon: BookOpen, color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface/40 border border-border rounded-xl p-8 mb-8 backdrop-blur-sm">
        <h3 className="font-bold text-white mb-4">Upload Training Data</h3>
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-white/5 transition cursor-pointer">
          <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-bold text-white mb-1">Upload PDFs, DOCX, TXT, or Markdown</p>
          <p className="text-xs text-text-muted">Files are processed and indexed for retrieval-augmented generation.</p>
        </div>
      </div>

      <div className="bg-surface/40 border border-border rounded-xl p-6 backdrop-blur-sm">
        <h3 className="font-bold text-white mb-4">Indexed Knowledge</h3>
        <div className="space-y-3">
          {[
            { name: 'Quantum Mechanics 101.pdf', size: '2.4 MB', indexed: true },
            { name: 'Thermodynamics_Notes.md', size: '450 KB', indexed: true },
            { name: 'Research_Paper_2026.pdf', size: '4.1 MB', indexed: true },
            { name: 'Custom_Instructions.txt', size: '12 KB', indexed: true },
          ].map((file, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-text-muted" />
                <div>
                  <p className="text-sm font-bold text-white">{file.name}</p>
                  <p className="text-xs text-text-muted">{file.size}</p>
                </div>
              </div>
              {file.indexed && <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Indexed</span>}
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
