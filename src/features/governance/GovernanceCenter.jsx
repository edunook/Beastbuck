import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Plus, Trophy, Vote, Users, AlertTriangle, FileText, Scale, Calendar, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { GovernanceService } from '../../services/firebase/governance';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function GovernanceCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('proposals');
  const [proposals, setProposals] = useState([]);
  const [elections, setElections] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', category: 'General' });
  const [showApplyForCandidacy, setShowApplyForCandidacy] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidacyStatement, setCandidacyStatement] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [showCreateDispute, setShowCreateDispute] = useState(false);
  const [disputeForm, setDisputeForm] = useState({ title: '', description: '', reportedUserId: '', severity: 'MEDIUM' });
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [policyForm, setPolicyForm] = useState({ title: '', description: '', category: 'General' });
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    loadGovernanceData();
  }, [activeTab]);

  const loadGovernanceData = async () => {
    setIsLoading(true);
    try {
      const [fetchedProposals, fetchedElections, fetchedDisputes, fetchedPolicies, usersSnap] = await Promise.all([
        GovernanceService.getActiveProposals(),
        GovernanceService.getElections(),
        GovernanceService.getDisputes(),
        GovernanceService.getPolicies(),
        getDocs(query(collection(db, 'users'), orderBy('stats.reputationScore', 'desc'), limit(5)))
      ]);
      
      setProposals(fetchedProposals || []);
      setElections(fetchedElections || []);
      setDisputes(fetchedDisputes || []);
      setPolicies(fetchedPolicies || []);
      
      const contributors = usersSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || data.displayName || 'Unknown Member',
          rep: data.stats?.reputationScore || 0,
          role: data.role || 'Member'
        };
      });
      setTopContributors(contributors);
    } catch (error) {
      console.error("Error loading governance data:", error);
    }
    setIsLoading(false);
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    try {
      await GovernanceService.createProposal(proposalForm, user);
      setShowCreateProposal(false);
      setProposalForm({ title: '', description: '', category: 'General' });
      await loadGovernanceData();
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal');
    }
  };

  const handleVote = async (proposalId, voteType) => {
    if (!user?.uid) return;
    
    try {
      const userReputation = topContributors.find(c => c.id === user.uid)?.rep || 0;
      await GovernanceService.castVote(proposalId, user.uid, voteType, userReputation);
      await loadGovernanceData();
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote');
    }
  };

  const handleApplyForCandidacy = async (e) => {
    e.preventDefault();
    if (!user?.uid || !selectedElection) return;
    
    try {
      await GovernanceService.applyForCandidacy(selectedElection.id, user, candidacyStatement);
      setShowApplyForCandidacy(false);
      setSelectedElection(null);
      setCandidacyStatement('');
      await loadGovernanceData();
      alert('Candidacy application submitted successfully!');
    } catch (error) {
      console.error('Error applying for candidacy:', error);
      alert('Failed to apply for candidacy');
    }
  };

  const handleViewCandidates = async (election) => {
    try {
      const electionCandidates = await GovernanceService.getCandidates(election.id);
      setCandidates(electionCandidates);
      setSelectedElection(election);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    if (!user?.uid) return
    
    try {
      await GovernanceService.createDispute(disputeForm, user.uid);
      setShowCreateDispute(false);
      setDisputeForm({ title: '', description: '', reportedUserId: '', severity: 'MEDIUM' });
      await loadGovernanceData();
      alert('Dispute created successfully!');
    } catch (error) {
      console.error('Error creating dispute:', error);
      alert('Failed to create dispute');
    }
  };

  const handleResolveDispute = async (disputeId, resolution) => {
    try {
      await GovernanceService.resolveDispute(disputeId, resolution, user?.uid);
      await loadGovernanceData();
      setSelectedDispute(null);
      alert('Dispute resolved successfully!');
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Failed to resolve dispute');
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    try {
      await GovernanceService.createPolicy(policyForm, user.uid);
      setShowCreatePolicy(false);
      setPolicyForm({ title: '', description: '', category: 'General' });
      await loadGovernanceData();
      alert('Policy created successfully!');
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('Failed to create policy');
    }
  };

  const handlePublishPolicy = async (policyId) => {
    try {
      await GovernanceService.publishPolicy(policyId);
      await loadGovernanceData();
      alert('Policy published successfully!');
    } catch (error) {
      console.error('Error publishing policy:', error);
      alert('Failed to publish policy');
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Governance Center" 
        description="Shape the future of BeastBuck through community proposals, elections, and conflict resolution."
        hero={true}
      />

      {/* Navigation Tabs */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'proposals', label: 'Proposals', icon: Vote },
              { id: 'elections', label: 'Elections', icon: Users },
              { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
              { id: 'policies', label: 'Policies', icon: FileText },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-accent/10 text-accent border border-accent/30'
                      : 'text-text-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Proposals Tab */}
      {activeTab === 'proposals' && (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={() => setShowCreateProposal(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-text-muted">Loading proposals...</div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-12 text-text-muted">No active proposals found.</div>
            ) : (
              proposals.map((prop) => (
                <Card key={prop.id} className="hover:border-accent/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{prop.title}</h3>
                        <p className="text-text-muted text-sm">{prop.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                          <FileText className="h-3 w-3" />
                          <span>{prop.category}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-3 py-1 bg-white/5 text-text-muted rounded-full shrink-0 ml-4">
                        {prop.endsAt ? new Date(prop.endsAt.toMillis ? prop.endsAt.toMillis() : prop.endsAt).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-emerald-400">Yes {prop.votesYes || 0}</span>
                        <span className="text-rose-400">No {prop.votesNo || 0}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${(prop.votesYes || 0) + (prop.votesNo || 0) === 0 ? 50 : ((prop.votesYes || 0) / ((prop.votesYes || 0) + (prop.votesNo || 0))) * 100}%` }} 
                        />
                        <div 
                          className="h-full bg-rose-500" 
                          style={{ width: `${(prop.votesYes || 0) + (prop.votesNo || 0) === 0 ? 50 : ((prop.votesNo || 0) / ((prop.votesYes || 0) + (prop.votesNo || 0))) * 100}%` }} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleVote(prop.id, 'YES')}
                        variant="secondary"
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Vote Yes
                      </Button>
                      <Button 
                        onClick={() => handleVote(prop.id, 'NO')}
                        variant="secondary"
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Vote No
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Elections Tab */}
      {activeTab === 'elections' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-text-muted">Loading elections...</div>
          ) : elections.length === 0 ? (
            <div className="text-center py-12 text-text-muted">No active elections found.</div>
          ) : (
            elections.map((election) => (
              <Card key={election.id} className="hover:border-accent/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{election.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Users className="h-4 w-4" />
                        <span>{election.role}</span>
                        <span>•</span>
                        <span>{election.type}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      election.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                      election.status === 'UPCOMING' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {election.status}
                    </span>
                  </div>
                  
                  {election.startsAt && (
                    <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>Starts: {new Date(election.startsAt.toMillis ? election.startsAt.toMillis() : election.startsAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleViewCandidates(election)}
                      variant="secondary"
                      className="flex-1"
                    >
                      View Candidates
                    </Button>
                    {election.status === 'UPCOMING' && (
                      <Button 
                        onClick={() => {
                          setSelectedElection(election);
                          setShowApplyForCandidacy(true);
                        }}
                        variant="secondary"
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={() => setShowCreateDispute(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Dispute
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-text-muted">Loading disputes...</div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-12 text-text-muted">No active disputes found.</div>
            ) : (
              disputes.map((dispute) => (
                <Card key={dispute.id} className="hover:border-accent/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{dispute.title}</h3>
                        <p className="text-text-muted text-sm">{dispute.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        dispute.severity === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                        dispute.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {dispute.severity}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
                      <Scale className="h-4 w-4" />
                      <span>Status: {dispute.status}</span>
                    </div>
                    
                    {dispute.status === 'UNDER_REVIEW' && (
                      <Button 
                        onClick={() => setSelectedDispute(dispute)}
                        variant="secondary"
                        className="w-full"
                      >
                        Review Dispute
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={() => setShowCreatePolicy(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-text-muted">Loading policies...</div>
            ) : policies.length === 0 ? (
              <div className="text-center py-12 text-text-muted">No policies found.</div>
            ) : (
              policies.map((policy) => (
                <Card key={policy.id} className="hover:border-accent/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{policy.title}</h3>
                        <p className="text-text-muted text-sm">{policy.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                          <FileText className="h-3 w-3" />
                          <span>{policy.category}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        policy.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' :
                        policy.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {policy.status}
                      </span>
                    </div>
                    
                    {policy.status === 'DRAFT' && (
                      <Button 
                        onClick={() => handlePublishPolicy(policy.id)}
                        variant="secondary"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Publish Policy
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Top Contributors Sidebar */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topContributors.map((contributor, index) => (
              <div key={contributor.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-amber-500/20 text-amber-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/5 text-text-muted'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{contributor.name}</p>
                    <p className="text-xs text-text-muted">{contributor.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{contributor.rep.toLocaleString()}</p>
                  <p className="text-xs text-text-muted">Reputation</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateProposal(false)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create Proposal</h2>
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title</label>
                <input
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  placeholder="Enter proposal title"
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  placeholder="Describe your proposal in detail"
                  rows={4}
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Category</label>
                <select
                  value={proposalForm.category}
                  onChange={(e) => setProposalForm({ ...proposalForm, category: e.target.value })}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white focus:border-accent/50 focus:outline-none transition-colors"
                >
                  <option value="General">General</option>
                  <option value="Policy">Policy</option>
                  <option value="Feature">Feature Request</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateProposal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Create Proposal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply for Candidacy Modal */}
      {showApplyForCandidacy && selectedElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowApplyForCandidacy(false)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Apply for Candidacy</h2>
            <p className="text-text-muted mb-6">Election: {selectedElection.title}</p>
            <form onSubmit={handleApplyForCandidacy} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Candidate Statement</label>
                <textarea
                  value={candidacyStatement}
                  onChange={(e) => setCandidacyStatement(e.target.value)}
                  placeholder="Tell the community why you should be elected for this position..."
                  rows={6}
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowApplyForCandidacy(false);
                    setSelectedElection(null);
                    setCandidacyStatement('');
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
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Candidates Modal */}
      {selectedElection && !showApplyForCandidacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedElection(null)} />
          <div className="relative max-w-2xl w-full bg-background border border-border rounded-3xl p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Candidates</h2>
              <p className="text-text-muted">{selectedElection.title}</p>
            </div>
            
            {candidates.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                No candidates have applied yet.
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <Card key={candidate.id} className="bg-white/5">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{candidate.name}</h3>
                          <p className="text-text-muted text-sm">{candidate.statement}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-accent">{candidate.votes || 0}</p>
                          <p className="text-xs text-text-muted">Votes</p>
                        </div>
                      </div>
                      {selectedElection.status === 'ACTIVE' && (
                        <Button variant="secondary" className="w-full">
                          Vote for {candidate.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setSelectedElection(null)}
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Dispute Modal */}
      {showCreateDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateDispute(false)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create Dispute</h2>
            <form onSubmit={handleCreateDispute} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title</label>
                <input
                  type="text"
                  value={disputeForm.title}
                  onChange={(e) => setDisputeForm({ ...disputeForm, title: e.target.value })}
                  placeholder="Enter dispute title"
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={disputeForm.description}
                  onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                  placeholder="Describe the dispute in detail"
                  rows={4}
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Reported User ID</label>
                <input
                  type="text"
                  value={disputeForm.reportedUserId}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reportedUserId: e.target.value })}
                  placeholder="Enter user ID being reported"
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Severity</label>
                <select
                  value={disputeForm.severity}
                  onChange={(e) => setDisputeForm({ ...disputeForm, severity: e.target.value })}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white focus:border-accent/50 focus:outline-none transition-colors"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateDispute(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                >
                  Create Dispute
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDispute(null)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Resolve Dispute</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-white mb-2">Dispute Title</p>
                <p className="text-text-muted">{selectedDispute.title}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-2">Description</p>
                <p className="text-text-muted">{selectedDispute.description}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Resolution</label>
                <textarea
                  placeholder="Enter the resolution for this dispute"
                  rows={4}
                  id="dispute-resolution"
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setSelectedDispute(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const resolution = document.getElementById('dispute-resolution').value;
                    if (resolution.trim()) {
                      handleResolveDispute(selectedDispute.id, resolution);
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Policy Modal */}
      {showCreatePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreatePolicy(false)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create Policy</h2>
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title</label>
                <input
                  type="text"
                  value={policyForm.title}
                  onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                  placeholder="Enter policy title"
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={policyForm.description}
                  onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                  placeholder="Describe the policy in detail"
                  rows={4}
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Category</label>
                <select
                  value={policyForm.category}
                  onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white focus:border-accent/50 focus:outline-none transition-colors"
                >
                  <option value="General">General</option>
                  <option value="Governance">Governance</option>
                  <option value="Community">Community</option>
                  <option value="Security">Security</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreatePolicy(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Create Policy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
