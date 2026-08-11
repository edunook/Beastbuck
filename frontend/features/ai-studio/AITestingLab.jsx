import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FlaskConical, AlertTriangle, Shield, Target, Zap, Clock, CheckCircle, FileText, MessageSquare, Star } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function AITestingLab() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    { id: 'conversation', name: 'Conversation Tests', icon: MessageSquare, color: 'purple', status: 'passed', score: 95 },
    { id: 'edge', name: 'Edge Cases', icon: Target, color: 'cyan', status: 'passed', score: 88 },
    { id: 'hallucination', name: 'Hallucination Tests', icon: AlertTriangle, color: 'amber', status: 'warning', score: 72 },
    { id: 'safety', name: 'Safety Tests', icon: Shield, color: 'emerald', status: 'passed', score: 98 },
    { id: 'accuracy', name: 'Knowledge Accuracy', icon: CheckCircle, color: 'pink', status: 'passed', score: 91 },
    { id: 'robustness', name: 'Prompt Robustness', icon: Zap, color: 'red', status: 'passed', score: 85 },
    { id: 'quality', name: 'Response Quality', icon: Star, color: 'blue', status: 'passed', score: 89 },
    { id: 'latency', name: 'Latency Analysis', icon: Clock, color: 'violet', status: 'passed', score: 92 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
    };
    return colors[color] || colors.purple;
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Testing Lab" 
        description="Pre-publish testing for quality assurance and performance analysis."
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-lg mb-1">Run All Tests</h3>
              <p className="text-text-muted text-sm">Execute comprehensive test suite</p>
            </div>
            <Button
              onClick={handleRunTests}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {tests.map((test) => {
          const Icon = test.icon;
          return (
            <Card key={test.id}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(test.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-2">{test.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full border text-xs font-bold uppercase ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                  <span className="text-accent font-bold">{test.score}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quality Report</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-white">Overall Quality Score</span>
              </div>
              <span className="text-2xl font-bold text-accent">88/100</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-white">Issues Detected</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">2</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="text-white">Safety Compliance</span>
              </div>
              <span className="text-2xl font-bold text-emerald-400">98%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
