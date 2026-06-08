import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Download, Eye, FileText, Flag, Star, Tags } from 'lucide-react';
import { MarketplaceService } from '../../services/firebase/marketplace';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { LoadingState, PageHeader } from '../../components/ui/UIElements';
import { AIContextPanel } from '../ai/AIContextPanel';
import { useAuth } from '../auth/AuthContext';
import { ResourceCard } from './MarketplaceHome';

export default function MarketplaceDetail() {
  const { resourceId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, review: '', feedback: '' });
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setData(await MarketplaceService.getResourceDetail(resourceId, user?.uid));
    } catch (err) {
      console.error('Resource detail failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    MarketplaceService.incrementView(resourceId).catch(() => {});
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId, user?.uid]);

  const resource = data?.resource;

  const bookmark = async () => {
    if (!user?.uid || !resource) return;
    setBusy('bookmark');
    try {
      await MarketplaceService.bookmarkResource(resource, user.uid);
      await load();
    } finally {
      setBusy('');
    }
  };

  const download = async () => {
    if (!user?.uid || !resource) return;
    setBusy('download');
    try {
      await MarketplaceService.trackDownload(resource, user.uid);
      if (resource.fileUrl) window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
      await load();
    } finally {
      setBusy('');
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;
    setBusy('review');
    try {
      await MarketplaceService.addReview(resourceId, user.uid, review);
      setReview({ rating: 5, review: '', feedback: '' });
      await load();
    } finally {
      setBusy('');
    }
  };

  if (loading) return <PageContainer><LoadingState text="Loading resource..." /></PageContainer>;
  if (!resource) return <PageContainer><div className="py-20 text-center text-white">Resource not found</div></PageContainer>;

  return (
    <PageContainer>
      <Link to="/marketplace" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" /> Back to Marketplace</Link>
      <PageHeader
        title={resource.title}
        description={resource.description}
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><FileText className="h-6 w-6" /></div>}
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {[resource.type, resource.category, resource.license, resource.visibility, `v${resource.version || '1.0.0'}`].filter(Boolean).map(item => <span key={item} className="rounded-lg border border-border bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-text-soft">{item}</span>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <main className="space-y-6">
          <section className="rounded-xl border border-border bg-surface/40 p-6">
            <h2 className="mb-3 font-heading text-lg font-bold text-white">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-text-soft">{resource.description}</p>
          </section>

          <AIContextPanel
            title="Resource AI"
            actions={[
              { label: 'Generate Tags', prompt: `Generate tags and related-content suggestions for this resource: ${resource.title}. Description: ${resource.description}`, mode: 'general' },
              { label: 'Improve Description', prompt: `Rewrite this marketplace resource description clearly and professionally: ${resource.description}`, mode: 'general' },
              { label: 'Suggest Usage', prompt: `Suggest how learners, researchers, venture teams, and builders can use this resource: ${resource.title}`, mode: 'general' },
            ]}
          />

          <section className="rounded-xl border border-border bg-surface/40 p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-white">Reviews & Ratings</h2>
            <form onSubmit={submitReview} className="mb-5 grid gap-3">
              <select value={review.rating} onChange={e => setReview(prev => ({ ...prev, rating: e.target.value }))} className="rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white">
                {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}
              </select>
              <textarea value={review.review} onChange={e => setReview(prev => ({ ...prev, review: e.target.value }))} placeholder="Written review" rows={3} className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted" />
              <button disabled={busy === 'review'} className="w-fit rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black disabled:opacity-50">Leave Review</button>
            </form>
            <div className="space-y-3">
              {data.reviews.length === 0 ? <p className="text-sm text-text-muted">No reviews yet.</p> : data.reviews.map(item => <div key={item.id} className="rounded-xl border border-border/60 bg-white/[0.02] p-4"><p className="font-bold text-white">{item.rating} stars</p><p className="mt-1 text-sm text-text-muted">{item.review || item.feedback}</p><p className="mt-2 text-xs text-text-soft">Helpful votes: {item.helpfulVotes || 0} · Quality {item.qualityScore || 0}</p></div>)}
            </div>
          </section>

          <SectionWrapper title="Related Resources">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.related.map(item => <ResourceCard key={item.id} item={item} />)}</div>
          </SectionWrapper>
        </main>

        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="mb-4 font-heading text-lg font-bold text-white">Access</h2>
            <div className="mb-4 rounded-xl border border-accent/20 bg-accent/10 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">Cost</p>
              <p className="mt-1 font-heading text-3xl font-black text-white">{resource.accessCost || 0} {resource.exchangeCurrency || 'Credits'}</p>
            </div>
            <div className="grid gap-2">
              <button onClick={download} disabled={busy === 'download'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-black disabled:opacity-50"><Download className="h-4 w-4" /> Download / Access</button>
              <button onClick={bookmark} disabled={data.isBookmarked || busy === 'bookmark'} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-3 text-sm font-bold text-text-soft disabled:opacity-50"><Bookmark className="h-4 w-4" /> {data.isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="mb-4 font-heading text-lg font-bold text-white">Author</h2>
            <Link to={`/creators/${resource.creatorUsername}`} className="block rounded-xl border border-border bg-white/[0.02] p-4 font-bold text-white hover:border-accent/40">{resource.creatorName || resource.creatorUsername || 'Creator'}</Link>
          </section>

          <section className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="mb-4 font-heading text-lg font-bold text-white">Usage Statistics</h2>
            <div className="grid grid-cols-2 gap-2 text-center text-xs text-text-muted">
              <Stat icon={Download} value={resource.downloadCount || 0} label="Downloads" />
              <Stat icon={Eye} value={resource.viewCount || 0} label="Views" />
              <Stat icon={Bookmark} value={resource.bookmarkCount || 0} label="Bookmarks" />
              <Stat icon={Star} value={resource.rating || 0} label="Rating" />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-white"><Tags className="h-4 w-4 text-accent" /> Tags</h2>
            <div className="flex flex-wrap gap-2">{(resource.tags || []).map(tag => <span key={tag} className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-soft">{tag}</span>)}</div>
          </section>

          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm font-bold text-status-warning"><Flag className="h-4 w-4" /> Report Resource</button>
        </aside>
      </div>
    </PageContainer>
  );
}

function Stat({ icon: Icon, value, label }) {
  return <div className="rounded-xl border border-border p-3"><Icon className="mx-auto mb-1 h-4 w-4 text-accent" /><span className="block text-xl font-black text-white">{value}</span>{label}</div>;
}
