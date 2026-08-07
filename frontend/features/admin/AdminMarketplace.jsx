import { useEffect, useState } from 'react';
import { Archive, Flag, PackageOpen, Star, Tags, Users } from 'lucide-react';
import { MarketplaceService } from '@services/firestore/marketplace';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { AdminActionButton, AdminEmptyState, AdminMetric, AdminPanel, LoadingRows, StatusBadge } from './adminUtils';

export default function AdminMarketplace() {
  const [health, setHealth] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [healthData, resourceData] = await Promise.all([
        MarketplaceService.getMarketplaceHealth(),
        MarketplaceService.searchResources({ includeDrafts: true, includeArchived: true, sort: 'newest' }),
      ]);
      setHealth(healthData);
      setResources(resourceData);
    } catch (err) {
      console.error('Admin marketplace failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id, updates) => {
    await MarketplaceService.updateResource(id, updates);
    await load();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Marketplace Command Center"
        description="Feature resources, archive resources, moderate reviews, manage creator status, categories, reports, and analytics."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><PackageOpen className="h-6 w-6" /></div>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminMetric label="Resources" value={health?.totalResources || 0} icon={PackageOpen} />
        <AdminMetric label="Published" value={health?.publishedResources || 0} icon={Star} color="success" />
        <AdminMetric label="Creators" value={health?.totalCreators || 0} icon={Users} />
        <AdminMetric label="Downloads" value={health?.totalDownloads || 0} icon={PackageOpen} color="purple" />
        <AdminMetric label="Reports" value={health?.pendingReports || 0} icon={Flag} color={health?.pendingReports ? 'danger' : 'accent'} />
      </div>

      <AdminPanel title="Resource Moderation" icon={PackageOpen}>
        {loading ? <LoadingRows count={5} /> : resources.length === 0 ? <AdminEmptyState icon={PackageOpen} title="No resources" message="Marketplace resources will appear here." /> : (
          <div className="space-y-4">
            {resources.map(resource => (
              <div key={resource.id} className="rounded-xl border border-border/60 bg-white/[0.02] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-bold text-white">{resource.title}</h3>
                      <StatusBadge variant={resource.status === 'PUBLISHED' ? 'success' : resource.status === 'ARCHIVED' ? 'danger' : 'default'}>{resource.status}</StatusBadge>
                      <StatusBadge>{resource.type}</StatusBadge>
                      {resource.featured && <StatusBadge variant="warning">Featured</StatusBadge>}
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2">{resource.description}</p>
                    <p className="mt-2 text-xs text-text-soft">{resource.downloadCount || 0} downloads · {resource.rating || 0} rating · by {resource.creatorName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminActionButton onClick={() => update(resource.id, { status: 'PUBLISHED' })} variant="success">Publish</AdminActionButton>
                    <AdminActionButton onClick={() => update(resource.id, { featured: !resource.featured })} variant="warning"><Star className="h-3.5 w-3.5" />{resource.featured ? 'Unfeature' : 'Feature'}</AdminActionButton>
                    <AdminActionButton onClick={() => update(resource.id, { status: 'ARCHIVED' })} variant="danger"><Archive className="h-3.5 w-3.5" />Archive</AdminActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Popular Categories" icon={Tags}>
          <div className="space-y-2">{(health?.popularCategories || []).map(item => <div key={item.name} className="flex justify-between rounded-lg border border-border bg-white/5 px-3 py-2 text-sm"><span className="font-bold text-white">{item.name}</span><span className="text-text-muted">{item.count}</span></div>)}</div>
        </AdminPanel>
        <AdminPanel title="Creator Status" icon={Users}>
          <div className="space-y-2">{(health?.topCreators || []).map(item => <div key={item.id} className="flex justify-between rounded-lg border border-border bg-white/5 px-3 py-2 text-sm"><span className="font-bold text-white">{item.displayName || item.username}</span><span className="text-text-muted">{item.reputation || 0} rep</span></div>)}</div>
        </AdminPanel>
      </div>
    </div>
  );
}
