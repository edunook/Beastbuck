import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { promoteToCoCEO, removeCoCEO, getExecutives } from '@services/firestore/executive';
import { GovernanceService } from '@services/firestore/governance';
import { Search, Users, Building2, Activity, CheckCircle, XCircle, AlertTriangle, Zap, Settings, ChevronDown, ChevronUp, Crown, Bell, Radio, Siren, Shield, Lock, Unlock, UserPlus, BriefcaseBusiness, FlaskConical, Package, Bot, Film, Calendar, MessageSquare } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { cn } from '@shared/lib/utils';

export default function CommandCenter() {
  const { user, roleData } = useAuth();
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [platformLocked, setPlatformLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [crisisMode, setCrisisMode] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadExecutives();
    loadNotifications();
  }, []);

  const loadExecutives = async () => {
    setLoading(true);
    try {
      const execs = await getExecutives();
      setExecutives(execs);
    } catch (error) {
      console.error('Error loading executives:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const alerts = await GovernanceService.getCriticalAlerts();
      setNotifications(alerts);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handlePromoteCoCEO = async (targetUid, reason) => {
    if (!user?.uid) return;
    const result = await promoteToCoCEO(user.uid, targetUid, reason);
    if (result.success) {
      await loadExecutives();
      setActionModal(null);
    } else {
      alert(result.error || 'Failed to promote user');
    }
  };

  const handleRemoveCoCEO = async (targetUid, reason) => {
    if (!user?.uid) return;
    const result = await removeCoCEO(user.uid, targetUid, reason);
    if (result.success) {
      await loadExecutives();
      setActionModal(null);
    } else {
      alert(result.error || 'Failed to remove Co-CEO');
    }
  };

  const togglePlatformLock = () => {
    if (platformLocked) {
      setPlatformLocked(false);
      setLockReason('');
    } else {
      const reason = prompt('Enter reason for platform lock:');
      if (reason) {
        setLockReason(reason);
        setPlatformLocked(true);
      }
    }
  };

  const handleCrisisBroadcast = async () => {
    if (!crisisMessage.trim()) return;
    
    try {
      await GovernanceService.createAlert({
        title: 'CRISIS BROADCAST',
        description: crisisMessage,
        severity: 'critical',
        type: 'broadcast',
        createdBy: user?.uid,
      });
      
      setCrisisMessage('');
      setCrisisMode(false);
      await loadNotifications();
      alert('Crisis broadcast sent successfully!');
    } catch (error) {
      console.error('Error sending crisis broadcast:', error);
      alert('Failed to send crisis broadcast');
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
            <p className="text-text-muted">Command Center is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Command Center" 
        description="Executive headquarters for managing the entire BeastBuck ecosystem."
        hero={true}
      />

      {/* Platform Lock Alert */}
      {platformLocked && (
        <Card className="mb-6 border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-bold text-white">Platform Locked</p>
                  <p className="text-sm text-text-muted">{lockReason}</p>
                </div>
              </div>
              <Button
                onClick={togglePlatformLock}
                size="sm"
                variant="destructive"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crisis Management */}
      <Card className="mb-6 border-red-500/30 bg-gradient-to-br from-red-500/5 to-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Siren className="h-5 w-5 text-red-400" />
            Crisis Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!crisisMode ? (
            <Button
              onClick={() => setCrisisMode(true)}
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Radio className="h-4 w-4 mr-2" />
              Send Crisis Broadcast
            </Button>
          ) : (
            <div className="space-y-4">
              <textarea
                value={crisisMessage}
                onChange={(e) => setCrisisMessage(e.target.value)}
                placeholder="Enter crisis message to broadcast to all members..."
                rows={4}
                className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-red-500/50 focus:outline-none transition-colors resize-none"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setCrisisMode(false);
                    setCrisisMessage('');
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCrisisBroadcast}
                  disabled={!crisisMessage.trim()}
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Broadcast
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Executive Notifications */}
      {notifications.length > 0 && (
        <Card className="mb-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5 text-amber-400" />
              Critical Alerts ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{notification.title}</h4>
                      <p className="text-text-mutedtext-sm">{notification.description}</p>
                      {notification.type === 'broadcast' && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-400">
                          <Radio className="h-3 w-3" />
                          <span>Broadcast Message</span>
                        </div>
                      )}
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Controls */}
      <div className="grid gap-6 mb-6 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="h-5 w-5 text-purple-400" />
              Executive Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-soft">CEO</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-soft">Co-CEOs</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                  {executives.filter(e => e.role === 'Co-CEO').length}
                </span>
              </div>
              <div className="pt-4 border-t border-border">
                <Button
                  onClick={() => setActionModal('promote')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Promote to Co-CEO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-amber-400" />
              Platform Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={togglePlatformLock}
                variant={platformLocked ? "destructive" : "secondary"}
                className={platformLocked ? "w-full bg-red-600 hover:bg-red-700" : "w-full"}
              >
                {platformLocked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                {platformLocked ? 'Unlock Platform' : 'Lock Platform'}
              </Button>
              <Button variant="secondary" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Maintenance
              </Button>
              <Button variant="secondary" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Platform Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'search', label: 'Global Search', icon: Search },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'departments', label: 'Departments', icon: Building2 },
              { id: 'teams', label: 'Teams', icon: BriefcaseBusiness },
              { id: 'projects', label: 'Projects', icon: Activity },
              { id: 'research', label: 'Research', icon: FlaskConical },
              { id: 'marketplace', label: 'Marketplace', icon: Package },
              { id: 'ai', label: 'AI Studio', icon: Bot },
              { id: 'funflix', label: 'FunFlix', icon: Film },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'community', label: 'Community', icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-accent/10 text-accent border border-accent/30"
                      : "text-text-muted hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all collections..."
                  className="pl-10"
                />
              </div>
              <div className="text-center py-12 text-text-muted">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Enter a search query to find members, projects, research, and more.</p>
              </div>
            </div>
          )}

          {activeTab !== 'search' && (
            <div className="text-center py-12 text-text-muted">
              <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management interface.</p>
              <p className="text-sm mt-2">This section will be populated with actual data from Firestore.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      {actionModal === 'promote' && (
        <PromoteModal
          onClose={() => setActionModal(null)}
          onConfirm={handlePromoteCoCEO}
        />
      )}

      {actionModal === 'remove' && selectedUser && (
        <RemoveModal
          user={selectedUser}
          onClose={() => setActionModal(null)}
          onConfirm={handleRemoveCoCEO}
        />
      )}
    </PageContainer>
  );
}

function PromoteModal({ onClose, onConfirm }) {
  const [targetUid, setTargetUid] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUid.trim()) return;
    setLoading(true);
    await onConfirm(targetUid.trim(), reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Promote to Co-CEO</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">User ID</label>
            <Input
              value={targetUid}
              onChange={(e) => setTargetUid(e.target.value)}
              placeholder="Enter user UID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you promoting this user?"
              rows={3}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Promoting...' : 'Promote'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RemoveModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(user.id, reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Remove Co-CEO</h2>
        <p className="text-text-muted mb-6">
          Are you sure you want to remove {user.displayName || user.username} from Co-CEO role?
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Reason (required)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you removing this Co-CEO?"
              rows={3}
              required
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
