import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { GovernanceService } from '@services/firestore/governance';
import { Vote, Users, BarChart3, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { cn } from '@shared/lib/utils';

export default function VotingSystem() {
  const { user, roleData } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const handleVote = async (proposalId, voteType) => {
    if (!user?.uid) return;
    try {
      const reputation = roleData?.stats?.reputationScore || 100;
      await GovernanceService.castVote(proposalId, user.uid, voteType, reputation);
      await loadProposals();
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote');
    }
  };

  const calculatePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
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
            <Vote className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Voting System is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || p.status?.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Voting System" 
        description="Reputation-weighted voting for governance proposals."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals..."
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-border rounded-xl px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Vote className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No voting proposals found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProposals.map((proposal) => {
                const totalVotes = (proposal.votesYes || 0) + (proposal.votesNo || 0);
                const yesPercentage = calculatePercentage(proposal.votesYes || 0, totalVotes);
                const noPercentage = calculatePercentage(proposal.votesNo || 0, totalVotes);
                
                return (
                  <div
                    key={proposal.id}
                    className="rounded-xl border border-border bg-white/[0.02] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-6 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getStatusColor(proposal.status))}>
                            {proposal.status === 'ACTIVE' ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            <span>{proposal.status}</span>
                          </div>
                          <span className="text-text-muted text-sm">{proposal.category}</span>
                        </div>

                        <h3 className="font-bold text-white text-lg mb-2">{proposal.title}</h3>
                        <p className="text-text-soft text-sm line-clamp-2">{proposal.description}</p>

                        <div className="flex items-center gap-4 text-sm text-text-muted mt-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{totalVotes} Total Votes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span>Weight: {proposal.votingWeight || 0}</span>
                          </div>
                        </div>
                      </div>

                      {proposal.status === 'ACTIVE' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleVote(proposal.id, 'YES')}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Vote Yes
                          </Button>
                          <Button
                            onClick={() => handleVote(proposal.id, 'NO')}
                            size="sm"
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Vote No
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Voting Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-400 font-bold">{proposal.votesYes || 0} Yes ({yesPercentage}%)</span>
                        <span className="text-red-400 font-bold">{proposal.votesNo || 0} No ({noPercentage}%)</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/10 overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 transition-all duration-500"
                          style={{ width: `${yesPercentage}%` }}
                        />
                        <div 
                          className="bg-red-500 transition-all duration-500"
                          style={{ width: `${noPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Voting Types Legend */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-text-muted mb-2">Voting Types Supported:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-text-muted">Anonymous</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-text-muted">Open</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-text-muted">Weighted</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-text-muted">Leadership</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-text-muted">Department</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-text-muted">Member</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
