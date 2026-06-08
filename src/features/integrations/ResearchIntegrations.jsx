import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { BookOpen } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'arXiv', desc: 'Sync preprints and discover latest research.', connected: true },
  { name: 'Semantic Scholar', desc: 'AI-driven search and discovery for publications.', connected: true },
  { name: 'PubMed', desc: 'Access life sciences and biomedical literature.', connected: false },
  { name: 'CrossRef', desc: 'Retrieve metadata and citation networks via DOI.', connected: true },
  { name: 'ORCID', desc: 'Verify researcher identities and publications.', connected: false },
];

export default function ResearchIntegrations() {
  return (
    <PageContainer>
      <PageHeader title="Research Integrations" description="Connect global research databases and citation networks." />
      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((app, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">{app.name}</h3>
                <p className="text-xs text-text-muted">{app.desc}</p>
              </div>
            </div>
            <button className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${app.connected ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-accent text-black hover:bg-accent/80'}`}>
              {app.connected ? 'Manage' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
