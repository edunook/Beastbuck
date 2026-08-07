import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Users, MessageSquare, Smile, Mic, Share2, Clock, Play, Pause, BarChart3 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function WatchParties() {
  const { user } = useAuth();

  const rooms = [
    { id: 1, name: 'Friday Movie Night', host: 'Dr. Sarah Chen', participants: 12, status: 'Live' },
    { id: 2, name: 'Comedy Marathon', host: 'Alex Johnson', participants: 8, status: 'Live' },
    { id: 3, name: 'Research Watch Party', host: 'Emma Williams', participants: 5, status: 'Scheduled' },
  ];

  const features = [
    { id: 'invite', name: 'Invite Friends', icon: Users, color: 'purple' },
    { id: 'watch', name: 'Watch Together', icon: Play, color: 'cyan' },
    { id: 'voice', name: 'Voice Chat', icon: Mic, color: 'emerald' },
    { id: 'text', name: 'Text Chat', icon: MessageSquare, color: 'amber' },
    { id: 'emoji', name: 'Emoji Reactions', icon: Smile, color: 'pink' },
    { id: 'polls', name: 'Polls', icon: BarChart3, color: 'red' },
    { id: 'controls', name: 'Shared Controls', icon: Share2, color: 'blue' },
    { id: 'countdown', name: 'Countdown', icon: Clock, color: 'violet' },
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
        title="Watch Parties" 
        description="Watch party rooms with friends, voice chat, text chat, emoji reactions, polls, and shared controls."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Rooms</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    room.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {room.status}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{room.name}</h3>
                    <p className="text-text-muted text-sm">Hosted by {room.host}</p>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <Users className="h-4 w-4" />
                    <span>{room.participants}</span>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700" size="sm">
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Features</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.id} className="p-4 rounded-xl bg-white/5 border border-border">
                    <div className={`p-2 rounded-lg ${getColorClass(feature.color)} mb-2`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm">{feature.name}</h3>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
