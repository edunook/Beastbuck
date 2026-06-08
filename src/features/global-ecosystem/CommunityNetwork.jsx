import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Users, Globe2, MapPin, Activity } from 'lucide-react';

const COMMUNITIES = [
  { name: 'BeastBuck Europe', region: 'Europe', members: '14.2K', status: 'Active', icon: '🇪🇺' },
  { name: 'AI Builders Asia', region: 'Asia-Pacific', members: '8.4K', status: 'Active', icon: '🌏' },
  { name: 'Quantum Researchers NA', region: 'North America', members: '3.1K', status: 'Growing', icon: '🌎' },
  { name: 'Web3 Africa', region: 'Africa', members: '5.6K', status: 'Active', icon: '🌍' },
];

export default function CommunityNetwork() {
  return (
    <PageContainer>
      <PageHeader title="Global Community Network" description="Connect with localized chapters, regional hubs, and global networks." />

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Global Communities', value: '142', icon: Globe2, color: 'text-blue-400' },
          { label: 'Local Chapters', value: '890', icon: MapPin, color: 'text-purple-400' },
          { label: 'Total Network Members', value: '1.2M', icon: Users, color: 'text-emerald-400' },
          { label: 'Weekly Active', value: '450K', icon: Activity, color: 'text-yellow-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-4 font-heading text-lg font-bold text-white">Top Regional Communities</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMMUNITIES.map((c, i) => (
          <div key={i} className="flex flex-col justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition-all hover:border-accent/30 hover:bg-white/5">
            <div className="mb-4 text-4xl">{c.icon}</div>
            <h3 className="mb-1 font-bold text-white">{c.name}</h3>
            <p className="mb-4 text-xs text-text-muted"><MapPin className="mr-1 inline h-3 w-3" /> {c.region}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white"><Users className="mr-1 inline h-3 w-3 text-text-muted" />{c.members}</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-bold uppercase text-emerald-400">{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
