import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { CheckCircle, MessageSquare, FlaskConical, Award, ShoppingCart, FileText, Film, Heart } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function RecentActivity() {
  const { user } = useAuth();

  const activities = [
    { id: 1, type: 'Task Completed', description: 'You completed "Review Research Proposal"', time: '5 minutes ago', icon: CheckCircle, color: 'emerald' },
    { id: 2, type: 'Comment', description: 'John commented on your project', time: '15 minutes ago', icon: MessageSquare, color: 'cyan' },
    { id: 3, type: 'Experiment Approved', description: 'Your experiment was approved', time: '1 hour ago', icon: FlaskConical, color: 'purple' },
    { id: 4, type: 'Achievement Unlocked', description: 'You earned "Research Pioneer"', time: '2 hours ago', icon: Award, color: 'amber' },
    { id: 5, type: 'Marketplace Purchase', description: 'Someone purchased your template', time: '3 hours ago', icon: ShoppingCart, color: 'pink' },
    { id: 6, type: 'Research Accepted', description: 'Your paper was accepted', time: '5 hours ago', icon: FileText, color: 'blue' },
    { id: 7, type: 'FunFlix Upload Liked', description: 'Your video received 100 likes', time: '1 day ago', icon: Heart, color: 'red' },
  ];

  const getColorClass = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.emerald;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Recent Activity" 
        description="Activity timeline from Firebase showing task completions, comments, experiment approvals, achievements, marketplace purchases, research acceptances, and FunFlix upload likes."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-xl ${getColorClass(activity.color)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-accent font-bold">{activity.type}</span>
                      <span className="text-text-muted text-sm">{activity.time}</span>
                    </div>
                    <p className="text-text-muted">{activity.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
