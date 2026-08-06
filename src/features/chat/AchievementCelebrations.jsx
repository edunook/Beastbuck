import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Trophy, Award, GraduationCap, Rocket, UserCheck, Bot, Film, BriefcaseBusiness, Sparkles, Star, Zap } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AchievementCelebrations() {
  const { user } = useAuth();
  const [celebrations] = useState([
    {
      id: 1,
      type: 'Complete Course',
      icon: GraduationCap,
      color: 'purple',
      title: 'Course Completed!',
      description: 'You completed the AI Fundamentals course',
      xp: 500,
      badge: '🎓',
    },
    {
      id: 2,
      type: 'Publish Research',
      icon: Award,
      color: 'emerald',
      title: 'Research Published!',
      description: 'Your research paper was published',
      xp: 1000,
      badge: '📄',
    },
    {
      id: 3,
      type: 'Reach New Level',
      icon: Trophy,
      color: 'amber',
      title: 'Level Up!',
      description: 'You reached Level 10',
      xp: 2000,
      badge: '⭐',
    },
    {
      id: 4,
      type: 'Win Competition',
      icon: Sparkles,
      color: 'pink',
      title: 'Competition Winner!',
      description: 'You won the AI Hackathon',
      xp: 1500,
      badge: '🏆',
    },
    {
      id: 5,
      type: 'Become Member',
      icon: UserCheck,
      color: 'cyan',
      title: 'Welcome Aboard!',
      description: 'You became a community member',
      xp: 100,
      badge: '👋',
    },
    {
      id: 6,
      type: 'Create AI',
      icon: Bot,
      color: 'violet',
      title: 'AI Creator!',
      description: 'You created your first AI model',
      xp: 800,
      badge: '🤖',
    },
    {
      id: 7,
      type: 'Upload FunFlix',
      icon: Film,
      color: 'red',
      title: 'Content Creator!',
      description: 'You uploaded your first video',
      xp: 300,
      badge: '🎬',
    },
    {
      id: 8,
      type: 'Launch Venture',
      icon: BriefcaseBusiness,
      color: 'blue',
      title: 'Startup Launched!',
      description: 'You launched your venture',
      xp: 2500,
      badge: '🚀',
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'Complete Course': return GraduationCap;
      case 'Publish Research': return Award;
      case 'Reach New Level': return Trophy;
      case 'Win Competition': return Sparkles;
      case 'Become Member': return UserCheck;
      case 'Create AI': return Bot;
      case 'Upload FunFlix': return Film;
      case 'Launch Venture': return BriefcaseBusiness;
      default: return Trophy;
    }
  };

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-gradient-to-br from-purple-500/25 via-purple-500/15 to-violet-500/10 border-purple-500/40 text-purple-400 shadow-purple-500/50',
      emerald: 'bg-gradient-to-br from-emerald-500/25 via-emerald-500/15 to-green-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/50',
      amber: 'bg-gradient-to-br from-amber-500/25 via-amber-500/15 to-yellow-500/10 border-amber-500/40 text-amber-400 shadow-amber-500/50',
      pink: 'bg-gradient-to-br from-pink-500/25 via-pink-500/15 to-rose-500/10 border-pink-500/40 text-pink-400 shadow-pink-500/50',
      cyan: 'bg-gradient-to-br from-cyan-500/25 via-cyan-500/15 to-sky-500/10 border-cyan-500/40 text-cyan-400 shadow-cyan-500/50',
      violet: 'bg-gradient-to-br from-violet-500/25 via-violet-500/15 to-purple-500/10 border-violet-500/40 text-violet-400 shadow-violet-500/50',
      red: 'bg-gradient-to-br from-red-500/25 via-red-500/15 to-rose-500/10 border-red-500/40 text-red-400 shadow-red-500/50',
      blue: 'bg-gradient-to-br from-blue-500/25 via-blue-500/15 to-sky-500/10 border-blue-500/40 text-blue-400 shadow-blue-500/50',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Achievement Celebrations" 
        description="Automatic celebration cards for community achievements."
        hero={true}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {celebrations.map((celebration) => {
          const Icon = getIcon(celebration.type);
          return (
            <Card 
              key={celebration.id} 
              className="border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="relative mb-5">
                  <div className="text-6xl text-center">{celebration.badge}</div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent animate-ping opacity-50" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent shadow-lg shadow-accent/50" />
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase mb-4 ${getColorClass(celebration.color)}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {celebration.type}
                </div>
                <h3 className="font-bold text-white text-center mb-2 text-lg group-hover:text-accent transition-colors">{celebration.title}</h3>
                <p className="text-white/60 text-sm text-center mb-5">{celebration.description}</p>
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/25 via-amber-500/15 to-orange-500/10 border border-yellow-500/40 shadow-lg shadow-yellow-500/30">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400">+{celebration.xp} XP</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
