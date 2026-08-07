import { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList, Filter, RefreshCw, ChevronDown, 
  Shield, Users, FileWarning, Zap, Award, Lock, FolderKanban, Building2 } from 'lucide-react';
import { AdminService } from '@services/firestore/admin';
import { AdminPanel, AdminEmptyState, StatusBadge, LoadingRows } from './adminUtils';
import { formatDistanceToNow, formatDate } from '@shared/lib/dateUtils';

const TYPE_META = {
  MEMBER_UPDATED:     { label: 'Member Updated',     icon: Users,        color: 'success', emoji: '👤' },
  ROLE_CHANGED:       { label: 'Role Changed',        icon: Shield,       color: 'purple',  emoji: '🛡️' },
  ROLE_DELETED:       { label: 'Role Deleted',        icon: Shield,       color: 'danger',  emoji: '🗑️' },
  CONTENT_MODERATED:  { label: 'Content Moderated',   icon: FileWarning,  color: 'accent',  emoji: '📋' },
  XP_CHANGED:         { label: 'XP Changed',          icon: Zap,          color: 'warning', emoji: '⚡' },
  ACHIEVEMENT_GRANTED:{ label: 'Achievement Granted', icon: Award,        color: 'accent',  emoji: '🏆' },
  ACHIEVEMENT_REMOVED:{ label: 'Achievement Removed', icon: Award,        color: 'danger',  emoji: '❌' },
  BADGE_GRANTED:      { label: 'Badge Granted',       icon: Award,        color: 'purple',  emoji: '🎖️' },
  SECURITY_CHANGED:   { label: 'Security Changed',    icon: Lock,         color: 'danger',  emoji: '🔒' },
  PROJECT_ACTION:     { label: 'Project Action',      icon: FolderKanban, color: 'accent',  emoji: '📁' },
  ORG_ACTION:         { label: 'Organization Action', icon: Building2,    color: 'accent',  emoji: '🏢' },
};

function AuditRow({ log, expanded, onToggle }) {
  const meta = TYPE_META[log.type] || { label: log.type, emoji: '📌', color: 'default' };

  return (
    <div className={`rounded-xl border transition-all ${expanded ? 'border-white/10 bg-white/[0.04]' : 'border-border/60 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03]'}`}>
      {/* Header Row */}
      <div
        className="flex cursor-pointer items-center gap-3 p-3"
        onClick={onToggle}
      >
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg">
          {meta.emoji}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white text-sm">{log.summary || meta.label}</span>
            <StatusBadge variant={meta.color}>{meta.label}</StatusBadge>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            {log.actorId ? `Actor: ${log.actorId.slice(0, 8)}…` : 'System'}
            {log.targetId ? ` · Target: ${String(log.targetId).slice(0, 20)}…` : ''}
          </p>
        </div>

        {/* Time */}
        <div className="shrink-0 text-right">
          <p className="text-xs text-text-muted">{formatDistanceToNow(log.createdAt)}</p>
          <p className="mt-0.5 text-[10px] text-text-muted/60">{formatDate(log.createdAt)}</p>
        </div>

        <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border/40 px-4 py-3">
          <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="font-bold text-text-muted uppercase tracking-wider mb-1">Type</p>
              <p className="font-mono text-white">{log.type}</p>
            </div>
            <div>
              <p className="font-bold text-text-muted uppercase tracking-wider mb-1">Actor ID</p>
              <p className="font-mono text-white break-all">{log.actorId || '—'}</p>
            </div>
            <div>
              <p className="font-bold text-text-muted uppercase tracking-wider mb-1">Target ID</p>
              <p className="font-mono text-white break-all">{log.targetId || '—'}</p>
            </div>
            <div>
              <p className="font-bold text-text-muted uppercase tracking-wider mb-1">Timestamp</p>
              <p className="text-white">{formatDate(log.createdAt)}</p>
            </div>
            <div>
              <p className="font-bold text-text-muted uppercase tracking-wider mb-1">Log ID</p>
              <p className="font-mono text-white break-all">{log.id}</p>
            </div>
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="font-bold text-text-muted uppercase tracking-wider mb-1">Metadata</p>
                <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-[11px] text-text-soft">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const PAGE_SIZE = 25;

  const load = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setLogs([]);
      setLastDoc(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await AdminService.getAuditLogs({
        pageSize: PAGE_SIZE,
        lastDoc: reset ? null : lastDoc,
        filterType,
      });
      if (reset) {
        setLogs(result.logs);
      } else {
        setLogs(prev => [...prev, ...result.logs]);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.logs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Audit logs failed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterType, lastDoc]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(true); }, [filterType]);

  // Summarize counts per type
  const typeCounts = logs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Audit Trail</h2>
          <p className="text-xs text-text-muted">Complete log of all administrative actions</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-bold text-text-soft hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Type Summary Cards */}
      {!loading && Object.entries(typeCounts).length > 0 && (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(typeCounts).slice(0, 10).map(([type, count]) => {
            const meta = TYPE_META[type] || { label: type, emoji: '📌', color: 'default' };
            return (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? '' : type)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-all ${
                  filterType === type
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-white/[0.02] text-text-muted hover:border-white/10 hover:text-white'
                }`}
              >
                <span className="text-base">{meta.emoji}</span>
                <div className="min-w-0">
                  <p className="truncate leading-tight">{meta.label}</p>
                  <p className="font-heading text-sm font-black text-white">{count}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-text-muted" />
        <span className="text-xs text-text-muted">Filter by type:</span>
        <button
          onClick={() => setFilterType('')}
          className={`rounded-lg border px-3 py-1 text-xs font-bold transition-all ${
            !filterType ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border bg-white/5 text-text-muted hover:text-white'
          }`}
        >
          All
        </button>
        {Object.entries(TYPE_META).map(([type, meta]) => (
          <button
            key={type}
            onClick={() => setFilterType(filterType === type ? '' : type)}
            className={`rounded-lg border px-3 py-1 text-xs font-bold transition-all ${
              filterType === type ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border bg-white/5 text-text-muted hover:text-white'
            }`}
          >
            {meta.emoji} {meta.label}
          </button>
        ))}
      </div>

      {/* Log Count */}
      <p className="text-xs text-text-muted">
        {loading ? 'Loading…' : `Showing ${logs.length} log${logs.length !== 1 ? 's' : ''}${filterType ? ` · filtered by ${TYPE_META[filterType]?.label || filterType}` : ''}`}
      </p>

      {/* Logs List */}
      <AdminPanel title="Audit Logs" icon={ClipboardList} action={
        <span className="text-xs text-text-muted">{logs.length} entries</span>
      }>
        {loading ? <LoadingRows count={8} /> : (
          <div className="space-y-2">
            {logs.length === 0 ? (
              <AdminEmptyState
                icon={ClipboardList}
                title="No audit logs found"
                message="Admin actions will be logged here as they occur."
              />
            ) : logs.map(log => (
              <AuditRow
                key={log.id}
                log={log}
                expanded={expandedId === log.id}
                onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && logs.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => load(false)}
              disabled={loadingMore}
              className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-6 py-2.5 text-sm font-bold text-text-soft hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {loadingMore ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Loading…</>
              ) : (
                <>Load More <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
