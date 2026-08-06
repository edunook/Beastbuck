import { Database, Cloud, Activity, Heart, FileText } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function TechnicalArchitecture() {
  const architecture = [
    { id: 'realtime', name: 'Realtime Database', icon: Database, color: 'cyan', description: 'Current Status, Last Seen, Current Activity, Typing Indicators, Connection State, Heartbeat' },
    { id: 'firestore', name: 'Firestore', icon: Cloud, color: 'amber', description: 'Permanent user data storage' },
    { id: 'automatic', name: 'Automatic Updates', icon: Activity, color: 'emerald', description: 'Temporary presence data auto-updates' },
    { id: 'heartbeat', name: 'Heartbeat System', icon: Heart, color: 'red', description: 'Keep-alive mechanism for connection monitoring' },
    { id: 'sync', name: 'Data Synchronization', icon: FileText, color: 'purple', description: 'Sync between Realtime and Firestore' },
  ];

  const getColorClass = (color) => {
    const colors = {
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    };
    return colors[color] || colors.cyan;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Technical Architecture" 
        description="Realtime Database storage including Current Status, Last Seen, Current Activity, Typing Indicators, Connection State, Heartbeat with Firestore for permanent user data, and automatic updates for temporary presence data."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Architecture Overview</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {architecture.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-border">
                  <div className={`p-3 rounded-xl ${getColorClass(item.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{item.name}</h4>
                  <p className="text-text-muted text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Data Flow</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="text-2xl">📱</div>
              <div className="flex-1">
                <p className="text-white font-bold">Client App</p>
                <p className="text-text-muted text-sm">Updates presence data</p>
              </div>
              <span className="text-accent">→</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="text-2xl">🔥</div>
              <div className="flex-1">
                <p className="text-white font-bold">Realtime Database</p>
                <p className="text-text-muted text-sm">Temporary presence data</p>
              </div>
              <span className="text-accent">→</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="text-2xl">☁️</div>
              <div className="flex-1">
                <p className="text-white font-bold">Firestore</p>
                <p className="text-text-muted text-sm">Permanent user data</p>
              </div>
              <span className="text-accent">→</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="text-2xl">👥</div>
              <div className="flex-1">
                <p className="text-white font-bold">Other Users</p>
                <p className="text-text-muted text-sm">See presence updates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Key Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Real-time synchronization</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Automatic heartbeat monitoring</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Efficient data storage strategy</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Scalable architecture</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
