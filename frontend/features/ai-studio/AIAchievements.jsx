import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Trophy, Award, Bot, MessageSquare, Star, CheckCircle, Crown, Sparkles, BookOpen } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';

export default function AIAchievements() {
  const { user } = useAuth();

  const achievements = [
    { id: 'first-ai', name: 'First AI', icon: Bot, color: 'purple', description: 'Create your first AI model', unlocked: true },
    { id: '10-conversations', name: '10 Conversations', icon: MessageSquare, color: 'cyan', description: 'Reach 10 conversations', unlocked: true },
    { id: '100-conversations', name: '100 Conversations', icon: MessageSquare, color: 'emerald', description: 'Reach 100 conversations', unlocked: true },
    { id: '1000-conversations', name: '1000 Conversations', icon: MessageSquare, color: 'amber', description: 'Reach 1000 conversations', unlocked: false },
    { id: 'verified', name: 'Verified AI', icon: CheckCircle, color: 'pink', description: 'Get your AI verified', unlocked: true },
    { id: 'featured', name: 'Featured AI', icon: Star, color: 'red', description: 'Get your AI featured', unlocked: false },
    { id: 'top-creator', name: 'Top Creator', icon: Trophy, color: 'blue', description: 'Become a top creator', unlocked: false },
    { id: 'prompt-engineer', name: 'Prompt Engineer', icon: Sparkles, color: 'violet', description: 'Master prompt engineering', unlocked: true },
    { id: 'knowledge-master', name: 'Knowledge Master', icon: BookOpen, color: 'orange', description: 'Build comprehensive knowledge base', unlocked: false },
    { id: 'ai-legend', name: 'AI Legend', icon: Crown, color: 'rose', description: 'Achieve legendary status', unlocked: false },
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
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Achievements" 
        description="Track your AI creation journey with achievements and milestones."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Card key={achievement.id} className={`transition-all ${achievement.unlocked ? 'hover:border-accent/50' : 'opacity-50'}`}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(achievement.color)} mb-4 ${!achievement.unlocked ? 'grayscale' : ''}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{achievement.name}</h3>
                  {achievement.unlocked && (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <p className="text-text-muted text-sm">{achievement.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
