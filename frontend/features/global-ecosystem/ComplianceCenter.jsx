import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { ShieldCheck, FileText, Globe, Lock } from 'lucide-react';

export default function ComplianceCenter() {
  return (
    <PageContainer>
      <PageHeader title="Security & Compliance" description="Data governance, privacy controls, and regional compliance frameworks." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'GDPR Compliance', region: 'Europe', status: 'Compliant', icon: Globe },
          { title: 'CCPA Compliance', region: 'California, USA', status: 'Compliant', icon: Globe },
          { title: 'Data Encryption', region: 'Global', status: 'Active (AES-256)', icon: Lock },
          { title: 'SOC 2 Type II', region: 'Global', status: 'Certified', icon: ShieldCheck },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 text-center backdrop-blur-sm">
            <c.icon className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="font-bold text-white">{c.title}</h3>
            <p className="mt-1 text-xs text-text-muted">{c.region}</p>
            <span className="mt-3 inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase text-emerald-400">{c.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-heading text-lg font-bold text-white">Recent Compliance Audits</h3>
        <div className="space-y-3">
          {[
            { doc: 'Q3 2026 Security Penetration Test Report', date: 'Oct 15, 2026', auditor: 'CyberSec Global' },
            { doc: 'Annual Data Privacy Impact Assessment', date: 'Sep 01, 2026', auditor: 'Internal Compliance Team' },
            { doc: 'ISO 27001 Re-certification Audit', date: 'Aug 12, 2026', auditor: 'ISO Standards Board' },
          ].map((audit, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-text-muted" />
                <div>
                  <p className="text-sm font-bold text-white">{audit.doc}</p>
                  <p className="text-xs text-text-muted">Auditor: {audit.auditor}</p>
                </div>
              </div>
              <span className="text-xs text-text-muted">{audit.date}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
