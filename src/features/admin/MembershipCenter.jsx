import { useState, useEffect } from 'react';
import { useAuth } from "../auth/AuthContext";
import { hasPermission } from '../../services/firebase/permissions';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { CheckCircle, XCircle, Clock, Search, User, Mail, Calendar, FileText, Info, ShieldAlert, UserPlus, Ban, AlertTriangle, Crown, Users, Building2, History, Award } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

export default function MembershipCenter() {
  const { user, roleData } = useAuth();
  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load applications
      const applicationsQuery = query(
        collection(db, 'users'),
        where('membershipStatus', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(applicationsData);

      // Load members
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
      const appRef = doc(db, 'users', applicationId);
      let updateData = { updatedAt: serverTimestamp() };

      switch(action) {
        case 'approve':
          updateData.membershipStatus = 'approved';
          updateData.accountStatus = 'active';
          updateData.approvedAt = serverTimestamp();
          updateData.approvedBy = user.uid;
          break;
        case 'reject':
          updateData.membershipStatus = 'rejected';
          updateData.rejectedAt = serverTimestamp();
          updateData.rejectedBy = user.uid;
          updateData.rejectionReason = reviewNotes;
          break;
        case 'request_info':
          updateData.membershipStatus = 'pending';
          updateData.needsInfo = true;
          updateData.infoRequestedAt = serverTimestamp();
          updateData.infoRequestedBy = user.uid;
          break;
        case 'promote':
          updateData.accountStatus = 'premium';
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
      }

      await updateDoc(appRef, updateData);
      await loadData();
      setSelectedApplication(null);
      setReviewNotes('');
      setActionType(null);
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
      let updateData = { updatedAt: serverTimestamp() };

      switch(action) {
        case 'promote_co_ceo':
          updateData.role = 'Co-CEO';
          updateData.isExecutive = true;
          updateData.promotedBy = user.uid;
          updateData.promotedAt = serverTimestamp();
          break;
        case 'assign_leadership':
          updateData.role = 'Leader';
          break;
        case 'assign_moderator':
          updateData.role = 'Moderator';
          break;
        case 'assign_mentor':
          updateData.role = 'Mentor';
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
      }

      await updateDoc(memberRef, updateData);
      await loadData();
      setSelectedMember(null);
      setReviewNotes('');
      setActionType(null);
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
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Membership Center is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Membership Center" 
        description="Executive management of membership applications, member accounts, and organizational structure."
        hero={true}
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="h-5 w-5 text-amber-400" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{applications.length}</p>
            <p className="text-xs text-text-muted">Pending Applications</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Approved</span>
            </div>
            <p className="text-2xl font-bold text-white">{members.length}</p>
            <p className="text-xs text-text-muted">Approved Members</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Suspended</span>
            </div>
            <p className="text-2xl font-bold text-white">{members.filter(m => m.accountStatus === 'suspended').length}</p>
            <p className="text-xs text-text-muted">Suspended Accounts</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Ban className="h-5 w-5 text-red-400" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Banned</span>
            </div>
            <p className="text-2xl font-bold text-white">{members.filter(m => m.accountStatus === 'banned').length}</p>
            <p className="text-xs text-text-muted">Banned Accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('applications')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'applications'
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <FileText className="h-4 w-4" />
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'members'
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Users className="h-4 w-4" />
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'history'
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-text-muted hover:bg-white/5 hover:text-white"
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
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <p className="text-text-muted">No pending applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    onClick={() => setSelectedApplication(application)}
                    className="group relative overflow-hidden rounded-xl border border-border bg-white/[0.02] p-6 cursor-pointer transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getStatusColor(application.membershipStatus))}>
                            <Clock className="h-4 w-4" />
                            <span>{application.membershipStatus}</span>
                          </div>
                          {application.createdAt && (
                            <div className="flex items-center gap-2 text-text-muted text-sm">
                              <Calendar className="h-4 w-4" />
                              {new Date(application.createdAt?.toDate?.() || application.createdAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                            <User className="h-6 w-6 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{application.displayName || application.username || 'Unknown'}</h3>
                            <div className="flex items-center gap-2 text-text-muted text-sm">
                              <Mail className="h-4 w-4" />
                              {application.email}
                            </div>
                          </div>
                        </div>

                        {application.bio && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-accent mt-1 shrink-0" />
                            <p className="text-text-soft text-sm line-clamp-2">{application.bio}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-text-muted group-hover:text-white transition-colors">
                          Review →
                        </span>
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
        <Card>
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
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <p className="text-text-muted">No members found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.filter(m => 
                  m.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.email?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="group relative overflow-hidden rounded-xl border border-border bg-white/[0.02] p-6 cursor-pointer transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {member.role === 'CEO' && <Crown className="h-4 w-4 text-purple-400" />}
                          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getRoleColor(member.role))}>
                            <span>{member.role || 'Member'}</span>
                          </div>
                          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", getAccountStatusColor(member.accountStatus))}>
                            <span>{member.accountStatus || 'active'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                            <User className="h-6 w-6 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{member.displayName || member.username || 'Unknown'}</h3>
                            <div className="flex items-center gap-2 text-text-muted text-sm">
                              <Mail className="h-4 w-4" />
                              {member.email}
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

                      <div className="flex items-center gap-2">
                        <span className="text-text-muted group-hover:text-white transition-colors">
                          Manage →
                        </span>
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
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-background border border-border rounded-3xl p-8">
            <button
              onClick={() => setSelectedApplication(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4", getStatusColor(selectedApplication.membershipStatus))}>
                <Clock className="h-4 w-4" />
                <span>{selectedApplication.membershipStatus}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedApplication.displayName || selectedApplication.username || 'Unknown'}</h2>
              <div className="flex items-center gap-2 text-text-muted">
                <Mail className="h-4 w-4" />
                {selectedApplication.email}
              </div>
            </div>

            <div className="space-y-6">
              {selectedApplication.bio && (
                <div>
                  <h3 className="font-bold text-white mb-2">Bio</h3>
                  <p className="text-text-soft bg-white/5 rounded-lg p-4">{selectedApplication.bio}</p>
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
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-bold text-white mb-4">Actions</h3>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add review notes (optional)..."
                rows={3}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none mb-4"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => handleApplicationAction('approve', selectedApplication.id)}
                  disabled={submittingReview}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleApplicationAction('reject', selectedApplication.id)}
                  disabled={submittingReview}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
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
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-background border border-border rounded-3xl p-8">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="mb-6">
              {selectedMember.role === 'CEO' && <Crown className="h-6 w-6 text-purple-400 mb-2" />}
              <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4", getRoleColor(selectedMember.role))}>
                <span>{selectedMember.role || 'Member'}</span>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roleData?.role === 'CEO' && selectedMember.role !== 'CEO' && (
                  <Button
                    onClick={() => handleMemberAction('promote_co_ceo', selectedMember.id)}
                    disabled={submittingReview}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Promote to Co-CEO
                  </Button>
                )}
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
                  onClick={() => handleMemberAction('suspend', selectedMember.id)}
                  disabled={submittingReview}
                  variant="secondary"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
                <Button
                  onClick={() => handleMemberAction('ban', selectedMember.id)}
                  disabled={submittingReview}
                  variant="destructive"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban
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
    </PageContainer>
  );
}
