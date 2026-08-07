import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { ShieldAlert, Check } from 'lucide-react';

export default function AdminGovernance() {
  return (
    <PageContainer>
      <PageHeader title="Governance Administration" description="Manage proposals, moderate elections, and resolve disputes." />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <h3 className="mb-4 font-bold text-white flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-accent"/> Pending Proposals</h3>
          <p className="text-sm text-text-muted">No pending proposals at this time.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <h3 className="mb-4 font-bold text-white flex items-center gap-2"><Check className="h-5 w-5 text-accent"/> Verification Requests</h3>
          <p className="text-sm text-text-muted">No pending verifications.</p>
        </div>
      </div>
    </PageContainer>
  );
}
