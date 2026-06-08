import { useEffect, useState } from 'react';
import { HeartPulse, Activity, Shield, Users, Globe, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IntelligenceService } from '../../services/firebase/intelligence';

const EcosystemHealth = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    async function loadHealth() {
      try {
        let snapshot = await IntelligenceService.getLatestSnapshot();
        if (!snapshot) {
          snapshot = await IntelligenceService.generateEcosystemSnapshot();
        }
        
        if (snapshot?.metrics) {
          const m = snapshot.metrics;
          setMetrics([
            { name: 'Member Health', score: m.memberGrowth?.score || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400' },
            { name: 'Research Health', score: m.researchOutput?.score || 0, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400' },
            { name: 'Venture Health', score: m.ventureSuccess?.score || 0, icon: Activity, color: 'text-green-400', bg: 'bg-green-400' },
            { name: 'Marketplace Health', score: m.marketplaceVelocity?.score || 0, icon: Globe, color: 'text-yellow-400', bg: 'bg-yellow-400' },
            { name: 'Academy Health', score: m.academyEngagement?.score || 0, icon: HeartPulse, color: 'text-pink-400', bg: 'bg-pink-400' },
            { name: 'Governance Health', score: m.governanceParticipation?.score || 0, icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400' },
          ]);
        }
      } catch (error) {
        console.error("Failed to load ecosystem health", error);
      }
      setLoading(false);
    }
    loadHealth();
  }, []);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
          Ecosystem Health
        </h1>
        <p className="text-muted-foreground mt-2">Detailed breakdown of sector vitality.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-lg font-medium mb-6 self-start w-full">Vitality Distribution</h3>
          {loading ? (
             <div className="flex-1 flex items-center justify-center text-text-muted">Loading chart...</div>
          ) : (
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {metrics.length > 0 ? Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length) : 0}
                  </span>
                </div>
              </div>
              {metrics.map((metric, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                const radius = (metric.score / 100) * 100;
                const x = 128 + radius * Math.cos(angle);
                const y = 128 + radius * Math.sin(angle);
                return (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      backgroundColor: metric.color.replace('text-', ''),
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Health Scores List */}
        <div className="space-y-4">
          {loading ? (
             <div className="py-12 text-center text-text-muted">Loading health metrics...</div>
          ) : metrics.map((metric, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md flex items-center gap-4">
              <div className={cn("p-3 rounded-lg bg-white/5", metric.color)}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{metric.name}</span>
                  <span className={cn(
                    "text-sm font-semibold",
                    metric.score >= 90 ? "text-green-400" : metric.score >= 80 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {metric.score}/100
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", metric.bg)} 
                    style={{ width: `${metric.score}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EcosystemHealth;
