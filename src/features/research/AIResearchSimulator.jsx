import { useState } from 'react';
import { FlaskConical, Atom, TrendingUp, DollarSign, Cloud, Leaf, Play, RotateCcw } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AIResearchSimulator() {
  const [selectedSim, setSelectedSim] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);

  const simulators = [
    {
      id: 'chemical',
      name: 'Chemical Reactions',
      icon: FlaskConical,
      description: 'Simulate chemical reactions without a lab',
      color: 'purple',
    },
    {
      id: 'physics',
      name: 'Physics Experiments',
      icon: Atom,
      description: 'Test physics concepts virtually',
      color: 'cyan',
    },
    {
      id: 'population',
      name: 'Population Growth',
      icon: TrendingUp,
      description: 'Model population dynamics',
      color: 'emerald',
    },
    {
      id: 'business',
      name: 'Business Models',
      icon: DollarSign,
      description: 'Test business strategies',
      color: 'amber',
    },
    {
      id: 'ml',
      name: 'Machine Learning',
      icon: Cloud,
      description: 'Experiment with AI models',
      color: 'pink',
    },
    {
      id: 'climate',
      name: 'Climate Effects',
      icon: Leaf,
      description: 'Simulate climate change scenarios',
      color: 'green',
    },
  ];

  const runSimulation = (simId) => {
    setSimulating(true);
    setSelectedSim(simId);
    setTimeout(() => {
      setResults({
        success: true,
        data: {
          iterations: Math.floor(Math.random() * 1000) + 100,
          accuracy: (Math.random() * 20 + 80).toFixed(1),
          time: (Math.random() * 5 + 1).toFixed(2),
          insights: [
            'Pattern detected in iteration 234',
            'Optimal parameters found',
            'Simulation converged successfully',
          ],
        },
      });
      setSimulating(false);
    }, 2000);
  };

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400 hover:bg-pink-500/30',
      green: 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Research Simulator" 
        description="Run simulations without expensive equipment!"
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {simulators.map((sim) => {
          const Icon = sim.icon;
          return (
            <Card key={sim.id} className="cursor-pointer transition-all hover:border-accent/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getColorClass(sim.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{sim.name}</h3>
                    <p className="text-text-muted text-sm mb-4">{sim.description}</p>
                    <Button
                      onClick={() => runSimulation(sim.id)}
                      disabled={simulating}
                      size="sm"
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {simulating && selectedSim === sim.id ? 'Simulating...' : 'Start'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Simulation Results */}
      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Simulation Results</span>
              <Button onClick={() => setResults(null)} size="sm" variant="secondary">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-text-muted text-sm mb-1">Iterations</p>
                <p className="text-2xl font-bold text-emerald-400">{results.data.iterations}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-text-muted text-sm mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-purple-400">{results.data.accuracy}%</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-text-muted text-sm mb-1">Time</p>
                <p className="text-2xl font-bold text-amber-400">{results.data.time}s</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-white mb-2">Key Insights:</p>
              {results.data.insights.map((insight, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 text-text-soft">
                  • {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
