import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { BookOpen, Brain, Shield, Clock, Award, PlayCircle, CheckCircle, Trophy, Sparkles, Database, Zap, BarChart3 } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AILearningAcademy() {
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState(null);

  const lessons = [
    { id: 'prompt', name: 'Prompt Engineering', icon: Sparkles, color: 'purple', modules: 8, completed: true, xp: 500 },
    { id: 'llms', name: 'LLMs', icon: Brain, color: 'cyan', modules: 6, completed: true, xp: 400 },
    { id: 'safety', name: 'AI Safety', icon: Shield, color: 'emerald', modules: 5, completed: false, xp: 350 },
    { id: 'context', name: 'Context Windows', icon: Clock, color: 'amber', modules: 4, completed: false, xp: 300 },
    { id: 'memory', name: 'Memory', icon: Database, color: 'pink', modules: 5, completed: false, xp: 350 },
    { id: 'rag', name: 'RAG', icon: BookOpen, color: 'red', modules: 7, completed: false, xp: 450 },
    { id: 'reasoning', name: 'Reasoning', icon: Brain, color: 'blue', modules: 6, completed: false, xp: 400 },
    { id: 'fine-tuning', name: 'Fine-tuning Concepts', icon: Zap, color: 'violet', modules: 5, completed: false, xp: 350 },
    { id: 'models', name: 'Model Comparison', icon: BarChart3, color: 'orange', modules: 4, completed: false, xp: 300 },
    { id: 'practices', name: 'Best Practices', icon: Award, color: 'teal', modules: 6, completed: false, xp: 400 },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Learning Academy" 
        description="Interactive lessons for prompt engineering, LLMs, AI safety, and more with animations and certificates."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => {
          const Icon = lesson.icon;
          return (
            <Card key={lesson.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(lesson.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{lesson.name}</h3>
                  {lesson.completed && (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <p className="text-text-muted text-sm mb-4">{lesson.modules} Modules</p>
                <div className="flex items-center justify-between">
                  <span className="text-accent font-bold">+{lesson.xp} XP</span>
                  <Button
                    onClick={() => setSelectedLesson(lesson)}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="sm"
                    disabled={!lesson.completed}
                  >
                    {lesson.completed ? 'Continue' : 'Locked'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedLesson && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = selectedLesson.icon;
                return <Icon className="h-5 w-5 text-accent" />;
              })()}
              {selectedLesson.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <PlayCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="font-bold text-white text-xl mb-2">Lesson Starting...</h3>
              <p className="text-text-muted mb-6">Interactive lesson with animations, examples, and quizzes</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setSelectedLesson(null)} variant="secondary">
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Trophy className="h-4 w-4 mr-2" />
                  Start Lesson
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
