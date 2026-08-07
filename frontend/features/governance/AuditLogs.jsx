import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { GovernanceService } from '@services/firestore/governance';
import { FileText, Search, RefreshCw, Shield } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { formatDistanceToNow } from '@shared/lib/dateUtils';

export default function AuditLogs() {
  const { roleData } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getAuditLogs(100);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (type) => {
    const icons = {
      CEO_ASSIGNED: '👑',
      ROLE_CHANGED: '🛡️',
      MEMBER_UPDATED: '👤',
      CONTENT_MODERATED: '📋',
      SECURITY_CHANGED: '🔒',
      ACHIEVEMENT_GRANTED: '🏆',
      BADGE_GRANTED: '🎖️',
      NEW_USER: '👋',
      MEMBER_APPROVED: '✅',
      MOVIE_UPLOADED: '🎬',
      RESEARCH_PUBLISHED: '📄',
      AI_CREATED: '🤖',
      PRODUCT_PUBLISHED: '📦',
      MARKETPLACE_LISTING: '🏪',
      PROJECT_STARTED: '🚀',
      EXPERIMENT_COMPLETED: '🧪',
      SYSTEM_ALERT: '⚠️',
      POLICY_CREATED: '📜',
      PROPOSAL_CREATED: '🗳️',
      MEETING_SCHEDULED: '📅',
      DEPARTMENT_CREATED: '🏢',
      TEAM_CREATED: '👥',
    };
    return icons[type] || '📌';
  };

  const getLogColor = (type) => {
    if (type.includes('SECURITY') || type.includes('ALERT')) return 'text-red-400';
    if (type.includes('CEO') || type.includes('ROLE')) return 'text-purple-400';
    if (type.includes('APPROVED') || type.includes('PUBLISHED')) return 'text-emerald-400';
    return 'text-text-muted';
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Audit Logs are only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log.type?.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Audit Logs" 
        description="Track all system activities and changes."
        hero={true}
        action={
          <Button onClick={loadLogs} disabled={loading} size="sm" variant="secondary">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-border rounded-xl px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
            >
              <option value="all">All Types</option>
              <option value="security">Security</option>
              <option value="role">Role Changes</option>
              <option value="member">Member Actions</option>
              <option value="content">Content</option>
              <option value="system">System</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`truncate text-sm font-bold ${getLogColor(log.type)}`}>
                        {log.type}
                      </p>
                      {log.createdAt && (
                        <span className="shrink-0 text-xs text-text-muted">
                          {formatDistanceToNow(log.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-text-soft">{log.summary || 'Activity recorded'}</p>
                    {log.actorId && (
                      <p className="text-xs text-text-muted mt-1">
                        Actor: {log.actorId}
                      </p>
                    )}
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
