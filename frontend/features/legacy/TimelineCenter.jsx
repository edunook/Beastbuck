import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Clock, Rocket, Flag, Star } from 'lucide-react';

const MILESTONES = [
  { year: '2026', title: 'Global Ecosystem Launch', desc: 'BeastBuck expanded from a platform to a fully integrated global ecosystem across mobile, desktop, and physical communities.', icon: Rocket, color: 'bg-emerald-500' },
  { year: '2025', title: 'First Unicorn Venture', desc: 'Aria Robotics achieved a $1B valuation, becoming the first unicorn incubated entirely within BeastBuck.', icon: Star, color: 'bg-yellow-500' },
  { year: '2024', title: '1 Million Members', desc: 'The ecosystem surpassed 1,000,000 active researchers, founders, and learners.', icon: Flag, color: 'bg-blue-500' },
  { year: '2023', title: 'The Founding', desc: 'BeastBuck OS was created to unify learning, research, and innovation.', icon: Clock, color: 'bg-purple-500' },
];

export default function TimelineCenter() {
  return (
    <PageContainer>
      <PageHeader title="Ecosystem Timeline" description="A historical record of major milestones and breakthroughs." />

      <div className="relative mx-auto max-w-3xl py-8">
        <div className="absolute bottom-0 left-8 top-0 w-px bg-border sm:left-1/2 sm:-ml-px" />
        
        <div className="space-y-12">
          {MILESTONES.map((item, i) => (
            <div key={i} className={`relative flex items-center ${i % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
              
              <div className="absolute left-8 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#0d1117] bg-surface sm:left-1/2">
                <item.icon className={`h-4 w-4 ${item.color.replace('bg-', 'text-')}`} />
              </div>

              <div className={`w-full pl-16 sm:w-1/2 ${i % 2 === 0 ? 'sm:pl-12 sm:pr-0' : 'sm:pl-0 sm:pr-12'}`}>
                <div className={`rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm ${i % 2 === 0 ? 'sm:text-left' : 'sm:text-right'}`}>
                  <span className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${item.color}/20 ${item.color.replace('bg-', 'text-')}`}>
                    {item.year}
                  </span>
                  <h3 className="mb-2 text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-text-muted">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
