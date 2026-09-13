import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { ROLES } from '@shared/constants/roles';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import {
  getAllAccountsForModeration,
  demoteMemberToUser,
  suspendMember,
  unsuspendMember,
  reinstateMember,
  getModerationAuditLogs,
} from '@services/firestore/executive';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  UserX,
  UserMinus,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  History,
  Calendar,
  RotateCcw,
  Crown,
  Users,
  AlertOctagon,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';

const DURATION_PRESETS = [
  { label: '1 Hour', hours: 1, desc: 'Cooling off' },
  { label: '24 Hours', hours: 24, desc: '1 Day' },
  { label: '3 Days', hours: 72, desc: '72 Hours' },
  { label: '7 Days', hours: 168, desc: '1 Week' },
  { label: '14 Days', hours: 336, desc: '2 Weeks' },
  { label: '30 Days', hours: 720, desc: '1 Month' },
  { label: 'Custom', hours: null, desc: 'Pick exact date' },
];

export default function MemberModeration() {
  const { user, roleData } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'suspended'
  const [sortBy, setSortBy] = useState('recently_updated'); // 'recently_updated' | 'name' | 'role'
  
  // Modals state
  const [modalType, setModalType] = useState(null); // 'suspend' | 'demote' | 'unsuspend' | 'reinstate'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // CEO and Co-CEO check
  const normalizedRole = roleData?.role?.toLowerCase()?.trim();
  const isAuthorized =
    hasPermission(roleData?.role, 'canAccessCeoPanel') ||
    normalizedRole === 'main ceo' ||
    normalizedRole === 'co-ceo' ||
    normalizedRole === 'co ceo';

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, logs] = await Promise.all([
        getAllAccountsForModeration(),
        getModerationAuditLogs(40),
      ]);
      setAccounts(accs);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, text) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Helper to determine if an account is an official Member (excludes regular users)
  const isMemberRecord = (acc) => {
    const roleNorm = (acc.role || '').toLowerCase().trim();
    // Exclude standard users, guests, public explorers, and revoked membership
    if (roleNorm === 'user' || roleNorm === 'guest' || roleNorm === 'public explorer') {
      return false;
    }
    if (acc.membershipStatus === 'revoked') {
      return false;
    }
    const isApproved = acc.membershipStatus === 'approved';
    const isMemberRole = ['member', 'leader', 'moderator', 'mentor', 'judge', 'writer', 'main ceo', 'co-ceo', 'co ceo'].includes(roleNorm);
    const isSuspendedMember = Boolean(acc.suspended || acc.accountStatus === 'suspended');

    return isApproved || isMemberRole || isSuspendedMember;
  };

  // Helper to test if an account is currently suspended
  const isAccountActiveSuspended = (acc) => {
    if (!acc.suspended && acc.accountStatus !== 'suspended') return false;
    if (acc.suspendedUntil) {
      const untilMs = acc.suspendedUntil?.toMillis
        ? acc.suspendedUntil.toMillis()
        : new Date(acc.suspendedUntil).getTime();
      return !isNaN(untilMs) && untilMs > Date.now();
    }
    return true;
  };

  // Helper to format remaining suspension time
  const formatRemainingTime = (suspendedUntil) => {
    if (!suspendedUntil) return 'Active suspension';
    const untilMs = suspendedUntil?.toMillis
      ? suspendedUntil.toMillis()
      : new Date(suspendedUntil).getTime();
    const diffMs = untilMs - Date.now();
    if (diffMs <= 0) return 'Expired';
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      return `${diffDays}d ${remainingHours}h remaining`;
    }
    const diffMins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    return `${diffHours}h ${diffMins}m remaining`;
  };

  // Filtered and sorted accounts (STRICTLY ONLY MEMBERS)
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((acc) => {
        // ONLY MEMBERS SHOWN - all regular accounts (users) are strictly excluded
        if (!isMemberRecord(acc)) return false;

        // Search filter
        const queryLower = searchQuery.toLowerCase().trim();
        if (queryLower) {
          const matchName = (acc.displayName || '').toLowerCase().includes(queryLower);
          const matchUser = (acc.username || '').toLowerCase().includes(queryLower);
          const matchEmail = (acc.email || '').toLowerCase().includes(queryLower);
          const matchRole = (acc.role || '').toLowerCase().includes(queryLower);
          if (!matchName && !matchUser && !matchEmail && !matchRole) return false;
        }

        // Status tab filter
        const isSusp = isAccountActiveSuspended(acc);
        if (filterStatus === 'suspended') return isSusp;
        if (filterStatus === 'active') return !isSusp;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const nameA = a.displayName || a.username || '';
          const nameB = b.displayName || b.username || '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'role') {
          const roleA = a.role || '';
          const roleB = b.role || '';
          return roleA.localeCompare(roleB);
        }
        // default: recently actioned/updated
        const tA = a.suspendedAt?.seconds || a.demotedAt?.seconds || a.updatedAt?.seconds || 0;
        const tB = b.suspendedAt?.seconds || b.demotedAt?.seconds || b.updatedAt?.seconds || 0;
        return tB - tA;
      });
  }, [accounts, searchQuery, filterStatus, sortBy]);

  // Quick stats computed only over members
  const stats = useMemo(() => {
    const memberAccounts = accounts.filter(isMemberRecord);
    let totalMembers = memberAccounts.length;
    let suspended = 0;
    let activeMembers = 0;
    let executives = 0;

    memberAccounts.forEach((acc) => {
      const roleNorm = (acc.role || '').toLowerCase().trim();
      const isExec = roleNorm === 'main ceo' || roleNorm === 'co-ceo' || roleNorm === 'co ceo' || acc.isExecutive;
      if (isExec) executives++;

      if (isAccountActiveSuspended(acc)) {
        suspended++;
      } else {
        activeMembers++;
      }
    });

    return { totalMembers, suspended, activeMembers, executives };
  }, [accounts]);

  // Action handlers
  const handleDemote = async (targetUid, reason) => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      const res = await demoteMemberToUser(user.uid, targetUid, reason);
      if (res.success) {
        showNotification('success', 'Member successfully demoted to standard User.');
        setModalType(null);
        setSelectedAccount(null);
        await loadData();
      } else {
        showNotification('error', res.error || 'Failed to demote member.');
      }
    } catch (err) {
      showNotification('error', err.message || 'An unexpected error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (targetUid, payload) => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      const res = await suspendMember(user.uid, targetUid, payload);
      if (res.success) {
        showNotification('success', 'Member has been temporarily suspended.');
        setModalType(null);
        setSelectedAccount(null);
        await loadData();
      } else {
        showNotification('error', res.error || 'Failed to suspend member.');
      }
    } catch (err) {
      showNotification('error', err.message || 'An unexpected error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (targetUid, reason) => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      const res = await unsuspendMember(user.uid, targetUid, reason);
      if (res.success) {
        showNotification('success', 'Suspension lifted. Member status fully restored.');
        setModalType(null);
        setSelectedAccount(null);
        await loadData();
      } else {
        showNotification('error', res.error || 'Failed to lift suspension.');
      }
    } catch (err) {
      showNotification('error', err.message || 'An unexpected error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinstate = async (targetUid, reason) => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      const res = await reinstateMember(user.uid, targetUid, reason);
      if (res.success) {
        showNotification('success', 'User reinstated as an official Member.');
        setModalType(null);
        setSelectedAccount(null);
        await loadData();
      } else {
        showNotification('error', res.error || 'Failed to reinstate member.');
      }
    } catch (err) {
      showNotification('error', err.message || 'An unexpected error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  // Access Denied screen
  if (!isAuthorized) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Executive Access Restricted</h1>
          <p className="max-w-md text-text-muted text-sm sm:text-base">
            Member Moderation is strictly reserved for the Main CEO and Co-CEO to enforce organizational standards.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-7xl pb-16">
      {/* Toast Notification Banner */}
      {feedbackMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            feedbackMessage.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
              : 'border-rose-500/30 bg-rose-950/90 text-rose-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertOctagon className="h-5 w-5 shrink-0 text-rose-400" />
          )}
          <span className="text-sm font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header & Hero */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            Executive Governance & Member Controls
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Member Moderation & Sanctions
          </h1>
          <p className="mt-1 text-sm sm:text-base text-text-muted max-w-2xl">
            Demote members to standard users or apply time-limited suspensions to enforce community integrity and platform rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={activeTab === 'directory' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('directory')}
            className="flex items-center gap-2 text-sm"
          >
            <Users className="h-4 w-4" />
            Directory & Actions
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('logs')}
            className="flex items-center gap-2 text-sm"
          >
            <History className="h-4 w-4" />
            Audit Logs ({auditLogs.length})
          </Button>
          <Button
            variant="ghost"
            onClick={loadData}
            disabled={loading}
            title="Refresh accounts"
            className="p-2.5 text-text-muted hover:text-white"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin text-accent' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Card className="border-cyan-500/20 bg-cyan-500/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-cyan-300/80">Total Members</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {loading ? '...' : stats.totalMembers}
                </p>
              </div>
              <Users className="h-6 w-6 text-cyan-400 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-300/80">Active Members</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {loading ? '...' : stats.activeMembers}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-400 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-300">Suspended Members</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">
                  {loading ? '...' : stats.suspended}
                </p>
              </div>
              <Clock className="h-6 w-6 text-amber-400 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-300/80">Executives (Protected)</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-300 mt-1">
                  {loading ? '...' : stats.executives}
                </p>
              </div>
              <Crown className="h-6 w-6 text-purple-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Controls: Search & Filter Pills */}
          <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by member name, @username, email, or role..."
                className="pl-10 h-11 bg-surface/80 border-white/10 rounded-xl text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter Tabs (Members only) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/20'
                }`}
              >
                All Members ({stats.totalMembers})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === 'active'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/20'
                }`}
              >
                Active ({stats.activeMembers})
              </button>
              <button
                onClick={() => setFilterStatus('suspended')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filterStatus === 'suspended'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/20'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                Suspended ({stats.suspended})
              </button>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-auto md:ml-2 h-9 px-3 text-xs rounded-xl bg-surface border border-white/10 text-text-muted focus:outline-none focus:border-cyan-400"
              >
                <option value="recently_updated">Sort: Recently Actioned</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="role">Sort: Role</option>
              </select>
            </div>
          </div>

          {/* Members List / Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <RotateCcw className="h-8 w-8 text-accent animate-spin mb-3" />
              <p className="text-text-muted text-sm">Loading member records & sanctions...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <Card className="border-dashed border-white/10 bg-surface/40 p-12 text-center">
              <UserX className="mx-auto h-12 w-12 text-text-muted/60 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Members Found</h3>
              <p className="text-text-muted text-sm max-w-sm mx-auto">
                {searchQuery
                  ? `No members matching "${searchQuery}". Try modifying your search.`
                  : 'No members match the current filter selection.'}
              </p>
              {searchQuery && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAccounts.map((account) => {
                const isSuspended = isAccountActiveSuspended(account);
                const roleNorm = (account.role || '').toLowerCase().trim();
                const isExecutive =
                  roleNorm === 'main ceo' ||
                  roleNorm === 'co-ceo' ||
                  roleNorm === 'co ceo' ||
                  account.isExecutive;

                return (
                  <Card
                    key={account.id}
                    className={`relative flex flex-col justify-between transition-all duration-200 ${
                      isSuspended
                        ? 'border-amber-500/40 bg-amber-950/10 shadow-[0_4px_20px_rgba(245,158,11,0.06)]'
                        : isExecutive
                        ? 'border-purple-500/30 bg-purple-950/10'
                        : 'border-white/10 bg-surface hover:border-white/20'
                    }`}
                  >
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      {/* Top Row: Member Avatar, Name & Role Badge */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {account.photoURL ? (
                              <img
                                src={account.photoURL}
                                alt={account.displayName || account.username || 'Member'}
                                className="h-12 w-12 rounded-full object-cover border border-white/15 shrink-0"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/15 flex items-center justify-center font-bold text-white shrink-0">
                                {(account.displayName || account.username || 'M')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 className="font-bold text-white text-base truncate flex items-center gap-1.5">
                                {account.displayName || account.username || 'Member'}
                                {isExecutive && <Crown className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                              </h3>
                              <p className="text-xs text-text-muted truncate">
                                @{account.username || 'nomembername'}
                              </p>
                              {account.email && (
                                <p className="text-xs text-text-muted/70 truncate">{account.email}</p>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                <Clock className="h-3 w-3" />
                                Suspended
                              </span>
                            ) : isExecutive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                <Crown className="h-3 w-3" />
                                {account.role || 'Executive'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" />
                                {account.role || 'Member'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Suspension Info Banner if Suspended */}
                        {isSuspended && (
                          <div className="mt-3 mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className="flex items-center gap-1 text-amber-400">
                                <Clock className="h-3.5 w-3.5" />
                                {formatRemainingTime(account.suspendedUntil)}
                              </span>
                              {account.suspendedUntil && (
                                <span className="text-text-muted text-[11px]">
                                  Until {new Date(account.suspendedUntil).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {account.suspendedReason && (
                              <p className="text-amber-300/80 mt-1 line-clamp-2">
                                <span className="font-semibold text-amber-400">Reason: </span>
                                {account.suspendedReason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Row */}
                      <div className="pt-3 border-t border-white/5 mt-3">
                        {isExecutive ? (
                          <div className="flex items-center justify-center py-1 text-xs text-purple-300/70 font-medium">
                            <Shield className="h-3.5 w-3.5 mr-1 text-purple-400" />
                            Executive account is protected from sanctions
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {isSuspended ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAccount(account);
                                    setModalType('unsuspend');
                                  }}
                                  className="w-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                  Lift Suspension
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAccount(account);
                                    setModalType('demote');
                                  }}
                                  className="w-full text-xs font-semibold"
                                >
                                  <UserMinus className="h-3.5 w-3.5 mr-1" />
                                  Demote to User
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAccount(account);
                                    setModalType('suspend');
                                  }}
                                  className="w-full text-xs font-semibold text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                                >
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  Suspend Member
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAccount(account);
                                    setModalType('demote');
                                  }}
                                  className="w-full text-xs font-semibold"
                                >
                                  <UserMinus className="h-3.5 w-3.5 mr-1" />
                                  Demote to User
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Audit Logs Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-accent" />
              Executive Sanction & Moderation History
            </h2>
            <span className="text-xs text-text-muted">Showing {auditLogs.length} recent events</span>
          </div>

          {auditLogs.length === 0 ? (
            <Card className="border-dashed border-white/10 bg-surface/40 p-12 text-center">
              <History className="mx-auto h-12 w-12 text-text-muted/60 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Moderation Events Recorded</h3>
              <p className="text-text-muted text-sm">
                Actions taken such as suspending members or demoting them to users will be logged here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => {
                const dateStr = log.createdAt?.seconds
                  ? new Date(log.createdAt.seconds * 1000).toLocaleString()
                  : 'Just now';

                let icon = <AlertTriangle className="h-5 w-5 text-amber-400" />;
                let badgeClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                let label = 'Suspended';

                if (log.type === 'MEMBER_DEMOTED_TO_USER') {
                  icon = <UserMinus className="h-5 w-5 text-rose-400" />;
                  badgeClass = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
                  label = 'Demoted to User';
                } else if (log.type === 'MEMBER_UNSUSPENDED') {
                  icon = <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
                  badgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                  label = 'Suspension Lifted';
                } else if (log.type === 'MEMBER_REINSTATED') {
                  icon = <UserCheck className="h-5 w-5 text-cyan-400" />;
                  badgeClass = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
                  label = 'Reinstated';
                }

                return (
                  <Card key={log.id} className="border-white/10 bg-surface/80">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                              {label}
                            </span>
                            <span className="text-xs text-text-muted">{dateStr}</span>
                          </div>
                          <p className="font-semibold text-white mt-1 text-sm">{log.summary}</p>
                          {log.details?.reason && (
                            <p className="text-xs text-text-muted mt-0.5">
                              <span className="text-text font-medium">Reason: </span>
                              {log.details.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-text-muted shrink-0 text-right sm:border-l sm:border-white/10 sm:pl-4">
                        <p>Target ID: <span className="font-mono text-white/80">{log.targetId?.slice(0, 10)}...</span></p>
                        <p>Actor ID: <span className="font-mono text-white/80">{log.actorId?.slice(0, 10)}...</span></p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. SUSPEND MEMBER MODAL */}
      {modalType === 'suspend' && selectedAccount && (
        <SuspendModal
          targetUser={selectedAccount}
          loading={actionLoading}
          onClose={() => {
            setModalType(null);
            setSelectedAccount(null);
          }}
          onConfirm={(payload) => handleSuspend(selectedAccount.id, payload)}
        />
      )}

      {/* 2. DEMOTE TO USER MODAL */}
      {modalType === 'demote' && selectedAccount && (
        <DemoteModal
          targetUser={selectedAccount}
          loading={actionLoading}
          onClose={() => {
            setModalType(null);
            setSelectedAccount(null);
          }}
          onConfirm={(reason) => handleDemote(selectedAccount.id, reason)}
        />
      )}

      {/* 3. LIFT SUSPENSION MODAL */}
      {modalType === 'unsuspend' && selectedAccount && (
        <LiftSuspensionModal
          targetUser={selectedAccount}
          loading={actionLoading}
          onClose={() => {
            setModalType(null);
            setSelectedAccount(null);
          }}
          onConfirm={(reason) => handleUnsuspend(selectedAccount.id, reason)}
        />
      )}

      {/* 4. REINSTATE MEMBER MODAL */}
      {modalType === 'reinstate' && selectedAccount && (
        <ReinstateModal
          targetUser={selectedAccount}
          loading={actionLoading}
          onClose={() => {
            setModalType(null);
            setSelectedAccount(null);
          }}
          onConfirm={(reason) => handleReinstate(selectedAccount.id, reason)}
        />
      )}
    </PageContainer>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Suspend Modal Component with duration presets & custom picker
 * ─────────────────────────────────────────────────────────────────────────────
 */
function SuspendModal({ targetUser, loading, onClose, onConfirm }) {
  const [selectedPreset, setSelectedPreset] = useState(24); // default 24 hours
  const [customDateTime, setCustomDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [restrictConfirmed, setRestrictConfirmed] = useState(true);

  // Compute calculated end time
  const calculatedEndTime = useMemo(() => {
    if (selectedPreset === null) {
      if (!customDateTime) return 'Select a date and time';
      const d = new Date(customDateTime);
      return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleString();
    }
    const d = new Date(Date.now() + selectedPreset * 3600 * 1000);
    return d.toLocaleString();
  }, [selectedPreset, customDateTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!restrictConfirmed) return;

    if (selectedPreset === null) {
      if (!customDateTime) {
        alert('Please choose a valid custom date and time.');
        return;
      }
      onConfirm({ customUntilDate: customDateTime, reason });
    } else {
      onConfirm({ durationHours: selectedPreset, reason });
    }
  };

  // Min datetime for HTML5 input (now)
  const nowIsoString = new Date().toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-amber-500/30 bg-slate-950/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Suspend Member Privileges</h2>
            <p className="text-xs text-text-muted">Apply a time-limited restriction on this member</p>
          </div>
        </div>

        {/* Target User Info */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
            {(targetUser.displayName || targetUser.username || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white text-sm truncate">
              {targetUser.displayName || targetUser.username}
            </p>
            <p className="text-xs text-text-muted truncate">
              @{targetUser.username} • {targetUser.role || 'Member'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Duration Presets Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
              Select Suspension Time Period
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setSelectedPreset(preset.hours)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                    selectedPreset === preset.hours
                      ? 'border-amber-400 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'border-white/10 bg-white/[0.04] text-text-muted hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold text-white">{preset.label}</span>
                  <span className="text-[10px] text-text-muted">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Input (if Custom selected) */}
          {selectedPreset === null && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Pick Expiration Date & Time
              </label>
              <Input
                type="datetime-local"
                min={nowIsoString}
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                required
                className="bg-slate-900 border-white/20 text-white text-sm"
              />
            </div>
          )}

          {/* Expiration Preview Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between text-xs">
            <span className="text-text-muted">Suspension ends automatically on:</span>
            <span className="font-bold text-amber-300 text-right">{calculatedEndTime}</span>
          </div>

          {/* Suspension Reason */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">
              Reason for Suspension (Required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Specify the reason (e.g. Conduct violation, spamming, unapproved actions)..."
              required
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-xs sm:text-sm text-white placeholder:text-text-muted focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Restriction Acknowledgment */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-muted pt-1">
            <input
              type="checkbox"
              checked={restrictConfirmed}
              onChange={(e) => setRestrictConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-white/20 text-amber-500 focus:ring-0"
            />
            <span>
              This user will immediately be barred from member-only hubs, task assignment, research tools, and community perks for this period.
            </span>
          </label>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !restrictConfirmed || !reason.trim()}
              className="w-full text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border-none shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              {loading ? 'Applying Suspension...' : 'Confirm Suspension'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Demote Member Modal Component (Member -> User)
 * ─────────────────────────────────────────────────────────────────────────────
 */
function DemoteModal({ targetUser, loading, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!confirmedCheck) return;
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-rose-500/30 bg-slate-950/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <UserMinus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Demote Member to User</h2>
            <p className="text-xs text-text-muted">Revoke member status permanently until reinstated</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
          <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300">Irreversible without manual reinstatement: </span>
            This action will immediately downgrade this account to a standard User. They will lose access to member portals, exclusive tasks, and team participation.
          </div>
        </div>

        {/* User Card */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
            {(targetUser.displayName || targetUser.username || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white text-sm truncate">
              {targetUser.displayName || targetUser.username}
            </p>
            <p className="text-xs text-text-muted truncate">
              Current Role: <span className="text-white font-medium">{targetUser.role || 'Member'}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-rose-400">➔ User</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">
              Reason for Demotion (Required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the official reason for removing this member's credentials..."
              required
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-xs sm:text-sm text-white placeholder:text-text-muted focus:border-rose-400 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-muted pt-1">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 rounded border-white/20 text-rose-500 focus:ring-0"
            />
            <span>
              I confirm that I am demoting <strong className="text-white">@{targetUser.username}</strong> to standard User role as Main CEO or Co-CEO.
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !confirmedCheck || !reason.trim()}
              className="w-full text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white border-none shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            >
              {loading ? 'Demoting Member...' : 'Confirm Demotion'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Lift Suspension Modal Component
 * ─────────────────────────────────────────────────────────────────────────────
 */
function LiftSuspensionModal({ targetUser, loading, onClose, onConfirm }) {
  const [reason, setReason] = useState('Suspension lifted by executive leadership');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-emerald-500/30 bg-slate-950/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Lift Suspension Early</h2>
            <p className="text-xs text-text-muted">Immediately restore all member capabilities</p>
          </div>
        </div>

        <p className="text-sm text-text-muted mb-4">
          Are you sure you want to lift the suspension for{' '}
          <strong className="text-white">{targetUser.displayName || targetUser.username}</strong>? They will regain full member access immediately.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">Note / Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-xs sm:text-sm text-white placeholder:text-text-muted focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="w-full text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {loading ? 'Restoring...' : 'Lift Suspension'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Reinstate Member Modal Component (User -> Member)
 * ─────────────────────────────────────────────────────────────────────────────
 */
function ReinstateModal({ targetUser, loading, onClose, onConfirm }) {
  const [reason, setReason] = useState('Reinstated as official Member by executive decision');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-cyan-500/30 bg-slate-950/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Reinstate as Member</h2>
            <p className="text-xs text-text-muted">Promote standard User back to full Member</p>
          </div>
        </div>

        <p className="text-sm text-text-muted mb-4">
          Promote <strong className="text-white">{targetUser.displayName || targetUser.username}</strong> back to official Member status.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">Note / Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-xs sm:text-sm text-white placeholder:text-text-muted focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="w-full text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {loading ? 'Reinstating...' : 'Reinstate Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
