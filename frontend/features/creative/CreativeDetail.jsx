import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Eye,
  FileText,
  Heart,
  ImageIcon,
  MessageSquare,
  Palette,
  Pencil,
  Send,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { LoadingState } from '@frontend/components/ui/UIElements';
import Button from '@frontend/components/ui/Button';
import { hasPermission } from '@shared/permissions/permissions';
import { formatDate } from '@shared/lib/dateUtils';
import { CREATIVE_CATEGORIES, CREATIVE_STATUSES, CreativeService } from '@services/firestore/creative';
import { isCloudinaryConfigured, uploadCreativeMedia } from '@services/storage/cloudinary';
import { AIContextPanel } from '../ai/AIContextPanel';
import { SafeImage, getCreativeMediaList } from './CreativityPage';
import { cn } from '@shared/lib/utils';

const detailStyles = `
  @keyframes creative-detail-enter {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes creative-detail-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }

  .creative-detail {
    --creative-ink: #080812;
    --creative-panel: rgba(12, 14, 28, 0.78);
    --creative-panel-strong: rgba(18, 19, 38, 0.94);
    --creative-cyan: #2de2ff;
    --creative-violet: #9b5cff;
    --creative-rose: #ff4fa3;
    --creative-amber: #ffc857;
    color: #fff;
  }

  .creative-detail * {
    min-width: 0;
  }

  .creative-detail-shell {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background:
      linear-gradient(135deg, rgba(45, 226, 255, 0.12), transparent 32%),
      linear-gradient(225deg, rgba(255, 79, 163, 0.13), transparent 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.015)),
      #080812;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.34);
  }

  .creative-detail-grid {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.72), transparent 82%);
  }

  .creative-detail-enter {
    animation: creative-detail-enter 0.46s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .creative-detail-float {
    animation: creative-detail-float 4.8s ease-in-out infinite;
  }

  .creative-detail-focus:focus-visible {
    outline: 2px solid var(--creative-cyan);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .creative-detail-enter,
    .creative-detail-float {
      animation: none;
    }

    .creative-detail *,
    .creative-detail *::before,
    .creative-detail *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`;

function likeCount(work) {
  return Array.isArray(work?.likes) ? work.likes.length : Number(work?.likes || 0);
}

function textBlock(text) {
  if (!text) return <p className="text-sm leading-6 text-white/[0.58]">No description provided.</p>;

  return (
    <p className="whitespace-pre-wrap text-sm leading-7 text-white/[0.70] sm:text-base">
      {text}
    </p>
  );
}

function Pill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/12 bg-white/[0.065] text-white/[0.72]',
    cyan: 'border-[var(--creative-cyan)]/[0.25] bg-[var(--creative-cyan)]/[0.12] text-[var(--creative-cyan)]',
    amber: 'border-[var(--creative-amber)]/[0.30] bg-[var(--creative-amber)]/[0.14] text-[var(--creative-amber)]',
  };

  return (
    <span className={cn('inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black', tones[tone])}>
      {children}
    </span>
  );
}

function StatTile({ icon: Icon, label, value, active = false, onClick }) {
  const content = (
    <>
      <span className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition',
        active ? 'bg-[var(--creative-rose)]/[0.18] text-[var(--creative-rose)]' : 'bg-white/10 text-[var(--creative-cyan)]'
      )}>
        <Icon className={cn('h-5 w-5', active && Icon === Heart ? 'fill-current' : '')} aria-hidden="true" />
      </span>
      <span className="min-w-0 text-left">
        <span className="block truncate text-base font-black leading-tight text-white">{value}</span>
        <span className="block truncate text-xs font-bold uppercase text-white/[0.48]">{label}</span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="creative-detail-focus flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 transition hover:border-[var(--creative-rose)]/[0.35] hover:bg-white/[0.08]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
      {content}
    </div>
  );
}

function Panel({ children, className }) {
  return (
    <section className={cn('creative-detail-enter rounded-[1.35rem] border border-white/10 bg-[var(--creative-panel)] shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl', className)}>
      {children}
    </section>
  );
}

function MediaItem({ item, featured = false }) {
  const url = typeof item === 'string' ? item : (item?.url || item?.src || item?.path || '');
  const type = typeof item === 'object' ? item.type : undefined;
  const name = typeof item === 'object' ? item.name || 'Creative media' : 'Creative media';
  const isVideo = type === 'video' || /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  const isDoc = type === 'document' || /\.(pdf|doc|docx|txt|csv)($|\?)/i.test(url);

  if (isVideo) {
    return (
      <video
        src={url}
        controls
        className={cn('w-full rounded-[1.25rem] bg-black object-contain', featured ? 'max-h-[68vh] min-h-[18rem]' : 'h-56')}
      />
    );
  }

  if (isDoc) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="creative-detail-focus flex min-h-32 items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4 text-white/[0.72] transition hover:border-[var(--creative-cyan)]/[0.35] hover:text-white"
      >
        <FileText className="h-7 w-7 shrink-0 text-[var(--creative-cyan)]" aria-hidden="true" />
        <span className="min-w-0 truncate font-bold">{name}</span>
      </a>
    );
  }

  if (url) {
    return (
      <SafeImage
        src={url}
        alt={name}
        className={cn('w-full rounded-[1.25rem] bg-black object-cover', featured ? 'max-h-[72vh] min-h-[18rem] object-contain' : 'aspect-[4/3]')}
      />
    );
  }

  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-6 text-center">
      <ImageIcon className="h-9 w-9 text-white/50" aria-hidden="true" />
      <span className="text-sm font-bold text-white/[0.58]">Media unavailable</span>
    </div>
  );
}

function EmptyMedia() {
  return (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-white/[0.14] bg-white/[0.035] p-6 text-center">
      <Palette className="creative-detail-float h-12 w-12 text-[var(--creative-cyan)]" aria-hidden="true" />
      <div>
        <h2 className="text-lg font-black text-white">No media attached</h2>
        <p className="mt-1 text-sm text-white/[0.58]">This creative work has not added an image, video, or document yet.</p>
      </div>
    </div>
  );
}

export default function CreativeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [work, setWork] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');
  const isOwner = user?.uid && work?.creatorId === user.uid;
  const likes = Array.isArray(work?.likes) ? work.likes : [];
  const hasLiked = likes.includes(user?.uid);
  const mediaItems = useMemo(() => getCreativeMediaList(work), [work]);
  const featuredMedia = mediaItems[0];

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
      onComments: setComments,
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
    setCommenting(true);
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
    } finally {
      setCommenting(false);
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
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    if (!isCloudinaryConfigured) {
      setError('Cloudinary upload preset is not configured.');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(selectedFiles.map(file => uploadCreativeMedia(file)));
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
      navigate('/creativity');
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
      <>
        <style>{detailStyles}</style>
        <PageContainer className="creative-detail max-w-[1720px] px-3 pt-20 sm:px-4 md:px-6 lg:px-8">
          <div className="creative-detail-shell rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6">
            <div className="flex min-h-72 items-center justify-center">
              <LoadingState text="Loading creative work..." />
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  if (!work) {
    return (
      <>
        <style>{detailStyles}</style>
        <PageContainer className="creative-detail max-w-[1720px] px-3 pt-20 sm:px-4 md:px-6 lg:px-8">
          <div className="creative-detail-shell rounded-[1.5rem] p-4 text-center sm:rounded-[2rem] sm:p-8">
            <Palette className="mx-auto mb-4 h-12 w-12 text-[var(--creative-cyan)]" aria-hidden="true" />
            <h2 className="mb-2 text-xl font-black text-white">Creative work not found</h2>
            <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-white/[0.62]">
              The creative work you are looking for does not exist or you do not have permission to view it.
            </p>
            <Button onClick={() => navigate('/creativity')}>Back to Creativity</Button>
          </div>
        </PageContainer>
      </>
    );
  }

  if (editing) {
    return (
      <>
        <style>{detailStyles}</style>
        <PageContainer className="creative-detail max-w-[1720px] px-3 pb-8 pt-20 sm:px-4 md:px-6 lg:px-8">
          <div className="creative-detail-shell rounded-[1.5rem] p-3 sm:rounded-[2rem] sm:p-5 lg:p-7">
            <div className="creative-detail-grid pointer-events-none absolute inset-0" aria-hidden="true" />

            <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="secondary" onClick={cancelEdit} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Cancel Editing
              </Button>
              <div className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-center text-xs font-black uppercase text-[var(--creative-cyan)]">
                Edit Creative Work
              </div>
            </div>

            {error && (
              <div className="relative mb-4 rounded-2xl border border-status-danger/25 bg-status-danger/10 px-4 py-3 text-sm font-bold text-status-danger">
                {error}
              </div>
            )}

            <form onSubmit={saveEdit} className="relative space-y-5 rounded-[1.35rem] border border-white/10 bg-[var(--creative-panel)] p-4 backdrop-blur-xl sm:p-5 lg:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase text-white/[0.52]">Title</span>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(event) => setEditForm(current => ({ ...current, title: event.target.value }))}
                    className="creative-detail-focus min-h-[46px] w-full rounded-2xl border border-white/12 bg-white/[0.055] px-4 text-sm text-white outline-none transition focus:border-[var(--creative-cyan)]/[0.45]"
                    required
                    maxLength={100}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase text-white/[0.52]">Category</span>
                  <select
                    value={editForm.category}
                    onChange={(event) => setEditForm(current => ({ ...current, category: event.target.value }))}
                    className="creative-detail-focus min-h-[46px] w-full rounded-2xl border border-white/12 bg-[#121426] px-4 text-sm font-bold text-white outline-none transition focus:border-[var(--creative-cyan)]/[0.45]"
                  >
                    {CREATIVE_CATEGORIES.map(category => <option key={category}>{category}</option>)}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-white/[0.52]">Description</span>
                <textarea
                  value={editForm.description}
                  onChange={(event) => setEditForm(current => ({ ...current, description: event.target.value }))}
                  placeholder="Describe your creative work"
                  required
                  rows={6}
                  maxLength={500}
                  className="creative-detail-focus w-full resize-none rounded-2xl border border-white/12 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-[var(--creative-cyan)]/[0.45]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-white/[0.52]">Status</span>
                <select
                  value={editForm.status}
                  onChange={(event) => setEditForm(current => ({ ...current, status: event.target.value }))}
                  className="creative-detail-focus min-h-[46px] w-full rounded-2xl border border-white/12 bg-[#121426] px-4 text-sm font-bold text-white outline-none transition focus:border-[var(--creative-cyan)]/[0.45]"
                >
                  {CREATIVE_STATUSES.map(status => <option key={status}>{status}</option>)}
                </select>
              </label>

              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-white">Creative Media</p>
                    <p className="mt-1 text-xs font-bold text-white/[0.48]">Images, videos, and documents</p>
                  </div>
                  <label className="creative-detail-focus inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.065] px-4 py-2 text-sm font-black text-white transition hover:border-[var(--creative-cyan)]/[0.35] hover:text-[var(--creative-cyan)]">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    {uploading ? 'Uploading...' : 'Upload'}
                    <input type="file" multiple className="hidden" onChange={(event) => uploadFiles(event.target.files || [])} disabled={uploading} />
                  </label>
                </div>

                {editForm.media.length === 0 ? (
                  <p className="text-sm text-white/[0.58]">No media attached yet.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {editForm.media.map((item, index) => (
                      <div key={`${item.publicId || item.url || item.name || 'media'}-${index}`} className="flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                        <span className="min-w-0 truncate text-sm font-bold text-white/[0.72]">{item.name || 'Creative media'}</span>
                        <button
                          type="button"
                          onClick={() => setEditForm(current => ({ ...current, media: current.media.filter((_, itemIndex) => itemIndex !== index) }))}
                          className="creative-detail-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-status-danger/[0.14] text-status-danger transition hover:bg-status-danger/[0.22]"
                          aria-label={`Remove ${item.name || 'media file'}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={cancelEdit} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" disabled={saving} loading={saving} className="w-full sm:w-auto">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <style>{detailStyles}</style>
      <PageContainer className="creative-detail max-w-[1720px] px-3 pb-8 pt-20 sm:px-4 md:px-6 lg:px-8">
        <div className="creative-detail-shell rounded-[1.5rem] p-3 sm:rounded-[2rem] sm:p-4 md:p-6 lg:p-8">
          <div className="creative-detail-grid pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="relative mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Button variant="secondary" onClick={() => navigate(-1)} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>

            {(isOwner || canModerate) && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-end">
                {isOwner && (
                  <Button variant="secondary" onClick={startEdit} className="w-full lg:w-auto">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>
                )}
                {canModerate && (
                  <Button variant="secondary" onClick={featureWork} className="w-full lg:w-auto">
                    <Star className="h-4 w-4" aria-hidden="true" />
                    {work.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                )}
                {(isOwner || canModerate) && (
                  <Button variant="danger" onClick={deleteWork} className="w-full lg:w-auto">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="relative mb-4 rounded-2xl border border-status-danger/25 bg-status-danger/10 px-4 py-3 text-sm font-bold text-status-danger">
              {error}
            </div>
          )}

          <section className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/[0.18] p-4 sm:p-5 lg:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,26rem)] xl:items-end">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap gap-2">
                  <Pill tone="cyan">{work.category || 'Creative'}</Pill>
                  <Pill>{work.status || 'PUBLISHED'}</Pill>
                  {work.featured && (
                    <Pill tone="amber">
                      <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                      Featured
                    </Pill>
                  )}
                </div>

                <h1 className="creative-detail-enter text-[clamp(2rem,8vw,5.25rem)] font-black leading-[0.96] tracking-normal text-white">
                  {work.title || 'Untitled creative work'}
                </h1>
                <div className="mt-4 flex flex-col gap-2 text-sm font-bold text-white/[0.60] sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="truncate">By {work.creatorName || work.creatorUsername || 'Member'}</span>
                  <span className="hidden text-white/[0.28] sm:inline">|</span>
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--creative-cyan)]" aria-hidden="true" />
                    {formatDate(work.createdAt)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <StatTile icon={Heart} label={hasLiked ? 'Liked' : 'Likes'} value={likeCount(work)} active={hasLiked} onClick={toggleLike} />
                <StatTile icon={Eye} label="Views" value={Number(work.views || 0)} />
                <StatTile icon={MessageSquare} label="Comments" value={comments.length} />
              </div>
            </div>
          </section>

          <div className="relative mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,26rem)]">
            <div className="min-w-0 space-y-5">
              <Panel className="overflow-hidden p-3 sm:p-4">
                {featuredMedia ? <MediaItem item={featuredMedia} featured /> : <EmptyMedia />}

                {mediaItems.length > 1 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mediaItems.slice(1).map((item, index) => (
                      <MediaItem key={`${item.url || item.name || 'media'}-${index}`} item={item} />
                    ))}
                  </div>
                )}
              </Panel>

              <Panel className="p-4 sm:p-5 lg:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--creative-cyan)]/[0.12] text-[var(--creative-cyan)]">
                    <Palette className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">Artist Notes</h2>
                    <p className="text-sm font-bold text-white/[0.48]">Story, intent, and process</p>
                  </div>
                </div>
                {textBlock(work.description)}
              </Panel>

              <Panel className="p-4 sm:p-5 lg:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--creative-rose)]/[0.12] text-[var(--creative-rose)]">
                      <MessageSquare className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-xl font-black text-white">Comments</h2>
                      <p className="text-sm font-bold text-white/[0.48]">{comments.length} community notes</p>
                    </div>
                  </div>
                </div>

                {user?.uid && (
                  <form onSubmit={submitComment} className="mb-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      placeholder="Add a thoughtful comment..."
                      className="creative-detail-focus min-h-[46px] flex-1 rounded-2xl border border-white/12 bg-white/[0.055] px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[var(--creative-cyan)]/[0.45]"
                    />
                    <Button type="submit" size="sm" disabled={commenting || !commentText.trim()} loading={commenting} className="w-full sm:w-auto">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Post
                    </Button>
                  </form>
                )}

                {comments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/[0.14] bg-white/[0.035] p-5 text-center">
                    <MessageSquare className="mx-auto mb-3 h-8 w-8 text-white/[0.38]" aria-hidden="true" />
                    <p className="text-sm font-bold text-white/[0.58]">No comments yet. Be the first to comment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <article key={comment.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <span className="truncate text-sm font-black text-white">{comment.authorName || 'Member'}</span>
                          <span className="shrink-0 text-xs font-bold text-white/[0.42]">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-white/[0.70]">{comment.text}</p>
                        {(user?.uid === comment.authorId || canModerate) && (
                          <button
                            type="button"
                            onClick={() => deleteComment(comment.id)}
                            className="creative-detail-focus mt-3 inline-flex items-center gap-1 text-xs font-black text-status-danger transition hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Delete
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <aside className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start">
              <Panel className="p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--creative-violet)]/[0.14] text-[var(--creative-violet)]">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">AI Assistant</h2>
                    <p className="text-sm font-bold text-white/[0.48]">Analyze, refine, and ideate</p>
                  </div>
                </div>
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
              </Panel>

              <Panel className="p-4 sm:p-5">
                <h2 className="mb-3 text-lg font-black text-white">Work Details</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <dt className="font-bold text-white/[0.48]">Category</dt>
                    <dd className="truncate font-black text-white">{work.category || 'Creative'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <dt className="font-bold text-white/[0.48]">Status</dt>
                    <dd className="truncate font-black text-white">{work.status || 'PUBLISHED'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-bold text-white/[0.48]">Media</dt>
                    <dd className="truncate font-black text-white">{mediaItems.length}</dd>
                  </div>
                </dl>
              </Panel>
            </aside>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
