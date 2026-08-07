import { useState } from 'react';
import { ScrollText, Calendar, User, AlertCircle, Crown, Shield, Search } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

const INITIAL_LOGS = [
  {
    id: 'LOG-001',
    type: 'election',
    title: 'Community Treasury Manager Election Concluded',
    description: 'Alice Chen elected as Community Treasury Manager with 142 votes.',
    timestamp: '2025-11-15T14:30:00Z',
    author: 'System',
    category: 'Governance',
    status: 'completed'
  },
  {
    id: 'LOG-002',
    type: 'role_change',
    title: 'Technical Council Lead Role Assigned',
    description: 'Eva Martinez assigned as Technical Council Lead after successful election.',
    timestamp: '2025-11-10T09:15:00Z',
    author: 'Admin',
    category: 'Roles',
    status: 'completed'
  },
  {
    id: 'LOG-003',
    type: 'verification',
    title: 'Identity Verification Badge Granted',
    description: 'User John Doe granted Identity Verified badge after successful document review.',
    timestamp: '2025-11-08T16:45:00Z',
    author: 'Verification Team',
    category: 'Verification',
    status: 'completed'
  },
  {
    id: 'LOG-004',
    type: 'conflict',
    title: 'Bounty Distribution Dispute Resolved',
    description: 'Case CAS-092 resolved with bounty reallocated to original submitter.',
    timestamp: '2025-11-05T11:20:00Z',
    author: 'Mediation Council',
    category: 'Conflict',
    status: 'completed'
  },
  {
    id: 'LOG-005',
    type: 'election',
    title: 'New Election Created: Research Council',
    description: 'Election for Research Council position opened for nominations.',
    timestamp: '2025-11-01T08:00:00Z',
    author: 'Governance Team',
    category: 'Governance',
    status: 'completed'
  },
  {
    id: 'LOG-006',
    type: 'role_change',
    title: 'Moderator Role Revoked',
    description: 'Moderator role revoked for user ID user_123 due to policy violation.',
    timestamp: '2025-10-28T13:30:00Z',
    author: 'Admin',
    category: 'Roles',
    status: 'completed'
  },
  {
    id: 'LOG-007',
    type: 'verification',
    title: 'Skill Verification Request Denied',
    description: 'Skill verification request VR-456 denied due to insufficient evidence.',
    timestamp: '2025-10-25T10:00:00Z',
    author: 'Verification Team',
    category: 'Verification',
    status: 'completed'
  },
];

const TYPE_ICONS = {
  election: Crown,
  role_change: User,
  verification: Shield,
  conflict: AlertCircle,
};

const TYPE_COLORS = {
  election: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  role_change: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  verification: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  conflict: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export function DecisionLogs() {
  const [logs] = useState(INITIAL_LOGS);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setSelectedLog] = useState(null);

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = searchQuery === '' || 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Decision Logs" 
        description="Public ledger recording all election conclusions, role modifications, and governance decisions."
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All' },
                { value: 'election', label: 'Elections' },
                { value: 'role_change', label: 'Role Changes' },
                { value: 'verification', label: 'Verifications' },
                { value: 'conflict', label: 'Conflicts' },
              ].map(filter => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={filterType === filter.value ? 'default' : 'secondary'}
                  onClick={() => setFilterType(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

        <div className="space-y-6">
          {filteredLogs.map((log, __index) => {
            const Icon = TYPE_ICONS[log.type] || ScrollText;
            const colorClass = TYPE_COLORS[log.type] || 'text-text-muted bg-white/5 border-border';
            
            return (
              <div key={log.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-background border-2 border-accent hidden md:block" />
                
                <Card className="ml-0 md:ml-16">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border ${colorClass} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-text-muted">{log.id}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-muted">
                              {log.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(log.timestamp)}</span>
                            <span>·</span>
                            <span>{timeAgo(log.timestamp)}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-white mb-1">{log.title}</h3>
                        <p className="text-sm text-text-muted mb-3">{log.description}</p>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <User className="h-3 w-3" />
                          <span>By {log.author}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <ScrollText className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No logs found</h3>
                <p className="text-text-muted text-sm">Try adjusting your search or filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{logs.length}</p>
            <p className="text-xs text-text-muted">Total Decisions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{logs.filter(l => l.type === 'election').length}</p>
            <p className="text-xs text-text-muted">Elections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{logs.filter(l => l.type === 'role_change').length}</p>
            <p className="text-xs text-text-muted">Role Changes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{logs.filter(l => l.type === 'verification').length}</p>
            <p className="text-xs text-text-muted">Verifications</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
