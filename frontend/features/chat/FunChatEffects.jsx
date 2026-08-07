import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Sparkles, Heart, Rocket, Trophy, Zap, Star, Smile, Gift, Flame } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function FunChatEffects() {
  const { user } = useAuth();
  const [activeEffect, setActiveEffect] = useState(null);

  const effects = [
    { id: 'confetti', name: 'Confetti', icon: Sparkles, color: 'purple', description: 'Celebration animation for achievements' },
    { id: 'fireworks', name: 'Fireworks', icon: Trophy, color: 'amber', description: 'Fireworks for major achievements' },
    { id: 'floating-emojis', name: 'Floating Emojis', icon: Smile, color: 'pink', description: 'Floating emoji particles' },
    { id: 'heart-burst', name: 'Heart Burst', icon: Heart, color: 'red', description: 'Heart explosion animation' },
    { id: 'rocket', name: 'Rocket Launch', icon: Rocket, color: 'cyan', description: 'Rocket launch animation' },
    { id: 'sparkle', name: 'Achievement Sparkle', icon: Star, color: 'amber', description: 'Sparkle effect for achievements' },
    { id: 'level-up', name: 'Level-up Glow', icon: Zap, color: 'emerald', description: 'Glow effect when leveling up' },
    { id: 'stickers', name: 'Animated Stickers', icon: Gift, color: 'violet', description: 'Animated sticker effects' },
    { id: 'typing', name: 'Typing Bubbles', icon: Smile, color: 'blue', description: 'Animated typing indicators' },
    { id: 'wave', name: 'Wave Animations', icon: Sparkles, color: 'teal', description: 'Wave motion effects' },
    { id: 'birthday', name: 'Birthday Effects', icon: Gift, color: 'pink', description: 'Birthday celebration effects' },
    { id: 'festival', name: 'Festival Themes', icon: Flame, color: 'orange', description: 'Seasonal festival themes' },
    { id: 'snow', name: 'Snow', icon: Sparkles, color: 'blue', description: 'Snow particle effects' },
    { id: 'rain', name: 'Rain', icon: Sparkles, color: 'cyan', description: 'Rain drop effects' },
    { id: 'stars', name: 'Stars', icon: Star, color: 'amber', description: 'Twinkling star effects' },
  ];

  const triggerEffect = (effectId) => {
    setActiveEffect(effectId);
    setTimeout(() => setActiveEffect(null), 3000);
  };

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Fun Chat Effects" 
        description="Visual effects to enhance chat interactions and celebrations."
        hero={true}
      />

      {activeEffect && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-8xl animate-bounce">🎉</div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {effects.map((effect) => {
          const Icon = effect.icon;
          return (
            <Card key={effect.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${getColorClass(effect.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{effect.name}</h3>
                    <p className="text-text-muted text-sm">{effect.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => triggerEffect(effect.id)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Trigger Effect
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
