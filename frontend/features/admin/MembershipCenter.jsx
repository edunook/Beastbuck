import { useState, useEffect } from 'react';
import { useAuth } from "../auth/AuthContext";
import { hasPermission } from '@shared/permissions/permissions';
import { ROLES } from '@shared/constants/roles';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { MembershipService } from '@services/firestore/membership';
import { CheckCircle, XCircle, Clock, Search, User, Mail, Calendar, FileText, Info, ShieldAlert, UserPlus, Ban, AlertTriangle, Crown, Users, Building2, History, Award, Sparkles, ArrowRight } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { cn } from '@shared/lib/utils';

const membershipCenterStyles = `
  .exec-membership-shell {
    position: relative;
    isolation: isolate;
  }

  .exec-membership-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 8% 8%, rgba(20, 184, 166, 0.15), transparent 28rem),
      radial-gradient(circle at 88% 12%, rgba(139, 92, 246, 0.15), transparent 27rem),
      radial-gradient(circle at 62% 96%, rgba(245, 158, 11, 0.11), transparent 33rem),
      linear-gradient(135deg, rgba(2, 6, 23, 0.96), rgba(8, 13, 32, 0.96) 48%, rgba(24, 14, 47, 0.95));
    z-index: -1;
  }

  .exec-membership-title {
    background: linear-gradient(90deg, #ffffff 0%, #99f6e4 32%, #c4b5fd 66%, #fde68a 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .exec-membership-shell * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`;

// Helper function to normalize role for comparison
const normalizeRole = (role) => {
  if (!role) return '';
  const normalized = role.toLowerCase().trim();
  // Handle common variations
  if (normalized === 'ceo') return 'main ceo';
  if (normalized === 'co-ceo' || normalized === 'co ceo') return 'co-ceo';
  return normalized;
};

export default function MembershipCenter() {
  const { user, roleData } = useAuth();
  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load applications from membershipApplications collection
      const applicationsQuery = query(
        collection(db, 'membershipApplications'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(applicationsData);

      // Load members from users collection
      const membersQuery = query(
        collection(db, 'users'),
        where('membershipStatus', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      const membersSnapshot = await getDocs(membersQuery);
      const membersData = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading membership data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (action, applicationId) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    setSubmittingReview(true);
    setError(null);

    try {
      // Use MembershipService for proper approval/rejection flow
      if (action === 'approve') {
        await MembershipService.reviewApplication(applicationId, {
          status: 'approved',
          reviewerId: user.uid,
          reviewNotes: reviewNotes
        });
      } else if (action === 'reject') {
        await MembershipService.reviewApplication(applicationId, {
          status: 'rejected',
          reviewerId: user.uid,
          reviewNotes: reviewNotes
        });
      } else {
        // For other actions, directly update the application
        const appRef = doc(db, 'membershipApplications', applicationId);
        let updateData = { updatedAt: serverTimestamp() };

        switch(action) {
          case 'request_info':
            updateData.status = 'pending';
            updateData.needsInfo = true;
            updateData.infoRequestedAt = serverTimestamp();
            updateData.infoRequestedBy = user.uid;
            break;
        }

        await updateDoc(appRef, updateData);
      }

      await loadData();
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (err) {
      console.error('Error handling action:', err);
      setError('Failed to process action');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMemberAction = async (action, memberId) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    setSubmittingReview(true);
    setError(null);

    try {
      const memberRef = doc(db, 'users', memberId);
      const publicProfileRef = doc(db, 'publicProfiles', memberId);
      let updateData = { updatedAt: serverTimestamp() };
      let updatePublicProfile = {};

      switch(action) {
        case 'promote_co_ceo':
          updateData.role = 'Co-CEO';
          updateData.isExecutive = true;
          updateData.promotedBy = user.uid;
          updateData.promotedAt = serverTimestamp();
          updatePublicProfile.role = 'Co-CEO';
          updatePublicProfile.isExecutive = true;
          break;
        case 'remove_co_ceo':
          updateData.role = 'Member';
          updateData.isExecutive = false;
          updateData.demotedBy = user.uid;
          updateData.demotedAt = serverTimestamp();
          updatePublicProfile.role = 'Member';
          updatePublicProfile.isExecutive = false;
          break;
        case 'assign_ceo':
          updateData.role = 'CEO';
          updateData.isExecutive = true;
          updateData.promotedBy = user.uid;
          updateData.promotedAt = serverTimestamp();
          updatePublicProfile.role = 'CEO';
          updatePublicProfile.isExecutive = true;
          break;
        case 'assign_leadership':
          updateData.role = 'Leader';
          updatePublicProfile.role = 'Leader';
          break;
        case 'assign_moderator':
          updateData.role = 'Moderator';
          updatePublicProfile.role = 'Moderator';
          break;
        case 'assign_mentor':
          updateData.role = 'Mentor';
          updatePublicProfile.role = 'Mentor';
          break;
        case 'assign_judge':
          updateData.role = 'Judge';
          updatePublicProfile.role = 'Judge';
          break;
        case 'assign_writer':
          updateData.role = 'Writer';
          updatePublicProfile.role = 'Writer';
          break;
        case 'assign_member':
          updateData.role = 'Member';
          updatePublicProfile.role = 'Member';
          break;
        case 'suspend':
          updateData.accountStatus = 'suspended';
          updateData.suspendedAt = serverTimestamp();
          updateData.suspendedBy = user.uid;
          break;
        case 'ban':
          updateData.accountStatus = 'banned';
          updateData.membershipStatus = 'rejected';
          updateData.bannedAt = serverTimestamp();
          updateData.bannedBy = user.uid;
          break;
        case 'kick':
          updateData.membershipStatus = 'rejected';
          updateData.accountStatus = 'suspended';
          updateData.kickedAt = serverTimestamp();
          updateData.kickedBy = user.uid;
          updateData.kickReason = reviewNotes;
          break;
      }

      const batch = writeBatch(db);
      batch.update(memberRef, updateData);
      if (Object.keys(updatePublicProfile).length > 0) {
        batch.update(publicProfileRef, updatePublicProfile);
      }
      await batch.commit();
      
      await loadData();
      setSelectedMember(null);
      setReviewNotes('');
    } catch (err) {
      console.error('Error handling member action:', err);
      setError('Failed to process action');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  const getAccountStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10';
      case 'premium': return 'text-purple-400 bg-purple-500/10';
      case 'suspended': return 'text-amber-400 bg-amber-500/10';
      case 'banned': return 'text-red-400 bg-red-500/10';
      default: return 'text-text-muted bg-white/5';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'CEO': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Co-CEO': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Leader': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Moderator': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Mentor': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'Judge': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Writer': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Member': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  // Check if user has access
  const userRole = roleData?.role?.toLowerCase().trim() || '';
  const isCEO = userRole === 'main ceo' || userRole === 'ceo';
  const isCoCEO = userRole === 'co-ceo' || userRole === 'co ceo';
  const isExecutive = isCEO || isCoCEO;

  if (!isExecutive) {
    return (
      <PageContainer className="exec-membership-shell">
        <style>{membershipCenterStyles}</style>
        <div className="flex min-h-[60vh] items-center justify-center px-3 py-16">
          <div className="w-full max-w-md rounded-3xl border border-rose-200/15 bg-slate-950/82 p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200/20 bg-rose-300/10 text-rose-100">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-2xl font-black text-white">Access Denied</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Membership Center is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const suspendedCount = members.filter(m => m.accountStatus === 'suspended').length;
  const bannedCount = members.filter(m => m.accountStatus === 'banned').length;
  const filteredMembers = members.filter(m =>
    m.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer className="exec-membership-shell max-w-[1760px]">
      <style>{membershipCenterStyles}</style>

      <section className="mb-6 overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-slate-950/86 via-slate-900/66 to-teal-950/38 p-1 shadow-[0_30px_96px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="relative rounded-[1.6rem] bg-black/20 p-4 sm:p-6 lg:p-7">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/45 to-transparent" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-teal-100">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Executive Membership Review
              </div>
              <h1 className="exec-membership-title font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Membership Center
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Review applications, manage member standing, assign leadership roles, and keep BeastBuck access decisions clear and auditable.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:w-[26rem]">
              <div className="rounded-2xl border border-amber-200/20 bg-amber-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-amber-100/70">Pending</p>
                <p className="mt-1 text-sm font-black text-amber-100">{loading ? 'Loading' : applications.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-emerald-100/70">Members</p>
                <p className="mt-1 text-sm font-black text-emerald-100">{loading ? 'Loading' : members.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <Card className="overflow-hidden border-amber-200/20 bg-gradient-to-br from-amber-500/12 via-orange-500/8 to-slate-950/65 shadow-[0_22px_60px_rgba(146,64,14,0.1)] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="h-5 w-5 text-amber-400" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{applications.length}</p>
            <p className="text-xs text-text-muted">Pending Applications</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-emerald-200/20 bg-gradient-to-br from-emerald-500/12 via-teal-500/8 to-slate-950/65 shadow-[0_22px_60px_rgba(6,95,70,0.1)] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Approved</span>
            </div>
            <p className="text-2xl font-bold text-white">{members.length}</p>
            <p className="text-xs text-text-muted">Approved Members</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-amber-200/20 bg-gradient-to-br from-yellow-500/12 via-amber-500/8 to-slate-950/65 shadow-[0_22px_60px_rgba(146,64,14,0.1)] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Suspended</span>
            </div>
            <p className="text-2xl font-bold text-white">{suspendedCount}</p>
            <p className="text-xs text-text-muted">Suspended Accounts</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-rose-200/20 bg-gradient-to-br from-rose-500/12 via-red-500/8 to-slate-950/65 shadow-[0_22px_60px_rgba(127,29,29,0.12)] backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Ban className="h-5 w-5 text-red-400" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Banned</span>
            </div>
            <p className="text-2xl font-bold text-white">{bannedCount}</p>
            <p className="text-xs text-text-muted">Banned Accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card className="mb-6 overflow-hidden border-white/10 bg-slate-950/72 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={() => setActiveTab('applications')}
              className={cn(
                "flex min-h-[48px] min-w-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-200/25",
                activeTab === 'applications'
                  ? "border-teal-200/35 bg-teal-300/12 text-teal-100 shadow-[0_14px_38px_rgba(20,184,166,0.1)]"
                  : "border-white/10 text-text-muted hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
              )}
            >
              <FileText className="h-4 w-4" />
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={cn(
                "flex min-h-[48px] min-w-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-200/25",
                activeTab === 'members'
                  ? "border-teal-200/35 bg-teal-300/12 text-teal-100 shadow-[0_14px_38px_rgba(20,184,166,0.1)]"
                  : "border-white/10 text-text-muted hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
              )}
            >
              <Users className="h-4 w-4" />
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex min-h-[48px] min-w-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-200/25",
                activeTab === 'history'
                  ? "border-teal-200/35 bg-teal-300/12 text-teal-100 shadow-[0_14px_38px_rgba(20,184,166,0.1)]"
                  : "border-white/10 text-text-muted hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
              )}
            >
              <History className="h-4 w-4" />
              History
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-slate-950/78 via-slate-900/62 to-teal-950/28 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.035] px-4 py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <p className="text-text-muted">No pending applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    onClick={() => setSelectedApplication(application)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200/25 hover:bg-white/[0.065] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getStatusColor(application.status))}>
                            <Clock className="h-4 w-4" />
                            <span>{application.status}</span>
                          </div>
                          {application.submittedAt && (
                            <div className="flex items-center gap-2 text-text-muted text-sm">
                              <Calendar className="h-4 w-4" />
                              {new Date(application.submittedAt?.toDate?.() || application.submittedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="mb-4 flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-200/20 bg-teal-300/10">
                            <User className="h-6 w-6 text-teal-100" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-white">{application.applicantName || 'Unknown'}</h3>
                            <div className="flex min-w-0 items-center gap-2 text-sm text-text-muted">
                              <Mail className="h-4 w-4 shrink-0" />
                              <span className="truncate">{application.applicantEmail}</span>
                            </div>
                          </div>
                        </div>

                        {application.motivation && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-accent mt-1 shrink-0" />
                            <p className="text-text-soft text-sm line-clamp-2">{application.motivation}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 text-teal-100">
                        <span className="text-sm font-black transition-colors group-hover:text-white">Open</span>
                        <span className="hidden" aria-hidden="true">
                          Review →
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-slate-950/78 via-slate-900/62 to-teal-950/28 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.035] px-4 py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <p className="text-text-muted">No members found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200/25 hover:bg-white/[0.065] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          {member.role === 'CEO' && <Crown className="h-4 w-4 text-purple-400" />}
                          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getRoleColor(member.role))}>
                            <span>{member.role || 'Member'}</span>
                          </div>
                          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", getAccountStatusColor(member.accountStatus))}>
                            <span>{member.accountStatus || 'active'}</span>
                          </div>
                        </div>

                        <div className="mb-4 flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-200/20 bg-teal-300/10">
                            <User className="h-6 w-6 text-teal-100" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-white">{member.displayName || member.username || 'Unknown'}</h3>
                            <div className="flex min-w-0 items-center gap-2 text-sm text-text-muted">
                              <Mail className="h-4 w-4 shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          </div>
                        </div>

                        {member.department && (
                          <div className="flex items-center gap-2 text-text-muted text-sm">
                            <Building2 className="h-4 w-4" />
                            {member.department}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 text-teal-100">
                        <span className="text-sm font-black transition-colors group-hover:text-white">Open</span>
                        <span className="hidden" aria-hidden="true">
                          Manage →
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12 text-text-muted">
              <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Membership history and audit logs will appear here.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedApplication(null)} />
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
            <button
              onClick={() => setSelectedApplication(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4", getStatusColor(selectedApplication.status))}>
                <Clock className="h-4 w-4" />
                <span>{selectedApplication.status}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedApplication.applicantName || 'Unknown'}</h2>
              <div className="flex items-center gap-2 text-text-muted">
                <Mail className="h-4 w-4" />
                {selectedApplication.applicantEmail}
              </div>
            </div>

            <div className="space-y-6">
              {selectedApplication.motivation && (
                <div>
                  <h3 className="font-bold text-white mb-2">Motivation</h3>
                  <p className="text-text-soft bg-white/5 rounded-lg p-4">{selectedApplication.motivation}</p>
                </div>
              )}

              {selectedApplication.skills && (
                <div>
                  <h3 className="font-bold text-white mb-2">Skills</h3>
                  <p className="text-text-soft bg-white/5 rounded-lg p-4">{selectedApplication.skills}</p>
                </div>
              )}

              {selectedApplication.interests && (
                <div>
                  <h3 className="font-bold text-white mb-2">Interests</h3>
                  <p className="text-text-soft bg-white/5 rounded-lg p-4">{selectedApplication.interests}</p>
                </div>
              )}

              {selectedApplication.experience && (
                <div>
                  <h3 className="font-bold text-white mb-2">Experience</h3>
                  <p className="text-text-soft bg-white/5 rounded-lg p-4">{selectedApplication.experience}</p>
                </div>
              )}

              {selectedApplication.portfolioLinks && (
                <div>
                  <h3 className="font-bold text-white mb-2">Portfolio Links</h3>
                  <p className="text-text-soft bg-white/5 rounded-lg p-4">{selectedApplication.portfolioLinks}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-bold text-white mb-4">Actions</h3>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add review notes (optional)..."
                rows={3}
                className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white transition-colors placeholder:text-text-muted focus:border-teal-200/40 focus:outline-none"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {isExecutive && (
                  <Button
                    onClick={() => handleApplicationAction('approve', selectedApplication.id)}
                    disabled={submittingReview}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                {isExecutive && (
                  <Button
                    onClick={() => handleApplicationAction('reject', selectedApplication.id)}
                    disabled={submittingReview}
                    variant="danger"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}
                <Button
                  onClick={() => handleApplicationAction('request_info', selectedApplication.id)}
                  disabled={submittingReview}
                  variant="secondary"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Request Info
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedMember(null)} />
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="mb-6">
              {(selectedMember.role === ROLES.MAIN_CEO || selectedMember.role === 'CEO') && <Crown className="h-6 w-6 text-purple-400 mb-2" />}
              <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4", getRoleColor(selectedMember.role))}>
                <span>{selectedMember.role === ROLES.MAIN_CEO ? 'CEO' : selectedMember.role || 'Member'}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedMember.displayName || selectedMember.username || 'Unknown'}</h2>
              <div className="flex items-center gap-2 text-text-muted">
                <Mail className="h-4 w-4" />
                {selectedMember.email}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-bold text-white mb-4">Member Actions</h3>
              
              {/* CEO-only actions */}
              {isCEO && selectedMember.id !== user.uid && (
                <div className="mb-4">
                  <p className="text-xs text-text-muted mb-2">CEO Only Actions</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {normalizeRole(selectedMember.role) !== 'main ceo' && normalizeRole(selectedMember.role) !== 'co-ceo' && (
                      <Button
                        onClick={() => handleMemberAction('promote_co_ceo', selectedMember.id)}
                        disabled={submittingReview}
                        className="border-violet-200/25 bg-violet-500/18 text-violet-100 hover:bg-violet-500/26"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Promote to Co-CEO
                      </Button>
                    )}
                    {normalizeRole(selectedMember.role) === 'co-ceo' && (
                      <Button
                        onClick={() => handleMemberAction('remove_co_ceo', selectedMember.id)}
                        disabled={submittingReview}
                        variant="secondary"
                        className="border-amber-200/25 bg-amber-500/18 text-amber-100 hover:bg-amber-500/26"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove Co-CEO
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* CEO and Co-CEO actions */}
              {isExecutive && selectedMember.id !== user.uid && (
                <div className="mb-4">
                  <p className="text-xs text-text-muted mb-2">Executive Actions</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                      onClick={() => handleMemberAction('assign_leadership', selectedMember.id)}
                      disabled={submittingReview}
                      variant="secondary"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Assign Leadership
                    </Button>
                    <Button
                      onClick={() => handleMemberAction('assign_moderator', selectedMember.id)}
                      disabled={submittingReview}
                      variant="secondary"
                    >
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Assign Moderator
                    </Button>
                    <Button
                      onClick={() => handleMemberAction('assign_mentor', selectedMember.id)}
                      disabled={submittingReview}
                      variant="secondary"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Assign Mentor
                    </Button>
                    <Button
                      onClick={() => handleMemberAction('assign_judge', selectedMember.id)}
                      disabled={submittingReview}
                      variant="secondary"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Assign Judge
                    </Button>
                    <Button
                      onClick={() => handleMemberAction('assign_writer', selectedMember.id)}
                      disabled={submittingReview}
                      variant="secondary"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Assign Writer
                    </Button>
                    <Button
                      onClick={() => handleMemberAction('assign_member', selectedMember.id)}
                      disabled={submittingReview}
                      variant="secondary"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Assign Member
                    </Button>
                  </div>
                </div>
              )}

              {/* Self actions (CEO only) */}
              {isCEO && selectedMember.id === user.uid && (
                <div className="mb-4">
                  <p className="text-xs text-text-muted mb-2">Self Actions</p>
                  <Button
                    onClick={() => handleMemberAction('remove_co_ceo', selectedMember.id)}
                    disabled={submittingReview}
                    variant="secondary"
                    className="border-amber-200/25 bg-amber-500/18 text-amber-100 hover:bg-amber-500/26"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Resign as CEO
                  </Button>
                </div>
              )}

              {/* All executive actions */}
              {isExecutive && selectedMember.id !== user.uid && (
                <div>
                  <p className="text-xs text-text-muted mb-2">Account Actions</p>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes for kick/ban/suspend (optional)..."
                    rows={2}
                    className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white transition-colors placeholder:text-text-muted focus:border-teal-200/40 focus:outline-none"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                      onClick={() => handleMemberAction('suspend', selectedMember.id)}
                      disabled={submittingReview}
                      variant="secondary"
                      className="border-amber-200/25 bg-amber-500/18 text-amber-100 hover:bg-amber-500/26"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Suspend
                    </Button>
                    <Button
                      onClick={() => handleMemberAction('ban', selectedMember.id)}
                      disabled={submittingReview}
                      variant="danger"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban
                    </Button>
                    <Button
                      onClick={() => handleMemberAction('kick', selectedMember.id)}
                      disabled={submittingReview}
                      variant="danger"
                      className="sm:col-span-2"
                    >
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Kick from Membership
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
