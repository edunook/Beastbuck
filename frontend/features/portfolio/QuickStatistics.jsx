import { Star, Trophy, FolderKanban, FileText, FlaskConical, ShoppingCart, Image, Film, Bot, GraduationCap, Award, Users, Heart, MessageSquare, Eye, Download, Video, Calendar, Zap, TrendingUp } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function QuickStatistics() {
  const stats = [
    { id: 'xp', name: 'XP', value: 45678, icon: Star, color: 'purple' },
    { id: 'level', name: 'Level', value: 42, icon: Trophy, color: 'cyan' },
    { id: 'rank', name: 'Rank', value: '#15', icon: Award, color: 'emerald' },
    { id: 'projects', name: 'Projects', value: 23, icon: FolderKanban, color: 'amber' },
    { id: 'research', name: 'Research Papers', value: 12, icon: FileText, color: 'pink' },
    { id: 'experiments', name: 'Experiments', value: 8, icon: FlaskConical, color: 'red' },
    { id: 'marketplace', name: 'Marketplace Products', value: 15, icon: ShoppingCart, color: 'blue' },
    { id: 'showcase', name: 'Showcase Posts', value: 34, icon: Image, color: 'violet' },
    { id: 'funflix', name: 'FunFlix Movies', value: 7, icon: Film, color: 'orange' },
    { id: 'ai', name: 'AI Models', value: 5, icon: Bot, color: 'teal' },
    { id: 'courses', name: 'Courses Completed', value: 18, icon: GraduationCap, color: 'rose' },
    { id: 'certificates', name: 'Certificates', value: 12, icon: Award, color: 'indigo' },
    { id: 'followers', name: 'Followers', value: 1234, icon: Users, color: 'sky' },
    { id: 'likes', name: 'Likes Received', value: 5678, icon: Heart, color: 'lime' },
    { id: 'comments', name: 'Comments', value: 2345, icon: MessageSquare, color: 'fuchsia' },
    { id: 'views', name: 'Views', value: 89012, icon: Eye, color: 'yellow' },
    { id: 'downloads', name: 'Downloads', value: 4567, icon: Download, color: 'orange' },
    { id: 'mentorship', name: 'Mentorship Sessions', value: 23, icon: Video, color: 'pink' },
    { id: 'events', name: 'Events Joined', value: 45, icon: Calendar, color: 'purple' },
    { id: 'hackathons', name: 'Hackathons', value: 8, icon: Zap, color: 'cyan' },
    { id: 'challenges', name: 'Challenges Won', value: 12, icon: TrendingUp, color: 'emerald' },
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
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      lime: 'bg-lime-500/20 border-lime-500/30 text-lime-400',
      fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Quick Statistics" 
        description="Animated statistic cards for XP, level, rank, projects, research papers, experiments, marketplace products, showcase posts, FunFlix movies, AI models, courses completed, certificates, followers, likes received, comments, views, downloads, mentorship sessions, events joined, hackathons, and challenges won."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(stat.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{stat.name}</h3>
                <p className="text-2xl font-bold text-accent">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
