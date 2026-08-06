import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { BookOpen, Target, Brain, Zap, CheckCircle, Award, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PromptEngineeringCenter() {
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState(null);

  const modules = [
    { id: 'basics', name: 'Prompt Basics', icon: BookOpen, color: 'purple', lessons: 5, completed: true },
    { id: 'role', name: 'Role Prompting', icon: Target, color: 'cyan', lessons: 4, completed: true },
    { id: 'context', name: 'Context Engineering', icon: Brain, color: 'emerald', lessons: 6, completed: false },
    { id: 'few-shot', name: 'Few-shot Prompting', icon: Zap, color: 'amber', lessons: 5, completed: false },
    { id: 'chain', name: 'Chain of Thought', icon: Brain, color: 'pink', lessons: 4, completed: false },
    { id: 'structured', name: 'Structured Output', icon: CheckCircle, color: 'red', lessons: 5, completed: false },
    { id: 'json', name: 'JSON Prompting', icon: Sparkles, color: 'blue', lessons: 3, completed: false },
    { id: 'tool', name: 'Tool Calling', icon: Zap, color: 'violet', lessons: 4, completed: false },
    { id: 'memory', name: 'Memory Design', icon: Brain, color: 'orange', lessons: 5, completed: false },
    { id: 'optimization', name: 'Prompt Optimization', icon: TrendingUp, color: 'teal', lessons: 6, completed: false },
    { id: 'safety', name: 'Safety Prompting', icon: Shield, color: 'rose', lessons: 4, completed: false },
    { id: 'rag', name: 'RAG Concepts', icon: BookOpen, color: 'indigo', lessons: 5, completed: false },
    { id: 'grounding', name: 'Knowledge Grounding', icon: CheckCircle, color: 'sky', lessons: 4, completed: false },
    { id: 'conversation', name: 'Conversation Design', icon: MessageSquare, color: 'lime', lessons: 5, completed: false },
    { id: 'personas', name: 'AI Personas', icon: Award, color: 'fuchsia', lessons: 4, completed: false },
    { id: 'evaluation', name: 'Evaluation', icon: CheckCircle, color: 'emerald', lessons: 5, completed: false },
    { id: 'testing', name: 'Testing', icon: Target, color: 'cyan', lessons: 4, completed: false },
    { id: 'advanced', name: 'Advanced Prompt Design', icon: Sparkles, color: 'purple', lessons: 6, completed: false },
    { id: 'system', name: 'System Prompt Writing', icon: BookOpen, color: 'amber', lessons: 5, completed: false },
    { id: 'chaining', name: 'Prompt Chaining', icon: Zap, color: 'pink', lessons: 4, completed: false },
    { id: 'debugging', name: 'Prompt Debugging', icon: Target, color: 'red', lessons: 5, completed: false },
    { id: 'security', name: 'Prompt Security', icon: Shield, color: 'blue', lessons: 4, completed: false },
    { id: 'ethics', name: 'AI Ethics', icon: Award, color: 'emerald', lessons: 5, completed: false },
  ];

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
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      lime: 'bg-lime-500/20 border-lime-500/30 text-lime-400',
      fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Prompt Engineering Center" 
        description="Interactive curriculum covering all aspects of prompt engineering."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(module.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{module.name}</h3>
                  {module.completed && (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <p className="text-text-muted text-sm mb-4">{module.lessons} Lessons</p>
                <Button
                  onClick={() => setSelectedModule(module)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!module.completed}
                >
                  {module.completed ? 'Continue' : 'Locked'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
