import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, Eye, Heart, Package, Plus, Search, Star, Upload, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { hasPermission, PERMISSIONS } from '@shared/permissions/permissions';
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES, ProductsService } from '@services/firestore/products';
import { UsersService } from '@services/firestore/users';
import { isCloudinaryConfigured, uploadProductMedia } from '@services/storage/cloudinary';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Invention',
  creatorId: '',
  teamMembers: [],
  price: 0,
  status: 'DRAFT',
  media: [],
  features: '',
  technicalDetails: '',
  usageInstructions: '',
  warrantyInfo: '',
};

function formatPrice(price) {
  return Number(price || 0) === 0 ? 'Free' : `$${Number(price || 0).toFixed(2)}`;
}

function getLikeCount(product) {
  return Array.isArray(product.likes) ? product.likes.length : Number(product.likes || 0);
}

function ProductForm({ members, onCancel, onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
      const uploaded = await Promise.all([...files].map(file => uploadProductMedia(file)));
      updateField('media', [...form.media, ...uploaded]);
    } catch (err) {
      console.error('Product media upload failed:', err);
      setUploadError('Media upload failed. Try a smaller file or check Cloudinary settings.');
    } finally {
      setUploading(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Create Product</h2>
        <button type="button" onClick={onCancel} className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-white" aria-label="Close product form">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Title <span className="text-status-danger">*</span></label>
          <Input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Product title" required maxLength={100} />
          <div className="mt-1 text-[10px] text-text-muted text-right">{form.title.length}/100</div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Price</label>
          <Input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} placeholder="Price" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Category</label>
          <select value={form.category} onChange={(event) => updateField('category', event.target.value)} className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
            {PRODUCT_CATEGORIES.map(category => <option key={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Status</label>
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
            {PRODUCT_STATUSES.filter(status => status !== 'ARCHIVED').map(status => <option key={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Description <span className="text-status-danger">*</span></label>
        <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Product overview and details" required rows={5} maxLength={500} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <div className="mt-1 text-[10px] text-text-muted text-right">{form.description.length}/500</div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Features & Specifications</label>
        <textarea value={form.features} onChange={(event) => updateField('features', event.target.value)} placeholder="Key features and specifications" rows={4} maxLength={1000} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <div className="mt-1 text-[10px] text-text-muted text-right">{form.features.length}/1000</div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Technical Details</label>
        <textarea value={form.technicalDetails} onChange={(event) => updateField('technicalDetails', event.target.value)} placeholder="Technical specifications and requirements" rows={4} maxLength={1000} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <div className="mt-1 text-[10px] text-text-muted text-right">{form.technicalDetails.length}/1000</div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Usage Instructions</label>
        <textarea value={form.usageInstructions} onChange={(event) => updateField('usageInstructions', event.target.value)} placeholder="How to use the product" rows={4} maxLength={1000} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <div className="mt-1 text-[10px] text-text-muted text-right">{form.usageInstructions.length}/1000</div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Warranty & Support</label>
        <textarea value={form.warrantyInfo} onChange={(event) => updateField('warrantyInfo', event.target.value)} placeholder="Warranty information and support details" rows={4} maxLength={1000} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <div className="mt-1 text-[10px] text-text-muted text-right">{form.warrantyInfo.length}/1000</div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Team Members</label>
        <p className="mb-2 text-[10px] text-text-muted">Hold Ctrl/Cmd to select multiple members</p>
        <select multiple value={form.teamMembers} onChange={(event) => updateField('teamMembers', [...event.target.selectedOptions].map(option => option.value))} className="min-h-28 w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
          {members.map(member => <option key={member.id} value={member.id}>{member.displayName || member.username}</option>)}
        </select>
        {form.teamMembers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {form.teamMembers.map(uid => {
              const member = members.find(m => m.id === uid);
              return member ? (
                <span key={uid} className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">
                  {member.displayName || member.username}
                  <button type="button" onClick={() => updateField('teamMembers', form.teamMembers.filter(id => id !== uid))} className="hover:text-status-danger">×</button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-black/20 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Product Media</p>
            <p className="text-xs text-text-muted">Images, videos, and documents stored as Cloudinary media objects.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-sm font-bold text-text-soft hover:text-white">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" multiple className="hidden" onChange={(event) => uploadFiles(event.target.files || [])} disabled={uploading} />
          </label>
        </div>
        {uploadError && <p className="mb-3 text-sm text-status-danger">{uploadError}</p>}
        {form.media.length === 0 ? (
          <p className="text-sm text-text-muted">No media attached yet.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
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
        <Button type="submit" disabled={submitting || uploading}>{submitting ? 'Saving...' : 'Save Product'}</Button>
      </div>
    </form>
  );
}

function ProductCard({ product, canModerate, onArchive, onFeature }) {
  const firstImage = product.media?.find(item => item.type === 'image');

  return (
    <Card className="rounded-lg">
      {firstImage && <img src={firstImage.url} alt={product.title} className="h-44 w-full object-cover" />}
      <CardContent className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{product.category}</span>
          <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{product.status}</span>
          {product.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
        </div>
        <Link to={`/workspace/products/${product.id}`} className="block">
          <h3 className="line-clamp-2 text-lg font-bold text-white hover:text-accent">{product.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{product.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-lg font-black text-white">{formatPrice(product.price)}</span>
          <span className="inline-flex items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{getLikeCount(product)}</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{product.views || 0}</span>
          </span>
        </div>
        <p className="mt-2 text-xs text-text-muted">By {product.creatorName || product.creatorUsername || 'Member'}</p>
        {canModerate && (
          <div className="mt-4 flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => onFeature(product)} className="flex-1 text-xs">
              <Star className="mr-1 h-3.5 w-3.5" /> {product.featured ? 'Unfeature' : 'Feature'}
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => onArchive(product.id)} className="flex-1 text-xs">
              <Archive className="mr-1 h-3.5 w-3.5" /> Archive
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductsMarketplace() {
  const { user, roleData } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', creatorId: '', status: '', sort: 'newest' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');
  const isApprovedMember = PERMISSIONS.isApprovedMember(roleData);
  const isCEO = roleData?.role === 'Main CEO' || roleData?.role === 'Co-CEO';
  const canCreateProduct = isApprovedMember || isCEO;

  const creator = useMemo(() => ({
    uid: user?.uid,
    name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
    username: roleData?.username || user?.displayName || '',
  }), [roleData?.displayName, roleData?.username, user?.displayName, user?.uid]);

  const updateFilters = (patch) => {
    setLoading(true);
    setFilters(current => ({ ...current, ...patch }));
  };

  const loadProducts = async () => {
    setError('');
    try {
      const [nextProducts, nextCreators] = await Promise.all([
        ProductsService.searchProducts(filters),
        ProductsService.getCreators(),
      ]);
      setProducts(nextProducts);
      setCreators(nextCreators);
    } catch (err) {
      console.error('Products load failed:', err);
      setError('Could not load products. Check Firestore permissions and indexes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProducts();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.category, filters.creatorId, filters.status, filters.sort]);

  useEffect(() => {
    UsersService.getAssignableMembers().then(setMembers).catch((err) => {
      console.error('Product member load failed:', err);
    });
  }, []);

  const submitProduct = async (form) => {
    if (!canCreateProduct) {
      setError('You need an approved membership or CEO role to create products.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const productId = await ProductsService.createProduct(form, creator);
      setShowForm(false);
      navigate(`/workspace/products/${productId}`);
    } catch (err) {
      console.error('Product create failed:', err);
      setError('Product could not be created. Check Cloudinary and Firestore rules.');
    } finally {
      setSubmitting(false);
    }
  };

  const archiveProduct = async (productId) => {
    await ProductsService.archiveProduct(productId);
    loadProducts();
  };

  const featureProduct = async (product) => {
    await ProductsService.featureProduct(product.id, !product.featured);
    loadProducts();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Products Marketplace"
        description="Create, showcase, search, and review BeastBuck member products."
        action={
          canCreateProduct ? (
            <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> New Product</Button>
          ) : (
            <Button variant="secondary" disabled><Plus className="mr-2 h-4 w-4" /> New Product (Requires Approved Membership)</Button>
          )
        }
      />

      {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}

      {showForm && (
        <SectionWrapper>
          <ProductForm members={members} onCancel={() => setShowForm(false)} onSubmit={submitProduct} submitting={submitting} />
        </SectionWrapper>
      )}

      <SectionWrapper>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-accent" />
              Marketplace Search
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0 md:grid-cols-5">
            <Input value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder="Search products..." />
            <select value={filters.category} onChange={(event) => updateFilters({ category: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="">All categories</option>
              {PRODUCT_CATEGORIES.map(category => <option key={category}>{category}</option>)}
            </select>
            <select value={filters.creatorId} onChange={(event) => updateFilters({ creatorId: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="">All creators</option>
              {creators.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={filters.status} onChange={(event) => updateFilters({ status: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="">All statuses</option>
              {PRODUCT_STATUSES.filter(status => status !== 'ARCHIVED').map(status => <option key={status}>{status}</option>)}
            </select>
            <select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="newest">Newest</option>
              <option value="popular">Most liked</option>
              <option value="views">Most viewed</option>
              <option value="price_low">Price low</option>
              <option value="price_high">Price high</option>
            </select>
          </CardContent>
        </Card>
      </SectionWrapper>

      <SectionWrapper>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center"><LoadingState text="Loading products..." /></div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <h2 className="mb-1 text-lg font-bold text-white">No products found</h2>
            <p className="text-sm text-text-muted">Create the first marketplace product or adjust your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} canModerate={canModerate} onArchive={archiveProduct} onFeature={featureProduct} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
