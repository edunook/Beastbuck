import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { ROLES } from '@shared/constants/roles';
import { promoteToCoCEO, removeCoCEO, getExecutives } from '@services/firestore/executive';
import { GovernanceService } from '@services/firestore/governance';
import { Search, Users, Building2, Activity, CheckCircle, AlertTriangle, Settings, Crown, Bell, Radio, Siren, Shield, Lock, Unlock, UserPlus, BriefcaseBusiness, FlaskConical, Package, Bot, Film, Calendar, MessageSquare, Sparkles, Trash2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { cn } from '@shared/lib/utils';

const commandCenterStyles = `
  .exec-command-shell {
    position: relative;
    isolation: isolate;
  }

  .exec-command-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 8%, rgba(34, 211, 238, 0.15), transparent 28rem),
      radial-gradient(circle at 88% 12%, rgba(168, 85, 247, 0.16), transparent 27rem),
      radial-gradient(circle at 66% 94%, rgba(245, 158, 11, 0.10), transparent 32rem),
      linear-gradient(135deg, rgba(2, 6, 23, 0.96), rgba(8, 13, 32, 0.96) 48%, rgba(24, 14, 47, 0.95));
    z-index: -1;
  }

  .exec-command-title {
    background: linear-gradient(90deg, #ffffff 0%, #a5f3fc 32%, #c4b5fd 66%, #fde68a 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .exec-command-shell * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`;

const tabItems = [
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
];

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

  const mainCeoCount = executives.filter(e => e.role === ROLES.MAIN_CEO || e.role === 'CEO').length || (roleData?.role === ROLES.MAIN_CEO ? 1 : 0);
  const coCeoExecutives = executives.filter(e => e.role === ROLES.CO_CEO || e.role === 'Co-CEO');
  const activeTabMeta = tabItems.find(tab => tab.id === activeTab);

  return (
    <PageContainer className="exec-command-shell max-w-[1760px]">
      <style>{commandCenterStyles}</style>

      <section className="mb-6 overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-slate-950/86 via-slate-900/66 to-violet-950/40 p-1 shadow-[0_30px_96px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="relative rounded-[1.6rem] bg-black/20 p-4 sm:p-6 lg:p-7">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Executive Headquarters
              </div>
              <h1 className="exec-command-title font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Command Center
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Crisis broadcasts, executive role actions, critical alerts, and cross-system command surfaces for BeastBuck leadership.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:w-[36rem]">
              <div className="rounded-2xl border border-violet-200/20 bg-violet-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-violet-100/70">CEO</p>
                <p className="mt-1 text-sm font-black text-violet-100">{loading ? 'Loading' : mainCeoCount}</p>
              </div>
              <div className="rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-cyan-100/70">Co-CEOs</p>
                <p className="mt-1 text-sm font-black text-cyan-100">{loading ? 'Loading' : coCeoExecutives.length}</p>
              </div>
              <div className="rounded-2xl border border-amber-200/20 bg-amber-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-amber-100/70">Alerts</p>
                <p className="mt-1 text-sm font-black text-amber-100">{notifications.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Lock Alert */}
      {platformLocked && (
        <Card className="mb-6 overflow-hidden border-rose-200/25 bg-rose-500/12 shadow-[0_22px_70px_rgba(127,29,29,0.16)]">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-200/25 bg-rose-400/15 text-rose-100">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white">Platform Locked</p>
                  <p className="break-words text-sm text-text-muted">{lockReason}</p>
                </div>
              </div>
              <Button
                onClick={togglePlatformLock}
                size="sm"
                variant="danger"
                className="w-full border-rose-200/25 bg-rose-500/20 text-rose-100 hover:bg-rose-500/28 sm:w-auto"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crisis Management */}
      <Card className="mb-6 overflow-hidden border-rose-200/20 bg-gradient-to-br from-rose-500/12 via-orange-500/8 to-slate-950/65 shadow-[0_24px_70px_rgba(127,29,29,0.14)] backdrop-blur-xl">
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
              variant="danger"
              className="w-full border-rose-200/25 bg-rose-500/20 text-rose-100 hover:bg-rose-500/28"
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
                  variant="danger"
                  className="flex-1 border-rose-200/25 bg-rose-500/20 text-rose-100 hover:bg-rose-500/28"
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
                      <p className="text-sm text-text-muted">{notification.description}</p>
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
        <Card className="overflow-hidden border-violet-200/20 bg-gradient-to-br from-violet-500/12 via-blue-500/8 to-slate-950/65 shadow-[0_24px_70px_rgba(88,28,135,0.13)] backdrop-blur-xl">
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
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-sm font-bold">{loading ? '...' : mainCeoCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-soft">Co-CEOs</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                  {loading ? '...' : coCeoExecutives.length}
                </span>
              </div>
              {coCeoExecutives.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  {coCeoExecutives.slice(0, 4).map(executive => (
                    <div key={executive.id || executive.uid || executive.email} className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">{executive.displayName || executive.username || executive.email || 'Co-CEO'}</p>
                        <p className="truncate text-xs text-slate-500">{executive.email || executive.id || executive.uid}</p>
                      </div>
                      {roleData?.role === ROLES.MAIN_CEO && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(executive);
                            setActionModal('remove');
                          }}
                          className="inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-xl border border-rose-200/20 bg-rose-300/10 px-2.5 text-xs font-black text-rose-100 transition hover:bg-rose-300/16 focus:outline-none focus:ring-2 focus:ring-rose-200/25"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-4 border-t border-border">
                <Button
                  onClick={() => setActionModal('promote')}
                  className="w-full border-violet-200/25 bg-violet-500/18 text-violet-100 hover:bg-violet-500/26"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Promote to Co-CEO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-amber-200/20 bg-gradient-to-br from-amber-500/12 via-orange-500/8 to-slate-950/65 shadow-[0_24px_70px_rgba(146,64,14,0.12)] backdrop-blur-xl">
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
                variant={platformLocked ? "danger" : "secondary"}
                className={platformLocked ? "w-full border-rose-200/25 bg-rose-500/20 text-rose-100 hover:bg-rose-500/28" : "w-full"}
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
      <Card className="mb-6 overflow-hidden border-white/10 bg-slate-950/72 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {tabItems.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex min-h-[46px] min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-200/25",
                    activeTab === tab.id
                      ? "border-cyan-200/35 bg-cyan-300/12 text-cyan-100 shadow-[0_14px_38px_rgba(34,211,238,0.1)]"
                      : "border-white/10 text-text-muted hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-slate-950/78 via-slate-900/62 to-indigo-950/34 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="mb-5 flex min-w-0 items-center gap-3">
            {activeTabMeta && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
                <activeTabMeta.icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-slate-500">Active command surface</p>
              <h2 className="truncate font-heading text-xl font-black text-white">{activeTabMeta?.label || 'Command Surface'}</h2>
            </div>
          </div>

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
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.035] px-4 py-12 text-center text-text-muted">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="mx-auto max-w-md text-sm leading-6">Enter a search query to find members, projects, research, and more.</p>
              </div>
            </div>
          )}

          {activeTab !== 'search' && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.035] px-4 py-12 text-center text-text-muted">
              <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-bold text-slate-300">{activeTabMeta?.label || activeTab} command surface</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6">No dedicated live panel is connected here yet. Existing actions remain available through the routed executive and admin pages.</p>
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
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
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
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white transition-colors placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full border-violet-200/25 bg-violet-500/18 text-violet-100 hover:bg-violet-500/26"
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
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
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
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white transition-colors placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="danger"
              className="w-full"
            >
              {loading ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
