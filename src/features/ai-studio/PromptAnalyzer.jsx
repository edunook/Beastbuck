import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { BarChart3, Eye, Ruler, Shield, Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function PromptAnalyzer() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const metrics = [
    { id: 'clarity', name: 'Clarity', icon: Eye, color: 'purple', score: 85 },
    { id: 'structure', name: 'Structure', icon: Ruler, color: 'cyan', score: 78 },
    { id: 'length', name: 'Optimal Length', icon: Ruler, color: 'emerald', score: 92 },
    { id: 'safety', name: 'Safety', icon: Shield, color: 'amber', score: 95 },
    { id: 'creativity', name: 'Creativity', icon: Lightbulb, color: 'pink', score: 72 },
    { id: 'efficiency', name: 'Efficiency', icon: TrendingUp, color: 'red', score: 88 },
    { id: 'instructions', name: 'Instructions', icon: CheckCircle, color: 'blue', score: 80 },
    { id: 'ambiguity', name: 'Low Ambiguity', icon: AlertTriangle, color: 'violet', score: 75 },
  ];

  const suggestions = [
    'Add more specific examples for better context',
    'Consider breaking down complex instructions',
    'Include desired output format specification',
    'Add constraints to limit response scope',
    'Use role-playing for better persona adoption',
  ];

  const handleAnalyze = () => {
    setAnalysis({
      overallScore: 82,
      strengths: ['Clear objective', 'Well-structured', 'Good constraints'],
      improvements: ['Add examples', 'Specify format', 'Include context'],
    });
  };

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Prompt Analyzer" 
        description="AI-powered prompt analysis with quality scoring and improvement suggestions."
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt to analyze..."
            className="min-h-[120px] py-3"
            multiline
          />
          <Button onClick={handleAnalyze} className="mt-4 bg-purple-600 hover:bg-purple-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze Prompt
          </Button>
        </CardContent>
      </Card>

      {analysis ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-accent mb-2">{analysis.overallScore}</p>
                <p className="text-text-muted">out of 100</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.id}>
                  <CardContent className="p-6">
                    <div className={`p-2 rounded-lg ${getColorClass(metric.color)} mb-3`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-white mb-1">{metric.name}</h3>
                    <p className="text-2xl font-bold text-accent">{metric.score}%</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvements</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Enter a prompt to see analysis</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
