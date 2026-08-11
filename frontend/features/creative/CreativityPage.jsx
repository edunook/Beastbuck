import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Eye,
  Heart,
  ImageIcon,
  Loader2,
  Lock,
  Palette,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import Button from '@frontend/components/ui/Button';
import { uploadCreativeMedia, isIPFSConfigured as isStorageConfigured } from '@services/storage/ipfs';
import { CREATIVE_CATEGORIES, CreativeService } from '@services/firestore/creative';
import { MembershipService } from '@services/firestore/membership';
import { cn } from '@shared/lib/utils';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Drawing',
  media: [],
};

const creativityStyles = `
  @keyframes creativity-enter {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes creativity-soft-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes creativity-sheen {
    from { transform: translateX(-120%); }
    to { transform: translateX(120%); }
  }

  .creativity-page {
    --creative-ink: #080812;
    --creative-panel: rgba(12, 14, 28, 0.78);
    --creative-panel-strong: rgba(18, 19, 38, 0.94);
    --creative-line: rgba(255, 255, 255, 0.12);
    --creative-soft: rgba(255, 255, 255, 0.68);
    --creative-cyan: #2de2ff;
    --creative-violet: #9b5cff;
    --creative-rose: #ff4fa3;
    --creative-amber: #ffc857;
    color: #fff;
  }

  .creativity-page * {
    min-width: 0;
  }

  .creativity-shell {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background:
      linear-gradient(135deg, rgba(45, 226, 255, 0.11), transparent 30%),
      linear-gradient(225deg, rgba(255, 79, 163, 0.12), transparent 32%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.015)),
      #080812;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.34);
  }

  .creativity-grid-bg {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.78), transparent 86%);
  }

  .creativity-enter {
    animation: creativity-enter 0.48s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .creativity-float {
    animation: creativity-soft-float 4.8s ease-in-out infinite;
  }

  .creativity-card::before,
  .creativity-upload-zone::before {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-120%);
    background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.12), transparent 72%);
    transition: transform 0.7s ease;
    pointer-events: none;
  }

  .creativity-card:hover::before,
  .creativity-upload-zone:hover::before {
    transform: translateX(120%);
  }

  .creativity-focus:focus-visible {
    outline: 2px solid var(--creative-cyan);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .creativity-enter,
    .creativity-float {
      animation: none;
    }

    .creativity-card,
    .creativity-card *,
    .creativity-upload-zone,
    .creativity-upload-zone * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`;

const PUBLIC_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

function getLikeCount(work) {
  return Array.isArray(work?.likes) ? work.likes.length : Number(work?.likes || 0);
}

function getCreatedMillis(work) {
  if (!work?.createdAt) return 0;
  if (typeof work.createdAt.toMillis === 'function') return work.createdAt.toMillis();
  if (typeof work.createdAt.seconds === 'number') return work.createdAt.seconds * 1000;
  const date = new Date(work.createdAt);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function matchesSearch(work, query) {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  return [
    work.title,
    work.description,
    work.category,
    work.creatorName,
    work.creatorUsername,
  ].some(value => String(value || '').toLowerCase().includes(term));
}

export function getCreativeMediaList(work) {
  if (!work) return [];
  const items = [];

  if (Array.isArray(work.media) && work.media.length > 0) {
    for (const m of work.media) {
      if (!m) continue;
      if (typeof m === 'string') {
        const isVid = /\.(mp4|webm|ogg|mov)($|\?)/i.test(m);
        items.push({ url: m, type: isVid ? 'video' : 'image' });
      } else if (typeof m === 'object') {
        const url = m.url || m.src || m.path || m.href || '';
        if (url) {
          const type = m.type || (/\.(mp4|webm|ogg|mov)($|\?)/i.test(url) ? 'video' : 'image');
          items.push({ url, type, name: m.name || '' });
        }
      }
    }
  }

  if (items.length === 0) {
    const singleUrl = work.imageUrl || work.coverUrl || work.mediaUrl || work.url || work.image;
    if (singleUrl && typeof singleUrl === 'string') {
      const isVid = /\.(mp4|webm|ogg|mov)($|\?)/i.test(singleUrl);
      items.push({ url: singleUrl, type: isVid ? 'video' : 'image' });
    }
  }

  return items;
}

export function SafeImage({ src, alt, className }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [gatewayIndex, setGatewayIndex] = useState(0);

  useEffect(() => {
    setCurrentSrc(src);
    setGatewayIndex(0);
  }, [src]);

  const handleError = () => {
    if (currentSrc && currentSrc.includes('/ipfs/')) {
      const cid = currentSrc.split('/ipfs/').pop();
      if (cid && gatewayIndex + 1 < PUBLIC_GATEWAYS.length) {
        const nextIndex = gatewayIndex + 1;
        setGatewayIndex(nextIndex);
        setCurrentSrc(`${PUBLIC_GATEWAYS[nextIndex]}${cid}`);
      }
    }
  };

  if (!currentSrc) return null;

  return (
    <img
      src={currentSrc}
      alt={alt || ''}
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}

function MetricPill({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[var(--creative-cyan)]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-lg font-black leading-tight text-white">{value}</div>
        <div className="truncate text-xs font-bold uppercase text-white/[0.55]">{label}</div>
      </div>
    </div>
  );
}

function CreativeCard({ work, index }) {
  const mediaList = getCreativeMediaList(work);
  const firstMedia = mediaList[0];
  const isVideo = firstMedia?.type === 'video';
  const hasMedia = Boolean(firstMedia?.url);

  return (
    <article
      className="creativity-card creativity-enter group relative flex min-h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[var(--creative-panel)] shadow-[0_18px_55px_rgba(0,0,0,0.26)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_70px_rgba(45,226,255,0.14)]"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0a0b16]">
        {isVideo ? (
          <video
            src={firstMedia.url}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            muted
            loop
            playsInline
            preload="metadata"
            onMouseEnter={(event) => event.currentTarget.play()}
            onMouseLeave={(event) => event.currentTarget.pause()}
          />
        ) : hasMedia ? (
          <SafeImage
            src={firstMedia.url}
            alt={work.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,rgba(45,226,255,0.13),rgba(255,79,163,0.1),rgba(255,200,87,0.08))] p-6 text-center">
            <ImageIcon className="h-10 w-10 text-white/70" aria-hidden="true" />
            <span className="text-sm font-bold text-white/[0.72]">Creative Work</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
          <span className="rounded-full border border-white/15 bg-black/[0.42] px-3 py-1 text-xs font-black text-white shadow-lg backdrop-blur-md">
            {work.category || 'Creative'}
          </span>
          {work.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--creative-amber)]/30 bg-[var(--creative-amber)]/[0.18] px-3 py-1 text-xs font-black text-[var(--creative-amber)] backdrop-blur-md">
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-white/[0.58]">
          <span className="truncate">By {work.creatorName || work.creatorUsername || 'Member'}</span>
          <span className="inline-flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-[var(--creative-rose)]" aria-hidden="true" />
              {getLikeCount(work)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-[var(--creative-cyan)]" aria-hidden="true" />
              {Number(work.views || 0)}
            </span>
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-black leading-snug text-white transition group-hover:text-[var(--creative-cyan)]">
          {work.title || 'Untitled creative work'}
        </h3>

        {work.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/[0.62]">
            {work.description}
          </p>
        )}

        <div className="mt-auto pt-5">
          <Link
            to={`/workspace/creative/${work.id}`}
            className="creativity-focus inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.075] px-4 py-2.5 text-sm font-black text-white transition hover:border-[var(--creative-cyan)]/40 hover:bg-[var(--creative-cyan)]/12 hover:text-[var(--creative-cyan)]"
          >
            Open Work
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CreativeSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.045]">
          <div className="aspect-[4/3] animate-pulse bg-white/10" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-11 w-full animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UploadModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { user, roleData } = useAuth();

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting && !uploading) onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, submitting, uploading]);

  if (!isOpen) return null;

  const updateField = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const closeModal = () => {
    if (!submitting && !uploading) onClose();
  };

  const uploadFiles = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    if (form.media.length >= 1) {
      setUploadError('You can only upload one image or video per post. Remove the existing media first.');
      return;
    }

    if (selectedFiles.length > 1) {
      setUploadError('You can only upload one image or video per post.');
      return;
    }

    if (!isStorageConfigured) {
      console.error('Storage not configured');
      setUploadError('Storage is not configured. Please contact administrator.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const uploaded = [];
      for (let i = 0; i < selectedFiles.length; i += 1) {
        const file = selectedFiles[i];
        setUploadProgress(Math.round((i / selectedFiles.length) * 100));

        try {
          const result = await uploadCreativeMedia(file);
          uploaded.push(result);
          setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          setUploadError(`Failed to upload ${file.name}: ${err.message}`);
        }
      }

      if (uploaded.length > 0) {
        updateField('media', [...form.media, ...uploaded]);
        setUploadSuccess(true);
        window.setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        setUploadError('No files were uploaded successfully.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Media upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isApprovedMember = await MembershipService.isApprovedMember(user?.uid);
    if (!isApprovedMember) {
      setUploadError('You must be an approved member to upload creative works. Please apply for membership first.');
      return;
    }

    if (!form.title.trim() || form.media.length === 0) {
      setUploadError('Please add a title and at least one media file.');
      return;
    }

    setSubmitting(true);
    setUploadError('');
    try {
      const creator = {
        uid: user?.uid,
        name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
        username: roleData?.username || user?.displayName || '',
      };
      await onSubmit({ ...form, creator });
      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      console.error('Submit failed:', err);
      setUploadError('Failed to submit creative work. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/76 px-3 py-3 backdrop-blur-md sm:items-center sm:px-5 sm:py-6">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close upload modal"
        onClick={closeModal}
      />

      <section className="creativity-enter relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#0b0d19] shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:max-h-[min(92dvh,760px)] sm:rounded-[1.7rem]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-white/[0.045] px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-black uppercase text-[var(--creative-cyan)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Community Showcase
            </div>
            <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">Share Your Creativity</h2>
            <p className="mt-1 text-sm leading-6 text-white/[0.62]">Publish one polished image or video for the community gallery.</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            disabled={submitting || uploading}
            className="creativity-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close upload modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-black text-white" htmlFor="creative-title">Title *</label>
              <input
                id="creative-title"
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Give your work a memorable title"
                maxLength={100}
                className="creativity-focus min-h-[46px] w-full rounded-2xl border border-white/12 bg-white/[0.055] px-4 text-sm text-white outline-none transition placeholder:text-white/[0.36] focus:border-[var(--creative-cyan)]/[0.55] focus:bg-white/[0.08]"
                required
              />
              <div className="mt-1 text-right text-xs font-bold text-white/[0.42]">{form.title.length}/100</div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-white" htmlFor="creative-category">Category</label>
              <select
                id="creative-category"
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
                className="creativity-focus min-h-[46px] w-full rounded-2xl border border-white/12 bg-[#121426] px-4 text-sm font-bold text-white outline-none transition focus:border-[var(--creative-cyan)]/[0.55]"
              >
                {CREATIVE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-white" htmlFor="creative-description">Description</label>
              <textarea
                id="creative-description"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Tell the story behind the work"
                rows={4}
                maxLength={500}
                className="creativity-focus w-full resize-none rounded-2xl border border-white/12 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/[0.36] focus:border-[var(--creative-cyan)]/[0.55] focus:bg-white/[0.08]"
              />
              <div className="mt-1 text-right text-xs font-bold text-white/[0.42]">{form.description.length}/500</div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-white">Media *</label>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  uploadFiles(event.dataTransfer.files);
                }}
                className={cn(
                  "creativity-upload-zone relative overflow-hidden rounded-[1.25rem] border-2 border-dashed p-5 text-center transition sm:p-8",
                  isDragging
                    ? "border-[var(--creative-cyan)] bg-[var(--creative-cyan)]/12"
                    : "border-white/[0.14] bg-white/[0.045] hover:border-[var(--creative-cyan)]/[0.45]"
                )}
              >
                {uploading ? (
                  <div className="space-y-4">
                    <Loader2 className="mx-auto h-11 w-11 animate-spin text-[var(--creative-cyan)]" aria-hidden="true" />
                    <p className="text-sm font-black text-white">Uploading to IPFS...</p>
                    <div className="mx-auto max-w-xs">
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--creative-cyan),var(--creative-rose),var(--creative-amber))] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white/[0.58]">{uploadProgress}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Upload className={cn("mx-auto mb-3 h-11 w-11", isDragging ? "text-[var(--creative-cyan)]" : "text-white/50")} aria-hidden="true" />
                    <p className="text-sm font-black text-white">{isDragging ? 'Drop files here' : 'Drag and drop an image or video'}</p>
                    <p className="mt-1 text-xs font-bold text-white/[0.48]">JPEG, PNG, GIF, WebP, MP4, WebM</p>
                    <label className="creativity-focus mt-4 inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--creative-cyan),var(--creative-violet),var(--creative-rose))] px-5 py-2.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(155,92,255,0.26)] transition hover:brightness-110">
                      Browse Files
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(event) => uploadFiles(event.target.files || [])}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>

              {uploadSuccess && (
                <div className="mt-3 flex items-start gap-2 rounded-2xl border border-status-success/25 bg-status-success/10 px-4 py-3 text-sm font-bold text-status-success">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Files uploaded successfully to IPFS.</span>
                </div>
              )}

              {uploadError && (
                <div className="mt-3 flex items-start gap-2 rounded-2xl border border-status-danger/25 bg-status-danger/10 px-4 py-3 text-sm font-bold text-status-danger">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{uploadError}</span>
                </div>
              )}

              {form.media.length > 0 && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="mb-3 text-sm font-black text-white">Uploaded File</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[7rem_1fr] sm:items-center">
                    {form.media.map((item, index) => (
                      <div key={`${item.url || item.name || 'media'}-${index}`} className="contents">
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/35">
                          {item.type === 'image' ? (
                            <img src={item.url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <video src={item.url} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-white">{item.name || 'Creative media'}</p>
                            <p className="mt-1 text-xs font-bold text-white/45">{item.type || 'media'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateField('media', form.media.filter((_, itemIndex) => itemIndex !== index))}
                            className="creativity-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-status-danger/[0.14] text-status-danger transition hover:bg-status-danger/[0.22]"
                            aria-label={`Remove ${item.name || 'media file'}`}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 mt-6 border-t border-white/10 bg-[#0b0d19]/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting || uploading} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || uploading} loading={submitting} className="w-full sm:w-auto">
                {submitting ? 'Publishing...' : 'Publish Work'}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function CreativityPage() {
  const { user } = useAuth();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [isApprovedMember, setIsApprovedMember] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadWorks = async () => {
      setLoadError('');
      try {
        const data = await CreativeService.searchCreativeWorks({ status: 'PUBLISHED' });
        if (mounted) setWorks(data);
      } catch (err) {
        console.error('Failed to load works:', err);
        if (mounted) setLoadError('Creative works could not be loaded right now.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const checkMembership = async () => {
      if (user?.uid) {
        const isMember = await MembershipService.isApprovedMember(user.uid);
        if (mounted) setIsApprovedMember(isMember);
      } else if (mounted) {
        setIsApprovedMember(false);
      }
    };

    loadWorks();
    checkMembership();
    return () => { mounted = false; };
  }, [user?.uid]);

  const filteredAndSortedWorks = useMemo(() => {
    const filtered = works
      .filter(work => filter === 'all' || work.category === filter)
      .filter(work => matchesSearch(work, searchTerm));

    return [...filtered].sort((a, b) => {
      if (sortBy === 'popular') return getLikeCount(b) - getLikeCount(a);
      if (sortBy === 'views') return Number(b.views || 0) - Number(a.views || 0);
      return getCreatedMillis(b) - getCreatedMillis(a);
    });
  }, [works, filter, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const categoryCount = new Set(works.map(work => work.category).filter(Boolean)).size;
    const featuredCount = works.filter(work => work.featured).length;
    const totalLikes = works.reduce((sum, work) => sum + getLikeCount(work), 0);

    return {
      total: works.length,
      categories: categoryCount,
      featured: featuredCount,
      likes: totalLikes,
    };
  }, [works]);

  const handleSubmit = async (formData) => {
    const workData = {
      ...formData,
      status: 'PUBLISHED',
      likes: [],
      views: 0,
      featured: false,
      createdAt: new Date(),
    };
    await CreativeService.createCreativeWork(workData, formData.creator);
    const data = await CreativeService.searchCreativeWorks({ status: 'PUBLISHED' });
    setWorks(data);
  };

  const showMemberAction = Boolean(user && isApprovedMember);
  const showMembershipPrompt = Boolean(user && !isApprovedMember);

  return (
    <>
      <style>{creativityStyles}</style>
      <PageContainer className="creativity-page max-w-[1720px] px-3 pb-8 pt-20 sm:px-4 md:px-6 lg:px-8">
        <div className="creativity-shell rounded-[1.5rem] p-3 sm:rounded-[2rem] sm:p-4 md:p-6 lg:p-8">
          <div className="creativity-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />

          <section className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/[0.18] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,24rem)] lg:items-end">
              <div className="min-w-0">
                <div className="creativity-enter mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-black uppercase text-[var(--creative-cyan)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <Palette className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Creative Gallery</span>
                </div>

                <h1 className="creativity-enter max-w-4xl text-[clamp(2.15rem,8vw,5.8rem)] font-black leading-[0.95] tracking-normal text-white" style={{ animationDelay: '60ms' }}>
                  Creativity Hub
                </h1>
                <p className="creativity-enter mt-4 max-w-2xl text-base leading-7 text-white/[0.68] sm:text-lg" style={{ animationDelay: '120ms' }}>
                  Explore artwork, models, posters, designs, photography, and digital pieces from BeastBuck members.
                </p>
              </div>

              <div className="creativity-enter flex flex-col gap-3 lg:items-end" style={{ animationDelay: '180ms' }}>
                {showMemberAction && (
                  <Button
                    onClick={() => setShowUpload(true)}
                    className="w-full justify-center bg-[linear-gradient(135deg,var(--creative-cyan),var(--creative-violet),var(--creative-rose))] px-6 text-white shadow-[0_18px_44px_rgba(155,92,255,0.28)] sm:w-auto"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    Share Your Work
                  </Button>
                )}

                {showMembershipPrompt && (
                  <div className="w-full rounded-2xl border border-status-warning/25 bg-status-warning/10 p-4 text-sm font-bold leading-6 text-status-warning sm:max-w-sm">
                    <div className="flex items-start gap-2">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>
                        <Link to="/membership/apply" className="font-black text-status-warning underline-offset-4 hover:underline">
                          Apply for membership
                        </Link>
                        {' '}to share your work.
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  <MetricPill icon={ImageIcon} label="Works" value={stats.total} />
                  <MetricPill icon={Palette} label="Styles" value={stats.categories} />
                  <MetricPill icon={Star} label="Featured" value={stats.featured} />
                  <MetricPill icon={Heart} label="Likes" value={stats.likes} />
                </div>
              </div>
            </div>
          </section>

          <section className="relative mt-4 rounded-[1.35rem] border border-white/10 bg-[var(--creative-panel-strong)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)] xl:items-center">
              <div className="flex items-center gap-3 px-1">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--creative-cyan)]/12 text-[var(--creative-cyan)]">
                  <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-black leading-tight text-white">Discover Works</h2>
                  <p className="truncate text-sm font-bold text-white/[0.48]">{filteredAndSortedWorks.length} showing</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_10rem]">
                <label className="relative block">
                  <span className="sr-only">Search creative works</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.42]" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by title, creator, category..."
                    className="creativity-focus min-h-[46px] w-full rounded-2xl border border-white/10 bg-white/[0.055] pl-11 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-white/35 focus:border-[var(--creative-cyan)]/[0.55] focus:bg-white/[0.08]"
                  />
                </label>

                <label className="block">
                  <span className="sr-only">Filter by category</span>
                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="creativity-focus min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#121426] px-4 text-sm font-black text-white outline-none transition focus:border-[var(--creative-cyan)]/[0.55]"
                  >
                    <option value="all">All Categories</option>
                    {CREATIVE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="sr-only">Sort creative works</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="creativity-focus min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#121426] px-4 text-sm font-black text-white outline-none transition focus:border-[var(--creative-cyan)]/[0.55]"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Liked</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="relative mt-5">
            {loadError && (
              <div className="mb-4 flex items-start gap-2 rounded-2xl border border-status-danger/25 bg-status-danger/10 px-4 py-3 text-sm font-bold text-status-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{loadError}</span>
              </div>
            )}

            {loading ? (
              <CreativeSkeletonGrid />
            ) : filteredAndSortedWorks.length === 0 ? (
              <div className="creativity-enter rounded-[1.35rem] border border-dashed border-white/[0.14] bg-white/[0.035] px-5 py-12 text-center sm:px-8">
                <div className="creativity-float mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,var(--creative-cyan),var(--creative-violet),var(--creative-rose))] text-white shadow-[0_18px_44px_rgba(155,92,255,0.24)]">
                  <Palette className="h-8 w-8" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-black text-white">No creative works found</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/[0.58]">
                  Try a different search, category, or sort option.
                </p>
                {showMemberAction && (
                  <Button onClick={() => setShowUpload(true)} className="mt-6">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Share Your First Work
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {filteredAndSortedWorks.map((work, index) => (
                  <CreativeCard key={work.id} work={work} index={index} />
                ))}
              </div>
            )}
          </section>
        </div>
      </PageContainer>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
