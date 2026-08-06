import { Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function ActiveDevice() {
  const devices = [
    { id: 'desktop', name: 'Desktop', icon: Monitor, color: 'blue', description: 'Desktop or laptop computer' },
    { id: 'mobile', name: 'Mobile', icon: Smartphone, color: 'emerald', description: 'Smartphone or tablet' },
    { id: 'tablet', name: 'Tablet', icon: Tablet, color: 'purple', description: 'Tablet device' },
    { id: 'web', name: 'Web', icon: Globe, color: 'cyan', description: 'Web browser' },
  ];

  const activeDevices = [
    { id: 1, device: 'Desktop', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'Mobile', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Active Device" 
        description="Device tracking (future) including Desktop, Mobile, Tablet, and Web."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Device Types</h3>
            <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
              Coming Soon
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {devices.map((device) => {
              const Icon = device.icon;
              return (
                <div key={device.id} className="p-4 rounded-xl bg-white/5 border border-border">
                  <div className={`p-3 rounded-xl ${getColorClass(device.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{device.name}</h4>
                  <p className="text-text-muted text-sm">{device.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Active Devices</h3>
          </div>
          <div className="space-y-3">
            {activeDevices.map((device) => (
              <div key={device.id} className={`flex items-center justify-between p-4 rounded-xl ${device.current ? 'bg-accent/10 border border-accent/30' : 'bg-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">💻</div>
                  <div>
                    <p className="text-white font-bold">{device.device}</p>
                    <p className="text-text-muted text-sm">{device.location}</p>
                    <p className="text-text-muted text-xs">{device.lastActive}</p>
                  </div>
                </div>
                {device.current && (
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-accent text-white">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
