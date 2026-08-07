import { Palette, Zap, Battery, Wifi, Activity, Minimize } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function PresenceDesign() {
  const designFeatures = [
    { id: 'animated', name: 'Animated Status Indicators', icon: Activity, color: 'purple', description: 'Smooth animations for status changes' },
    { id: 'smooth-fadin', name: 'Smooth Fading', icon: Palette, color: 'cyan', description: 'Elegant fade transitions' },
    { id: 'minimal-battery', name: 'Minimal Battery Usage', icon: Battery, color: 'emerald', description: 'Optimized for low power consumption' },
    { id: 'minimal-network', name: 'Minimal Network Usage', icon: Wifi, color: 'blue', description: 'Efficient data transmission' },
    { id: 'instant-updates', name: 'Instant Updates', icon: Zap, color: 'amber', description: 'Real-time presence synchronization' },
    { id: 'no-clutter', name: 'No Visual Clutter', icon: Minimize, color: 'pink', description: 'Clean and minimal interface' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Presence Design" 
        description="Subtle design including animated status indicators, smooth fading, minimal battery and network usage, instant updates, and no visual clutter."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Design Principles</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {designFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.id} className="p-4 rounded-xl bg-white/5 border border-border">
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
          <h3 className="font-bold text-white text-xl mb-4">Performance Metrics</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <p className="text-text-muted text-sm mb-1">Battery Impact</p>
              <p className="text-2xl font-bold text-emerald-400">&lt;1%</p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
              <p className="text-text-muted text-sm mb-1">Network Usage</p>
              <p className="text-2xl font-bold text-cyan-400">&lt;50KB/h</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
              <p className="text-text-muted text-sm mb-1">Update Latency</p>
              <p className="text-2xl font-bold text-purple-400">&lt;100ms</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
              <p className="text-text-muted text-sm mb-1">CPU Usage</p>
              <p className="text-2xl font-bold text-amber-400">&lt;2%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Preview</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="relative">
                <div className="text-3xl">👤</div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <p className="text-white font-bold">Online User</p>
                <p className="text-text-muted text-sm">Green dot with pulse animation</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="relative">
                <div className="text-3xl">👤</div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-amber-400" />
              </div>
              <div>
                <p className="text-white font-bold">Away User</p>
                <p className="text-text-muted text-sm">Yellow dot, no animation</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="relative">
                <div className="text-3xl">👤</div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gray-400" />
              </div>
              <div>
                <p className="text-white font-bold">Offline User</p>
                <p className="text-text-muted text-sm">Gray dot, no animation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
