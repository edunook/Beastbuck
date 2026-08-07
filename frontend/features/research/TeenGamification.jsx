import { useEffect } from 'react';
import { Trophy, Gamepad2, Target, Flame, Dice6, Gift, Sparkles, Brain, Zap, Puzzle, Award, Medal } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function TeenGamification() {
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    // Simulated gamification stats
  };

  const gamificationItems = [
    { icon: Trophy, label: 'Achievements', value: '🏆', color: 'amber' },
    { icon: Gamepad2, label: 'Daily Missions', value: '🎮', color: 'purple' },
    { icon: Target, label: 'Research Streak', value: '🎯', color: 'emerald' },
    { icon: Dice6, label: 'Lucky Spin', value: '🎲', color: 'cyan' },
    { icon: Gift, label: 'Mystery Boxes', value: '🎁', color: 'pink' },
    { icon: Flame, label: 'Daily XP', value: '🔥', color: 'red' },
    { icon: Zap, label: 'Speed Challenges', value: '⚡', color: 'amber' },
    { icon: Puzzle, label: 'Mini Quizzes', value: '🧩', color: 'purple' },
    { icon: Brain, label: 'Brain Games', value: '🧠', color: 'cyan' },
    { icon: Sparkles, label: 'Idea Battles', value: '💡', color: 'emerald' },
    { icon: Award, label: 'Research Olympics', value: '🏅', color: 'amber' },
    { icon: Medal, label: 'Leaderboards', value: '🥇', color: 'purple' },
  ];

  const getColorClass = (color) => {
    const colors = {
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.amber;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Teenager Friendly Gamification" 
        description="Fun gamification elements to make research exciting!"
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {gamificationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-2xl ${getColorClass(item.color)}`}>
                    {item.value}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5 text-accent" />
                      <h3 className="font-bold text-white">{item.label}</h3>
                    </div>
                    <p className="text-text-muted text-sm">Earn rewards and XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Gamification Features</h3>
              <p className="text-text-soft text-sm">
                🏆 Achievements, 🎮 Daily Missions, 🎯 Research Streak, 🎲 Lucky Spin Rewards, 🎁 Mystery Boxes, 
                🔥 Daily XP, ⚡ Speed Challenges, 🧩 Mini Quizzes, 🧠 Brain Games, 💡 Idea Battles, 🏅 Research Olympics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
