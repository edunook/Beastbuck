import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { CheckCircle, FolderKanban, FlaskConical, FileText, ShoppingCart, Image, Film, Calendar, Award, GraduationCap, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function DashboardStatistics() {
  const { user } = useAuth();

  const stats = [
    { id: 'tasks', name: 'Tasks Pending', value: 12, icon: CheckCircle, color: 'purple', change: -3, trend: 'down' },
    { id: 'projects', name: 'Projects', value: 8, icon: FolderKanban, color: 'cyan', change: 2, trend: 'up' },
    { id: 'experiments', name: 'Experiments', value: 5, icon: FlaskConical, color: 'emerald', change: 1, trend: 'up' },
    { id: 'research', name: 'Research Papers', value: 12, icon: FileText, color: 'amber', change: 0, trend: 'same' },
    { id: 'marketplace', name: 'Marketplace Items', value: 15, icon: ShoppingCart, color: 'pink', change: 5, trend: 'up' },
    { id: 'showcase', name: 'Showcase Posts', value: 34, icon: Image, color: 'red', change: 8, trend: 'up' },
    { id: 'funflix', name: 'FunFlix Videos', value: 7, icon: Film, color: 'blue', change: 2, trend: 'up' },
    { id: 'events', name: 'Events Joined', value: 45, icon: Calendar, color: 'violet', change: 3, trend: 'up' },
    { id: 'achievements', name: 'Achievements', value: 45, icon: Award, color: 'orange', change: 4, trend: 'up' },
    { id: 'certificates', name: 'Certificates', value: 12, icon: GraduationCap, color: 'teal', change: 1, trend: 'up' },
    { id: 'followers', name: 'Followers', value: 1234, icon: Users, color: 'rose', change: 45, trend: 'up' },
    { id: 'impact', name: 'Impact Score', value: 89, icon: TrendingUp, color: 'indigo', change: 5, trend: 'up' },
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
      orange: 'bg-orange-500/20 border-orange-500/30 border-orange-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Dashboard Statistics" 
        description="Animated statistic cards with icon, number, difference from last week, mini graph, and trend for tasks pending, projects, experiments, research papers, marketplace items, showcase posts, FunFlix videos, events joined, achievements, certificates, followers, and impact score."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
          const trendColor = stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'down' ? 'text-red-400' : 'text-text-muted';
          return (
            <Card key={stat.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(stat.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{stat.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-accent">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                    <span className="text-sm">{Math.abs(stat.change)}</span>
                  </div>
                </div>
                <div className="h-1 mt-3 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-purple-500"
                    style={{ width: `${Math.min(100, stat.value * 2)}%` }}
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
