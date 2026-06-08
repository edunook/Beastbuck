import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Handshake } from 'lucide-react';

const ORGS = [
  { name: 'OpenAI Research Lab', type: 'AI Partner', collaborations: 12, icon: 'O' },
  { name: 'Stanford Engineering', type: 'Academic', collaborations: 45, icon: 'S' },
  { name: 'Y Combinator Alumni', type: 'Venture Network', collaborations: 89, icon: 'Y' },
  { name: 'Ethereum Foundation', type: 'Web3 Partner', collaborations: 34, icon: 'E' },
];

export default function OrganizationNetwork() {
  return (
    <PageContainer>
      <PageHeader title="Multi-Organization Network" description="Discover and collaborate with partner organizations across the ecosystem." />

      <div className="grid gap-4 sm:grid-cols-2">
        {ORGS.map((org, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-bold text-accent">
                {org.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{org.name}</h3>
                <p className="text-xs text-text-muted">{org.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-text-muted">Shared Projects</p>
                <p className="font-bold text-white">{org.collaborations}</p>
              </div>
              <button className="rounded-lg bg-white/5 p-2 text-white hover:bg-white/10"><Handshake className="h-5 w-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
