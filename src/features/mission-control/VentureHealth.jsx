import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Rocket, Activity, AlertTriangle, Coins } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function VentureHealth() {
  const metrics = [
    { label: 'Active Ventures', value: '42', change: '+12%', icon: Rocket, color: 'text-accent' },
    { label: 'Avg Health Score', value: '86/100', change: '+5%', icon: Activity, color: 'text-green-400' },
    { label: 'Total Virtual Funding', value: '$2.4M', change: '+18%', icon: Coins, color: 'text-purple-400' },
    { label: 'High Risk Ventures', value: '3', change: '-2', icon: AlertTriangle, color: 'text-orange-400' }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Venture Health & Analytics"
        description="Mission Control overview of startup growth, innovation pipelines, and simulated funding."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map(m => (
          <Card key={m.label} className="bg-surface/50 border-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-black/40 border border-border/50 ${m.color}`}>
                  <m.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded bg-black/40 ${
                  m.change.startsWith('+') ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {m.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{m.value}</h3>
              <p className="text-sm text-text-muted">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="bg-surface/50 border-border">
            <CardContent className="p-6">
               <h3 className="font-bold text-white mb-6">Growth Velocity Pipeline</h3>
               <div className="space-y-6">
                  {['IDEA', 'MVP', 'SCALING', 'ENTERPRISE'].map((stage, idx) => (
                     <div key={stage} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-bold text-text-muted uppercase">{stage}</div>
                        <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                           <div className="h-full bg-accent rounded-full" style={{ width: `${Math.max(10, 100 - (idx * 25))}%` }}></div>
                        </div>
                        <div className="w-12 text-right font-bold text-white">{Math.max(2, 42 - (idx * 12))}</div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="bg-surface/50 border-border">
            <CardContent className="p-6">
               <h3 className="font-bold text-white mb-6">Innovation Distribution (Simulated)</h3>
               <div className="h-48 flex items-center justify-center border-2 border-dashed border-border/50 rounded-xl">
                  <p className="text-text-muted">Chart Component placeholder</p>
               </div>
            </CardContent>
         </Card>
      </div>
    </PageContainer>
  );
}
