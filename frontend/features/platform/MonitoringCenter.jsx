import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Activity, Server, Zap, AlertCircle } from 'lucide-react';

export default function MonitoringCenter() {
  return (
    <PageContainer>
      <PageHeader title="Observability & Performance" description="Real-time monitoring of application vitals and infrastructure usage." />
      
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'System Uptime', value: '99.99%', icon: Activity, color: 'text-emerald-400' },
          { label: 'Avg API Response', value: '45ms', icon: Zap, color: 'text-yellow-400' },
          { label: 'Active Errors', value: '0', icon: AlertCircle, color: 'text-emerald-400' },
          { label: 'Server Load', value: '14%', icon: Server, color: 'text-blue-400' }
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-heading font-bold text-white">Firestore Usage (24h)</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 text-white"><span>Reads (45.2M / 50M)</span><span>90%</span></div>
              <div className="w-full bg-white/5 rounded-full h-2"><div className="bg-yellow-400 h-2 rounded-full" style={{ width: '90%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-white"><span>Writes (1.2M / 20M)</span><span>6%</span></div>
              <div className="w-full bg-white/5 rounded-full h-2"><div className="bg-emerald-400 h-2 rounded-full" style={{ width: '6%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-white"><span>Deletes (400K / 20M)</span><span>2%</span></div>
              <div className="w-full bg-white/5 rounded-full h-2"><div className="bg-emerald-400 h-2 rounded-full" style={{ width: '2%' }}></div></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-heading font-bold text-white">Core Web Vitals</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm border-b border-border/50 pb-2"><span className="text-text-muted">Largest Contentful Paint (LCP)</span><span className="text-emerald-400 font-bold">1.2s</span></div>
            <div className="flex justify-between text-sm border-b border-border/50 pb-2"><span className="text-text-muted">First Input Delay (FID)</span><span className="text-emerald-400 font-bold">12ms</span></div>
            <div className="flex justify-between text-sm border-b border-border/50 pb-2"><span className="text-text-muted">Cumulative Layout Shift (CLS)</span><span className="text-emerald-400 font-bold">0.01</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-muted">Time to Interactive (TTI)</span><span className="text-emerald-400 font-bold">1.8s</span></div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
