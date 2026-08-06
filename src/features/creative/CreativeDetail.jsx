import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, FileText, Heart, MessageSquare, Pencil, Star, Trash2, Palette, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { hasPermission } from '../../services/firebase/permissions';
import { CREATIVE_CATEGORIES, CREATIVE_STATUSES, CreativeService } from '../../services/firebase/creative';

import { isCloudinaryConfigured, uploadCreativeMedia } from '../../services/cloudinary/uploads';
import { AIContextPanel } from '../ai/AIContextPanel';

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Recently';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function textBlock(value, empty = 'Not documented yet.') {
  return <p className="whitespace-pre-wrap text-sm leading-7 text-text-soft">{value || empty}</p>;
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

export default function CreativeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [work, setWork] = useState(null);

  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');
  const isOwner = user?.uid && work?.creatorId === user.uid;
  const likes = Array.isArray(work?.likes) ? work.likes : [];
  const hasLiked = likes.includes(user?.uid);

  useEffect(() => {
    if (!id) return undefined;
    CreativeService.incrementViews(id).catch((err) => console.error('Creative work view failed:', err));

    const unsubscribe = CreativeService.subscribeToCreativeWork(id, {
      onWork: (nextWork) => {
        setWork(nextWork);
        if (nextWork && !editing) {
          setEditForm({
            title: nextWork.title || '',
            description: nextWork.description || '',
            category: nextWork.category || 'Drawing',
            status: nextWork.status || 'DRAFT',
            media: nextWork.media || [],
          });
        }
        setLoading(false);
      },
      onError: (err) => {
        console.error('Creative work listener failed:', err);
        setError('Could not load this creative work.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [editing, id]);

  useEffect(() => {
    if (!id) return undefined;
    const unsubscribe = CreativeService.subscribeToComments(id, {
      onComments: () => {
        // Comments are handled in work object
      },
      onError: (err) => {
        console.error('Comments listener failed:', err);
      },
    });

    return () => unsubscribe();
  }, [id]);

  const toggleLike = async () => {
    if (!user?.uid) return;
    try {
      await CreativeService.toggleLike(id, user.uid, hasLiked);
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || !user?.uid) return;
    try {
      await CreativeService.addComment(id, {
        text: commentText,
        authorId: user.uid,
        authorName: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
        authorUsername: roleData?.username || user?.displayName || '',
      });
      setCommentText('');
    } catch (err) {
      console.error('Comment submission failed:', err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await CreativeService.deleteComment(id, commentId);
    } catch (err) {
      console.error('Comment deletion failed:', err);
    }
  };

  const startEdit = () => {
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    if (work) {
      setEditForm({
        title: work.title || '',
        description: work.description || '',
        category: work.category || 'Drawing',
        status: work.status || 'DRAFT',
        media: work.media || [],
      });
    }
  };

  const uploadFiles = async (files) => {
    if (!files.length) return;
    if (!isCloudinaryConfigured) {
      setError('Cloudinary upload preset is not configured.');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all([...files].map(file => uploadCreativeMedia(file)));
      setEditForm(current => ({ ...current, media: [...current.media, ...uploaded] }));
    } catch (err) {
      console.error('Creative media upload failed:', err);
      setError('Media upload failed. Try a smaller file or check Cloudinary settings.');
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await CreativeService.updateCreativeWork(id, editForm);
      setEditing(false);
    } catch (err) {
      console.error('Creative work update failed:', err);
      setError('Could not save changes. Check Firestore permissions.');
    } finally {
      setSaving(false);
    }
  };

  const deleteWork = async () => {
    if (!confirm('Are you sure you want to delete this creative work? This action cannot be undone.')) return;
    try {
      await CreativeService.archiveCreativeWork(id);
      navigate('/workspace/creative');
    } catch (err) {
      console.error('Creative work deletion failed:', err);
      setError('Could not delete this creative work.');
    }
  };

  const featureWork = async () => {
    try {
      await CreativeService.featureCreativeWork(id, !work.featured);
    } catch (err) {
      console.error('Feature toggle failed:', err);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-64 items-center justify-center"><LoadingState text="Loading creative work..." /></div>
      </PageContainer>
    );
  }

  if (!work) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-border p-8 text-center">
          <Palette className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <h2 className="mb-2 text-xl font-bold text-white">Creative work not found</h2>
          <p className="mb-4 text-text-muted">The creative work you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/workspace/creative"><Button>Back to Creative Hub</Button></Link>
        </div>
      </PageContainer>
    );
  }

  if (editing) {
    return (
      <PageContainer>
        <div className="mb-4 flex items-center gap-3">
          <Button variant="secondary" onClick={cancelEdit}><ArrowLeft className="mr-2 h-4 w-4" /> Cancel</Button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}

        <form onSubmit={saveEdit} className="space-y-4 rounded-2xl border border-border bg-surface p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(current => ({ ...current, title: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm(current => ({ ...current, category: e.target.value }))}
                className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                {CREATIVE_CATEGORIES.map(category => <option key={category}>{category}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(current => ({ ...current, description: e.target.value }))}
              placeholder="Describe your creative work"
              required
              rows={5}
              maxLength={500}
              className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm(current => ({ ...current, status: e.target.value }))}
              className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
            >
              {CREATIVE_STATUSES.map(status => <option key={status}>{status}</option>)}
            </select>
          </div>

          <div className="rounded-xl border border-border bg-black/20 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Creative Media</p>
                <p className="text-xs text-text-muted">Images, videos, and documents</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-sm font-bold text-text-soft hover:text-white">
                <input type="file" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files || [])} disabled={uploading} />
                {uploading ? 'Uploading...' : 'Upload'}
              </label>
            </div>
            {editForm.media.length === 0 ? (
              <p className="text-sm text-text-muted">No media attached yet.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {editForm.media.map((item, index) => (
                  <div key={`${item.publicId}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white/[0.03] p-2">
                    <span className="min-w-0 truncate text-sm text-text-soft">{item.name}</span>
                    <button type="button" onClick={() => setEditForm(current => ({ ...current, media: current.media.filter((_, i) => i !== index) }))} className="text-text-muted hover:text-status-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to="/workspace/creative"><Button variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Creative Hub</Button></Link>
        {(isOwner || canModerate) && (
          <div className="flex gap-2">
            {isOwner && <Button variant="secondary" onClick={startEdit}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>}
            {canModerate && <Button variant="secondary" onClick={featureWork}><Star className="mr-2 h-4 w-4" /> {work.featured ? 'Unfeature' : 'Feature'}</Button>}
            {(isOwner || canModerate) && <Button variant="danger" onClick={deleteWork}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>}
          </div>
        )}
      </div>

      {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{work.category}</span>
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{work.status}</span>
                    {work.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
                  </div>
                  <h1 className="font-heading text-2xl font-bold text-white">{work.title}</h1>
                  <p className="mt-1 text-sm text-text-muted">By {work.creatorName || work.creatorUsername || 'Member'} · {formatDate(work.createdAt)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-text-muted">Description</h3>
                {textBlock(work.description)}
              </div>

              {work.media && work.media.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-text-muted">Media</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {work.media.map((item, index) => (
                      <MediaItem key={`${item.publicId}-${index}`} item={item} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                <button onClick={toggleLike} className={`inline-flex items-center gap-2 text-sm ${hasLiked ? 'text-status-danger' : 'text-text-muted hover:text-status-danger'}`}>
                  <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                  {likes.length}
                </button>
                <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                  <Eye className="h-4 w-4" />
                  {work.views || 0}
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                  <MessageSquare className="h-4 w-4" />
                  {Array.isArray(work.comments) ? work.comments.length : 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-accent" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.uid && (
                <form onSubmit={submitComment} className="flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                  />
                  <Button type="submit" size="sm">Post</Button>
                </form>
              )}

              {(!work.comments || work.comments.length === 0) ? (
                <p className="text-sm text-text-muted">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-3">
                  {work.comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-border bg-white/[0.03] p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white">{comment.authorName || 'Member'}</span>
                        <span className="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-text-soft">{comment.text}</p>
                      {(user?.uid === comment.authorId || canModerate) && (
                        <button onClick={() => deleteComment(comment.id)} className="mt-2 text-xs text-status-danger hover:underline">
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-accent" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIContextPanel
                actions={[
                  {
                    label: 'Analyze this creative work',
                    prompt: `Analyze this creative work titled "${work.title}" in the ${work.category} category. Description: ${work.description}`,
                  },
                  {
                    label: 'Suggest improvements',
                    prompt: `Suggest improvements for this creative work titled "${work.title}" in the ${work.category} category.`,
                  },
                  {
                    label: 'Generate similar ideas',
                    prompt: `Generate 5 similar creative work ideas in the ${work.category} category.`,
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
