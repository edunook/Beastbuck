import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Smartphone, Heart, Bookmark, Share2, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, Maximize, Play, Volume2, User, Download } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function MobileExperience() {
  const { user } = useAuth();

  const features = [
    { id: 'vertical', name: 'Vertical Swipe', icon: ChevronDown, color: 'purple', description: 'Swipe through content' },
    { id: 'horizontal', name: 'Horizontal Categories', icon: ChevronRight, color: 'cyan', description: 'Swipe categories' },
    { id: 'gestures', name: 'Gesture Controls', icon: Smartphone, color: 'emerald', description: 'Intuitive gestures' },
    { id: 'pip', name: 'Picture in Picture', icon: Maximize, color: 'amber', description: 'Watch while browsing' },
    { id: 'mini', name: 'Mini Player', icon: Play, color: 'pink', description: 'Compact playback' },
    { id: 'quick-like', name: 'Quick Like', icon: Heart, color: 'red', description: 'Double tap to like' },
    { id: 'quick-save', name: 'Quick Save', icon: Bookmark, color: 'blue', description: 'Easy bookmarking' },
    { id: 'quick-share', name: 'Quick Share', icon: Share2, color: 'violet', description: 'Fast sharing' },
    { id: 'swipe-comments', name: 'Swipe Comments', icon: MessageSquare, color: 'orange', description: 'Swipe to view comments' },
    { id: 'swipe-creator', name: 'Swipe Creator', icon: User, color: 'teal', description: 'Swipe to creator profile' },
    { id: 'one-hand', name: 'One-hand Operation', icon: Smartphone, color: 'rose', description: 'Easy one-handed use' },
    { id: 'haptic', name: 'Haptic Feedback', icon: Volume2, color: 'indigo', description: 'Tactile responses' },
    { id: 'offline', name: 'Offline Watchlist', icon: Download, color: 'sky', description: 'Watch without internet' },
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
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Mobile Experience" 
        description="Mobile optimization with vertical swipe, horizontal categories, gesture controls, picture in picture, mini player, quick actions, and haptic feedback."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id}>
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
