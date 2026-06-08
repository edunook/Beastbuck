import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Bot, MessageSquare, Users, Star } from 'lucide-react';

export default function AIEcosystemAnalytics() {
  return (
    <PageContainer>
      <PageHeader title="AI Ecosystem — Mission Control" description="Platform-wide analytics for the community AI marketplace." />

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'Total AIs Published', value: '342', icon: Bot, color: 'text-purple-400' },
          { label: 'Total Conversations', value: '1.2M', icon: MessageSquare, color: 'text-blue-400' },
          { label: 'Active Creators', value: '89', icon: Users, color: 'text-emerald-400' },
          { label: 'Avg AI Rating', value: '4.6', icon: Star, color: 'text-yellow-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="font-bold text-white mb-4">Top AIs by Usage</h3>
          <div className="space-y-4">
            {[
              { name: 'Meme Lord', emoji: '😂', chats: '89K', creator: 'Intern Squad' },
              { name: 'Code Reviewer', emoji: '💻', chats: '61K', creator: 'Alex Rivera' },
              { name: 'Physics Guru', emoji: '⚛️', chats: '42K', creator: 'Dr. Sarah Chen' },
              { name: 'Story Weaver', emoji: '📖', chats: '34K', creator: 'Luna Park' },
            ].map((ai, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{ai.emoji}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{ai.name}</h4>
                    <p className="text-xs text-text-muted">by {ai.creator}</p>
                  </div>
                </div>
                <span className="text-accent font-bold text-sm">{ai.chats}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="font-bold text-white mb-4">Most Active Categories</h3>
          <div className="space-y-4">
            {[
              { cat: 'Educational', pct: 38 },
              { cat: 'Coding', pct: 25 },
              { cat: 'Creative & Fun', pct: 20 },
              { cat: 'Business', pct: 12 },
              { cat: 'Research', pct: 5 },
            ].map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1 text-white"><span>{c.cat}</span><span>{c.pct}%</span></div>
                <div className="w-full bg-white/5 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${c.pct}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
        <h3 className="font-bold text-white mb-4">Top AI Creators</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: 'Dr. Sarah Chen', ais: 12, chats: '124K', level: 'AI Legend' },
            { name: 'Alex Rivera', ais: 8, chats: '89K', level: 'AI Master' },
            { name: 'Intern Squad', ais: 5, chats: '102K', level: 'AI Architect' },
          ].map((c, i) => (
            <div key={i} className="bg-white/5 border border-border/50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-surface border border-border mx-auto mb-2"></div>
              <h4 className="font-bold text-white text-sm">{c.name}</h4>
              <p className="text-xs text-text-muted">{c.level} · {c.ais} AIs</p>
              <p className="text-xs text-accent font-bold mt-1">{c.chats} total chats</p>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
