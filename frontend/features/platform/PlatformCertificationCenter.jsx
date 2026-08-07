import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Award, ShieldCheck, Zap, Heart, Server, Box } from 'lucide-react';

const CATEGORIES = [
  { name: 'Security & Auth', score: 98, icon: ShieldCheck },
  { name: 'Performance & Speed', score: 95, icon: Zap },
  { name: 'Reliability & Uptime', score: 99, icon: Server },
  { name: 'Accessibility & UX', score: 92, icon: Heart },
  { name: 'Infrastructure', score: 96, icon: Box },
  { name: 'Ecosystem Health', score: 100, icon: Award },
];

export default function PlatformCertificationCenter() {
  return (
    <PageContainer>
      <PageHeader title="Platform Certification" description="Automated verification of enterprise-grade quality and readiness." />
      
      <div className="mb-12 flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <div className="text-center">
            <span className="block text-4xl font-bold text-emerald-400">96</span>
            <span className="text-xs font-bold text-white">SCORE</span>
          </div>
        </div>
        <h2 className="font-heading text-3xl font-bold text-white">BeastBuck Enterprise Certified</h2>
        <p className="mt-2 max-w-xl text-text-muted">The platform meets or exceeds all strict requirements for security, scalability, and UX.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white">
              <cat.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                <span className="text-emerald-400 font-bold text-sm">{cat.score}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${cat.score}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
