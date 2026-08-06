import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Bot, MessageSquare, Send, Sparkles } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AIAssistantPanel() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const context = {
    tasks: ['Complete research paper', 'Review project proposal', 'Attend AI Workshop'],
    projects: ['AI Research Platform', 'Dashboard Redesign'],
    deadlines: ['2024-03-15', '2024-02-28'],
    research: ['Neural Network Optimization', 'Quantum Computing'],
    experiments: ['Testing Stage', 'Analysis Stage'],
  };

  const messages = [
    { id: 1, type: 'ai', content: 'Hello! I\'m your AI assistant. I know about your current tasks, projects, deadlines, research, and experiments. How can I help you today?' },
    { id: 2, type: 'user', content: 'What should I prioritize today?' },
    { id: 3, type: 'ai', content: 'Based on your deadlines, I recommend prioritizing the "Complete research paper" task due on March 15th. Your AI Research Platform project is at 75% progress and should be completed soon.' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="AI Assistant Panel" 
        description="Persistent AI assistant knowing current tasks, projects, deadlines, research, and experiments, answering dashboard-related questions instantly."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="h-6 w-6 text-accent" />
            <h3 className="font-bold text-white text-xl">AI Assistant</h3>
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>

          <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <h4 className="font-bold text-white mb-2">I Know About:</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-text-muted">Tasks:</p>
                <p className="text-white">{context.tasks.length} active</p>
              </div>
              <div>
                <p className="text-text-muted">Projects:</p>
                <p className="text-white">{context.projects.length} ongoing</p>
              </div>
              <div>
                <p className="text-text-muted">Deadlines:</p>
                <p className="text-white">{context.deadlines.length} upcoming</p>
              </div>
              <div>
                <p className="text-text-muted">Research:</p>
                <p className="text-white">{context.research.length} papers</p>
              </div>
              <div>
                <p className="text-text-muted">Experiments:</p>
                <p className="text-white">{context.experiments.length} active</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${msg.type === 'user' ? 'bg-purple-600' : 'bg-white/10'}`}>
                  <p className="text-white">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about your dashboard..."
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
            />
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
