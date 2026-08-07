import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { Bell, AlertTriangle, Shield, FileText, Rocket, ShoppingBag, Activity, Crown } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function ExecutiveNotifications() {
  const { user, roleData } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const notificationTypes = [
    { id: 'membership', name: 'Membership Requests', icon: Crown, color: 'amber', description: 'New membership applications' },
    { id: 'security', name: 'Security Alerts', icon: Shield, color: 'red', description: 'Security threats and breaches' },
    { id: 'reports', name: 'Reports', icon: FileText, color: 'blue', description: 'Weekly and monthly reports' },
    { id: 'errors', name: 'System Errors', icon: AlertTriangle, color: 'orange', description: 'Critical system errors' },
    { id: 'research', name: 'Research Published', icon: FileText, color: 'emerald', description: 'New research publications' },
    { id: 'ai', name: 'AI Published', icon: Activity, color: 'purple', description: 'New AI models created' },
    { id: 'movies', name: 'Movie Published', icon: Rocket, color: 'rose', description: 'New FunFlix uploads' },
    { id: 'marketplace', name: 'Marketplace Listings', icon: ShoppingBag, color: 'cyan', description: 'New marketplace products' },
    { id: 'platform', name: 'Platform Issues', icon: AlertTriangle, color: 'red', description: 'Platform-wide issues' },
    { id: 'emergency', name: 'Emergency Alerts', icon: Bell, color: 'red', description: 'Critical emergency notifications' },
  ];

  const recentAlerts = [
    { id: 1, type: 'Membership Requests', message: '5 new membership applications pending review', time: '2 minutes ago', priority: 'high' },
    { id: 2, type: 'Security Alerts', message: 'Unusual login attempt detected', time: '15 minutes ago', priority: 'critical' },
    { id: 3, type: 'Research Published', message: '3 new research papers published', time: '1 hour ago', priority: 'normal' },
    { id: 4, type: 'System Errors', message: 'Database latency spike detected', time: '2 hours ago', priority: 'high' },
  ];

  const getColorClass = (color) => {
    const colors = {
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    };
    return colors[color] || colors.blue;
  };

  const getPriorityClass = (priority) => {
    const priorities = {
      critical: 'bg-red-500/10 border-red-500/30 text-red-400',
      high: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      normal: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    };
    return priorities[priority] || priorities.normal;
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Bell className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Executive Notifications is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Executive Notifications" 
        description="CEO and Co-CEO notifications for Membership Requests, Security Alerts, Reports, System Errors, Research Published, AI Published, Movie Published, Marketplace Listings, Platform Issues, and Emergency Alerts in real-time."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Notification Types</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-sm">Enable Notifications</span>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-all ${notificationsEnabled ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="p-4 rounded-xl bg-white/5 border border-border">
                  <div className={`p-3 rounded-xl ${getColorClass(type.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{type.name}</h4>
                  <p className="text-text-muted text-sm">{type.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Recent Alerts</h3>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl bg-white/5 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{alert.type}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityClass(alert.priority)}`}>
                    {alert.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-text-muted text-sm mb-2">{alert.message}</p>
                <p className="text-text-muted text-xs">{alert.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Notification Channels</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">In-App Notifications</span>
              <span className="text-emerald-400">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Email Alerts</span>
              <span className="text-emerald-400">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Push Notifications (Mobile)</span>
              <span className="text-text-muted">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">SMS Alerts (Critical Only)</span>
              <span className="text-text-muted">Coming Soon</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Notification Settings
      </Button>
    </PageContainer>
  );
}
