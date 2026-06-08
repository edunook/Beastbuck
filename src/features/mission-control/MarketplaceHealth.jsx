import { useEffect, useState } from 'react';
import { AlertTriangle, Bookmark, CheckCircle2, Download, Flag, PackageOpen, Star, Tags, Users } from 'lucide-react';
import { MarketplaceService } from '../../services/firebase/marketplace';
import { LoadingState } from '../../components/ui/UIElements';
import { AIContextPanel } from '../ai/AIContextPanel';

function Metric({ label, value, icon: Icon, warning }) {
  return <div className={`rounded-xl border p-4 ${warning ? 'border-status-warning/40 bg-status-warning/5' : 'border-border/50 bg-white/[0.02]'}`}><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p><Icon className={`h-4 w-4 ${warning ? 'text-status-warning' : 'text-accent'}`} /></div><p className={`font-heading text-3xl font-black ${warning ? 'text-status-warning' : 'text-white'}`}>{value}</p></div>;
}

export default function MarketplaceHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setHealth(await MarketplaceService.getMarketplaceHealth());
      } catch (err) {
        console.error('Marketplace health failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState text="Analyzing marketplace..." />;
  if (!health) return null;
  const healthy = health.marketplaceHealthLabel === 'Healthy';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-surface/30 p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-heading text-2xl font-bold text-white">Creator Marketplace Health</h2><p className="text-sm text-text-muted">Creator analytics, marketplace growth, resource usage, popular categories, top creators, and knowledge contribution metrics.</p></div>
          <span className={`flex w-fit items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${healthy ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>{healthy ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}{health.marketplaceHealthLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          <Metric label="Resources" value={health.totalResources} icon={PackageOpen} />
          <Metric label="Published" value={health.publishedResources} icon={CheckCircle2} />
          <Metric label="Downloads" value={health.totalDownloads} icon={Download} />
          <Metric label="Bookmarks" value={health.totalBookmarks} icon={Bookmark} />
          <Metric label="Reviews" value={health.totalReviews} icon={Star} />
          <Metric label="Creators" value={health.totalCreators} icon={Users} />
          <Metric label="Categories" value={health.categoryCount} icon={Tags} />
          <Metric label="Reports" value={health.pendingReports} icon={Flag} warning={health.pendingReports > 0} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Top Resources">{health.topResources.map(item => <Row key={item.id} title={item.title} value={`${item.downloadCount || 0} downloads`} />)}</Panel>
        <Panel title="Top Creators">{health.topCreators.map(item => <Row key={item.id} title={item.displayName || item.username} value={`${item.reputation || 0} rep`} />)}</Panel>
        <Panel title="Popular Categories">{health.popularCategories.map(item => <Row key={item.name} title={item.name} value={item.count} />)}</Panel>
      </div>

      <AIContextPanel
        title="Marketplace Intelligence"
        actions={[
          { label: 'Analyze Marketplace Growth', prompt: `Analyze marketplace growth: ${health.totalResources} resources, ${health.totalDownloads} downloads, ${health.totalCreators} creators, ${health.pendingReports} reports. Recommend improvements.`, mode: 'general' },
          { label: 'Recommend Category Strategy', prompt: 'Recommend creator economy categories for BeastBuck including templates, research kits, startup toolkits, AI prompts, course assets, prototypes, and code components.', mode: 'general' },
        ]}
      />
    </div>
  );
}

function Panel({ title, children }) {
  return <section className="rounded-xl border border-border bg-surface/40 p-5"><h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">{title}</h3><div className="space-y-2">{children}</div></section>;
}

function Row({ title, value }) {
  return <div className="flex justify-between rounded-lg border border-border bg-white/5 px-3 py-2 text-sm"><span className="font-bold text-white">{title}</span><span className="text-text-muted">{value}</span></div>;
}
