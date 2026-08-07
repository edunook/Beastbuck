import { Trophy, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function LeaderboardHistory() {
  const ranks = [
    { id: 'highest', name: 'Highest Rank', value: '#5', change: 0, color: 'purple' },
    { id: 'current', name: 'Current Rank', value: '#15', change: -2, color: 'cyan' },
    { id: 'previous', name: 'Previous Rank', value: '#13', change: 0, color: 'emerald' },
    { id: 'monthly', name: 'Monthly Rank', value: '#8', change: 5, color: 'amber' },
    { id: 'dept', name: 'Department Rank', value: '#3', change: 1, color: 'pink' },
    { id: 'global', name: 'Global Rank', value: '#42', change: -3, color: 'red' },
  ];

  const history = [
    { month: 'Jan', rank: 50 },
    { month: 'Feb', rank: 45 },
    { month: 'Mar', rank: 38 },
    { month: 'Apr', rank: 32 },
    { month: 'May', rank: 25 },
    { month: 'Jun', rank: 18 },
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
        title="Leaderboard History" 
        description="History tracking for highest rank, current rank, previous rank, monthly rank, department rank, and global rank with charts."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {ranks.map((rank) => (
          <Card key={rank.id}>
            <CardContent className="p-6">
              <div className={`p-3 rounded-xl ${getColorClass(rank.color)} mb-4`}>
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white mb-1">{rank.name}</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-accent">{rank.value}</p>
                {rank.change !== 0 && (
                  <div className={`flex items-center gap-1 ${rank.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {rank.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="text-sm">{Math.abs(rank.change)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Rank History (Last 6 Months)</h3>
          </div>
          <div className="flex items-end gap-4 h-48">
            {history.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-accent to-purple-500 rounded-t-lg transition-all"
                  style={{ height: `${(50 - item.rank) * 2}%` }}
                />
                <span className="text-text-muted text-sm">{item.month}</span>
                <span className="text-accent font-bold">#{item.rank}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
