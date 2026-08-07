import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Globe, Users, Trophy, Building2, Workflow } from 'lucide-react';

export default function AdminEcosystem() {
  const adminModules = [
    { title: 'Global Chapters', icon: Globe, count: '12 Active' },
    { title: 'Ambassador Network', icon: Users, count: '45 Global' },
    { title: 'Institution Partners', icon: Building2, count: '8 Universities' },
    { title: 'Global Programs', icon: Workflow, count: '3 Open' },
    { title: 'Legacy & Hall of Fame', icon: Trophy, count: '12 Legends' }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Ecosystem & Legacy Administration"
        description="Manage chapters, ambassadors, institutional partnerships, and the Hall of Fame."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminModules.map((mod, i) => (
          <div key={i} className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface/40 p-8 text-center transition-all hover:border-accent/50 hover:bg-white/5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <mod.icon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 font-heading font-bold text-white">{mod.title}</h3>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-text-muted">
              {mod.count}
            </span>
            <button className="mt-6 w-full rounded-lg bg-white/10 py-2 text-sm font-bold text-white transition-colors hover:bg-accent hover:text-black">
              Manage
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
