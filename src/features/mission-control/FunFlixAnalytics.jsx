import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { BarChart2, Film, Users, Eye } from 'lucide-react';

export default function FunFlixAnalytics() {
  return (
    <PageContainer>
      <PageHeader title="FunFlix Mission Control" description="High-level analytics and performance tracking for the entertainment network." />
      
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'Total Network Views', value: '4.2M', trend: '+15%', icon: Eye, color: 'text-blue-400' },
          { label: 'Total Uploads', value: '12.4K', trend: '+5%', icon: Film, color: 'text-purple-400' },
          { label: 'Active Creators', value: '892', trend: '+12%', icon: Users, color: 'text-emerald-400' },
          { label: 'Avg Engagement Rate', value: '14.2%', trend: '+2%', icon: BarChart2, color: 'text-yellow-400' }
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted mb-2">{s.label}</p>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">{s.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="font-bold text-white mb-4">Most Popular Categories</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 text-white"><span>Comedy Skits</span><span>45%</span></div>
              <div className="w-full bg-white/5 rounded-full h-2"><div className="bg-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-white"><span>Challenge Videos</span><span>30%</span></div>
              <div className="w-full bg-white/5 rounded-full h-2"><div className="bg-emerald-400 h-2 rounded-full" style={{ width: '30%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-white"><span>Team Movies</span><span>15%</span></div>
              <div className="w-full bg-white/5 rounded-full h-2"><div className="bg-purple-400 h-2 rounded-full" style={{ width: '15%' }}></div></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="font-bold text-white mb-4">Top Performing Regions</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-white font-bold">North America</span><span className="text-emerald-400">1.2M views</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-white font-bold">Europe</span><span className="text-emerald-400">890K views</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-white font-bold">Asia Pacific</span><span className="text-emerald-400">650K views</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
