import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { BarChart3, Users, Clock, Heart, Star, Bookmark, Share2, TrendingUp, Award, MessageSquare, Database, HelpCircle } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function AIAnalytics() {
  const { user } = useAuth();

  const metrics = [
    { id: 'conversations', name: 'Total Conversations', value: 12345, icon: MessageSquare, color: 'purple', trend: '+12%' },
    { id: 'active', name: 'Active Users', value: 2345, icon: Users, color: 'cyan', trend: '+8%' },
    { id: 'retention', name: 'Retention Rate', value: '78%', icon: TrendingUp, color: 'emerald', trend: '+5%' },
    { id: 'session', name: 'Avg Session Time', value: '12m', icon: Clock, color: 'amber', trend: '+3%' },
    { id: 'quality', name: 'Prompt Quality', value: '85%', icon: BarChart3, color: 'pink', trend: '+7%' },
    { id: 'knowledge', name: 'Knowledge Usage', value: '92%', icon: Database, color: 'red', trend: '+15%' },
    { id: 'popular', name: 'Popular Questions', value: 456, icon: HelpCircle, color: 'blue', trend: '+10%' },
    { id: 'satisfaction', name: 'Satisfaction Score', value: '4.5', icon: Star, color: 'violet', trend: '+2%' },
    { id: 'ratings', name: 'Total Ratings', value: 890, icon: Award, color: 'orange', trend: '+20%' },
    { id: 'bookmarks', name: 'Bookmarks', value: 567, icon: Bookmark, color: 'teal', trend: '+18%' },
    { id: 'shares', name: 'Shares', value: 234, icon: Share2, color: 'rose', trend: '+25%' },
    { id: 'growth', name: 'Growth Rate', value: '+45%', icon: TrendingUp, color: 'indigo', trend: '+45%' },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Analytics" 
        description="Comprehensive analytics for AI creators including usage, engagement, and growth metrics."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(metric.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{metric.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-accent">{metric.value}</p>
                  <span className="text-emerald-400 text-sm">{metric.trend}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
