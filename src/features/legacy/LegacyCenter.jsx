import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Medal, Star, Shield, Trophy } from 'lucide-react';

const LEGENDS = [
  { name: 'Dr. Sarah Chen', title: 'Pioneer of Quantum Encryption', year: '2025', icon: Trophy, color: 'text-yellow-400' },
  { name: 'Marcus Sterling', title: 'Ecosystem Architect', year: '2024', icon: Shield, color: 'text-emerald-400' },
  { name: 'Aria Robotics (Venture)', title: 'First Unicorn Startup', year: '2026', icon: Star, color: 'text-blue-400' },
];

export default function LegacyCenter() {
  return (
    <PageContainer>
      <PageHeader title="Legacy & Hall of Fame" description="Preserving the greatest members, discoveries, and ventures for future generations." />

      <div className="mb-12 flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-500/10 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
          <Medal className="h-12 w-12 text-yellow-400" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-white">The BeastBuck Hall of Fame</h2>
        <p className="mt-2 max-w-xl text-text-muted">An immutable ledger honoring the individuals and teams who have fundamentally shaped the trajectory of global innovation.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {LEGENDS.map((legend, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl border border-border bg-surface/40 p-6 text-center backdrop-blur-sm transition-all hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <legend.icon className={`mx-auto mb-4 h-10 w-10 ${legend.color}`} />
            <h3 className="text-xl font-bold text-white">{legend.name}</h3>
            <p className="mb-2 text-sm text-text-muted">{legend.title}</p>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">Inducted {legend.year}</span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
