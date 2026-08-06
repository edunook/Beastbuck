import { useState, useEffect } from 'react';
import { useAuth } from "../auth/AuthContext";
import { MembershipService } from '../../services/firebase/membership';
import { hasPermission } from '../../services/firebase/permissions';
import { CheckCircle, XCircle, Clock, Search, User, Mail, Calendar, FileText, Info, ShieldAlert, UserPlus, Ban, AlertTriangle } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

const MOCK_APPLICATIONS = [
  { id: 1, applicantName: 'John Smith', applicantEmail: 'john@example.com', motivation: 'Passionate about AI and community building', skills: 'Python, Machine Learning', interests: 'AI Research, Education', experience: '5 years in software development', status: 'pending', submittedAt: new Date(Date.now() - 86400000), accountStatus: 'active' },
  { id: 2, applicantName: 'Sarah Johnson', applicantEmail: 'sarah@example.com', motivation: 'Want to contribute to open source projects', skills: 'JavaScript, React, Node.js', interests: 'Web Development, UI/UX', experience: '3 years full-stack development', status: 'pending', submittedAt: new Date(Date.now() - 172800000), accountStatus: 'active' },
  { id: 3, applicantName: 'Mike Chen', applicantEmail: 'mike@example.com', motivation: 'Looking for a community of innovators', skills: 'Data Science, Python', interests: 'Data Analysis, Research', experience: '2 years data analyst', status: 'approved', submittedAt: new Date(Date.now() - 259200000), accountStatus: 'active' },
  { id: 4, applicantName: 'Emily Davis', applicantEmail: 'emily@example.com', motivation: 'Interested in sustainable tech', skills: 'Project Management, Sustainability', interests: 'Green Tech, Social Impact', experience: '4 years non-profit management', status: 'rejected', submittedAt: new Date(Date.now() - 345600000), accountStatus: 'suspended' },
];

export default function AdminMemberships() {
  const { user, roleData } = useAuth();
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [filteredApplications, setFilteredApplications] = useState(MOCK_APPLICATIONS);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => { filterApplications(); }, [applications, searchQuery, statusFilter]);

  const filterApplications = () => {
    let filtered = applications;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicantName?.toLowerCase().includes(query) ||
        app.applicantEmail?.toLowerCase().includes(query) ||
        app.motivation?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleAction = async (action, applicationId) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    setSubmittingReview(true);
    setError(null);

    try {
      // Simulate action
      setTimeout(() => {
        let updatedApp = { ...app };
        
        switch(action) {
          case 'approve':
            updatedApp.status = 'approved';
            updatedApp.accountStatus = 'active';
            break;
          case 'reject':
            updatedApp.status = 'rejected';
            break;
          case 'request_info':
            updatedApp.status = 'pending';
            break;
          case 'promote':
            updatedApp.accountStatus = 'premium';
            break;
          case 'suspend':
            updatedApp.accountStatus = 'suspended';
            break;
          case 'ban':
            updatedApp.accountStatus = 'banned';
            updatedApp.status = 'rejected';
            break;
        }

        setApplications(prev => prev.map(a => a.id === applicationId ? updatedApp : a));
        setSelectedApplication(null);
        setReviewNotes('');
        setActionType(null);
        setSubmittingReview(false);
      }, 1000);
    } catch (err) {
      console.error('Error handling action:', err);
      setError('Failed to process action');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessAdmin')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">You don't have permission to access this page.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Membership Review & Approvals" 
        description="Executive review panels for managing membership applications and user accounts."
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{applications.filter(a => a.status === 'pending').length}</p>
            <p className="text-xs text-text-muted">Pending Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Approved</span>
            </div>
            <p className="text-2xl font-bold text-white">{applications.filter(a => a.status === 'approved').length}</p>
            <p className="text-xs text-text-muted">Approved Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Suspended</span>
            </div>
            <p className="text-2xl font-bold text-white">{applications.filter(a => a.accountStatus === 'suspended').length}</p>
            <p className="text-xs text-text-muted">Suspended Accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Ban className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Banned</span>
            </div>
            <p className="text-2xl font-bold text-white">{applications.filter(a => a.accountStatus === 'banned').length}</p>
            <p className="text-xs text-text-muted">Banned Accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'approved', 'rejected'].map(filter => (
                <Button
                  key={filter}
                  size="sm"
                  variant={statusFilter === filter ? 'default' : 'secondary'}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)} ({filter === 'all' ? applications.length : applications.filter(a => a.status === filter).length})
                </Button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-muted">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  onClick={() => setSelectedApplication(application)}
                  className="group relative overflow-hidden rounded-xl border border-border bg-white/[0.02] p-6 cursor-pointer transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getStatusColor(application.status))}>
                          {getStatusIcon(application.status)}
                          <span>{application.status}</span>
                        </div>
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", getAccountStatusColor(application.accountStatus))}>
                          <span>{application.accountStatus}</span>
                        </div>
                        {application.submittedAt && (
                          <div className="flex items-center gap-2 text-text-muted text-sm">
                            <Calendar className="h-4 w-4" />
                            {new Date(application.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{application.applicantName}</h3>
                          <div className="flex items-center gap-2 text-text-muted text-sm">
                            <Mail className="h-4 w-4" />
                            {application.applicantEmail}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-accent mt-1 shrink-0" />
                          <p className="text-text-soft text-sm line-clamp-2">{application.motivation}</p>
                        </div>
                        {application.skills && (
                          <div className="flex items-start gap-2">
                            <span className="text-accent text-xs font-semibold mt-1 shrink-0">Skills:</span>
                            <p className="text-text-muted text-sm">{application.skills}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-text-muted group-hover:text-white transition-colors">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
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
              <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4", getStatusColor(selectedApplication.status))}>
                {getStatusIcon(selectedApplication.status)}
                <span>{selectedApplication.status}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedApplication.applicantName}</h2>
              <div className="flex items-center gap-2 text-text-muted">
                <Mail className="h-4 w-4" />
                {selectedApplication.applicantEmail}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-white mb-2">Motivation</h3>
                <p className="text-text-soft bg-white/5 rounded-lg p-4">{selectedApplication.motivation}</p>
              </div>

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
                  onClick={() => handleAction('approve', selectedApplication.id)}
                  disabled={submittingReview}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction('reject', selectedApplication.id)}
                  disabled={submittingReview}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleAction('request_info', selectedApplication.id)}
                  disabled={submittingReview}
                  variant="secondary"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Request Info
                </Button>
                <Button
                  onClick={() => handleAction('promote', selectedApplication.id)}
                  disabled={submittingReview}
                  variant="secondary"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Promote
                </Button>
                <Button
                  onClick={() => handleAction('suspend', selectedApplication.id)}
                  disabled={submittingReview}
                  variant="secondary"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
                <Button
                  onClick={() => handleAction('ban', selectedApplication.id)}
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
