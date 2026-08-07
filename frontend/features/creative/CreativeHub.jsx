import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, Eye, Heart, Palette, Plus, Search, Star, Upload, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { hasPermission } from '@shared/permissions/permissions';
import { CREATIVE_CATEGORIES, CreativeService } from '@services/firestore/creative';
import { isCloudinaryConfigured, uploadCreativeMedia } from '@services/storage/cloudinary';
import { cn } from '@shared/lib/utils';
import { getCreativeMediaList, SafeImage } from './CreativityPage';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Drawing',
  creatorId: '',
  media: [],
};

function getLikeCount(work) {
  return Array.isArray(work.likes) ? work.likes.length : Number(work.likes || 0);
}

function CreativeForm({ onCancel, onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const updateField = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const uploadFiles = async (files) => {
    setUploadError('');
    if (!files.length) return;
    if (!isCloudinaryConfigured) {
      setUploadError('Cloudinary upload preset is not configured.');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all([...files].map(file => uploadCreativeMedia(file)));
      updateField('media', [...form.media, ...uploaded]);
    } catch (err) {
      console.error('Creative media upload failed:', err);
      setUploadError('Media upload failed. Try a smaller file or check Cloudinary settings.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    uploadFiles(files);
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Create Creative Work</h2>
        <button type="button" onClick={onCancel} className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-white" aria-label="Close creative form">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Title <span className="text-status-danger">*</span></label>
          <Input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Creative work title" required maxLength={100} />
          <div className="mt-1 text-[10px] text-text-muted text-right">{form.title.length}/100</div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Category</label>
          <select value={form.category} onChange={(event) => updateField('category', event.target.value)} className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
            {CREATIVE_CATEGORIES.map(category => <option key={category}>{category}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Description <span className="text-status-danger">*</span></label>
        <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe your creative work" required rows={5} maxLength={500} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <div className="mt-1 text-[10px] text-text-muted text-right">{form.description.length}/500</div>
      </div>

      <div className="rounded-xl border border-border bg-black/20 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Creative Media</p>
            <p className="text-xs text-text-muted">Images, videos, and documents stored as Cloudinary media objects.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-sm font-bold text-text-soft hover:text-white">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" multiple className="hidden" onChange={(event) => uploadFiles(event.target.files || [])} disabled={uploading} />
          </label>
        </div>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-lg border-2 border-dashed p-6 text-center transition-all",
            isDragging ? "border-accent bg-accent/5" : "border-border bg-white/[0.03] hover:border-accent/50"
          )}
        >
          <Upload className={cn("mx-auto h-8 w-8 mb-2", isDragging ? "text-accent" : "text-text-muted")} />
          <p className="text-sm font-medium text-white">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-text-muted mt-1">or click the Upload button above</p>
        </div>

        {uploadError && <p className="mt-3 text-sm text-status-danger">{uploadError}</p>}
        {form.media.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No media attached yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {form.media.map((item, index) => (
              <div key={`${item.publicId}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white/[0.03] p-2">
                <span className="min-w-0 truncate text-sm text-text-soft">{item.name}</span>
                <button type="button" onClick={() => updateField('media', form.media.filter((_, itemIndex) => itemIndex !== index))} className="text-text-muted hover:text-status-danger" aria-label={`Remove ${item.name}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting || uploading}>{submitting ? 'Saving...' : 'Save Creative Work'}</Button>
      </div>
    </form>
  );
}

function CreativeCard({ work, canModerate, onArchive, onFeature }) {
  const mediaList = getCreativeMediaList(work);
  const firstMedia = mediaList[0];

  return (
    <Card className="rounded-lg">
      {firstMedia?.url && (
        <SafeImage src={firstMedia.url} alt={work.title} className="h-44 w-full object-cover" />
      )}
      <CardContent className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{work.category}</span>
          <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{work.status}</span>
          {work.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
        </div>
        <Link to={`/workspace/creative/${work.id}`} className="block">
          <h3 className="line-clamp-2 text-lg font-bold text-white hover:text-accent">{work.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{work.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{getLikeCount(work)}</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{work.views || 0}</span>
          </span>
        </div>
        <p className="mt-2 text-xs text-text-muted">By {work.creatorName || work.creatorUsername || 'Member'}</p>
        {canModerate && (
          <div className="mt-4 flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => onFeature(work)} className="flex-1 text-xs">
              <Star className="mr-1 h-3.5 w-3.5" /> {work.featured ? 'Unfeature' : 'Feature'}
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => onArchive(work.id)} className="flex-1 text-xs">
              <Archive className="mr-1 h-3.5 w-3.5" /> Archive
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CreativeHub() {
  const { user, roleData } = useAuth();
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [creators, setCreators] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', creatorId: '', status: '', sort: 'newest' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');

  const creator = useMemo(() => ({
    uid: user?.uid,
    name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
    username: roleData?.username || user?.displayName || '',
  }), [roleData?.displayName, roleData?.username, user?.displayName, user?.uid]);

  const updateFilters = (patch) => {
    setLoading(true);
    setFilters(current => ({ ...current, ...patch }));
  };

  const loadWorks = async () => {
    setError('');
    try {
      const [nextWorks, nextCreators] = await Promise.all([
        CreativeService.searchCreativeWorks(filters),
        CreativeService.getCreators(),
      ]);
      setWorks(nextWorks);
      setCreators(nextCreators);
    } catch (err) {
      console.error('Creative works load failed:', err);
      setError('Could not load creative works. Check Firestore permissions and indexes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWorks();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.category, filters.creatorId, filters.status, filters.sort]);

  const submitWork = async (form) => {
    setSubmitting(true);
    setError('');
    try {
      const workId = await CreativeService.createCreativeWork(form, creator);
      setShowForm(false);
      navigate(`/workspace/creative/${workId}`);
    } catch (err) {
      console.error('Creative work create failed:', err);
      setError('Creative work could not be created. Check Cloudinary and Firestore rules.');
    } finally {
      setSubmitting(false);
    }
  };

  const archiveWork = async (workId) => {
    await CreativeService.archiveCreativeWork(workId);
    loadWorks();
  };

  const featureWork = async (work) => {
    await CreativeService.featureCreativeWork(work.id, !work.featured);
    loadWorks();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Creative Hub"
        description="Showcase your drawings, crafts, models, posters, designs, and other creative works."
        action={
          user?.uid ? (
            <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> New Creative Work</Button>
          ) : (
            <Button variant="secondary" disabled><Plus className="mr-2 h-4 w-4" /> New Creative Work (Sign in Required)</Button>
          )
        }
      />

      {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}

      {showForm && (
        <SectionWrapper>
          <CreativeForm onCancel={() => setShowForm(false)} onSubmit={submitWork} submitting={submitting} />
        </SectionWrapper>
      )}

      <SectionWrapper>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-accent" />
              Creative Works Search
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0 md:grid-cols-4">
            <Input value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder="Search creative works..." />
            <select value={filters.category} onChange={(event) => updateFilters({ category: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="">All categories</option>
              {CREATIVE_CATEGORIES.map(category => <option key={category}>{category}</option>)}
            </select>
            <select value={filters.creatorId} onChange={(event) => updateFilters({ creatorId: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="">All creators</option>
              {creators.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="newest">Newest</option>
              <option value="popular">Most liked</option>
              <option value="views">Most viewed</option>
            </select>
          </CardContent>
        </Card>
      </SectionWrapper>

      <SectionWrapper>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center"><LoadingState text="Loading creative works..." /></div>
        ) : works.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Palette className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <h2 className="mb-1 text-lg font-bold text-white">No creative works found</h2>
            <p className="text-sm text-text-muted">Create the first creative work or adjust your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {works.map(work => (
              <CreativeCard key={work.id} work={work} canModerate={canModerate} onArchive={archiveWork} onFeature={featureWork} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
