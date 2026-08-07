import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Users, MessageSquare, Star, Clock } from 'lucide-react';

export default function AICreatorAnalytics() {
  return (
    <PageContainer>
      <PageHeader title="AI Creator Analytics" description="Track performance across all your published AI assistants." />

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'Total Conversations', value: '12.4K', trend: '+15%', icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Unique Users', value: '3.2K', trend: '+8%', icon: Users, color: 'text-blue-400' },
          { label: 'Avg Rating', value: '4.8', trend: '+0.1', icon: Star, color: 'text-yellow-400' },
          { label: 'Avg Session', value: '4m 12s', trend: '+22s', icon: Clock, color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted mb-2">{s.label}</p>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">{s.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="font-bold text-white mb-4">Per-AI Performance</h3>
          <div className="space-y-4">
            {[
              { name: 'Physics Guru', emoji: '⚛️', chats: '4.2K', rating: 4.9, trend: '+12%' },
              { name: 'Code Reviewer', emoji: '💻', chats: '6.1K', rating: 4.8, trend: '+5%' },
              { name: 'Startup Coach', emoji: '🚀', chats: '2.1K', rating: 4.7, trend: '+22%' },
            ].map((ai, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{ai.emoji}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{ai.name}</h4>
                    <p className="text-xs text-text-muted">{ai.chats} chats · ⭐ {ai.rating}</p>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-bold">{ai.trend}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="font-bold text-white mb-4">Popular Topics Asked</h3>
          <div className="space-y-3">
            {[
              { topic: 'Quantum Mechanics', pct: 35 },
              { topic: 'JavaScript Best Practices', pct: 28 },
              { topic: 'Pitch Deck Review', pct: 20 },
              { topic: 'Thermodynamics', pct: 17 },
            ].map((t, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1 text-white"><span>{t.topic}</span><span>{t.pct}%</span></div>
                <div className="w-full bg-white/5 rounded-full h-2"><div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${t.pct}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
