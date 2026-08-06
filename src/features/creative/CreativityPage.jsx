import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Sparkles, Upload, X, Search, Filter, TrendingUp, Clock, Palette, Plus, ChevronDown, Loader2, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { LoadingState } from '../../components/ui/UIElements';
import Button from '../../components/ui/Button';
import { uploadCreativeMedia, isIPFSConfigured as isStorageConfigured } from '../../services/ipfs/storage';
import { CREATIVE_CATEGORIES, CreativeService } from '../../services/firebase/creative';
import { MembershipService } from '../../services/firebase/membership';
import { cn } from '../../lib/utils';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Drawing',
  media: [],
};

// Animation keyframes
const animations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.5s ease-out forwards;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-dark {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

function CreativeCard({ work, index, onLike, hasLiked }) {
  const firstMedia = work.media?.[0];
  const isVideo = firstMedia?.type === 'video';
  const isImage = firstMedia?.type === 'image';

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl glass-dark transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:scale-[1.02]",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Media */}
      <div className="relative w-full overflow-hidden">
        {isImage && (
          <img
            src={firstMedia.url}
            alt={work.title}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        {isVideo && (
          <video
            src={firstMedia.url}
            className="w-full h-auto object-cover"
            muted
            loop
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => e.target.pause()}
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full space-y-2 p-4 transition-transform duration-300 group-hover:translate-y-0">
          <Link
            to={`/workspace/creative/${work.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-accent/80"
          >
            <Sparkles className="h-4 w-4" />
            View Work
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">
            {work.category}
          </span>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Heart className={cn("h-3.5 w-3.5", hasLiked ? "fill-status-danger text-status-danger" : "")} />
              {Array.isArray(work.likes) ? work.likes.length : work.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {work.views || 0}
            </span>
          </div>
        </div>
        
        <h3 className="line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-accent">
          {work.title}
        </h3>
        
        <p className="mt-1 text-xs text-text-muted">
          By {work.creatorName || work.creatorUsername || 'Member'}
        </p>
      </div>
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

  if (!isOpen) return null;

  const updateField = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const uploadFiles = async (files) => {
    console.log('Starting file upload:', files);
    if (!files.length) return;
    
    // Limit to one file per post
    if (form.media.length >= 1) {
      setUploadError('You can only upload one image or video per post. Remove the existing media first.');
      return;
    }
    
    if (files.length > 1) {
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
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}:`, file.name, file.type, file.size);
        setUploadProgress(Math.round(((i) / files.length) * 100));
        
        try {
          const result = await uploadCreativeMedia(file);
          console.log('Upload successful for:', file.name, result);
          uploaded.push(result);
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          setUploadError(`Failed to upload ${file.name}: ${err.message}`);
        }
      }

      console.log('Upload complete. Total uploaded:', uploaded.length);
      if (uploaded.length > 0) {
        updateField('media', [...form.media, ...uploaded]);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started. Form data:', form);
    
    // Check membership status before allowing upload
    const isApprovedMember = await MembershipService.isApprovedMember(user?.uid);
    if (!isApprovedMember) {
      setUploadError('You must be an approved member to upload creative works. Please apply for membership first.');
      return;
    }
    
    if (!form.title.trim() || form.media.length === 0) {
      console.error('Validation failed:', { title: form.title, description: form.description, media: form.media });
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
      console.log('Submitting to Firestore with creator:', creator);
      await onSubmit({ ...form, creator });
      console.log('Firestore submission successful');
      onClose();
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('Submit failed:', err);
      setUploadError('Failed to submit creative work. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-dark p-6 animate-scale-in mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent animate-float" />
            Share Your Creativity
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Inspire others with your creative work
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-white">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Give your work a catchy title"
              maxLength={100}
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              >
                {CREATIVE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Tell us about your creative work..."
              rows={4}
              maxLength={500}
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Media *</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                uploadFiles(e.dataTransfer.files);
              }}
              className={cn(
                "relative rounded-2xl border-2 border-dashed p-8 text-center transition-all",
                isDragging ? "border-accent bg-accent/10" : "border-border bg-white/5 hover:border-accent/50"
              )}
            >
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="mx-auto h-12 w-12 text-accent animate-spin" />
                  <p className="text-sm font-medium text-white">Uploading to IPFS...</p>
                  <div className="mx-auto max-w-xs">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-text-muted">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className={cn("mx-auto h-12 w-12 mb-3", isDragging ? "text-accent" : "text-text-muted")} />
                  <p className="text-sm font-medium text-white">
                    {isDragging ? 'Drop files here' : 'Drag and drop your images or videos'}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">or</p>
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent/80 transition-colors">
                    Browse Files
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => uploadFiles(e.target.files || [])}
                      disabled={uploading}
                    />
                  </label>
                  <p className="mt-3 text-xs text-text-muted">
                    Supports: JPEG, PNG, GIF, WebP, MP4, WebM (Max 10MB images, 2GB videos)
                  </p>
                </>
              )}
            </div>

            {uploadSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-status-success/10 border border-status-success/20 px-4 py-2">
                <CheckCircle className="h-4 w-4 text-status-success" />
                <span className="text-sm text-status-success">Files uploaded successfully to IPFS!</span>
              </div>
            )}

            {uploadError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-status-danger/10 border border-status-danger/20 px-4 py-2">
                <AlertCircle className="h-4 w-4 text-status-danger" />
                <span className="text-sm text-status-danger">{uploadError}</span>
              </div>
            )}

            {form.media.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-bold text-white">Uploaded Files ({form.media.length})</p>
                <div className="grid grid-cols-4 gap-2">
                  {form.media.map((item, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                      {item.type === 'image' ? (
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <video src={item.url} className="h-full w-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => updateField('media', form.media.filter((_, i) => i !== idx))}
                          className="rounded-full bg-status-danger p-2 text-white hover:bg-status-danger/80 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                        <p className="text-[10px] text-white truncate">{item.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1"
            >
              {submitting ? 'Publishing...' : 'Publish Work'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreativityPage() {
  const { user, roleData } = useAuth();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isApprovedMember, setIsApprovedMember] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadWorks = async () => {
      try {
        const data = await CreativeService.searchCreativeWorks({ status: 'PUBLISHED' });
        if (mounted) setWorks(data);
      } catch (err) {
        console.error('Failed to load works:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const checkMembership = async () => {
      if (user?.uid) {
        const isMember = await MembershipService.isApprovedMember(user.uid);
        if (mounted) setIsApprovedMember(isMember);
      }
    };

    loadWorks();
    checkMembership();
    return () => { mounted = false; };
  }, [user?.uid]);

  const filteredAndSortedWorks = useMemo(() => {
    let filtered = [...works];
    
    if (filter !== 'all') {
      filtered = filtered.filter(w => w.category === filter);
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (Array.isArray(b.likes) ? b.likes.length : b.likes || 0) - (Array.isArray(a.likes) ? a.likes.length : a.likes || 0));
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return filtered;
  }, [works, filter, sortBy]);

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
    // Reload works
    const data = await CreativeService.searchCreativeWorks({ status: 'PUBLISHED' });
    setWorks(data);
  };

  return (
    <>
      <style>{animations}</style>
      <PageContainer>
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-purple-500/10 to-pink-500/10 p-8 md:p-12 animate-fade-in">
          <div className="absolute inset-0 shimmer" />
          <div className="relative z-10">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                  <Palette className="h-10 w-10 text-accent animate-float" />
                  Creativity Hub
                </h1>
                <p className="text-lg text-text-muted max-w-xl">
                  Discover amazing creative works from our community. Share your art, designs, and inspire others.
                </p>
              </div>
              {user && isApprovedMember && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-6 py-3 text-base"
                >
                  <Plus className="h-5 w-5" />
                  Share Your Work
                </Button>
              )}
              {user && !isApprovedMember && (
                <div className="flex items-center gap-2 rounded-xl bg-status-warning/10 border border-status-warning/20 px-4 py-2">
                  <Lock className="h-4 w-4 text-status-warning" />
                  <span className="text-sm text-status-warning">
                    <Link to="/membership/apply" className="hover:underline">Apply for membership</Link> to share your work
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search creative works..."
              className="w-full rounded-xl border border-border bg-white/5 pl-10 pr-4 py-2.5 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          >
            <option value="all">All Categories</option>
            {CREATIVE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Liked</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoadingState text="Loading creative works..." />
          </div>
        ) : filteredAndSortedWorks.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center animate-fade-in">
            <Palette className="mx-auto mb-4 h-16 w-16 text-text-muted" />
            <h2 className="text-2xl font-bold text-white mb-2">No creative works yet</h2>
            <p className="text-text-muted mb-6">Be the first to share your creativity with the community!</p>
            {user && (
              <Button onClick={() => setShowUpload(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Share Your First Work
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedWorks.map((work, index) => (
              <CreativeCard
                key={work.id}
                work={work}
                index={index}
                hasLiked={false}
                onLike={() => {}}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
