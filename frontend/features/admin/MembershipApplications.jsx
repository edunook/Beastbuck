import { useState, useEffect, useMemo } from 'react';
import { useAuth } from "../auth/AuthContext";
import { hasPermission } from '@shared/permissions/permissions';
import { ROLES } from '@shared/constants/roles';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { MembershipService } from '@services/firestore/membership';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  Mail,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Globe,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  AlertCircle,
  Link2,
  RotateCcw,
  FileCheck,
  FileX,
  Filter,
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { cn } from '@shared/lib/utils';
import { formatDistanceToNow } from '@shared/lib/dateUtils';

const membershipApplicationsStyles = `
  .membership-applications-shell {
    position: relative;
    isolation: isolate;
  }

  .membership-applications-shell::before {
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

  .membership-applications-title {
    background: linear-gradient(90deg, #ffffff 0%, #99f6e4 32%, #c4b5fd 66%, #fde68a 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .membership-applications-shell * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default function MembershipApplications() {
  const { user, roleData } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userRole = typeof roleData === 'object' ? roleData?.role : roleData;
  const canViewApplications = hasPermission(userRole, 'canAccessCeoPanel') || hasPermission(userRole, 'canAccessAdmin');

  useEffect(() => {
    if (canViewApplications) {
      loadApplications();
    }
  }, [canViewApplications]);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const applicationsQuery = query(collection(db, 'membershipApplications'));
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      applicationsData.sort((a, b) => {
        const dateA = a.submittedAt?.seconds
          ? a.submittedAt.seconds * 1000
          : a.submittedAt
          ? new Date(a.submittedAt).getTime()
          : 0;
        const dateB = b.submittedAt?.seconds
          ? b.submittedAt.seconds * 1000
          : b.submittedAt
          ? new Date(b.submittedAt).getTime()
          : 0;
        return dateB - dateA;
      });

      setApplications(applicationsData);
    } catch (err) {
      console.error('Error loading membership applications:', err);
      setError('Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!reviewNotes.trim()) {
      setError('Please provide review notes before approving');
      return;
    }

    setSubmittingReview(true);
    setError(null);
    setSuccess(null);

    try {
      await MembershipService.reviewApplication(applicationId, {
        status: 'approved',
        reviewerId: user.uid,
        reviewNotes: reviewNotes.trim()
      });

      setSuccess('Application approved successfully! User is now an official Member.');
      setReviewNotes('');
      setExpandedApplication(null);
      await loadApplications();
    } catch (err) {
      console.error('Error approving application:', err);
      setError('Failed to approve application.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReject = async (applicationId) => {
    if (!reviewNotes.trim()) {
      setError('Please provide review notes before rejecting');
      return;
    }

    setSubmittingReview(true);
    setError(null);
    setSuccess(null);

    try {
      await MembershipService.reviewApplication(applicationId, {
        status: 'rejected',
        reviewerId: user.uid,
        reviewNotes: reviewNotes.trim()
      });

      setSuccess('Application rejected.');
      setReviewNotes('');
      setExpandedApplication(null);
      await loadApplications();
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError('Failed to reject application.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleExpand = (applicationId) => {
    setExpandedApplication(expandedApplication === applicationId ? null : applicationId);
  };

  // Stats calculation
  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    applications.forEach(a => {
      const s = (a.status || 'pending').toLowerCase();
      if (s === 'approved') approved++;
      else if (s === 'rejected') rejected++;
      else pending++;
    });
    return { total: applications.length, pending, approved, rejected };
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Status filter
      const appStatus = (app.status || 'pending').toLowerCase();
      if (statusFilter !== 'all' && appStatus !== statusFilter) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const searchLower = searchQuery.toLowerCase();
      const name = app.applicantName || app.name || '';
      const email = app.applicantEmail || app.email || '';
      const profession = app.profession || '';
      const organization = app.organization || '';
      const motivation = app.motivation || '';

      return (
        name.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        profession.toLowerCase().includes(searchLower) ||
        organization.toLowerCase().includes(searchLower) ||
        motivation.toLowerCase().includes(searchLower)
      );
    });
  }, [applications, statusFilter, searchQuery]);

  if (!canViewApplications) {
    return (
      <PageContainer>
        <style>{membershipApplicationsStyles}</style>
        <div className="membership-applications-shell min-h-[60vh] flex flex-col items-center justify-center p-4">
          <Card className="border-red-500/30 bg-red-950/20 max-w-md w-full p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/15 text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white mb-2">Access Restricted</h2>
            <p className="text-sm text-text-muted">
              Membership Applications review is strictly reserved for platform leadership and executives.
            </p>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-7xl pb-16">
      <style>{membershipApplicationsStyles}</style>
      <div className="membership-applications-shell">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Executive Application Processing
            </div>
            <h1 className="membership-applications-title font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              Membership Applications
            </h1>
            <p className="mt-1 text-sm sm:text-base text-text-muted max-w-2xl">
              Review, evaluate, and process applicant requests for official BeastBuck platform membership.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={loadApplications}
            disabled={loading}
            className="flex items-center gap-2 text-sm self-start md:self-auto"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin text-accent' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards Overview */}
        <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-cyan-300/80">Total Applications</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {loading ? '...' : stats.total}
                  </p>
                </div>
                <FileText className="h-6 w-6 text-cyan-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-300">Pending Review</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">
                    {loading ? '...' : stats.pending}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-amber-400 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-300/80">Approved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
                    {loading ? '...' : stats.approved}
                  </p>
                </div>
                <FileCheck className="h-6 w-6 text-emerald-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-rose-300/80">Rejected</p>
                  <p className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1">
                    {loading ? '...' : stats.rejected}
                  </p>
                </div>
                <FileX className="h-6 w-6 text-rose-400 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls: Search & Status Filter Tabs */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Search by applicant name, email, profession, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === 'rejected'
                  ? 'bg-rose-500 text-white font-bold shadow-md'
                  : 'bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Rejected ({stats.rejected})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-950 font-bold shadow-md'
                  : 'bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/20'
              }`}
            >
              All ({stats.total})
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Card className="mb-6 border-rose-500/50 bg-rose-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <p className="text-sm text-white">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-emerald-500/50 bg-emerald-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-white">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-white/10 bg-white/5 p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 w-1/3 rounded bg-white/10" />
                  <div className="h-4 w-1/2 rounded bg-white/10" />
                  <div className="h-4 w-1/4 rounded bg-white/10" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="border-dashed border-white/10 bg-surface/40 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No Applications Found</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto">
              {searchQuery
                ? `No applications matching "${searchQuery}".`
                : `There are no ${statusFilter !== 'all' ? statusFilter : ''} membership applications.`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const statusLower = (application.status || 'pending').toLowerCase();
              const isPending = statusLower === 'pending';
              const isApproved = statusLower === 'approved';
              const isRejected = statusLower === 'rejected';

              return (
                <Card
                  key={application.id}
                  className={cn(
                    "border-white/10 bg-surface/90 transition-all hover:border-white/20",
                    expandedApplication === application.id && "border-teal-500/40 bg-slate-900/90 shadow-xl"
                  )}
                >
                  <CardContent className="p-5 sm:p-6">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2.5">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Clock className="h-3.5 w-3.5" />
                              Pending Review
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approved
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <XCircle className="h-3.5 w-3.5" />
                              Rejected
                            </span>
                          )}

                          {application.submittedAt && (
                            <span className="text-xs text-text-muted flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(
                                application.submittedAt?.seconds
                                  ? application.submittedAt.seconds * 1000
                                  : application.submittedAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3.5 mb-3">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shrink-0 border border-white/15">
                            {(application.applicantName || application.name || 'A')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-lg truncate">
                              {application.applicantName || application.name || 'Unknown Applicant'}
                            </h3>
                            <p className="text-xs text-text-muted truncate flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              {application.applicantEmail || application.email || 'No email provided'}
                            </p>
                          </div>
                        </div>

                        {/* Quick preview info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                          {(application.profession || application.experience) && (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-accent" />
                              <span>{application.profession || application.experience}</span>
                            </div>
                          )}
                          {application.organization && (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-accent" />
                              <span>{application.organization}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => toggleExpand(application.id)}
                        variant="secondary"
                        size="sm"
                        className="shrink-0 text-xs font-semibold self-end sm:self-start"
                      >
                        {expandedApplication === application.id ? (
                          <>
                            Close Details <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Review Application <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {expandedApplication === application.id && (
                      <div className="mt-6 space-y-6 border-t border-white/10 pt-6 animate-in fade-in duration-200">
                        {/* Motivation */}
                        {application.motivation && (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-teal-300">
                              Applicant Motivation Statement
                            </h4>
                            <p className="text-sm text-white leading-relaxed">{application.motivation}</p>
                          </div>
                        )}

                        {/* Personal & Contact Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                            <span className="text-text-muted block mb-1 font-semibold">Contact Email</span>
                            <span className="text-white font-medium">{application.applicantEmail || application.email || 'N/A'}</span>
                          </div>
                          {application.phone && (
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                              <span className="text-text-muted block mb-1 font-semibold">Phone</span>
                              <span className="text-white font-medium">{application.phone}</span>
                            </div>
                          )}
                          {application.location && (
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                              <span className="text-text-muted block mb-1 font-semibold">Location</span>
                              <span className="text-white font-medium">{application.location}</span>
                            </div>
                          )}
                          {application.website && (
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                              <span className="text-text-muted block mb-1 font-semibold">Website</span>
                              <a
                                href={application.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent underline font-medium"
                              >
                                {application.website}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Experience & Skills */}
                        {(application.experience || application.skills || application.goals) && (
                          <div className="space-y-3 border-t border-white/5 pt-4 text-xs">
                            {application.experience && (
                              <div>
                                <span className="font-bold text-teal-300 block mb-1">Experience & Background</span>
                                <p className="text-white text-sm">{application.experience}</p>
                              </div>
                            )}
                            {application.skills && (
                              <div>
                                <span className="font-bold text-teal-300 block mb-1">Skills & Specializations</span>
                                <p className="text-white text-sm">{application.skills}</p>
                              </div>
                            )}
                            {application.goals && (
                              <div>
                                <span className="font-bold text-teal-300 block mb-1">Goals & Aspirations</span>
                                <p className="text-white text-sm">{application.goals}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reviewer notes & Previous decision */}
                        {!isPending && (
                          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 text-xs">
                            <span className="font-bold text-amber-300 block mb-1">Reviewer Feedback & Decision</span>
                            <p className="text-text-muted">{application.reviewNotes || 'No notes provided during review.'}</p>
                            {application.reviewedAt && (
                              <p className="text-[11px] text-text-muted/70 mt-2">
                                Processed on {new Date(application.reviewedAt?.seconds ? application.reviewedAt.seconds * 1000 : application.reviewedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Review Action Form (for Pending applications or re-review) */}
                        {isPending && (
                          <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5 space-y-4">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-teal-300" />
                              Review & Process Application
                            </h4>

                            <div>
                              <label className="block text-xs font-bold text-teal-200 mb-1.5">
                                Executive Review Notes (Required for approval/rejection)
                              </label>
                              <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Write decision rationale or welcome notes for the applicant..."
                                rows={3}
                                className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/90 p-3 text-xs sm:text-sm text-white placeholder:text-text-muted focus:border-teal-400 focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                              <Button
                                onClick={() => handleApprove(application.id)}
                                disabled={submittingReview || !reviewNotes.trim()}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex-1"
                              >
                                <CheckCircle className="mr-1.5 h-4 w-4" />
                                Approve Application
                              </Button>

                              <Button
                                onClick={() => handleReject(application.id)}
                                disabled={submittingReview || !reviewNotes.trim()}
                                variant="destructive"
                                className="font-bold text-xs sm:text-sm flex-1"
                              >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Reject Application
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
