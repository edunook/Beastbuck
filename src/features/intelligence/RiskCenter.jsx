import { AlertOctagon, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

const RiskCenter = () => {
  const risks = [
    {
      id: 1,
      title: "Marketplace Abuse Detected",
      severity: "High",
      impact: "Severe",
      description: "Anomalous transaction patterns flagged in digital asset exchanges.",
      icon: AlertOctagon,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    },
    {
      id: 2,
      title: "Stalled Research Projects",
      severity: "Medium",
      impact: "Moderate",
      description: "3 key AI alignment papers have missed milestones by >30 days.",
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20"
    },
    {
      id: 3,
      title: "Failing Ventures Portfolio",
      severity: "Low",
      impact: "Low",
      description: "Early-stage edtech startup runway below 2 months.",
      icon: ShieldAlert,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20"
    }
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">
          Risk Center
        </h1>
        <p className="text-muted-foreground mt-2">Threat detection and mitigation protocols.</p>
      </div>

      <div className="space-y-4">
        {risks.map((risk) => (
          <div key={risk.id} className={cn("p-6 rounded-xl backdrop-blur-md border transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between", risk.bg, risk.border)}>
            <div className="flex gap-4 items-start md:items-center">
              <div className="p-3 rounded-lg bg-white/5">
                <risk.icon className={cn("w-6 h-6", risk.color)} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">{risk.title}</h3>
                <p className="text-sm text-gray-300 mt-1">{risk.description}</p>
                <div className="flex gap-3 mt-3">
                  <span className={cn("text-xs px-2 py-1 rounded-md bg-white/10 font-medium", risk.color)}>
                    Severity: {risk.severity}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-md bg-white/10 font-medium text-gray-300">
                    Impact: {risk.impact}
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
              <ShieldCheck className="w-4 h-4" />
              <span>Mitigate Risk</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskCenter;
