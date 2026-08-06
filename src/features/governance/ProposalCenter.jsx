import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../../services/firebase/permissions';
import { GovernanceService } from '../../services/firebase/governance';
import { FileText, Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Search, X, Send } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

export default function ProposalCenter() {
  const { user, roleData } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'General' });
  const [searchQuery, setSearchQuery] = useState('');
  const [votingProposal, setVotingProposal] = useState(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getAllProposals();
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await GovernanceService.createProposal(formData, { uid: user.uid, name: roleData?.displayName || roleData?.username || 'User' });
      await loadProposals();
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'General' });
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal');
    }
  };

  const handleVote = async (proposalId, voteType) => {
    if (!user?.uid) return;
    try {
      const reputation = roleData?.stats?.reputationScore || 100;
      await GovernanceService.castVote(proposalId, user.uid, voteType, reputation);
      await loadProposals();
      setVotingProposal(null);
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote');
    }
  };

  const handleCloseProposal = async (proposalId, result) => {
    if (!confirm(`Are you sure you want to close this proposal as ${result}?`)) return;
    try {
      await GovernanceService.closeProposal(proposalId, result);
      await loadProposals();
    } catch (error) {
      console.error('Error closing proposal:', error);
      alert('Failed to close proposal');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'CLOSED': return 'text-text-muted bg-white/5 border-border';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Proposal Center is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredProposals = proposals.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Proposal Center" 
        description="Create and vote on organizational proposals."
        hero={true}
        action={
          <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search proposals..."
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No proposals found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-white/[0.02] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getStatusColor(proposal.status))}>
                          {proposal.status === 'ACTIVE' ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          <span>{proposal.status}</span>
                        </div>
                        <span className="text-text-muted text-sm">{proposal.category}</span>
                      </div>

                      <h3 className="font-bold text-white text-lg mb-2">{proposal.title}</h3>
                      <p className="text-text-soft text-sm mb-4 line-clamp-2">{proposal.description}</p>

                      <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-emerald-400" />
                          <span>{proposal.votesYes || 0} Yes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-400" />
                          <span>{proposal.votesNo || 0} No</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Weight: {proposal.votingWeight || 0}</span>
                        </div>
                      </div>

                      <p className="text-xs text-text-muted">
                        Created by {proposal.creatorName || 'Unknown'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {proposal.status === 'ACTIVE' && (
                        <>
                          <Button
                            onClick={() => setVotingProposal(proposal)}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Vote
                          </Button>
                          {hasPermission(roleData?.role, 'canAccessCeoPanel') && (
                            <Button
                              onClick={() => handleCloseProposal(proposal.id, 'APPROVED')}
                              size="sm"
                              variant="secondary"
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          )}
                          {hasPermission(roleData?.role, 'canAccessCeoPanel') && (
                            <Button
                              onClick={() => handleCloseProposal(proposal.id, 'REJECTED')}
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <button
              onClick={() => {
                setShowModal(false);
                setFormData({ title: '', description: '', category: 'General' });
              }}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Create Proposal</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter proposal title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter proposal description"
                  rows={4}
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                >
                  <option value="General">General</option>
                  <option value="Policy">Policy</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Community">Community</option>
                  <option value="Innovation">Innovation</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ title: '', description: '', category: 'General' });
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vote Modal */}
      {votingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setVotingProposal(null)} />
          <div className="relative max-w-sm w-full bg-background border border-border rounded-3xl p-8">
            <button
              onClick={() => setVotingProposal(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">Vote</h2>
            <p className="text-text-muted mb-6">{votingProposal.title}</p>

            <div className="space-y-3">
              <Button
                onClick={() => handleVote(votingProposal.id, 'YES')}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Vote Yes
              </Button>
              <Button
                onClick={() => handleVote(votingProposal.id, 'NO')}
                variant="destructive"
                className="w-full"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Vote No
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
