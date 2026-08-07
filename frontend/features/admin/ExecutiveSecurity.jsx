import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Shield, Lock, Key, FileText, Server, UserCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { hasPermission } from '@shared/permissions/permissions';

export default function ExecutiveSecurity() {
  const { user, roleData } = useAuth();

  const securityFeatures = [
    { id: 'rbac', name: 'Role-Based Access Control (RBAC)', icon: Shield, color: 'emerald', status: 'active', description: 'Granular permissions based on user roles' },
    { id: 'firestore', name: 'Firestore Security Rules', icon: Lock, color: 'blue', status: 'active', description: 'Database-level access control' },
    { id: 'auth', name: 'Firebase Authentication', icon: Key, color: 'purple', status: 'active', description: 'Secure user authentication' },
    { id: 'audit', name: 'Audit Logs', icon: FileText, color: 'amber', status: 'active', description: 'Immutable activity tracking' },
    { id: 'permission', name: 'Permission Validation', icon: UserCheck, color: 'cyan', status: 'active', description: 'Server-side permission checks' },
    { id: 'server', name: 'Server-side Authorization', icon: Server, color: 'red', status: 'active', description: 'No client-side trust' },
    { id: 'session', name: 'Session Validation', icon: Lock, color: 'orange', status: 'active', description: 'Active session management' },
  ];

  const securityMetrics = [
    { id: 'active-sessions', name: 'Active Sessions', value: '127', trend: '+5%' },
    { id: 'auth-attempts', name: 'Auth Attempts (24h)', value: '1,234', trend: '+12%' },
    { id: 'failed-logins', name: 'Failed Logins (24h)', value: '23', trend: '-8%' },
    { id: 'security-events', name: 'Security Events (24h)', value: '5', trend: '0%' },
  ];

  const recentSecurityEvents = [
    { id: 1, type: 'Role Change', user: 'Admin', action: 'Promoted user to Co-CEO', time: '2 hours ago', severity: 'info' },
    { id: 2, type: 'Login Alert', user: 'Unknown', action: 'Failed login attempt from unusual location', time: '4 hours ago', severity: 'warning' },
    { id: 3, type: 'Permission Update', user: 'CEO', action: 'Updated department permissions', time: '6 hours ago', severity: 'info' },
    { id: 4, type: 'Session Revoked', user: 'Admin', action: 'Revoked session for suspended user', time: '1 day ago', severity: 'warning' },
  ];

  const getColorClass = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    };
    return colors[color] || colors.emerald;
  };

  const getSeverityClass = (severity) => {
    const severities = {
      info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    };
    return severities[severity] || severities.info;
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Executive Security is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Executive Security" 
        description="Role-Based Access Control (RBAC), Firestore Security Rules, Firebase Authentication, Audit Logs, Permission Validation, Server-side Authorization, and Session Validation with no client-side trust."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Security Features</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.id} className="p-4 rounded-xl bg-white/5 border border-border">
                  <div className={`p-3 rounded-xl ${getColorClass(feature.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{feature.name}</h4>
                  <p className="text-text-muted text-sm mb-2">{feature.description}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${feature.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {feature.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Server className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Security Metrics</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {securityMetrics.map((metric) => (
              <div key={metric.id} className="p-4 rounded-xl bg-white/5 border border-border">
                <p className="text-text-muted text-sm mb-1">{metric.name}</p>
                <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                <p className={`text-sm ${metric.trend.startsWith('+') ? 'text-emerald-400' : metric.trend.startsWith('-') ? 'text-red-400' : 'text-text-muted'}`}>
                  {metric.trend}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Recent Security Events</h3>
          </div>
          <div className="space-y-3">
            {recentSecurityEvents.map((event) => (
              <div key={event.id} className="p-4 rounded-xl bg-white/5 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{event.type}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSeverityClass(event.severity)}`}>
                    {event.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-text-muted text-sm mb-1">{event.action}</p>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">By: {event.user}</span>
                  <span className="text-text-muted text-xs">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Security Principles</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-white">No client-side trust - all validations server-side</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-white">Immutable audit logs for all actions</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-white">Granular RBAC with principle of least privilege</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-white">Real-time security monitoring and alerts</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-white">Automatic session revocation on role changes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Review Security Settings
      </Button>
    </PageContainer>
  );
}
