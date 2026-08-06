import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { BookOpen, Award, GraduationCap, Clock, Flame } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function LearningProgress() {
  const { user } = useAuth();

  const metrics = [
    { id: 'courses', name: 'Courses', value: 18, icon: BookOpen, color: 'purple' },
    { id: 'lessons', name: 'Lessons', value: 145, icon: BookOpen, color: 'cyan' },
    { id: 'quiz', name: 'Quiz Score', value: '92%', icon: Award, color: 'emerald' },
    { id: 'certificates', name: 'Certificates', value: 12, icon: GraduationCap, color: 'amber' },
    { id: 'streak', name: 'Current Streak', value: 15, icon: Flame, color: 'pink' },
    { id: 'time', name: 'Weekly Learning', value: '12.5h', icon: Clock, color: 'red' },
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
        title="Learning Progress" 
        description="Learning metrics including courses, lessons, quiz score, certificates, current streak, and weekly learning time with progress bars."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(metric.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{metric.name}</h3>
                <p className="text-2xl font-bold text-accent">{metric.value}</p>
                <div className="h-2 mt-3 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-purple-500"
                    style={{ width: `${Math.min(100, typeof metric.value === 'number' ? metric.value * 2 : 80)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
