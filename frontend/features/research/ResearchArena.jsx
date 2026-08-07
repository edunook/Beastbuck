import { useState } from 'react';
import { Swords, Trophy, Flame, Vote, CheckCircle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function ResearchArena() {
  const [battles, setBattles] = useState([
    {
      id: 1,
      idea1: 'Solar-powered water purifier',
      idea2: 'Wind-powered water purifier',
      votes1: 234,
      votes2: 189,
      category: 'Most Innovative',
      status: 'active',
    },
    {
      id: 2,
      idea1: 'AI for climate prediction',
      idea2: 'AI for wildlife conservation',
      votes1: 456,
      votes2: 378,
      category: 'Best Research',
      status: 'active',
    },
    {
      id: 3,
      idea1: 'Biodegradable plastic',
      idea2: 'Recycling robots',
      votes1: 567,
      votes2: 612,
      category: 'Best Design',
      status: 'completed',
      winner: 'idea2',
    },
  ]);
  const [userVotes, setUserVotes] = useState({});

  const handleVote = (battleId, idea) => {
    setUserVotes({ ...userVotes, [battleId]: idea });
    setBattles(battles.map(b => {
      if (b.id === battleId) {
        return {
          ...b,
          votes1: idea === 'idea1' ? b.votes1 + 1 : b.votes1,
          votes2: idea === 'idea2' ? b.votes2 + 1 : b.votes2,
        };
      }
      return b;
    }));
  };

  const getPercentage = (votes, total) => {
    if (total === 0) return 50;
    return Math.round((votes / total) * 100);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Arena" 
        description="Compare research ideas and vote for the best ones!"
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">Most Innovative</span>
            </div>
            <p className="text-text-muted text-sm">Vote for the most creative ideas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-6 w-6 text-emerald-400" />
              <span className="text-2xl font-bold text-white">Best Research</span>
            </div>
            <p className="text-text-muted text-sm">Most scientifically sound research</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Swords className="h-6 w-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">Best Design</span>
            </div>
            <p className="text-text-muted text-sm">Best presented research</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {battles.map((battle) => {
          const totalVotes = battle.votes1 + battle.votes2;
          const pct1 = getPercentage(battle.votes1, totalVotes);
          const pct2 = getPercentage(battle.votes2, totalVotes);
          const userVote = userVotes[battle.id];

          return (
            <Card key={battle.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-accent" />
                    {battle.category}
                  </span>
                  {battle.status === 'completed' && (
                    <span className="text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Idea 1 */}
                  <div className={`p-6 rounded-xl border-2 transition-all ${userVote === 'idea1' ? 'border-purple-500 bg-purple-500/10' : 'border-border bg-white/5'}`}>
                    <h3 className="font-bold text-white text-lg mb-4">{battle.idea1}</h3>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-muted">{battle.votes1} votes</span>
                        <span className="font-bold text-purple-400">{pct1}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${pct1}%` }} />
                      </div>
                    </div>
                    {battle.status === 'active' && (
                      <Button
                        onClick={() => handleVote(battle.id, 'idea1')}
                        disabled={userVote !== undefined}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        Vote
                      </Button>
                    )}
                  </div>

                  {/* Idea 2 */}
                  <div className={`p-6 rounded-xl border-2 transition-all ${userVote === 'idea2' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-white/5'}`}>
                    <h3 className="font-bold text-white text-lg mb-4">{battle.idea2}</h3>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-muted">{battle.votes2} votes</span>
                        <span className="font-bold text-emerald-400">{pct2}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct2}%` }} />
                      </div>
                    </div>
                    {battle.status === 'active' && (
                      <Button
                        onClick={() => handleVote(battle.id, 'idea2')}
                        disabled={userVote !== undefined}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        Vote
                      </Button>
                    )}
                  </div>
                </div>

                {battle.status === 'completed' && (
                  <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
                    <p className="text-accent font-bold">
                      Winner: {battle.winner === 'idea1' ? battle.idea1 : battle.idea2} 🏆
                    </p>
                    <p className="text-text-muted text-sm mt-1">
                      Earned 100 XP for participating!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
