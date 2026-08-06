import { useState, useEffect } from 'react';
import { Zap, Award, TrendingUp } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function ResearchLevels() {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    loadLevel();
  }, []);

  const loadLevel = () => {
    // Simulated level data
    setXp(3456);
    setCurrentLevel({
      name: 'Research Contributor',
      xpRequired: 1500,
      nextLevel: {
        name: 'Senior Researcher',
        xpRequired: 3000,
      },
    });
  };

  const levels = [
    { name: 'Beginner Explorer', xp: 0, icon: '🌱' },
    { name: 'Junior Researcher', xp: 100, icon: '🌿' },
    { name: 'Research Apprentice', xp: 500, icon: '🌳' },
    { name: 'Research Contributor', xp: 1500, icon: '🔬' },
    { name: 'Senior Researcher', xp: 3000, icon: '⚗️' },
    { name: 'Innovation Expert', xp: 6000, icon: '💡' },
    { name: 'Lead Scientist', xp: 10000, icon: '🧪' },
    { name: 'Research Legend', xp: 20000, icon: '🏆' },
  ];

  const progressPercentage = currentLevel ? ((xp - currentLevel.xpRequired) / (currentLevel.nextLevel.xpRequired - currentLevel.xpRequired)) * 100 : 0;

  return (
    <PageContainer>
      <PageHeader 
        title="Research Levels" 
        description="Progress through research levels as you earn XP!"
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{currentLevel?.name}</h2>
              <p className="text-text-muted">Current Level</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-accent">{xp.toLocaleString()}</p>
              <p className="text-text-muted">Total XP</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-muted">Progress to {currentLevel?.nextLevel.name}</span>
              <span className="text-accent font-bold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-4 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
          </div>

          <p className="text-text-muted text-sm">
            {currentLevel?.nextLevel.xpRequired - xp} XP to next level
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Level Progression path</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {levels.map((level) => {
              const isCurrent = level.name === currentLevel?.name;
              const isUnlocked = xp >= level.xp;
              const isNext = level.name === currentLevel?.nextLevel?.name;
              
              return (
                <div
                  key={level.name}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isCurrent ? 'border-accent bg-accent/10' : 
                    isNext ? 'border-purple-500/30 bg-purple-500/10' :
                    isUnlocked ? 'border-border bg-white/5' : 'border-white/5 bg-white/5 opacity-50'
                  }`}
                >
                  <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${isCurrent ? 'text-accent' : isNext ? 'text-purple-400' : 'text-white'}`}>
                      {level.name}
                    </h3>
                    <p className="text-text-muted text-sm">{level.xp.toLocaleString()} XP required</p>
                  </div>
                  {isCurrent && (
                    <div className="flex items-center gap-2 text-accent">
                      <Zap className="h-5 w-5" />
                      <span className="text-sm font-bold">Current</span>
                    </div>
                  )}
                  {isNext && (
                    <div className="flex items-center gap-2 text-purple-400">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-sm font-bold">Next</span>
                    </div>
                  )}
                  {isUnlocked && !isCurrent && !isNext && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Award className="h-5 w-5" />
                      <span className="text-sm font-bold">Unlocked</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
