import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MembershipService } from '../../services/firebase/membership';
import { hasPermission } from '../../services/firebase/permissions';
import { ROLES } from '../../constants/roles';
import { CheckCircle, XCircle, Clock, Filter, Search, User, Mail, Calendar, FileText, Send } from 'lucide-react';

export default function AdminMemberships() {
  const { user, roleData } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await MembershipService.getApplications(statusFilter === 'all' ? null : statusFilter);
      setApplications(data);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

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

    setFilteredApplications(filtered);
  };

  const handleReview = async (status) => {
    if (!selectedApplication) return;

    setSubmittingReview(true);
    setError(null);

    try {
      await MembershipService.reviewApplication(selectedApplication.id, {
        status,
        reviewerId: user.uid,
        reviewNotes,
      });
      
      await loadApplications();
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (err) {
      console.error('Error reviewing application:', err);
      setError('Failed to review application');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-text-muted bg-white/5 border-white/10';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-text-muted">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <h1 className="text-3xl font-black text-white">Membership Applications</h1>
          <p className="mt-2 text-text-soft">Review and manage membership applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-accent text-background' 
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'pending' 
                  ? 'bg-yellow-500 text-background' 
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              Pending ({applications.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'approved' 
                  ? 'bg-green-500 text-background' 
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              Approved ({applications.filter(a => a.status === 'approved').length})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'rejected' 
                  ? 'bg-red-500 text-background' 
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              Rejected ({applications.filter(a => a.status === 'rejected').length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No applications found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                onClick={() => setSelectedApplication(application)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-6 cursor-pointer transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span>{application.status}</span>
                      </div>
                      {application.submittedAt && (
                        <div className="flex items-center gap-2 text-text-muted text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(application.submittedAt?.toDate?.() || application.submittedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{application.applicantName}</h3>
                        {application.applicantEmail && (
                          <div className="flex items-center gap-2 text-text-muted text-sm">
                            <Mail className="h-4 w-4" />
                            {application.applicantEmail}
                          </div>
                        )}
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
      </div>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedApplication(null)} />
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-surface border border-white/10 rounded-3xl p-8">
            <button
              onClick={() => setSelectedApplication(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4 ${getStatusColor(selectedApplication.status)}`}>
                {getStatusIcon(selectedApplication.status)}
                <span>{selectedApplication.status}</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">{selectedApplication.applicantName}</h2>
              {selectedApplication.applicantEmail && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Mail className="h-4 w-4" />
                  {selectedApplication.applicantEmail}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-white mb-2">Motivation</h3>
                <p className="text-text-soft bg-black/20 rounded-lg p-4">{selectedApplication.motivation}</p>
              </div>

              {selectedApplication.skills && (
                <div>
                  <h3 className="font-bold text-white mb-2">Skills</h3>
                  <p className="text-text-soft bg-black/20 rounded-lg p-4">{selectedApplication.skills}</p>
                </div>
              )}

              {selectedApplication.interests && (
                <div>
                  <h3 className="font-bold text-white mb-2">Interests</h3>
                  <p className="text-text-soft bg-black/20 rounded-lg p-4">{selectedApplication.interests}</p>
                </div>
              )}

              {selectedApplication.experience && (
                <div>
                  <h3 className="font-bold text-white mb-2">Experience</h3>
                  <p className="text-text-soft bg-black/20 rounded-lg p-4">{selectedApplication.experience}</p>
                </div>
              )}

              {selectedApplication.portfolioLinks && (
                <div>
                  <h3 className="font-bold text-white mb-2">Portfolio Links</h3>
                  <p className="text-text-soft bg-black/20 rounded-lg p-4">{selectedApplication.portfolioLinks}</p>
                </div>
              )}

              {selectedApplication.reviewedAt && (
                <div>
                  <h3 className="font-bold text-white mb-2">Review Notes</h3>
                  <p className="text-text-soft bg-black/20 rounded-lg p-4">{selectedApplication.reviewNotes || 'No notes provided'}</p>
                </div>
              )}
            </div>

            {selectedApplication.status === 'pending' && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="font-bold text-white mb-4">Review Application</h3>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes (optional)..."
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview('approved')}
                    disabled={submittingReview}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {submittingReview ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReview('rejected')}
                    disabled={submittingReview}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    {submittingReview ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
