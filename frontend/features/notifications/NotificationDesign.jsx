import { Layout, Sparkles, Zap, Palette, Eye, Check } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function NotificationDesign() {
  const designFeatures = [
    { id: 'timeline', name: 'Timeline', icon: Layout, color: 'purple', description: 'Notifications organized in a chronological timeline' },
    { id: 'animated', name: 'Animated Icons', icon: Sparkles, color: 'cyan', description: 'Smooth animations for notification icons' },
    { id: 'transitions', name: 'Smooth Transitions', icon: Zap, color: 'amber', description: 'Fluid transitions between notification states' },
    { id: 'priorities', name: 'Color-coded Priorities', icon: Palette, color: 'pink', description: 'Priority levels indicated by color coding' },
    { id: 'indicators', name: 'Unread Indicators', icon: Eye, color: 'emerald', description: 'Clear visual indicators for unread notifications' },
    { id: 'actions', name: 'Quick Actions', icon: Check, color: 'blue', description: 'Quick action buttons on notifications' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Notification Design" 
        description="Modern notification design including Timeline, Animated icons, Smooth transitions, Color-coded priorities, Unread indicators, and Quick actions."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {designFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.id} className="p-4 rounded-xl bg-white/5 border border-border hover:border-accent/50 transition-all">
                  <div className={`p-3 rounded-xl ${getColorClass(feature.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{feature.name}</h4>
                  <p className="text-text-muted text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Design Principles</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Clean and minimal interface</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Consistent visual language</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Accessible color contrast</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Responsive across all devices</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Performance-optimized animations</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Preview</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-accent/20 text-accent">
                  <span className="text-xl">💬</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-bold text-white">New message from Sarah</h5>
                    <span className="w-2 h-2 rounded-full bg-accent mt-2" />
                  </div>
                  <p className="text-text-muted text-sm">Hey! How is the project going?</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <span className="text-xl">@</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-white">You were mentioned</h5>
                  <p className="text-text-muted text-sm">Alex mentioned you in a comment</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
