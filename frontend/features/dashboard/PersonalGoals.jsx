import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FileText, Award, GraduationCap, Rocket, FolderKanban } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function PersonalGoals() {
  const { user } = useAuth();

  const goals = [
    { id: 1, title: 'Publish Research', description: 'Submit research paper to conference', progress: 80, icon: FileText, color: 'purple' },
    { id: 2, title: 'Reach Level 20', description: 'Achieve level 20 on BeastBuck', progress: 100, icon: Award, color: 'cyan' },
    { id: 3, title: 'Complete Course', description: 'Finish Advanced ML course', progress: 65, icon: GraduationCap, color: 'emerald' },
    { id: 4, title: 'Launch Product', description: 'Release first marketplace product', progress: 45, icon: Rocket, color: 'amber' },
    { id: 5, title: 'Finish Project', description: 'Complete AI Research Platform', progress: 90, icon: FolderKanban, color: 'pink' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Personal Goals" 
        description="Goal tracking for publish research, reach level 20, complete course, launch product, and finish project with animated progress."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <Card key={goal.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(goal.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-2">{goal.title}</h3>
                <p className="text-text-muted text-sm mb-4">{goal.description}</p>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-muted">Progress</span>
                    <span className="text-accent">{goal.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                {goal.progress === 100 && (
                  <div className="mt-2 text-emerald-400 text-sm font-bold flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Completed!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
