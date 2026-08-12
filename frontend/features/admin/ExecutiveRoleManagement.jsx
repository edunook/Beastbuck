import { useCallback, useEffect, useState } from 'react';
import { 
  Crown, 
  Shield, 
  UserPlus, 
  UserMinus, 
  RefreshCw, 
  Search, 
  ChevronDown,
  X,
  AlertTriangle,
  Crown as CoCEOIcon,
  Users,
  Award,
  Edit,
  Star,
  Lock
} from 'lucide-react';
import { db } from '@services/firebase/config';
import { collection, getDocs, doc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '@shared/constants/roles';
import { cn } from '@shared/lib/utils';
import toast from 'react-hot-toast';

const ROLE_HIERARCHY = {
  [ROLES.MAIN_CEO]: { level: 5, label: 'CEO', icon: Crown, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  [ROLES.CO_CEO]: { level: 4, label: 'Co-CEO', icon: CoCEOIcon, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  [ROLES.LEADER]: { level: 3, label: 'Leader', icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  [ROLES.MEMBER]: { level: 2, label: 'Member', icon: Users, color: 'text-green-400', bgColor: 'bg-green-400/10' },
  [ROLES.USER]: { level: 1, label: 'User', icon: UserPlus, color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
};

const AVAILABLE_ROLES = [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER, ROLES.USER];

const executiveRoleStyles = `
  .exec-role-shell {
    position: relative;
    isolation: isolate;
  }

  .exec-role-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 8% 8%, rgba(250, 204, 21, 0.12), transparent 26rem),
      radial-gradient(circle at 86% 10%, rgba(139, 92, 246, 0.16), transparent 28rem),
      radial-gradient(circle at 66% 94%, rgba(34, 211, 238, 0.12), transparent 32rem),
      linear-gradient(135deg, rgba(2, 6, 23, 0.96), rgba(8, 13, 32, 0.96) 48%, rgba(24, 14, 47, 0.95));
    z-index: -1;
  }

  .exec-role-title {
    background: linear-gradient(90deg, #ffffff 0%, #fde68a 28%, #c4b5fd 62%, #a5f3fc 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .exec-role-shell * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default function ExecutiveRoleManagement() {
  const { user, roleData } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, executives: 0, leaders: 0, members: 0 });

  const currentUserRole = roleData?.role;
  const isCEO = currentUserRole === ROLES.MAIN_CEO;
  const isCoCEO = currentUserRole === ROLES.CO_CEO;
  const hasAccess = isCEO || isCoCEO;

  useEffect(() => {
    if (!hasAccess) {
      toast.error('Access denied. CEO and Co-CEO only.');
      return;
    }
    loadMembers();
  }, [hasAccess]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const membersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setMembers(membersList);
      setFilteredMembers(membersList);
      
      // Calculate stats
      setStats({
        total: membersList.length,
        executives: membersList.filter(m => m.role === ROLES.MAIN_CEO || m.role === ROLES.CO_CEO).length,
        leaders: membersList.filter(m => m.role === ROLES.LEADER).length,
        members: membersList.filter(m => m.role === ROLES.MEMBER).length,
      });
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = useCallback(() => {
    let filtered = [...members];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        (m.displayName || m.username || '').toLowerCase().includes(query) ||
        (m.email || '').toLowerCase().includes(query)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }

    setFilteredMembers(filtered);
  }, [members, roleFilter, searchQuery]);

  useEffect(() => {
    filterMembers();
  }, [filterMembers]);

  const handleRoleChange = async (memberId, newRole) => {
    setActionLoading(true);
    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        role: newRole,
        roleUpdatedAt: serverTimestamp(),
        roleUpdatedBy: user.uid
      });

      toast.success(`Role updated successfully`);
      await loadMembers();
      setShowRoleModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveCoCEO = async (coCEOMemberId) => {
    if (!window.confirm('Are you sure you want to remove this Co-CEO? They will be demoted to Member.')) {
      return;
    }

    setActionLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const coCEORef = doc(db, 'users', coCEOMemberId);
        const coCEODoc = await transaction.get(coCEORef);

        if (!coCEODoc.exists()) {
          throw new Error('Co-CEO not found');
        }

        const coCEOData = coCEODoc.data();
        if (coCEOData.role !== ROLES.CO_CEO) {
          throw new Error('User is not a Co-CEO');
        }

        transaction.update(coCEORef, {
          role: ROLES.MEMBER,
          isExecutive: false,
          demotedBy: user.uid,
          demotedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      toast.success('Co-CEO removed successfully');
      await loadMembers();
    } catch (error) {
      console.error('Error removing Co-CEO:', error);
      toast.error(error.message || 'Failed to remove Co-CEO');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteToCoCEO = async (memberId) => {
    if (!window.confirm('Are you sure you want to promote this member to Co-CEO?')) {
      return;
    }

    setActionLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const memberRef = doc(db, 'users', memberId);
        const memberDoc = await transaction.get(memberRef);

        if (!memberDoc.exists()) {
          throw new Error('Member not found');
        }

        const memberData = memberDoc.data();
        if (memberData.role === ROLES.MAIN_CEO || memberData.role === ROLES.CO_CEO) {
          throw new Error('User is already an executive');
        }

        transaction.update(memberRef, {
          role: ROLES.CO_CEO,
          isExecutive: true,
          promotedBy: user.uid,
          promotedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      toast.success('Member promoted to Co-CEO successfully');
      await loadMembers();
    } catch (error) {
      console.error('Error promoting to Co-CEO:', error);
      toast.error(error.message || 'Failed to promote to Co-CEO');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferCEO = async (newCEOId) => {
    if (!window.confirm('Are you sure you want to transfer CEO position? This will remove your CEO status and cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const currentCEORef = doc(db, 'users', user.uid);
        const newCEORef = doc(db, 'users', newCEOId);

        const currentCEODoc = await transaction.get(currentCEORef);
        const newCEODoc = await transaction.get(newCEORef);

        if (!currentCEODoc.exists() || !newCEODoc.exists()) {
          throw new Error('User not found');
        }

        const currentCEOData = currentCEODoc.data();
        if (currentCEOData.role !== ROLES.MAIN_CEO) {
          throw new Error('You are not the current CEO');
        }

        const newCEOData = newCEODoc.data();
        if (newCEOData.role === ROLES.MAIN_CEO) {
          throw new Error('User is already the CEO');
        }

        // Demote current CEO to Co-CEO
        transaction.update(currentCEORef, {
          role: ROLES.CO_CEO,
          ceoTransferredTo: newCEOId,
          ceoTransferredAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Promote new user to CEO
        transaction.update(newCEORef, {
          role: ROLES.MAIN_CEO,
          isExecutive: true,
          ceoTransferredFrom: user.uid,
          ceoTransferredAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      toast.success('CEO position transferred successfully');
      await loadMembers();
      setShowTransferModal(false);
    } catch (error) {
      console.error('Error transferring CEO:', error);
      toast.error(error.message || 'Failed to transfer CEO position');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleInfo = (role) => ROLE_HIERARCHY[role] || ROLE_HIERARCHY[ROLES.USER];

  const canModifyRole = (targetMember) => {
    if (!hasAccess) return false;
    
    const targetRole = targetMember.role;
    
    // CEO can modify everyone except when transferring their own position
    if (isCEO) {
      return true;
    }
    
    // Co-CEO cannot modify CEO or other Co-CEOs
    if (isCoCEO) {
      return targetRole !== ROLES.MAIN_CEO && targetRole !== ROLES.CO_CEO;
    }
    
    return false;
  };

  const canRemoveCoCEO = (targetMember) => {
    return isCEO && targetMember.role === ROLES.CO_CEO;
  };

  const canPromoteToCoCEO = (targetMember) => {
    return isCEO && targetMember.role !== ROLES.MAIN_CEO && targetMember.role !== ROLES.CO_CEO;
  };

  const canTransferCEO = (targetMember) => {
    return isCEO && targetMember.id !== user.id && targetMember.role !== ROLES.MAIN_CEO;
  };

  if (!hasAccess) {
    return (
      <div className="exec-role-shell flex min-h-[60vh] items-center justify-center px-4">
        <style>{executiveRoleStyles}</style>
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Access Denied</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">This workspace is reserved for CEO and Co-CEO access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exec-role-shell mx-auto max-w-[1760px] space-y-6">
      <style>{executiveRoleStyles}</style>
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/95 via-indigo-950/70 to-cyan-950/45 p-1 shadow-2xl shadow-black/30">
        <div className="rounded-[22px] bg-slate-950/45 p-5 backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-300/20 to-violet-400/20 text-amber-100 shadow-lg shadow-amber-300/10">
                <Crown className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">Leadership control plane</p>
                <h1 className="exec-role-title font-heading text-2xl font-black tracking-wide md:text-3xl">
                  Executive Role Management
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  {isCEO ? 'CEO Control Panel' : 'Co-CEO Management Panel'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={loadMembers}
                disabled={loading}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-slate-100 transition-all hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Members"
          value={stats.total}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
        />
        <StatCard
          icon={Crown}
          label="Executives"
          value={stats.executives}
          color="text-yellow-400"
          bgColor="bg-yellow-400/10"
        />
        <StatCard
          icon={Shield}
          label="Leaders"
          value={stats.leaders}
          color="text-purple-400"
          bgColor="bg-purple-400/10"
        />
        <StatCard
          icon={Award}
          label="Members"
          value={stats.members}
          color="text-green-400"
          bgColor="bg-green-400/10"
        />
      </div>

      {/* Search and Filter */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 shadow-xl shadow-black/15 backdrop-blur-xl sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search members by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-12 pr-4 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-200/45 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
          />
        </div>
        
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.05] px-4 pr-12 text-sm text-white transition-colors focus:border-cyan-200/45 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-cyan-300/20 md:w-56"
          >
            <option value="all">All Roles</option>
            {AVAILABLE_ROLES.map(role => (
              <option key={role} value={role}>{getRoleInfo(role).label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>
      </div>

      {/* Members List */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/65 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="border-b border-white/10 bg-white/[0.035] px-5 py-5 sm:px-6">
          <h3 className="text-lg font-bold text-white">Team Members</h3>
          <p className="text-sm text-text-muted">Manage roles and permissions</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-accent mb-4" />
            <p className="text-text-muted">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-text-muted mb-4" />
            <p className="text-text-muted">No members found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredMembers.map((member, index) => {
              const roleInfo = getRoleInfo(member.role);
              const RoleIcon = roleInfo.icon;
              const isCurrentUser = member.id === user.id;
              
              return (
                <div
                  key={member.id}
                  className="group relative px-4 py-4 transition-all hover:bg-white/[0.045] sm:px-6"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    {/* Member Info */}
                    <div className="flex min-w-0 items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        roleInfo.bgColor,
                        roleInfo.color
                      )}>
                        <RoleIcon className="h-6 w-6" />
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white truncate">
                            {member.displayName || member.username || 'Unknown'}
                          </h4>
                          {isCurrentUser && (
                            <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                              <Star className="h-3 w-3" />
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted truncate">
                          {member.email || member.username || 'No email'}
                        </p>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold",
                        roleInfo.bgColor,
                        roleInfo.color
                      )}>
                        <RoleIcon className="h-4 w-4" />
                        {roleInfo.label}
                      </span>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {canModifyRole(member) && !isCurrentUser && (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowRoleModal(true);
                            }}
                            className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-2 text-sm font-bold text-accent hover:bg-accent/20 transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            Change Role
                          </button>
                        )}
                        
                        {canRemoveCoCEO(member) && (
                          <button
                            onClick={() => handleRemoveCoCEO(member.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            <UserMinus className="h-4 w-4" />
                            Remove Co-CEO
                          </button>
                        )}
                        
                        {canPromoteToCoCEO(member) && (
                          <button
                            onClick={() => handlePromoteToCoCEO(member.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-2 text-sm font-bold text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                          >
                            <Crown className="h-4 w-4" />
                            Make Co-CEO
                          </button>
                        )}
                        
                        {canTransferCEO(member) && (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowTransferModal(true);
                            }}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm font-bold text-yellow-400 hover:bg-yellow-500/20 transition-all disabled:opacity-50"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Transfer CEO
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedMember && (
        <Modal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedMember(null);
          }}
          title={`Change Role for ${selectedMember.displayName || selectedMember.username}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Select a new role for this member. This action will be logged.
            </p>
            
            <div className="space-y-2">
              {AVAILABLE_ROLES.map(role => {
                const roleInfo = getRoleInfo(role);
                const RoleIcon = roleInfo.icon;
                const isCurrentRole = selectedMember.role === role;
                
                // Co-CEO cannot assign CEO or Co-CEO roles
                if (isCoCEO && (role === ROLES.MAIN_CEO || role === ROLES.CO_CEO)) {
                  return null;
                }
                
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(selectedMember.id, role)}
                    disabled={actionLoading || isCurrentRole}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                      isCurrentRole
                        ? "border-accent/40 bg-accent/5 cursor-default"
                        : "border-border bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
                      actionLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      roleInfo.bgColor,
                      roleInfo.color
                    )}>
                      <RoleIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{roleInfo.label}</span>
                        {isCurrentRole && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">
                        Level {roleInfo.level} access
                      </p>
                    </div>
                    
                    {!isCurrentRole && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white/5">
                        <ChevronDown className="h-4 w-4 text-text-muted" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* CEO Transfer Modal */}
      {showTransferModal && selectedMember && (
        <Modal
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedMember(null);
          }}
          title="Transfer CEO Position"
          variant="danger"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-red-400">Warning: Irreversible Action</h4>
                <p className="text-sm text-text-muted mt-1">
                  This will transfer your CEO position to {selectedMember.displayName || selectedMember.username}. 
                  You will be demoted to Co-CEO and this action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 rounded-xl bg-white/[0.02] border border-border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">
                  {selectedMember.displayName || selectedMember.username}
                </h4>
                <p className="text-sm text-text-muted">
                  {selectedMember.email || selectedMember.username}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleTransferCEO(selectedMember.id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", actionLoading && "animate-spin")} />
                {actionLoading ? 'Transferring...' : 'Confirm Transfer'}
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedMember(null);
                }}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-text-soft hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.055]">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", bgColor, color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ isOpen, onClose, title, children, variant = 'default' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        "relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-slate-950/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-6",
        variant === 'danger' ? "border-red-400/35" : "border-white/10"
      )}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-400 transition-all hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
