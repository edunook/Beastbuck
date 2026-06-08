import { Activity, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const IntelligenceCenter = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Intelligence Center
        </h1>
        <p className="text-muted-foreground mt-2">Strategic overview and system telemetry.</p>
      </div>

      {/* Ecosystem Health */}
      <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="text-blue-400 w-6 h-6" />
            Ecosystem Health
          </h2>
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
            Optimal (94/100)
          </span>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 w-[94%]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Growth Forecast */}
        <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md hover:bg-surface/60 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-purple-400 w-5 h-5" />
            <h3 className="font-medium">Growth Forecast</h3>
          </div>
          <div className="text-3xl font-bold mb-2">+24.5%</div>
          <p className="text-sm text-muted-foreground">Projected ecosystem expansion next quarter.</p>
        </div>

        {/* Top Opportunities */}
        <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md hover:bg-surface/60 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="text-yellow-400 w-5 h-5" />
            <h3 className="font-medium">Top Opportunities</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span>Emerging AI Startups</span>
              <span className="text-green-400">92% Match</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span>Cross-border VC</span>
              <span className="text-green-400">88% Match</span>
            </li>
          </ul>
        </div>

        {/* Critical Risks */}
        <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md hover:bg-surface/60 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-400 w-5 h-5" />
            <h3 className="font-medium">Critical Risks</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>Liquidity Crunch in Region B</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>Regulatory Shifts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceCenter;
