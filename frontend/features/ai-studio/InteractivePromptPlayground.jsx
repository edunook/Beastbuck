import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Play, RefreshCw, Sparkles, BarChart3, Code, Zap } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function InteractivePromptPlayground() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [qualityScore, setQualityScore] = useState(0);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setOutput('Based on your prompt, here is a sample response demonstrating the AI\'s understanding and capabilities.');
      setQualityScore(Math.floor(Math.random() * 30) + 70);
      setIsTesting(false);
    }, 1500);
  };

  const handleImprove = () => {
    setPrompt(prev => prev + ' [Improved with AI suggestions for clarity and structure]');
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Interactive Prompt Playground" 
        description="Experimental environment to test, compare, and improve prompts."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prompt Input</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your prompt here..."
              className="min-h-[200px] py-3"
              multiline
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleTest} className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={isTesting}>
                <Play className="h-4 w-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test Prompt'}
              </Button>
              <Button onClick={handleImprove} variant="secondary">
                <Sparkles className="h-4 w-4 mr-2" />
                Improve
              </Button>
              <Button variant="secondary">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Output</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="min-h-[200px] p-4 rounded-xl bg-white/5 border border-border">
              {output || 'AI response will appear here...'}
            </div>
            {qualityScore > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm">Prompt Quality Score</span>
                  <span className={`font-bold ${qualityScore >= 80 ? 'text-emerald-400' : qualityScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {qualityScore}/100
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${qualityScore >= 80 ? 'bg-emerald-500' : qualityScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${qualityScore}%` }} 
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Code className="h-5 w-5 text-cyan-400" />
              <span className="text-text-muted text-sm">Structure</span>
            </div>
            <p className="text-2xl font-bold text-white">Good</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              <span className="text-text-muted text-sm">Clarity</span>
            </div>
            <p className="text-2xl font-bold text-white">85%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span className="text-text-muted text-sm">Efficiency</span>
            </div>
            <p className="text-2xl font-bold text-white">High</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-text-muted text-sm">Creativity</span>
            </div>
            <p className="text-2xl font-bold text-white">Medium</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
