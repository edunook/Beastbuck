import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Trophy, Target, Zap, Flame, Calendar, Users, Award } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PromptChallenges() {
  const { user } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const challenges = [
    {
      id: 'teacher',
      name: 'Best Teacher AI',
      type: 'Daily',
      icon: Trophy,
      color: 'purple',
      description: 'Design the best teacher AI',
      participants: 234,
      timeLeft: '2 hours',
      xp: 500,
    },
    {
      id: 'coding',
      name: 'Coding Assistant',
      type: 'Daily',
      icon: Zap,
      color: 'cyan',
      description: 'Create a coding assistant',
      participants: 456,
      timeLeft: '5 hours',
      xp: 600,
    },
    {
      id: 'medical',
      name: 'Medical Helper',
      type: 'Weekly',
      icon: Target,
      color: 'emerald',
      description: 'Create a medical helper',
      participants: 123,
      timeLeft: '3 days',
      xp: 1000,
    },
    {
      id: 'game',
      name: 'Game Master',
      type: 'Weekly',
      icon: Flame,
      color: 'amber',
      description: 'Create a game master',
      participants: 345,
      timeLeft: '5 days',
      xp: 800,
    },
    {
      id: 'storyteller',
      name: 'Storyteller',
      type: 'Monthly',
      icon: Award,
      color: 'pink',
      description: 'Create a storyteller',
      participants: 567,
      timeLeft: '2 weeks',
      xp: 1500,
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Dr. Sarah Chen', score: 2345, avatar: '👩‍🔬' },
    { rank: 2, name: 'Alex Johnson', score: 1987, avatar: '👨‍💼' },
    { rank: 3, name: 'Emma Williams', score: 1765, avatar: '👩‍💻' },
    { rank: 4, name: 'James Brown', score: 1543, avatar: '👨‍🚀' },
    { rank: 5, name: 'Lisa Anderson', score: 1321, avatar: '👩‍🏫' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Prompt Challenges" 
        description="Daily, weekly, and monthly prompt engineering challenges with leaderboards."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {challenges.map((challenge) => {
          const Icon = challenge.icon;
          return (
            <Card key={challenge.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(challenge.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{challenge.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    challenge.type === 'Daily' ? 'bg-purple-500/10 text-purple-400' :
                    challenge.type === 'Weekly' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {challenge.type}
                  </span>
                </div>
                <p className="text-text-muted text-sm mb-4">{challenge.description}</p>
                <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{challenge.participants}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{challenge.timeLeft}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-accent font-bold">+{challenge.xp} XP</span>
                  <Button
                    onClick={() => setSelectedChallenge(challenge)}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
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
