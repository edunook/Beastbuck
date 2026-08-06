import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Flame, Award, Calendar, TrendingUp } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function DailyStreak() {
  const { user } = useAuth();

  const streakData = {
    current: 15,
    longest: 23,
    todayStatus: 'Active',
    rewards: ['🔥 Fire Badge', '⭐ XP Bonus', '🎁 Mystery Box'],
  };

  const weeklyStreak = [
    { day: 'Mon', active: true },
    { day: 'Tue', active: true },
    { day: 'Wed', active: true },
    { day: 'Thu', active: true },
    { day: 'Fri', active: true },
    { day: 'Sat', active: true },
    { day: 'Sun', active: false },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Daily Streak" 
        description="Streak display showing current streak, longest streak, today's status, and rewards with fire animation."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="h-6 w-6 text-orange-400" />
              <h3 className="font-bold text-white text-2xl">Daily Streak</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <p className="text-text-muted text-sm mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-orange-400">{streakData.current}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-text-muted text-sm mb-1">Longest Streak</p>
                <p className="text-4xl font-bold text-amber-400">{streakData.longest}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-emerald-400">Today's Status</span>
              </div>
              <p className="text-white font-bold">{streakData.todayStatus}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">This Week</h3>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weeklyStreak.map((day) => (
                <div key={day.day} className={`p-3 rounded-xl text-center ${day.active ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-white/5'}`}>
                  <p className="text-xs text-text-muted mb-2">{day.day}</p>
                  <div className={`w-8 h-8 rounded-full mx-auto ${day.active ? 'bg-orange-400' : 'bg-gray-600'}`} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Rewards</h3>
            </div>
            <div className="space-y-2">
              {streakData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <span className="text-2xl">{reward.split(' ')[0]}</span>
                  <span className="text-text-muted">{reward.split(' ').slice(1).join(' ')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
