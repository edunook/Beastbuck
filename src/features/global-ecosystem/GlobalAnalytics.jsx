import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { BarChart3, Users, Building, Rocket, BookOpen, GraduationCap, Link2, Calendar } from 'lucide-react';

const METRICS = [
  { label: 'Total Members', value: '1.2M', icon: Users, color: 'text-blue-400' },
  { label: 'Total Communities', value: '1,032', icon: Building, color: 'text-purple-400' },
  { label: 'Total Ventures', value: '45.2K', icon: Rocket, color: 'text-emerald-400' },
  { label: 'Total Research Papers', value: '89K', icon: BookOpen, color: 'text-yellow-400' },
  { label: 'Knowledge Assets', value: '2.4M', icon: GraduationCap, color: 'text-cyan-400' },
  { label: 'Total Collaborations', value: '340K', icon: Link2, color: 'text-pink-400' },
  { label: 'Total Events', value: '1,204', icon: Calendar, color: 'text-orange-400' },
  { label: 'Ecosystem Value', value: '$4.2B', icon: BarChart3, color: 'text-accent' },
];

export default function GlobalAnalytics() {
  return (
    <PageContainer>
      <PageHeader title="Global Analytics Platform" description="Macro-level metrics across the entire BeastBuck global ecosystem." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <div key={i} className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface/40 p-6 text-center backdrop-blur-sm">
            <m.icon className={`mb-3 h-8 w-8 ${m.color}`} />
            <h3 className="text-3xl font-bold text-white">{m.value}</h3>
            <p className="mt-1 text-sm text-text-muted">{m.label}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
