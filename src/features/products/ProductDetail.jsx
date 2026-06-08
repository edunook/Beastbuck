import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, ArrowLeft, BarChart3, Eye, FileText, Heart, MessageSquare, Package, Pencil, Star, Trash2, Users, X, FolderKanban } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { hasPermission } from '../../services/firebase/permissions';
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES, ProductsService } from '../../services/firebase/products';
import { UsersService } from '../../services/firebase/users';
import { isCloudinaryConfigured, uploadProductMedia } from '../../services/cloudinary/uploads';

function formatPrice(price) {
  return Number(price || 0) === 0 ? 'Free' : `$${Number(price || 0).toFixed(2)}`;
}

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Recently';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function MediaItem({ item }) {
  if (item.type === 'image') {
    return <img src={item.url} alt={item.name || ''} className="h-56 w-full rounded-xl object-cover" />;
  }

  if (item.type === 'video') {
    return <video src={item.url} controls className="h-56 w-full rounded-xl bg-black object-contain" />;
  }

  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="flex min-h-32 items-center gap-3 rounded-xl border border-border bg-white/[0.03] p-4 text-text-soft hover:text-white">
      <FileText className="h-6 w-6 text-accent" />
      <span className="min-w-0 truncate">{item.name || 'Document'}</span>
    </a>
  );
}

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [product, setProduct] = useState(null);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');
  const isOwner = user?.uid && product?.creatorId === user.uid;
  const likes = Array.isArray(product?.likes) ? product.likes : [];
  const hasLiked = likes.includes(user?.uid);
  const teamIds = Array.isArray(product?.teamMembers) ? product.teamMembers : [];
  const teamMembers = teamIds.map(id => members.find(member => member.id === id)).filter(Boolean);

  useEffect(() => {
    if (!productId) return undefined;
    ProductsService.incrementViews(productId).catch((err) => console.error('Product view failed:', err));

    const unsubscribe = ProductsService.subscribeToProduct(productId, {
      onProduct: (nextProduct) => {
        setProduct(nextProduct);
        if (nextProduct && !editing) {
          setEditForm({
            title: nextProduct.title || '',
            description: nextProduct.description || '',
            category: nextProduct.category || 'Invention',
            price: nextProduct.price || 0,
            status: nextProduct.status || 'DRAFT',
            teamMembers: nextProduct.teamMembers || [],
            media: nextProduct.media || [],
          });
        }
        setLoading(false);
      },
      onError: (err) => {
        console.error('Product listener failed:', err);
        setError('Could not load this product.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [editing, productId]);

  useEffect(() => {
    if (!productId) return undefined;
    return ProductsService.subscribeToComments(productId, {
      onComments: setComments,
      onError: (err) => console.error('Product comments failed:', err),
    });
  }, [productId]);

  useEffect(() => {
    UsersService.getAssignableMembers().then(setMembers).catch((err) => console.error('Product members failed:', err));
  }, []);

  const toggleLike = async () => {
    if (!user?.uid) return;
    await ProductsService.toggleLike(productId, user.uid, hasLiked);
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;

    await ProductsService.addComment(productId, {
      authorId: user.uid,
      authorName: roleData?.displayName || roleData?.username || user.displayName || 'Member',
      text: commentText,
    });
    setCommentText('');
  };

  const deleteComment = async (commentId) => {
    await ProductsService.deleteComment(productId, commentId);
  };

  const handleWorkspaceAction = async () => {
    if (product.workspaceId) {
       navigate(`/workspace/${product.workspaceId}`);
       return;
    }
    
    // Create new workspace
    setSaving(true);
    try {
       const newWs = await import('../../services/firebase/workspace').then(m => m.WorkspaceService.createWorkspace({
          name: `${product.title} Workspace`,
          description: `Dedicated workspace for product: ${product.title}`
       }, user.uid));
       
       await ProductsService.updateProduct(productId, { workspaceId: newWs.id });
       navigate(`/workspace/${newWs.id}`);
    } catch (err) {
       console.error("Workspace creation failed:", err);
       setError("Failed to create workspace.");
    } finally {
       setSaving(false);
    }
  };

  const saveEdits = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await ProductsService.updateProduct(productId, editForm);
      setEditing(false);
    } catch (err) {
      console.error('Product edit failed:', err);
      setError('Product could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const updateEditField = (field, value) => setEditForm(current => ({ ...current, [field]: value }));

  const uploadEditMedia = async (files) => {
    if (!files.length || !isCloudinaryConfigured) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all([...files].map(file => uploadProductMedia(file)));
      updateEditField('media', [...(editForm.media || []), ...uploaded]);
    } catch (err) {
      console.error('Product media upload failed:', err);
      setError('Media upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading product..." /></div>;
  }

  if (!product) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Product not found</h1>
          <p className="mt-2 text-sm text-text-muted">This product is missing or archived.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button variant="ghost" onClick={() => navigate('/workspace/products')} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={handleWorkspaceAction} disabled={saving}>
             <FolderKanban className="mr-2 h-4 w-4" /> 
             {product.workspaceId ? 'Open Workspace' : 'Create Workspace'}
          </Button>
          <Button variant="secondary" onClick={toggleLike}>
            <Heart className={`mr-2 h-4 w-4 ${hasLiked ? 'fill-current text-status-danger' : ''}`} /> {likes.length}
          </Button>
          {canModerate && (
            <>
              <Button variant="secondary" onClick={() => ProductsService.featureProduct(productId, !product.featured)}><Star className="mr-2 h-4 w-4" />{product.featured ? 'Unfeature' : 'Feature'}</Button>
              <Button variant="danger" onClick={() => ProductsService.archiveProduct(productId)}><Archive className="mr-2 h-4 w-4" />Archive</Button>
            </>
          )}
          {isOwner && <Button variant="danger" onClick={async () => { await ProductsService.deleteProduct(productId); navigate('/workspace/products'); }}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}

      <section className="mb-6 rounded-2xl border border-border bg-surface/70 p-5 md:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{product.category}</span>
          <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{product.status}</span>
          {product.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">{product.title}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-text-muted">{product.description}</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-accent/20 bg-accent/10 px-5 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Price</p>
            <p className="mt-1 text-2xl font-black text-white">{formatPrice(product.price)}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-text-muted">
          <span>By {product.creatorName || product.creatorUsername || 'Member'}</span>
          <span>{formatDate(product.createdAt)}</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{product.views || 0} views</span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-lg">Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-white/[0.03] p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Status</p>
                  <p className="mt-1 font-bold text-white">{product.status}</p>
                </div>
                <div className="rounded-xl border border-border bg-white/[0.03] p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Category</p>
                  <p className="mt-1 font-bold text-white">{product.category}</p>
                </div>
                <div className="rounded-xl border border-border bg-white/[0.03] p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Price</p>
                  <p className="mt-1 font-bold text-white">{formatPrice(product.price)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap text-sm leading-7 text-text-soft">{product.description || 'No description provided yet.'}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Gallery</CardTitle></CardHeader>
            <CardContent>
              {!product.media?.length ? (
                <p className="text-sm text-text-muted">No media uploaded yet.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {product.media.map((item, index) => <MediaItem key={`${item.publicId}-${index}`} item={item} />)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-5 w-5 text-accent" />Comments</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addComment} className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." className="h-11 flex-1 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent" />
                <Button type="submit" disabled={!commentText.trim()}>Comment</Button>
              </form>
              <div className="space-y-3">
                {comments.length === 0 ? <p className="text-sm text-text-muted">No comments yet.</p> : comments.map(comment => (
                  <div key={comment.id} className="rounded-xl border border-border bg-white/[0.03] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-white">{comment.authorName || 'Member'}</p>
                      {(canModerate || comment.authorId === user?.uid) && (
                        <button
                          type="button"
                          onClick={() => deleteComment(comment.id)}
                          className="rounded-lg p-1 text-text-muted hover:bg-status-danger/10 hover:text-status-danger"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-text-soft">{comment.text}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-text-muted">{formatDate(comment.createdAt)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5 text-accent" />Creator Info</CardTitle></CardHeader>
            <CardContent>
              <Link to={`/profile/${product.creatorId}`} className="block rounded-xl border border-border bg-white/[0.03] p-3 text-sm font-bold text-white hover:border-accent/40">
                {product.creatorName || product.creatorUsername || 'Member'}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-accent" />Team Members</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {teamMembers.length === 0 ? <p className="text-sm text-text-muted">No team members listed.</p> : teamMembers.map(member => (
                <Link key={member.id} to={`/profile/${member.id}`} className="block rounded-xl border border-border bg-white/[0.03] p-3 text-sm font-bold text-white hover:border-accent/40">
                  {member.displayName || member.username}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-accent" />Statistics</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-center text-xs text-text-muted">
              <div className="rounded-xl border border-border p-3"><span className="block text-xl font-black text-white">{likes.length}</span>Likes</div>
              <div className="rounded-xl border border-border p-3"><span className="block text-xl font-black text-white">{product.views || 0}</span>Views</div>
              <div className="rounded-xl border border-border p-3"><span className="block text-xl font-black text-white">{comments.length}</span>Comments</div>
              <div className="rounded-xl border border-border p-3"><span className="block text-xl font-black text-white">{product.media?.length || 0}</span>Media</div>
            </CardContent>
          </Card>

          {isOwner && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Pencil className="h-5 w-5 text-accent" />Owner Tools</CardTitle></CardHeader>
              <CardContent><Button variant="secondary" className="w-full" onClick={() => setEditing(current => !current)}>{editing ? 'Close Editor' : 'Edit Product'}</Button></CardContent>
            </Card>
          )}
        </aside>
      </div>

      {editing && editForm && (
        <SectionWrapper title="Edit Product" className="mt-6">
          <form onSubmit={saveEdits} className="space-y-4 rounded-2xl border border-border bg-surface p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={editForm.title} onChange={(event) => updateEditField('title', event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent" required />
              <input type="number" min="0" step="0.01" value={editForm.price} onChange={(event) => updateEditField('price', event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent" />
              <select value={editForm.category} onChange={(event) => updateEditField('category', event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {PRODUCT_CATEGORIES.map(category => <option key={category}>{category}</option>)}
              </select>
              <select value={editForm.status} onChange={(event) => updateEditField('status', event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {PRODUCT_STATUSES.filter(status => status !== 'ARCHIVED').map(status => <option key={status}>{status}</option>)}
              </select>
            </div>
            <textarea value={editForm.description} onChange={(event) => updateEditField('description', event.target.value)} rows={5} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent" />
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-muted">Team Members</span>
              <select multiple value={editForm.teamMembers} onChange={(event) => updateEditField('teamMembers', [...event.target.selectedOptions].map(option => option.value))} className="min-h-28 w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {members.map(member => <option key={member.id} value={member.id}>{member.displayName || member.username}</option>)}
              </select>
            </label>
            <div className="rounded-xl border border-border bg-black/20 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-white">Media</p>
                <label className="inline-flex cursor-pointer items-center rounded-xl border border-border bg-white/5 px-3 py-2 text-sm font-bold text-text-soft hover:text-white">
                  {uploading ? 'Uploading...' : 'Upload Media'}
                  <input type="file" multiple className="hidden" onChange={(event) => uploadEditMedia(event.target.files || [])} disabled={uploading} />
                </label>
              </div>
              {!isCloudinaryConfigured && <p className="mb-3 text-xs text-status-danger">Cloudinary upload preset is not configured.</p>}
              {!editForm.media?.length ? (
                <p className="text-sm text-text-muted">No media attached.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {editForm.media.map((item, index) => (
                    <div key={`${item.publicId}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white/[0.03] p-2">
                      <span className="min-w-0 truncate text-sm text-text-soft">{item.name}</span>
                      <button type="button" onClick={() => updateEditField('media', editForm.media.filter((_, itemIndex) => itemIndex !== index))} className="text-text-muted hover:text-status-danger" aria-label={`Remove ${item.name}`}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </SectionWrapper>
      )}
    </PageContainer>
  );
}
