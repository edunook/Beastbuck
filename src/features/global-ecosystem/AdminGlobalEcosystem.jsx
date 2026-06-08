import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Settings, Shield, Globe } from 'lucide-react';

export default function AdminGlobalEcosystem() {
  return (
    <PageContainer>
      <PageHeader title="Global Ecosystem Administration" description="Manage overarching governance policies, institutions, and global settings." />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <Globe className="mb-4 h-8 w-8 text-blue-400" />
          <h3 className="mb-2 font-bold text-white">Region Management</h3>
          <p className="mb-4 text-sm text-text-muted">Configure localized policies and settings.</p>
          <button className="w-full rounded-lg bg-white/5 py-2 text-sm font-bold text-white hover:bg-white/10">Manage Regions</button>
        </div>
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <Shield className="mb-4 h-8 w-8 text-emerald-400" />
          <h3 className="mb-2 font-bold text-white">Global Compliance</h3>
          <p className="mb-4 text-sm text-text-muted">Audit data sharing agreements.</p>
          <button className="w-full rounded-lg bg-white/5 py-2 text-sm font-bold text-white hover:bg-white/10">Audit Compliance</button>
        </div>
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <Settings className="mb-4 h-8 w-8 text-purple-400" />
          <h3 className="mb-2 font-bold text-white">System Settings</h3>
          <p className="mb-4 text-sm text-text-muted">Global configuration flags.</p>
          <button className="w-full rounded-lg bg-white/5 py-2 text-sm font-bold text-white hover:bg-white/10">Configure</button>
        </div>
      </div>
    </PageContainer>
  );
}
