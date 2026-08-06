import { AlertTriangle, RefreshCw, Shield, CheckCircle } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function FailureHandling() {
  const failureHandling = [
    { id: 'no-crash', name: 'Do Not Crash App', icon: Shield, color: 'emerald', description: 'App continues working if Realtime Database unavailable' },
    { id: 'graceful-disable', name: 'Gracefully Disable Presence', icon: AlertTriangle, color: 'amber', description: 'Presence features disabled without breaking app' },
    { id: 'auto-retry', name: 'Retry Automatically', icon: RefreshCw, color: 'blue', description: 'Automatic reconnection attempts' },
    { id: 'continue-normal', name: 'Continue Using Platform', icon: CheckCircle, color: 'purple', description: 'All other features remain functional' },
  ];

  const getColorClass = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    };
    return colors[color] || colors.emerald;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Failure Handling" 
        description="Graceful degradation including do not crash app if Realtime Database unavailable, gracefully disable presence, retry automatically, and continue using platform normally."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Graceful Degradation</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {failureHandling.map((item) => {
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
          <h3 className="font-bold text-white text-xl mb-4">Error Scenarios</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h4 className="font-bold text-white">Realtime Database Unavailable</h4>
              </div>
              <p className="text-text-muted text-sm">Presence features disabled, app continues normally</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h4 className="font-bold text-white">Network Connection Lost</h4>
              </div>
              <p className="text-text-muted text-sm">Auto-retry mechanism activated, user notified</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h4 className="font-bold text-white">Connection Restored</h4>
              </div>
              <p className="text-text-muted text-sm">Presence features automatically re-enabled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">User Experience</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">No app crashes due to presence failures</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Clear error messages when needed</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Automatic recovery without user intervention</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">All core features remain functional</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
