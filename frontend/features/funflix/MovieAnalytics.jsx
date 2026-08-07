import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Eye, Clock, TrendingUp, Heart, MessageSquare, Bookmark, Share2, Users, MapPin, Award } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function MovieAnalytics() {
  const { user } = useAuth();

  const metrics = [
    { id: 'views', name: 'Total Views', value: '1.2M', icon: Eye, color: 'purple', trend: '+12%' },
    { id: 'unique', name: 'Unique Viewers', value: '890K', icon: Users, color: 'cyan', trend: '+8%' },
    { id: 'watchtime', name: 'Watch Time', value: '45K hours', icon: Clock, color: 'emerald', trend: '+15%' },
    { id: 'completion', name: 'Completion Rate', value: '78%', icon: TrendingUp, color: 'amber', trend: '+5%' },
    { id: 'shares', name: 'Shares', value: '12.5K', icon: Share2, color: 'pink', trend: '+20%' },
    { id: 'likes', name: 'Likes', value: '45.2K', icon: Heart, color: 'red', trend: '+18%' },
    { id: 'comments', name: 'Comments', value: '3.4K', icon: MessageSquare, color: 'blue', trend: '+10%' },
    { id: 'bookmarks', name: 'Bookmarks', value: '8.9K', icon: Bookmark, color: 'violet', trend: '+25%' },
    { id: 'followers', name: 'Followers Gained', value: '2.3K', icon: Users, color: 'orange', trend: '+30%' },
    { id: 'trending', name: 'Trending Score', value: '92/100', icon: Award, color: 'teal', trend: '+7%' },
  ];

  const geography = [
    { country: 'United States', percentage: 35 },
    { country: 'India', percentage: 25 },
    { country: 'United Kingdom', percentage: 15 },
    { country: 'Canada', percentage: 10 },
    { country: 'Australia', percentage: 8 },
    { country: 'Others', percentage: 7 },
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
        title="Movie Analytics" 
        description="Creator analytics including views, unique viewers, watch time, completion rate, drop-off graph, shares, likes, comments, bookmarks, followers gained, audience geography, and trending score."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
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
                  <p className="text-xl font-bold text-accent">{metric.value}</p>
                  <span className="text-emerald-400 text-sm">{metric.trend}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Audience Geography
          </h3>
          <div className="space-y-3">
            {geography.map((item) => (
              <div key={item.country} className="flex items-center gap-4">
                <div className="w-32 text-text-muted text-sm">{item.country}</div>
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-purple-500" style={{ width: `${item.percentage}%` }} />
                </div>
                <div className="w-16 text-accent font-bold text-sm">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
