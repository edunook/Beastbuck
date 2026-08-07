import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Bot, Sparkles, FileText, MessageSquare, Calendar, Brain, Code, Lightbulb, Send } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function AIInsideChat() {
  const { user } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [input, setInput] = useState('');

  const features = [
    { id: 'ask-ai', name: 'Ask AI', icon: Bot, color: 'purple', description: 'Get AI assistance with any question' },
    { id: 'summarize', name: 'Summarize Discussion', icon: FileText, color: 'cyan', description: 'Get a summary of the conversation' },
    { id: 'translate', name: 'Translate Messages', icon: MessageSquare, color: 'emerald', description: 'Translate messages to any language' },
    { id: 'rewrite', name: 'Rewrite Text', icon: Sparkles, color: 'amber', description: 'Improve or rephrase your message' },
    { id: 'generate-reply', name: 'Generate Reply', icon: MessageSquare, color: 'pink', description: 'Get AI-suggested responses' },
    { id: 'create-task', name: 'Create Task', icon: Calendar, color: 'blue', description: 'Create a task from a message' },
    { id: 'create-event', name: 'Create Event', icon: Calendar, color: 'red', description: 'Schedule an event from discussion' },
    { id: 'research-notes', name: 'Generate Research Notes', icon: Brain, color: 'violet', description: 'Extract key points as research notes' },
    { id: 'explain-files', name: 'Explain Files', icon: FileText, color: 'orange', description: 'Get AI explanation of shared files' },
    { id: 'generate-code', name: 'Generate Code', icon: Code, color: 'teal', description: 'Generate code snippets' },
    { id: 'generate-ideas', name: 'Generate Ideas', icon: Lightbulb, color: 'yellow', description: 'Brainstorm ideas with AI' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Inside Chat" 
        description="Integrate AI assistant directly in your conversations."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(feature.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.name}</h3>
                <p className="text-text-muted text-sm mb-4">{feature.description}</p>
                <Button
                  onClick={() => setSelectedFeature(feature)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Use Feature
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedFeature && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = selectedFeature.icon;
                return <Icon className="h-5 w-5 text-accent" />;
              })()}
              {selectedFeature.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter text for ${selectedFeature.name.toLowerCase()}...`}
              />
              <div className="flex gap-2">
                <Button onClick={() => setSelectedFeature(null)} variant="secondary">
                  Cancel
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4 mr-2" />
                  Process
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
