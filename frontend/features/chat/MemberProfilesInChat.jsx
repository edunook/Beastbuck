import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { User, Award, BriefcaseBusiness, GraduationCap, MessageSquare, ExternalLink, Code, FileText, Sparkles, Trophy, Star, Zap, Shield, Clock, TrendingUp } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function MemberProfilesInChat() {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);

  const members = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      avatar: '👩‍🔬',
      skills: ['AI', 'Machine Learning', 'Research'],
      role: 'Senior Researcher',
      department: 'Research',
      achievements: ['Top Contributor', 'Research Legend'],
      projects: 15,
      research: 23,
      portfolio: 'sarah-chen.research',
      status: 'online',
      xp: 15420,
      level: 42,
    },
    {
      id: 2,
      name: 'Alex Johnson',
      avatar: '👨‍💼',
      skills: ['React', 'Node.js', 'Python'],
      role: 'Full Stack Developer',
      department: 'Engineering',
      achievements: ['Code Master', 'Startup Founder'],
      projects: 34,
      research: 5,
      portfolio: 'alex-johnson.dev',
      status: 'coding',
      xp: 12850,
      level: 38,
    },
    {
      id: 3,
      name: 'Emma Williams',
      avatar: '👩‍💻',
      skills: ['UI/UX', 'Design', 'Figma'],
      role: 'UX Designer',
      department: 'Design',
      achievements: ['Design Expert', 'Top Mentor'],
      projects: 28,
      research: 2,
      portfolio: 'emma-williams.design',
      status: 'away',
      xp: 11300,
      level: 35,
    },
    {
      id: 4,
      name: 'James Brown',
      avatar: '👨‍🚀',
      skills: ['Business', 'Strategy', 'Marketing'],
      role: 'Entrepreneur',
      department: 'Business',
      achievements: ['Startup Founder', 'Innovation Leader'],
      projects: 12,
      research: 3,
      portfolio: 'james-brown.startup',
      status: 'busy',
      xp: 9800,
      level: 31,
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      online: 'bg-status-success shadow-status-success/50',
      coding: 'bg-blue-500 shadow-blue-500/50',
      busy: 'bg-status-warning shadow-status-warning/50',
      away: 'bg-yellow-500 shadow-yellow-500/50',
    };
    return colors[status] || colors.online;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Member Profiles in Chat" 
        description="Mini profile cards showing member information with quick actions."
        hero={true}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <Card 
            key={member.id} 
            className="border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className="relative mb-4">
                <div className="text-6xl text-center">{member.avatar}</div>
                <div className={`absolute bottom-0 right-1/4 h-4 w-4 rounded-full ${getStatusColor(member.status)} animate-pulse shadow-lg`} />
              </div>
              
              <h3 className="font-bold text-white text-center mb-1 text-lg group-hover:text-accent transition-colors">{member.name}</h3>
              <p className="text-white/60 text-sm text-center mb-4">{member.role}</p>
              
              <div className="flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-xl bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/30">
                <Trophy className="h-4 w-4 text-accent" />
                <span className="text-sm font-bold text-accent">Level {member.level}</span>
                <span className="text-white/40">·</span>
                <span className="text-sm font-bold text-white">{member.xp.toLocaleString()} XP</span>
              </div>
              
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2.5 text-sm text-white/70 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <BriefcaseBusiness className="h-4 w-4 text-accent/70" />
                  <span>{member.department}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/70 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Code className="h-4 w-4 text-accent/70" />
                  <span className="truncate">{member.skills.join(', ')}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap justify-center">
                {member.achievements.map((achievement) => (
                  <span key={achievement} className="px-2.5 py-1 rounded-full bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/30 text-accent text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {achievement}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5 pt-4 border-t border-white/10">
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-accent" />
                    <p className="text-lg font-bold text-accent">{member.projects}</p>
                  </div>
                  <p className="text-white/50 text-xs">Projects</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FileText className="h-4 w-4 text-purple-400" />
                    <p className="text-lg font-bold text-purple-400">{member.research}</p>
                  </div>
                  <p className="text-white/50 text-xs">Research</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 border border-accent/40 shadow-lg shadow-accent/30 transition-all duration-200 hover:scale-105">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="secondary" className="flex-1 bg-gradient-to-br from-white/10 to-white/5 border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all duration-200 hover:scale-105">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
