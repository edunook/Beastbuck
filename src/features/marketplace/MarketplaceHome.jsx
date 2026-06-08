import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, FolderKanban, Library, PackageOpen, Plus, Search, Star, Tags, Users } from 'lucide-react';
import { MarketplaceService, MARKETPLACE_TYPES, RESOURCE_LICENSES } from '../../services/firebase/marketplace';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { EmptyState, LoadingState, PageHeader } from '../../components/ui/UIElements';
import { AIContextPanel } from '../ai/AIContextPanel';
import { useAuth } from '../auth/AuthContext';

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'Template',
  category: 'Education',
  tags: '',
  version: '1.0.0',
  license: 'Internal',
  visibility: 'INTERNAL',
  accessCost: 0,
  fileUrl: '',
  status: 'DRAFT',
};

function ResourceCard({ item }) {
  return (
    <Link to={`/marketplace/${item.id}`} className="group flex h-full flex-col justify-between rounded-xl border border-border bg-surface/40 p-5 transition hover:border-accent/50 hover:bg-surface/70">
      <div>
        <div className="mb-4 flex items-start justify-between gap-2">
          <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">{item.type}</span>
          {item.featured && <Star className="h-4 w-4 fill-status-warning text-status-warning" />}
        </div>
        <h3 className="font-heading text-lg font-bold text-white group-hover:text-accent line-clamp-2">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-text-muted line-clamp-3">{item.description}</p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-white/[0.03] p-2"><p className="font-black text-white">{item.downloadCount || 0}</p><p className="text-text-muted">Downloads</p></div>
        <div className="rounded-lg bg-white/[0.03] p-2"><p className="font-black text-white">{item.rating || 0}</p><p className="text-text-muted">Rating</p></div>
        <div className="rounded-lg bg-white/[0.03] p-2"><p className="font-black text-white">{item.bookmarkCount || 0}</p><p className="text-text-muted">Saved</p></div>
      </div>
      <p className="mt-3 text-xs text-text-muted">By {item.creatorName || item.creatorUsername || 'Creator'} · {item.exchangeCurrency || 'Credits'} {item.accessCost || 0}</p>
    </Link>
  );
}

function CreateResourceForm({ onCreated }) {
  const { user, roleData } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    try {
      const id = await MarketplaceService.createResource({
        ...form,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      }, {
        uid: user.uid,
        name: roleData?.displayName || roleData?.username || user.displayName || 'Creator',
        username: roleData?.username || user.displayName || '',
      });
      setForm(EMPTY_FORM);
      setOpen(false);
      onCreated?.();
      navigate(`/marketplace/${id}`);
    } catch (err) {
      console.error('Create resource failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface/50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Publish a Resource</h2>
          <p className="text-sm text-text-muted">No real money: exchange with XP, reputation, credits, and contribution points.</p>
        </div>
        <button onClick={() => setOpen(prev => !prev)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black">
          <Plus className="h-4 w-4" />
          {open ? 'Close' : 'Create Resource'}
        </button>
      </div>
      {open && (
        <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-2">
          <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Resource title" required className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none md:col-span-2" />
          <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Description" rows={3} required className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none md:col-span-2" />
          <select value={form.type} onChange={e => update('type', e.target.value)} className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white">{MARKETPLACE_TYPES.map(type => <option key={type}>{type}</option>)}</select>
          <input value={form.category} onChange={e => update('category', e.target.value)} placeholder="Category" className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none" />
          <select value={form.license} onChange={e => update('license', e.target.value)} className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white">{RESOURCE_LICENSES.map(license => <option key={license}>{license}</option>)}</select>
          <input type="number" value={form.accessCost} onChange={e => update('accessCost', e.target.value)} placeholder="Credit cost" className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none" />
          <input value={form.fileUrl} onChange={e => update('fileUrl', e.target.value)} placeholder="File or resource URL" className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none md:col-span-2" />
          <input value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="Tags, comma separated" className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none md:col-span-2" />
          <select value={form.status} onChange={e => update('status', e.target.value)} className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white">
            <option>DRAFT</option>
            <option>PUBLISHED</option>
          </select>
          <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-black disabled:opacity-50">
            {saving ? 'Publishing...' : 'Save Resource'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function MarketplaceHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', type: '', category: '', sort: 'trending' });

  const load = async () => {
    setLoading(true);
    try {
      const [home, resources] = await Promise.all([
        MarketplaceService.getMarketplaceHome(user?.uid),
        MarketplaceService.searchResources(filters),
      ]);
      setData(home);
      setItems(resources);
    } catch (err) {
      console.error('Marketplace load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, filters.search, filters.type, filters.category, filters.sort]);

  const categories = useMemo(() => data?.categories || [], [data]);

  return (
    <PageContainer>
      <PageHeader
        title="Creator Marketplace"
        description="Templates, research assets, educational resources, AI prompts, design assets, documents, whiteboards, mind maps, code, prototypes, courses, and toolkits."
        action={
          <button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-black font-bold px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" /> Create Listing
          </button>
        }
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <CreateResourceForm onCreated={load} />
        <AIContextPanel
          title="Marketplace AI"
          actions={[
            { label: 'Recommend Resources', prompt: 'Recommend BeastBuck marketplace resources for a learner, researcher, startup founder, designer, and engineer. Use XP/credits/reputation, not real money.', mode: 'general' },
            { label: 'Generate Metadata', prompt: 'Generate marketplace title, description, category, tags, license, and related-resource suggestions for a reusable educational or innovation resource.', mode: 'general' },
            { label: 'Suggest Creators', prompt: 'Suggest criteria for matching creators to resources, courses, research kits, venture toolkits, and design assets.', mode: 'general' },
          ]}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Resources', data?.stats.resources || 0, Library],
          ['Creators', data?.stats.creators || 0, Users],
          ['Collections', data?.stats.collections || 0, FolderKanban],
          ['Downloads', data?.stats.downloads || 0, Download],
        ].map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-border bg-white/[0.02] p-4"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p><Icon className="h-4 w-4 text-accent" /></div><p className="font-heading text-3xl font-black text-white">{value}</p></div>)}
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-4">
        <label className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input value={filters.search} onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))} placeholder="Search resources" className="w-full rounded-xl border border-border bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none" />
        </label>
        <select value={filters.type} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))} className="rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white">
          <option value="">All types</option>
          {MARKETPLACE_TYPES.map(type => <option key={type}>{type}</option>)}
        </select>
        <select value={filters.sort} onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))} className="rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white">
          <option value="trending">Trending</option>
          <option value="newest">Newest</option>
          <option value="downloads">Downloads</option>
          <option value="rating">Rating</option>
          <option value="bookmarks">Bookmarks</option>
        </select>
      </div>

      <SectionWrapper title="Resource Exchange">
        {loading ? <LoadingState text="Loading resources..." /> : items.length === 0 ? <EmptyState icon={PackageOpen} title="No resources found" description="Publish the first template, toolkit, prompt, document, or course asset." /> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map(item => <ResourceCard key={item.id} item={item} />)}</div>
        )}
      </SectionWrapper>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Popular Categories" icon={Tags}>{categories.map(cat => <button key={cat.id || cat.name} onClick={() => setFilters(prev => ({ ...prev, category: cat.name }))} className="mr-2 mb-2 rounded-lg border border-border bg-white/5 px-3 py-2 text-sm font-bold text-text-soft hover:text-white">{cat.name}</button>)}</Panel>
        <Panel title="Top Creators" icon={Users}>{(data?.topCreators || []).map(creator => <Link key={creator.id} to={`/creators/${creator.username}`} className="mb-2 block rounded-lg border border-border bg-white/5 px-3 py-2 text-sm font-bold text-white">{creator.displayName || creator.username}<span className="ml-2 text-text-muted">{creator.reputation || 0} rep</span></Link>)}</Panel>
        <Panel title="Collections" icon={FolderKanban}>{(data?.collections || []).length ? data.collections.map(collection => <div key={collection.id} className="mb-2 rounded-lg border border-border bg-white/5 px-3 py-2"><p className="font-bold text-white">{collection.title}</p><p className="text-sm text-text-muted">{collection.category}</p></div>) : <p className="text-sm text-text-muted">No collections yet.</p>}</Panel>
      </div>
    </PageContainer>
  );
}

function Panel({ title, icon: Icon, children }) {
  return <section className="rounded-xl border border-border bg-surface/40 p-5"><h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-white"><Icon className="h-4 w-4 text-accent" />{title}</h2>{children}</section>;
}

export { ResourceCard };
