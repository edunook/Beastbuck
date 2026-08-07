import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Smartphone, ArrowLeftRight, Archive, MessageSquare, ArrowDown, Hand, Zap, Volume2, Sparkles, Touchpad, Fingerprint } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function MobileChatExperience() {
  const { user } = useAuth();

  const features = [
    { id: 'swipe-chats', name: 'Swipe Between Chats', icon: ArrowLeftRight, color: 'purple', description: 'Swipe left/right to navigate between chats', status: 'active' },
    { id: 'swipe-reply', name: 'Swipe to Reply', icon: MessageSquare, color: 'cyan', description: 'Swipe right on message to reply', status: 'active' },
    { id: 'swipe-archive', name: 'Swipe to Archive', icon: Archive, color: 'amber', description: 'Swipe left to archive conversation', status: 'active' },
    { id: 'long-press', name: 'Long Press Menu', icon: Hand, color: 'emerald', description: 'Long press for context menu', status: 'active' },
    { id: 'bottom-composer', name: 'Bottom Message Composer', icon: MessageSquare, color: 'pink', description: 'Easy access composer at bottom', status: 'active' },
    { id: 'scroll-button', name: 'Floating Scroll Button', icon: ArrowDown, color: 'red', description: 'Quick scroll to latest messages', status: 'active' },
    { id: 'gesture-nav', name: 'Gesture Navigation', icon: Touchpad, color: 'blue', description: 'Intuitive gesture controls', status: 'active' },
    { id: 'large-targets', name: 'Large Touch Targets', icon: Fingerprint, color: 'violet', description: 'Easier tapping on mobile', status: 'active' },
    { id: 'haptic', name: 'Haptic Feedback', icon: Volume2, color: 'orange', description: 'Tactile response to actions', status: 'active' },
    { id: 'smooth-anim', name: 'Smooth Animations', icon: Zap, color: 'teal', description: 'Fluid transitions and animations', status: 'active' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-gradient-to-br from-purple-500/25 via-purple-500/15 to-violet-500/10 border-purple-500/40 text-purple-400 shadow-purple-500/50',
      cyan: 'bg-gradient-to-br from-cyan-500/25 via-cyan-500/15 to-sky-500/10 border-cyan-500/40 text-cyan-400 shadow-cyan-500/50',
      amber: 'bg-gradient-to-br from-amber-500/25 via-amber-500/15 to-yellow-500/10 border-amber-500/40 text-amber-400 shadow-amber-500/50',
      emerald: 'bg-gradient-to-br from-emerald-500/25 via-emerald-500/15 to-green-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/50',
      pink: 'bg-gradient-to-br from-pink-500/25 via-pink-500/15 to-rose-500/10 border-pink-500/40 text-pink-400 shadow-pink-500/50',
      red: 'bg-gradient-to-br from-red-500/25 via-red-500/15 to-rose-500/10 border-red-500/40 text-red-400 shadow-red-500/50',
      blue: 'bg-gradient-to-br from-blue-500/25 via-blue-500/15 to-sky-500/10 border-blue-500/40 text-blue-400 shadow-blue-500/50',
      violet: 'bg-gradient-to-br from-violet-500/25 via-violet-500/15 to-purple-500/10 border-violet-500/40 text-violet-400 shadow-violet-500/50',
      orange: 'bg-gradient-to-br from-orange-500/25 via-orange-500/15 to-amber-500/10 border-orange-500/40 text-orange-400 shadow-orange-500/50',
      teal: 'bg-gradient-to-br from-teal-500/25 via-teal-500/15 to-cyan-500/10 border-teal-500/40 text-teal-400 shadow-teal-500/50',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Mobile Chat Experience" 
        description="Optimized mobile chat with gestures, animations, and touch-friendly design."
        hero={true}
      />

      <Card className="mb-6 border-accent/40 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent backdrop-blur-2xl shadow-2xl shadow-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/25 via-purple-500/15 to-violet-500/10 border border-purple-500/40 shadow-xl shadow-purple-500/50">
                <Smartphone className="h-7 w-7 text-purple-400" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent animate-ping opacity-50" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent shadow-lg shadow-accent/50" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">Mobile-First Design</h3>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span className="text-[10px] font-bold text-accent">Premium</span>
                </div>
              </div>
              <p className="text-white/60 text-sm mt-1">Optimized for touch interactions and small screens</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.id} 
              className="border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="relative mb-5">
                  <div className={`p-4 rounded-2xl ${getColorClass(feature.color)} shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent animate-ping opacity-50" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent shadow-lg shadow-accent/50" />
                </div>
                <h3 className="font-bold text-white mb-2 text-lg group-hover:text-accent transition-colors">{feature.name}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
                {feature.status === 'active' && (
                  <div className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">Active</span>
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
