import { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Zap, Users, Award, Calendar, CheckCircle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function ResearchChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = () => {
    // Simulated challenges data
    setChallenges([
      {
        id: 1,
        title: 'Plastic Pollution Solution',
        description: 'Find a creative solution for reducing plastic waste',
        type: 'weekly',
        xp: 100,
        participants: 234,
        icon: '♻️',
        color: 'emerald',
      },
      {
        id: 2,
        title: 'Build an AI Model',
        description: 'Create a simple AI model for a real-world problem',
        type: 'monthly',
        xp: 500,
        participants: 156,
        icon: '🤖',
        color: 'purple',
      },
      {
        id: 3,
        title: 'Design a Robot',
        description: 'Design a robot that helps with daily tasks',
        type: 'special',
        xp: 300,
        participants: 89,
        icon: '🦾',
        color: 'cyan',
      },
      {
        id: 4,
        title: 'Improve Farming',
        description: 'Research ways to make farming more sustainable',
        type: 'weekly',
        xp: 150,
        participants: 312,
        icon: '🌱',
        color: 'green',
      },
      {
        id: 5,
        title: 'Invent Something Useful',
        description: 'Create an invention that solves a common problem',
        type: 'monthly',
        xp: 400,
        participants: 198,
        icon: '💡',
        color: 'amber',
      },
      {
        id: 6,
        title: 'Space Challenge',
        description: 'Research space exploration technologies',
        type: 'special',
        xp: 600,
        participants: 145,
        icon: '🚀',
        color: 'blue',
      },
    ]);
  };

  const handleJoin = (challengeId) => {
    setUserChallenges([...userChallenges, challengeId]);
  };

  const getColorClass = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      green: 'bg-green-500/20 border-green-500/30 text-green-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    };
    return colors[color] || colors.emerald;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Challenges" 
        description="Complete challenges to earn XP, certificates, and recognition!"
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-6 w-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">Weekly</span>
            </div>
            <p className="text-text-muted text-sm">New challenges every week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">Monthly</span>
            </div>
            <p className="text-text-muted text-sm">Bigger challenges, bigger rewards</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-6 w-6 text-cyan-400" />
              <span className="text-2xl font-bold text-white">Special</span>
            </div>
            <p className="text-text-muted text-sm">Limited-time special events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {challenges.map((challenge) => {
          const isJoined = userChallenges.includes(challenge.id);
          return (
            <Card key={challenge.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{challenge.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-lg">{challenge.title}</h3>
                        <p className="text-text-muted text-sm">{challenge.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Award className="h-4 w-4 text-amber-400" />
                        <span>{challenge.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participants} participants</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getColorClass(challenge.color)}`}>
                        {challenge.type}
                      </div>
                    </div>
                  </div>

                  {isJoined ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-bold">Joined</span>
                    </div>
                  ) : (
                    <Button onClick={() => handleJoin(challenge.id)} size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Join
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rewards Info */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Rewards</h3>
              <p className="text-text-soft text-sm">
                Complete challenges to earn XP, unlock certificates, get featured on the homepage, 
                and earn recognition as a top researcher!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
