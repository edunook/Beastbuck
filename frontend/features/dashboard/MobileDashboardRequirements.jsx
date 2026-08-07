import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Smartphone, Touchpad, Target, Zap, Layout, Navigation } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function MobileDashboardRequirements() {
  const { user } = useAuth();

  const requirements = [
    { id: 1, title: 'Fully Responsive', description: '320px to 4K screens', icon: Smartphone, color: 'purple', status: 'Implemented' },
    { id: 2, title: 'No Horizontal Scrolling', description: 'All content fits viewport width', icon: Layout, color: 'cyan', status: 'Implemented' },
    { id: 3, title: 'Touch Target Size', description: 'Minimum 44×44px for tap targets', icon: Touchpad, color: 'emerald', status: 'Implemented' },
    { id: 4, title: 'Swipeable Cards', description: 'Swipe navigation support', icon: Target, color: 'amber', status: 'Implemented' },
    { id: 5, title: 'Sticky Quick Actions', description: 'Quick actions always accessible', icon: Zap, color: 'pink', status: 'Implemented' },
    { id: 6, title: '60 FPS Animations', description: 'Smooth animations at 60fps', icon: Zap, color: 'red', status: 'Achieved' },
    { id: 7, title: 'Bottom Navigation', description: 'Never overlaps content', icon: Navigation, color: 'blue', status: 'Implemented' },
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
    };
    return colors[color] || colors.purple;
  };

  const getStatusColor = (status) => {
    const colors = {
      Implemented: 'bg-emerald-500/10 text-emerald-400',
      Achieved: 'bg-emerald-500/10 text-emerald-400',
      Pending: 'bg-amber-500/10 text-amber-400',
    };
    return colors[status] || colors.Pending;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Mobile Dashboard Requirements" 
        description="Mobile optimization including fully responsive from 320px to 4K, no horizontal scrolling, minimum touch target of 44×44px, swipeable cards, sticky quick actions, smooth animations at 60 FPS, and bottom navigation that never overlaps content."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requirements.map((req) => {
          const Icon = req.icon;
          return (
            <Card key={req.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(req.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-2">{req.title}</h3>
                <p className="text-text-muted text-sm mb-4">{req.description}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
