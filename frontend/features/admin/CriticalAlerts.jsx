import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { GovernanceService } from '@services/firestore/governance';
import { Shield, Bell, CheckCircle, Radio } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function CriticalAlerts() {
  const { roleData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const alerts = await GovernanceService.getCriticalAlerts();
      setNotifications(alerts);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await GovernanceService.resolveAlert(alertId);
      await loadNotifications();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Critical Alerts is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Critical Alerts</h1>
        <p className="text-text-muted">Monitor and resolve platform-wide alerts and crisis communications</p>
      </div>

      {/* Alert Stats */}
      <Card className="mb-6 border-amber-500/30 bg-amber-500/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm text-text-muted">Active Alerts</p>
                <p className="text-2xl font-bold text-white">{notifications.length}</p>
              </div>
            </div>
            <Button
              onClick={loadNotifications}
              variant="secondary"
              size="sm"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {loading ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-8 text-center">
            <p className="text-text-muted">Loading alerts...</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-text-muted mb-4 opacity-50" />
            <p className="text-text-muted">No active alerts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="border-amber-500/30 bg-amber-500/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notification.type === 'broadcast' && (
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <Radio className="h-3 w-3" />
                          <span>Broadcast</span>
                        </div>
                      )}
                      <h4 className="font-bold text-white">{notification.title}</h4>
                    </div>
                    <p className="text-sm text-text-muted">{notification.description}</p>
                  </div>
                  <Button
                    onClick={() => handleResolveAlert(notification.id)}
                    variant="secondary"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
