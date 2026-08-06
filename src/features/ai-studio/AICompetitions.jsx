import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Trophy, Award, Flame, Calendar, Users, Star, Zap } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AICompetitions() {
  const { user } = useAuth();

  const competitions = [
    { id: 'educational', name: 'Best Educational AI', type: 'Weekly', icon: GraduationCap, color: 'purple', participants: 234, timeLeft: '2 days', rewards: ['XP', 'Certificate', 'Badge', 'Homepage Feature'] },
    { id: 'coding', name: 'Best Coding AI', type: 'Weekly', icon: Code, color: 'cyan', participants: 456, timeLeft: '5 days', rewards: ['XP', 'Certificate', 'Badge'] },
    { id: 'startup', name: 'Best Startup AI', type: 'Weekly', icon: BriefcaseBusiness, color: 'emerald', participants: 123, timeLeft: '3 days', rewards: ['XP', 'Certificate', 'Badge', 'Homepage Feature'] },
    { id: 'creative', name: 'Best Creative AI', type: 'Weekly', icon: Sparkles, color: 'amber', participants: 345, timeLeft: '6 days', rewards: ['XP', 'Certificate', 'Badge'] },
    { id: 'research', name: 'Best Research AI', type: 'Weekly', icon: FlaskConical, color: 'pink', participants: 567, timeLeft: '4 days', rewards: ['XP', 'Certificate', 'Badge', 'Homepage Feature'] },
    { id: 'prompt', name: 'Best Prompt', type: 'Weekly', icon: MessageSquare, color: 'red', participants: 890, timeLeft: '1 day', rewards: ['XP', 'Certificate', 'Badge'] },
  ];

  const leaderboard = [
    { rank: 1, name: 'Dr. Sarah Chen', score: 3456, avatar: '👩‍🔬' },
    { rank: 2, name: 'Alex Johnson', score: 2987, avatar: '👨‍💼' },
    { rank: 3, name: 'Emma Williams', score: 2765, avatar: '👩‍💻' },
    { rank: 4, name: 'James Brown', score: 2543, avatar: '👨‍🚀' },
    { rank: 5, name: 'Lisa Anderson', score: 2321, avatar: '👩‍🏫' },
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
        title="AI Competitions" 
        description="Weekly AI battles with community voting and XP, certificates, badges, homepage feature rewards."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {competitions.map((competition) => {
          const Icon = competition.icon;
          return (
            <Card key={competition.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(competition.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{competition.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/10 text-purple-400`}>
                    {competition.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{competition.participants}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{competition.timeLeft}</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {competition.rewards.map((reward) => (
                    <span key={reward} className="px-2 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs">
                      {reward}
                    </span>
                  ))}
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Flame className="h-4 w-4 mr-2" />
                  Enter Competition
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                <div className="text-2xl font-bold text-accent w-8">#{entry.rank}</div>
                <div className="text-3xl">{entry.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{entry.name}</h3>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{entry.score.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
