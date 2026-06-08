import { Target, Zap, TrendingUp, Compass, ArrowRight } from 'lucide-react';

const OpportunityScanner = () => {
  const opportunities = [
    {
      id: 1,
      title: "Emerging Talent Pool",
      category: "Academy",
      description: "High concentration of AI specialists graduating this month.",
      confidence: 94,
      icon: Zap,
      color: "text-blue-400"
    },
    {
      id: 2,
      title: "Rising Researchers",
      category: "Research",
      description: "Quantum computing paper authors showing high collaboration potential.",
      confidence: 88,
      icon: Compass,
      color: "text-purple-400"
    },
    {
      id: 3,
      title: "High Potential Ventures",
      category: "Venture",
      description: "FinTech startups in Region APAC with accelerating traction.",
      confidence: 91,
      icon: TrendingUp,
      color: "text-green-400"
    },
    {
      id: 4,
      title: "Future Leaders",
      category: "Governance",
      description: "Members with high community engagement and reputation scores.",
      confidence: 85,
      icon: Target,
      color: "text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Opportunity Scanner
        </h1>
        <p className="text-muted-foreground mt-2">AI-driven detection of high-value prospects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.map((opp) => (
          <div key={opp.id} className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md hover:bg-surface/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/5">
                  <opp.icon className={`w-6 h-6 ${opp.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{opp.title}</h3>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{opp.category}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-white">{opp.confidence}%</span>
                <span className="text-xs text-green-400">Confidence</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-6">{opp.description}</p>
            
            <button className="w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 transition-colors">
              <span>Capitalize Opportunity</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpportunityScanner;
