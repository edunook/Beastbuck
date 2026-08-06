import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../../services/firebase/permissions';
import { GovernanceService } from '../../services/firebase/governance';
import { FileText, Search, Calendar, User, Link } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

export default function DecisionHistory() {
  const { roleData } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    setLoading(true);
    try {
      // Combine proposals, policies, and meetings as decisions
      const [proposals, policies, meetings] = await Promise.all([
        GovernanceService.getAllProposals(),
        GovernanceService.getPolicies(),
        GovernanceService.getMeetings(),
      ]);

      const allDecisions = [
        ...proposals.map(p => ({
          id: p.id,
          type: 'PROPOSAL',
          title: p.title,
          description: p.description,
          status: p.status,
          result: p.result,
          actorId: p.creatorId,
          actorName: p.creatorName,
          createdAt: p.createdAt,
          linkedResource: 'proposal',
        })),
        ...policies.map(p => ({
          id: p.id,
          type: 'POLICY',
          title: p.title,
          description: p.description,
          status: p.status,
          actorId: p.createdBy,
          actorName: 'Unknown',
          createdAt: p.createdAt,
          linkedResource: 'policy',
        })),
        ...meetings.map(m => ({
          id: m.id,
          type: 'MEETING',
          title: m.title,
          description: m.description,
          status: m.status,
          actorId: m.createdBy,
          actorName: 'Unknown',
          createdAt: m.createdAt,
          linkedResource: 'meeting',
        })),
      ].sort((a, b) => (b.createdAt?.toDate?.() || b.createdAt) - (a.createdAt?.toDate?.() || a.createdAt));

      setDecisions(allDecisions);
    } catch (error) {
      console.error('Error loading decision history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'CLOSED': case 'COMPLETED': case 'PUBLISHED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'DRAFT': case 'SCHEDULED': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'REJECTED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'PROPOSAL': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'POLICY': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'MEETING': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
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
            <p className="text-text-muted">Decision History is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = 
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.actorName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || d.type?.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Decision History" 
        description="Permanent logging of all governance decisions and outcomes."
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
                placeholder="Search decisions..."
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-border rounded-xl px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
            >
              <option value="all">All Types</option>
              <option value="proposal">Proposals</option>
              <option value="policy">Policies</option>
              <option value="meeting">Meetings</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDecisions.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No decisions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="rounded-xl border border-border bg-white/[0.02] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getTypeColor(decision.type))}>
                          <span>{decision.type}</span>
                        </div>
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getStatusColor(decision.status))}>
                          <span>{decision.status}</span>
                        </div>
                        {decision.result && (
                          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", decision.result === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20')}>
                            <span>{decision.result}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-white text-lg mb-2">{decision.title}</h3>
                      <p className="text-text-soft text-sm line-clamp-2 mb-4">{decision.description}</p>

                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{decision.actorName || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(decision.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          <span className="capitalize">{decision.linkedResource}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
