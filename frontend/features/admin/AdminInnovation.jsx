import { useState, useEffect } from 'react';
import { FlaskConical, CheckCircle2, Star, AlertCircle } from 'lucide-react';
import { PageHeader, LoadingState } from '@frontend/components/ui/UIElements';
import { SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { InnovationService } from '@services/firestore/innovation';
import { useAuth } from '../auth/AuthContext';
import { formatDate } from '@shared/lib/dateUtils';

export default function AdminInnovation() {
  const { user } = useAuth();
  const [discoveries, setDiscoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await InnovationService.getDiscoveries({ status: filter });
      setDiscoveries(data);
    } catch (err) {
      console.error('Failed to load discoveries:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [filter]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await InnovationService.approveDiscovery(id, user.uid);
      await load();
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeature = async (id) => {
    setActionLoading(id);
    try {
      await InnovationService.featureDiscovery(id, user.uid);
      await load();
    } catch (err) {
      console.error('Feature failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Innovation Moderation"
        description="Review, approve, and feature member discoveries, research projects, and inventions."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
            <FlaskConical className="h-6 w-6" />
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['PENDING_REVIEW', 'APPROVED', 'FEATURED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              filter === status
                ? 'bg-accent text-black'
                : 'border border-border bg-surface/50 text-text-muted hover:text-white'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <SectionWrapper>
        <h3 className="mb-6 font-heading text-xl font-bold text-white">Discoveries</h3>
        {loading ? (
          <LoadingState />
        ) : discoveries.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-text-muted/50" />
            <p className="text-text-muted">No discoveries with status: {filter.replace('_', ' ')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {discoveries.map(d => (
              <div key={d.id} className="rounded-xl border border-border/50 bg-surface/30 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="font-bold text-white">{d.title}</h4>
                    <p className="text-sm text-text-muted mt-1">{d.description}</p>
                    <p className="mt-2 text-xs text-text-soft">{formatDate(d.timestamp)}</p>
                  </div>
                  <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    d.status === 'FEATURED' ? 'bg-status-warning/10 text-status-warning' :
                    d.status === 'APPROVED' ? 'bg-status-success/10 text-status-success' :
                    'bg-white/5 text-text-muted'
                  }`}>{d.status.replace('_', ' ')}</span>
                </div>
                <div className="flex gap-2">
                  {d.status === 'PENDING_REVIEW' && (
                    <button
                      onClick={() => handleApprove(d.id)}
                      disabled={actionLoading === d.id}
                      className="flex items-center gap-1.5 rounded-lg bg-status-success/10 px-3 py-1.5 text-xs font-bold text-status-success transition hover:bg-status-success/20 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {actionLoading === d.id ? 'Approving...' : 'Approve'}
                    </button>
                  )}
                  {d.status !== 'FEATURED' && (
                    <button
                      onClick={() => handleFeature(d.id)}
                      disabled={actionLoading === d.id}
                      className="flex items-center gap-1.5 rounded-lg bg-status-warning/10 px-3 py-1.5 text-xs font-bold text-status-warning transition hover:bg-status-warning/20 disabled:opacity-50"
                    >
                      <Star className="h-3.5 w-3.5" />
                      {actionLoading === d.id ? 'Featuring...' : 'Feature'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}
