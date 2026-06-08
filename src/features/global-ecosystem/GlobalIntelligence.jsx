import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const INSIGHTS = [
  { title: 'Surge in AI EdTech Ventures', desc: 'The ecosystem has seen a 45% increase in AI-driven EdTech startups in the Asia-Pacific region over the last 30 days.', type: 'Opportunity' },
  { title: 'Declining Engagement in Legacy Tech', desc: 'Discussions around legacy web frameworks have dropped by 30%. Consider archiving related academy courses.', type: 'Warning' },
  { title: 'Cross-Disciplinary Research Trend', desc: 'High correlation detected between Quantum Computing researchers and Biology teams. Consider launching a joint summit.', type: 'Insight' },
];

export default function GlobalIntelligence() {
  return (
    <PageContainer>
      <PageHeader title="Global AI Intelligence Layer" description="Ecosystem health analysis, predictive forecasting, and trend detection." />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Ecosystem Health Score', value: '94/100', icon: Brain, color: 'text-purple-400' },
          { label: 'Projected Growth (YoY)', value: '+142%', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Identified Risks', value: '3', icon: AlertTriangle, color: 'text-yellow-400' },
          { label: 'New Opportunities', value: '12', icon: Lightbulb, color: 'text-accent' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-4 font-heading text-lg font-bold text-white">AI Generated Ecosystem Insights</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {INSIGHTS.map((insight, i) => (
          <div key={i} className="flex flex-col justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
            <div>
              <span className={`mb-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${insight.type === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' : insight.type === 'Opportunity' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {insight.type}
              </span>
              <h4 className="mb-2 font-bold text-white">{insight.title}</h4>
              <p className="text-sm text-text-muted">{insight.desc}</p>
            </div>
            <button className="mt-4 w-full rounded-lg bg-white/5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10">Take Action</button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
