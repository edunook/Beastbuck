import { Crown, FileText, Shield, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function ExecutiveNotifications() {
  const executiveNotifications = [
    { id: 1, type: 'membership', title: 'New Membership Request', message: 'John Doe requested Senior Member status', time: '2 minutes ago', priority: 'high' },
    { id: 2, type: 'report', title: 'Weekly Report Ready', message: 'Platform performance report is ready for review', time: '15 minutes ago', priority: 'normal' },
    { id: 3, type: 'security', title: 'Security Alert', message: 'Unusual login activity detected from IP 192.168.1.1', time: '1 hour ago', priority: 'urgent' },
    { id: 4, type: 'approval', title: 'Approval Required', message: 'Research paper "AI Ethics" needs CEO approval', time: '2 hours ago', priority: 'high' },
    { id: 5, type: 'system', title: 'System Error', message: 'Database connection timeout in production', time: '3 hours ago', priority: 'urgent' },
    { id: 6, type: 'health', title: 'Platform Health', message: 'Server load at 85% - monitoring required', time: '4 hours ago', priority: 'normal' },
    { id: 7, type: 'event', title: 'Critical Event', message: 'Major security breach attempt blocked', time: '5 hours ago', priority: 'urgent' },
  ];

  const getIcon = (type) => {
    const icons = {
      membership: Crown,
      report: FileText,
      security: Shield,
      approval: CheckCircle,
      system: AlertTriangle,
      health: Activity,
      event: AlertTriangle,
    };
    return icons[type] || Crown;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500/20 border-red-500/30 text-red-400',
      high: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      normal: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    };
    return colors[priority] || colors.normal;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Executive Notifications" 
        description="CEO and Co-CEO notifications including Membership Requests, Reports, Security Alerts, Approvals, System Errors, Platform Health, and Critical Events in real-time."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Executive Dashboard</h3>
            <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
              CEO / Co-CEO Only
            </span>
          </div>

          <div className="space-y-3">
            {executiveNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border-2 ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${getPriorityColor(notification.priority)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="font-bold text-white">{notification.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-text-muted text-sm mb-2">{notification.message}</p>
                      <span className="text-text-muted text-xs">{notification.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Executive Features</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Real-time critical alerts</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Priority-based notification routing</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Direct approval workflows</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Platform health monitoring</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Security incident tracking</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
