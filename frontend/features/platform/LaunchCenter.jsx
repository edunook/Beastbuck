import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { CheckCircle2, XCircle, AlertTriangle, Rocket } from 'lucide-react';

const CHECKLIST = [
  { item: 'Authentication & Security Rules', status: 'Ready' },
  { item: 'Payment Gateway Integration', status: 'Ready' },
  { item: 'AI Provider Routing', status: 'Ready' },
  { item: 'Cloudinary Asset Pipeline', status: 'Ready' },
  { item: 'Notification Delivery System', status: 'Warning' },
  { item: 'Mission Control Analytics', status: 'Ready' },
  { item: 'Marketplace Transactions', status: 'Ready' },
  { item: 'Academy Course Delivery', status: 'Ready' },
  { item: 'Venture Incubation Flows', status: 'Ready' },
  { item: 'Governance Voting Protocol', status: 'Ready' }
];

export default function LaunchCenter() {
  return (
    <PageContainer>
      <PageHeader title="Launch Readiness Center" description="Pre-flight checklist for BeastBuck OS v1.0 Production Launch." />
      
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between bg-surface/40 border border-border rounded-xl p-6 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Rocket className="text-accent" /> T-Minus Launch Status</h2>
          <p className="text-text-muted mt-1">90% of critical systems are validated for production.</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          Initiate Production Launch
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-heading font-bold text-white">System Validation Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {CHECKLIST.map((c, i) => (
            <div key={i} className="flex justify-between items-center border-b border-border/30 pb-2">
              <span className="text-sm text-white">{c.item}</span>
              {c.status === 'Ready' && <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold uppercase"><CheckCircle2 className="w-4 h-4" /> Ready</span>}
              {c.status === 'Warning' && <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold uppercase"><AlertTriangle className="w-4 h-4" /> Check</span>}
              {c.status === 'Critical' && <span className="flex items-center gap-1 text-xs text-red-400 font-bold uppercase"><XCircle className="w-4 h-4" /> Blocked</span>}
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
