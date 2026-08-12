import { useState, useEffect } from 'react';
import { useAuth } from "../auth/AuthContext";
import { hasPermission } from '@shared/permissions/permissions';
import { ROLES } from '@shared/constants/roles';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { MembershipService } from '@services/firestore/membership';
import { CheckCircle, XCircle, Clock, Search, User, Mail, Calendar, FileText, ChevronDown, ChevronUp, Building2, MapPin, Globe, Phone, Briefcase, GraduationCap, Award, Sparkles, AlertCircle, Link2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
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
    }
  }
`;

export default function MembershipApplications() {
  const { user, roleData } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check if user has permission to view membership applications
  // roleData might be an object or string, handle both cases
  const userRole = typeof roleData === 'object' ? roleData?.role : roleData;
  const canViewApplications = hasPermission(userRole, 'canAccessAdmin');

  useEffect(() => {
    if (canViewApplications) {
      loadApplications();
    }
  }, [canViewApplications]);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use simple query without orderBy to avoid index requirement
      // This will work immediately without waiting for index to build
      const applicationsQuery = query(
        collection(db, 'membershipApplications'),
        where('status', '==', 'pending')
      );
      
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Debug: log the raw data
      console.log('Loaded applications:', applicationsData);
      console.log('First application fields:', applicationsData[0] ? Object.keys(applicationsData[0]) : 'No applications');
      
      // Sort manually by submittedAt in descending order
      applicationsData.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading membership applications:', error);
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
        reviewNotes: reviewNotes
      });

      setSuccess('Application approved successfully');
      setReviewNotes('');
      setExpandedApplication(null);
      await loadApplications();
    } catch (err) {
      console.error('Error approving application:', err);
      setError('Failed to approve application');
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
        reviewNotes: reviewNotes
      });

      setSuccess('Application rejected successfully');
      setReviewNotes('');
      setExpandedApplication(null);
      await loadApplications();
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError('Failed to reject application');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleExpand = (applicationId) => {
    setExpandedApplication(expandedApplication === applicationId ? null : applicationId);
  };

  const filteredApplications = applications.filter(app => {
    // If search is empty, show all applications
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const name = app.name || '';
    const email = app.email || '';
    const profession = app.profession || '';
    const organization = app.organization || '';
    
    return (
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      profession.toLowerCase().includes(searchLower) ||
      organization.toLowerCase().includes(searchLower)
    );
  });

  // Debug: log filtered applications
  console.log('Search query:', searchQuery);
  console.log('Loaded applications:', applications);
  console.log('Filtered applications:', filteredApplications);
  console.log('Total applications:', applications.length);
  console.log('Filtered count:', filteredApplications.length);

  if (!canViewApplications) {
    return (
      <PageContainer>
        <style>{membershipApplicationsStyles}</style>
        <div className="membership-applications-shell min-h-screen p-4 sm:p-6 lg:p-8">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <div>
                  <h3 className="font-bold text-white">Access Denied</h3>
                  <p className="text-sm text-text-muted">You don't have permission to view membership applications.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <style>{membershipApplicationsStyles}</style>
      <div className="membership-applications-shell min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="membership-applications-title font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Membership Applications
          </h1>
          <p className="mt-2 text-text-muted text-caption sm:text-body">
            Review and manage pending membership applications
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent/20 p-2">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{applications.length}</p>
                  <p className="text-caption text-text-muted">Pending Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-success/20 p-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-caption text-text-muted">Approved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-danger/20 p-2">
                  <XCircle className="h-5 w-5 text-danger" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-caption text-text-muted">Rejected Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Search by name, email, profession, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-text-muted focus:border-accent"
            />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Card className="mb-6 border-red-500/50 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-white">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-500/50 bg-green-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="text-sm text-white">{success}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-white/10 bg-white/5">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 w-1/3 rounded bg-white/10" />
                    <div className="h-4 w-1/2 rounded bg-white/10" />
                    <div className="h-4 w-1/4 rounded bg-white/10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-4 font-heading text-lg font-bold text-white">No Applications Found</h3>
              <p className="mt-2 text-caption text-text-muted">
                {searchQuery ? 'Try adjusting your search query' : 'There are no pending membership applications'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className={cn(
                  "border-white/10 bg-white/5 transition-all hover:border-accent/30",
                  expandedApplication === application.id && "border-accent/50 bg-accent/5"
                )}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-accent/20 p-2">
                          <User className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-heading text-lg font-bold text-white">
                            {application.applicantName || 'Unknown'}
                          </h3>
                          <p className="text-caption text-text-muted">{application.applicantEmail || 'No email'}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-caption text-text-muted">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{application.experience || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>{application.skills || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {application.submittedAt
                              ? formatDistanceToNow(new Date(application.submittedAt))
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleExpand(application.id)}
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-text-muted hover:text-white"
                    >
                      {expandedApplication === application.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedApplication === application.id && (
                    <div className="mt-6 space-y-6 border-t border-white/10 pt-6">
                      {/* Personal Information */}
                      <div>
                        <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-accent">
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-2 text-caption text-text-muted">
                            <Mail className="h-4 w-4" />
                            <span>{application.email || 'Not provided'}</span>
                          </div>
                          {application.phone && (
                            <div className="flex items-center gap-2 text-caption text-text-muted">
                              <Phone className="h-4 w-4" />
                              <span>{application.phone}</span>
                            </div>
                          )}
                          {application.location && (
                            <div className="flex items-center gap-2 text-caption text-text-muted">
                              <MapPin className="h-4 w-4" />
                              <span>{application.location}</span>
                            </div>
                          )}
                          {application.website && (
                            <div className="flex items-center gap-2 text-caption text-text-muted">
                              <Globe className="h-4 w-4" />
                              <a
                                href={application.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline"
                              >
                                {application.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div>
                        <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-accent">
                          Professional Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-2 text-caption text-text-muted">
                            <Briefcase className="h-4 w-4" />
                            <span>{application.profession || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-caption text-text-muted">
                            <Building2 className="h-4 w-4" />
                            <span>{application.organization || 'Not specified'}</span>
                          </div>
                          {application.experience && (
                            <div className="col-span-1 sm:col-span-2">
                              <div className="flex items-start gap-2 text-caption text-text-muted">
                                <GraduationCap className="h-4 w-4 mt-0.5" />
                                <span>{application.experience}</span>
                              </div>
                            </div>
                          )}
                          {application.skills && (
                            <div className="col-span-1 sm:col-span-2">
                              <div className="flex items-start gap-2 text-caption text-text-muted">
                                <Award className="h-4 w-4 mt-0.5" />
                                <span>{application.skills}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Social Links */}
                      <div>
                        <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-accent">
                          Social Links
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {application.linkedin && (
                            <a
                              href={application.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-caption text-text-muted transition-all hover:bg-white/10 hover:text-white"
                            >
                              <Link2 className="h-4 w-4" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {application.twitter && (
                            <a
                              href={application.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-caption text-text-muted transition-all hover:bg-white/10 hover:text-white"
                            >
                              <Link2 className="h-4 w-4" />
                              <span>Twitter</span>
                            </a>
                          )}
                          {application.github && (
                            <a
                              href={application.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-caption text-text-muted transition-all hover:bg-white/10 hover:text-white"
                            >
                              <Link2 className="h-4 w-4" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {!application.linkedin && !application.twitter && !application.github && (
                            <p className="text-caption text-text-muted">No social links provided</p>
                          )}
                        </div>
                      </div>

                      {/* Application Details */}
                      <div>
                        <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-accent">
                          Application Details
                        </h4>
                        <div className="space-y-3">
                          {application.motivation && (
                            <div>
                              <p className="mb-1 text-caption font-bold text-text-muted">Motivation</p>
                              <p className="text-body text-white">{application.motivation}</p>
                            </div>
                          )}
                          {application.goals && (
                            <div>
                              <p className="mb-1 text-caption font-bold text-text-muted">Goals</p>
                              <p className="text-body text-white">{application.goals}</p>
                            </div>
                          )}
                          {application.contribution && (
                            <div>
                              <p className="mb-1 text-caption font-bold text-text-muted">How they can contribute</p>
                              <p className="text-body text-white">{application.contribution}</p>
                            </div>
                          )}
                          {application.interests && (
                            <div>
                              <p className="mb-1 text-caption font-bold text-text-muted">Interests</p>
                              <p className="text-body text-white">{application.interests}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Section */}
                      <div>
                        <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-accent">
                          Review Application
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-caption font-bold text-text-muted">
                              Review Notes *
                            </label>
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Provide feedback on this application..."
                              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                              rows={3}
                            />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={() => handleApprove(application.id)}
                              disabled={submittingReview}
                              className="bg-success hover:bg-success/90"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(application.id)}
                              disabled={submittingReview}
                              variant="destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
