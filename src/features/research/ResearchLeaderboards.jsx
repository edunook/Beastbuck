import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Calendar, Globe, Users } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function ResearchLeaderboards() {
  const [timeframe, setTimeframe] = useState('all');
  const [category, setCategory] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe, category]);

  const loadLeaderboard = () => {
    // Simulated leaderboard data
    setLeaderboard([
      { rank: 1, name: 'Dr. Sarah Chen', xp: 15678, researchCount: 45, country: 'USA', avatar: '👩‍🔬' },
      { rank: 2, name: 'Prof. Michael Lee', xp: 14234, researchCount: 38, country: 'UK', avatar: '👨‍🔬' },
      { rank: 3, name: 'Emma Williams', xp: 12890, researchCount: 32, country: 'Canada', avatar: '👩‍💻' },
      { rank: 4, name: 'Alex Johnson', xp: 11567, researchCount: 29, country: 'Australia', avatar: '👨‍💼' },
      { rank: 5, name: 'Lisa Anderson', xp: 10234, researchCount: 26, country: 'Germany', avatar: '👩‍🎓' },
      { rank: 6, name: 'David Kim', xp: 9876, researchCount: 24, country: 'South Korea', avatar: '👨‍🎨' },
      { rank: 7, name: 'James Brown', xp: 8765, researchCount: 22, country: 'Japan', avatar: '👨‍🚀' },
      { rank: 8, name: 'Maria Garcia', xp: 7654, researchCount: 20, country: 'Spain', avatar: '👩‍⚕️' },
      { rank: 9, name: 'John Smith', xp: 6543, researchCount: 18, country: 'France', avatar: '👨‍🏫' },
      { rank: 10, name: 'Sophie Martin', xp: 5432, researchCount: 16, country: 'Italy', avatar: '👩‍🏭' },
    ]);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-amber-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-2xl font-bold text-text-muted">#{rank}</span>;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'bg-amber-500/20 border-amber-500/30';
    if (rank === 2) return 'bg-gray-500/20 border-gray-500/30';
    if (rank === 3) return 'bg-amber-600/20 border-amber-600/30';
    return 'bg-white/5 border-border';
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Leaderboards" 
        description="See who's leading in research!"
        hero={true}
      />

      <div className="flex gap-4 mb-6">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-white/5 border border-border rounded-xl px-4 py-2 text-white focus:border-accent focus:outline-none transition-colors"
        >
          <option value="all">All Time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white/5 border border-border rounded-xl px-4 py-2 text-white focus:border-accent focus:outline-none transition-colors"
        >
          <option value="global">Global</option>
          <option value="department">Department</option>
          <option value="lab">Lab</option>
          <option value="country">Country</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">Daily</span>
            </div>
            <p className="text-text-muted text-sm">Top researchers today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">Weekly</span>
            </div>
            <p className="text-text-muted text-sm">Top this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-6 w-6 text-cyan-400" />
              <span className="text-2xl font-bold text-white">All Time</span>
            </div>
            <p className="text-text-muted text-sm">All-time rankings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Researchers</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${getRankClass(entry.rank)}`}
              >
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="text-3xl">{entry.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{entry.name}</h3>
                  <p className="text-text-muted text-sm">{entry.country}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{entry.xp.toLocaleString()} XP</p>
                  <p className="text-text-muted text-sm">{entry.researchCount} Research</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
