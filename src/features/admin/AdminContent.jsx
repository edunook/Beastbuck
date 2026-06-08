import { useEffect, useState } from 'react';
import {
  Archive, RotateCcw, Star, Trash2, FlaskConical, Package, BookOpen, MessageSquare, RefreshCw } from 'lucide-react';
import { AdminService } from '../../services/firebase/admin';
import { useAuth } from '../auth/AuthContext';
import {
  AdminPanel, AdminEmptyState, AdminActionButton, AdminToast, StatusBadge, LoadingRows,
} from './adminUtils';
import { formatDistanceToNow } from '../../lib/dateUtils';

const SECTIONS = [
  { key: 'experiments', label: 'Experiments', icon: FlaskConical, collection: 'experiments' },
  { key: 'products', label: 'Products', icon: Package, collection: 'products' },
  { key: 'resources', label: 'Resources', icon: BookOpen, collection: 'resources' },
  { key: 'comments', label: 'Comments', icon: MessageSquare, collection: 'comments' },
];

const TABS = ['All', 'experiments', 'products', 'resources', 'comments'];

function getStatusVariant(status) {
  if (!status) return 'default';
  if (status === 'ARCHIVED') return 'warning';
  if (status === 'ACTIVE' || status === 'PUBLISHED' || status === 'SHOWCASE' || status === 'PLANNING') return 'success';
  return 'default';
}

function ContentCard({ item, collectionName, onAction }) {
  const [loading, setLoading] = useState(false);

  const handle = async (action) => {
    setLoading(true);
    try {
      await onAction(collectionName, item.id, action);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge variant={getStatusVariant(item.status)}>{item.status || 'Draft'}</StatusBadge>
            {item.featured && <StatusBadge variant="warning">⭐ Featured</StatusBadge>}
            {item.archived && <StatusBadge variant="default">Archived</StatusBadge>}
          </div>
          <h3 className="font-bold text-white">{item.title || item.name || item.text || 'Untitled'}</h3>
          {(item.description || item.body) && (
            <p className="mt-1 line-clamp-2 text-sm text-text-muted">{item.description || item.body}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
            {item.createdAt && <span>Created {formatDistanceToNow(item.createdAt)}</span>}
            {item.authorId && <span>By {item.authorId.slice(0, 8)}…</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-border/40 pt-3">
        <AdminActionButton
          variant={item.featured ? 'warning' : 'default'}
          onClick={() => handle('feature')}
          disabled={loading}
          size="sm"
        >
          <Star className="h-3.5 w-3.5" />
          {item.featured ? 'Unfeature' : 'Feature'}
        </AdminActionButton>
        <AdminActionButton variant="default" onClick={() => handle('archive')} disabled={loading} size="sm">
          <Archive className="h-3.5 w-3.5" /> Archive
        </AdminActionButton>
        <AdminActionButton variant="success" onClick={() => handle('restore')} disabled={loading} size="sm">
          <RotateCcw className="h-3.5 w-3.5" /> Restore
        </AdminActionButton>
        <AdminActionButton
          variant="danger"
          onClick={() => {
            if (window.confirm('Delete this content permanently?')) handle('delete');
          }}
          disabled={loading}
          size="sm"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </AdminActionButton>
      </div>
    </div>
  );
}

export default function AdminContent() {
  const { user } = useAuth();
  const [content, setContent] = useState({ experiments: [], products: [], resources: [], comments: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setContent(await AdminService.getContent());
    } catch (err) {
      console.error('Admin content failed:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const moderate = async (collectionName, id, action) => {
    await AdminService.moderateContent({ collectionName, id, action, actorId: user.uid });
    setToast(`Content ${action}d successfully.`);
    await load();
  };

  const visibleSections = tab === 'All'
    ? SECTIONS
    : SECTIONS.filter(s => s.key === tab);

  const totalItems = SECTIONS.reduce((sum, s) => sum + (content[s.key]?.length || 0), 0);

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onClear={() => setToast('')} />

      {/* Tab navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl border px-4 py-1.5 text-xs font-bold capitalize transition-all ${
                tab === t
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border bg-white/5 text-text-muted hover:text-white'
              }`}
            >
              {t === 'All' ? `All (${totalItems})` : `${t} (${content[t]?.length || 0})`}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-text-soft hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Sections */}
      {visibleSections.map(({ key, label, icon: Icon, collection: col }) => (
        <AdminPanel
          key={key}
          title={`Moderate ${label}`}
          icon={Icon}
          action={<span className="text-xs text-text-muted">{content[key]?.length || 0} items</span>}
        >
          {loading ? <LoadingRows count={3} /> : (
            content[key]?.length === 0 ? (
              <AdminEmptyState
                icon={Icon}
                title={`No ${label.toLowerCase()} loaded`}
                message="Content will appear here when available."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {content[key].map(item => (
                  <ContentCard key={item.id} item={item} collectionName={col} onAction={moderate} />
                ))}
              </div>
            )
          )}
        </AdminPanel>
      ))}
    </div>
  );
}
