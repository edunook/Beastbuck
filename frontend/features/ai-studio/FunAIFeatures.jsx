import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Smile, Shuffle, GitBranch, User, Sparkles, Gamepad2, Gift, Trophy } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function FunAIFeatures() {
  const { user } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    { id: 'personality', name: 'AI Personality Creator', icon: User, color: 'purple', description: 'Create unique AI personalities' },
    { id: 'random-prompt', name: 'Random Prompt Generator', icon: Shuffle, color: 'cyan', description: 'Get random creative prompts' },
    { id: 'roulette', name: 'Prompt Roulette', icon: GitBranch, color: 'emerald', description: 'Spin for random challenges' },
    { id: 'avatar', name: 'AI Avatar Creator', icon: Smile, color: 'amber', description: 'Design AI avatars' },
    { id: 'name-gen', name: 'AI Name Generator', icon: Sparkles, color: 'pink', description: 'Generate AI names' },
    { id: 'quiz', name: 'AI Personality Quiz', icon: User, color: 'red', description: 'Discover your AI style' },
    { id: 'battle', name: 'Prompt Battle Arena', icon: Gamepad2, color: 'blue', description: 'Compete with prompts' },
    { id: 'olympics', name: 'AI Olympics', icon: Trophy, color: 'violet', description: 'AI skill competitions' },
    { id: 'missions', name: 'Daily AI Missions', icon: Target, color: 'orange', description: 'Complete daily challenges' },
    { id: 'mystery', name: 'Mystery Reward Box', icon: Gift, color: 'teal', description: 'Unlock surprise rewards' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Fun AI Features" 
        description="Engaging features including personality creator, random prompts, battles, and daily missions."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(feature.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.name}</h3>
                <p className="text-text-muted text-sm mb-4">{feature.description}</p>
                <Button
                  onClick={() => setSelectedFeature(feature)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Try Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedFeature && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = selectedFeature.icon;
                return <Icon className="h-5 w-5 text-accent" />;
              })()}
              {selectedFeature.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="font-bold text-white text-xl mb-2">Feature Loading...</h3>
              <p className="text-text-muted mb-6">{selectedFeature.description}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setSelectedFeature(null)} variant="secondary">
                  Close
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
