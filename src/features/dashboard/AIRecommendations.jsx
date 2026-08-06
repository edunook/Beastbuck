import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Bot, BookOpen, FolderKanban, FlaskConical, FileText, CheckCircle, Sparkles, Users } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AIRecommendations() {
  const { user } = useAuth();

  const recommendations = [
    { id: 1, type: 'Course', title: 'Advanced Machine Learning', description: 'Based on your research interests', icon: BookOpen, color: 'purple' },
    { id: 2, type: 'Member', title: 'Dr. Sarah Chen', description: 'Similar research background', icon: Users, color: 'cyan' },
    { id: 3, type: 'Project', title: 'AI Ethics Framework', description: 'Aligns with your expertise', icon: FolderKanban, color: 'emerald' },
    { id: 4, type: 'Experiment', title: 'Neural Architecture Search', description: 'Complements your current work', icon: FlaskConical, color: 'amber' },
    { id: 5, type: 'Research', title: 'Transformer Optimization', description: 'Relevant to your publications', icon: FileText, color: 'pink' },
    { id: 6, type: 'Task', title: 'Review Paper Submission', description: 'Priority: High', icon: CheckCircle, color: 'red' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Recommendations" 
        description="AI-powered recommendations analyzing projects, tasks, deadlines, learning, and research to suggest courses, members, projects, experiments, research papers, and tasks."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">AI-Powered Suggestions</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <div key={rec.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div className={`p-3 rounded-xl ${getColorClass(rec.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-muted uppercase">{rec.type}</span>
                    </div>
                    <h3 className="font-bold text-white">{rec.title}</h3>
                    <p className="text-text-muted text-sm">{rec.description}</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
