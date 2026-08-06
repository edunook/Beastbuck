import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Heart, MessageSquare, Smile, Users, Lightbulb, BookOpen, Sparkles, Camera } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function InteractiveWatching() {
  const { user } = useAuth();

  const features = [
    { id: 'reactions', name: 'Live Reactions', icon: Heart, color: 'purple', description: 'Real-time emoji reactions' },
    { id: 'floating', name: 'Floating Emojis', icon: Smile, color: 'cyan', description: 'Animated emoji overlays' },
    { id: 'comments', name: 'Real-time Comments', icon: MessageSquare, color: 'emerald', description: 'Optional live chat' },
    { id: 'watchparty', name: 'Watch Party', icon: Users, color: 'amber', description: 'Group watching experience' },
    { id: 'quiz', name: 'Movie Quiz', icon: Sparkles, color: 'pink', description: 'Interactive trivia' },
    { id: 'bts', name: 'Behind the Scenes', icon: Camera, color: 'red', description: 'Bonus content' },
    { id: 'facts', name: 'Fun Facts', icon: Lightbulb, color: 'blue', description: 'Interesting tidbits' },
    { id: 'notes', name: 'Creator Notes', icon: BookOpen, color: 'violet', description: 'Director commentary' },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Interactive Watching" 
        description="Enhanced watching experience with live reactions, floating emojis, comments, and more."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(feature.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.name}</h3>
                <p className="text-text-muted text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
