import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../../services/firebase/permissions';
import { GovernanceService } from '../../services/firebase/governance';
import { Zap, Bell, Clock, FileText, Shield, ToggleLeft, ToggleRight, RefreshCw, Settings } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AutomationControl() {
  const { roleData } = useAuth();
  const [, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getAutomations();
      setAutomations(data);
    } catch (error) {
      console.error('Error loading automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (automationId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await GovernanceService.toggleAutomation(automationId, newStatus);
      await loadAutomations();
    } catch (error) {
      console.error('Error toggling automation:', error);
      alert('Failed to toggle automation');
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Zap className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Automation Control is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const automationTypes = [
    {
      id: 'membership-reminder',
      name: 'Auto Membership Reminder',
      description: 'Automatically remind users about pending membership applications',
      icon: Bell,
      status: 'active',
    },
    {
      id: 'review-assignment',
      name: 'Auto Review Assignment',
      description: 'Automatically assign membership reviews to available moderators',
      icon: Shield,
      status: 'active',
    },
    {
      id: 'auto-notifications',
      name: 'Auto Notifications',
      description: 'Send automated notifications for system events',
      icon: Bell,
      status: 'active',
    },
    {
      id: 'auto-reports',
      name: 'Auto Reports',
      description: 'Generate and send scheduled governance reports',
      icon: FileText,
      status: 'inactive',
    },
    {
      id: 'scheduled-reviews',
      name: 'Scheduled Reviews',
      description: 'Automatically schedule periodic membership reviews',
      icon: Clock,
      status: 'inactive',
    },
    {
      id: 'policy-expiration',
      name: 'Policy Expiration',
      description: 'Notify when policies are due for review or expiration',
      icon: FileText,
      status: 'active',
    },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Automation Control" 
        description="Configure and manage automated governance processes."
        hero={true}
        action={
          <Button onClick={loadAutomations} disabled={loading} size="sm" variant="secondary">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {automationTypes.map((automation) => {
          const Icon = automation.icon;
          return (
            <Card key={automation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${automation.status === 'active' ? 'bg-accent/20' : 'bg-white/5'}`}>
                      <Icon className={`h-6 w-6 ${automation.status === 'active' ? 'text-accent' : 'text-text-muted'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-2">{automation.name}</h3>
                      <p className="text-text-soft text-sm">{automation.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(automation.id, automation.status)}
                    className={`p-2 rounded-lg transition-colors ${automation.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                  >
                    {automation.status === 'active' ? (
                      <ToggleRight className="h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${automation.status === 'active' ? 'text-emerald-400' : 'text-text-muted'}`}>
                      {automation.status}
                    </span>
                    <Button size="sm" variant="secondary">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Info */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Full Configurability</h3>
              <p className="text-text-soft text-sm">
                All automations can be fully configured with custom schedules, triggers, conditions, and actions. 
                Click the Configure button on any automation to customize its behavior.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
