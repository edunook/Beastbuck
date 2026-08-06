import { Eye, Users, Download, MousePointer, TrendingUp, Globe, FolderKanban, FileText, Heart, Image } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function Analytics() {
  const metrics = [
    { id: 'views', name: 'Portfolio Views', value: '12,456', icon: Eye, color: 'purple', trend: '+15%' },
    { id: 'unique', name: 'Unique Visitors', value: '8,234', icon: Users, color: 'cyan', trend: '+12%' },
    { id: 'downloads', name: 'Downloads', value: '1,567', icon: Download, color: 'emerald', trend: '+25%' },
    { id: 'clicks', name: 'Clicks', value: '23,456', icon: MousePointer, color: 'amber', trend: '+18%' },
    { id: 'followers', name: 'Followers Growth', value: '+234', icon: TrendingUp, color: 'pink', trend: '+30%' },
    { id: 'engagement', name: 'Engagement Rate', value: '8.5%', icon: Heart, color: 'red', trend: '+5%' },
    { id: 'media', name: 'Media Views', value: '45,678', icon: Image, color: 'blue', trend: '+22%' },
  ];

  const countryDistribution = [
    { country: 'United States', percentage: 35 },
    { country: 'India', percentage: 25 },
    { country: 'United Kingdom', percentage: 15 },
    { country: 'Canada', percentage: 10 },
    { country: 'Australia', percentage: 8 },
    { country: 'Germany', percentage: 7 },
  ];

  const topViewed = [
    { name: 'AI Research Project', type: 'Project', views: 3456 },
    { name: 'Machine Learning Paper', type: 'Research', views: 2345 },
    { name: 'React Dashboard', type: 'Project', views: 1890 },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Portfolio Analytics" 
        description="Owner-only analytics including portfolio views, unique visitors, downloads, clicks, followers growth, engagement, media views, country distribution, top viewed project, and top viewed research."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Country Distribution</h3>
            </div>
            <div className="space-y-3">
              {countryDistribution.map((item) => (
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Top Viewed Content</h3>
            </div>
            <div className="space-y-3">
              {topViewed.map((item, index) => {
                const Icon = item.type === 'Project' ? FolderKanban : FileText;
                return (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                    <div className={`p-2 rounded-lg ${item.type === 'Project' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-text-muted text-sm">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">{item.views.toLocaleString()}</p>
                      <p className="text-text-muted text-xs">views</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
