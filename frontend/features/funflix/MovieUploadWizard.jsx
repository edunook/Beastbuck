import { useState, useCallback } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { UploadCloud, X, Loader2, ImagePlus, CheckCircle2, Film } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@shared/lib/utils';
import { useAuth } from '../auth/AuthContext';
import { uploadFunFlixMedia, isCloudinaryConfigured } from '@services/storage/cloudinary';
import { uploadFile } from '@services/storage/ipfs';
import { FunFlixService } from '@services/firestore/funflix';

export default function MovieUploadWizard() {
  const navigate = useNavigate();
  const { user, roleData } = useAuth();

  // Video state
  const [videoFile, setVideoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Comedy Skit');
  const [visibility, setVisibility] = useState('Public');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Video handlers
  const validateAndSetVideo = useCallback((file) => {
    setUploadError('');
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid video file (MP4, WebM, or MOV)');
      return;
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadError('Video file exceeds 2 GB limit');
      return;
    }
    setVideoFile(file);
  }, []);

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetVideo(file);
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetVideo(file);
  };

  // Thumbnail handlers
  const validateAndSetThumbnail = useCallback((file) => {
    setUploadError('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Thumbnail must be a JPG, PNG, WebP, or GIF image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Thumbnail image exceeds 10 MB limit');
      return;
    }
    setThumbnailFile(file);
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
  }, []);

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetThumbnail(file);
  };

  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    setIsThumbnailDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetThumbnail(file);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview('');
  };

  // Submit
  const handleSubmit = async () => {
    if (!videoFile) { setUploadError('Please select a video file'); return; }
    if (!title.trim()) { setUploadError('Please enter a title'); return; }
    if (!isCloudinaryConfigured) {
      setUploadError('Storage is not configured. Please check environment variables.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // 1. Upload video
      setUploadStage('video');
      const uploadedVideo = await uploadFunFlixMedia(videoFile);

      // 2. Upload thumbnail if provided
      let thumbnailUrl = '';
      if (thumbnailFile) {
        setUploadStage('thumbnail');
        const uploadedThumb = await uploadFile(thumbnailFile, { folder: 'funflix/thumbnails' });
        thumbnailUrl = uploadedThumb.url;
      }

      // 3. Save to Firestore
      setUploadStage('saving');
      const creator = {
        uid: user?.uid,
        name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
        username: roleData?.username || user?.displayName || '',
      };

      await FunFlixService.createVideo({
        title: title.trim(),
        description: description.trim() || `A ${category} video`,
        category,
        videoUrl: uploadedVideo.url,
        thumbnail: thumbnailUrl,
        duration: 0,
        tags: [],
        visibility: visibility.toLowerCase(),
      }, creator);

      setUploadSuccess(true);
      setTimeout(() => navigate('/funflix'), 1500);
    } catch (error) {
      console.warn('Upload failed:', error?.code || error?.message);
      if (
        error?.code === 'permission-denied' ||
        error?.message?.includes('403') ||
        error?.message?.includes('permission')
      ) {
        setUploadError('You need to be an approved member to upload videos.');
      } else {
        setUploadError(error?.message || 'Upload failed. Please try again.');
      }
      setUploading(false);
    } finally {
      setUploadStage('');
    }
  };

  const stageLabel = { video: 'Uploading video...', thumbnail: 'Uploading thumbnail...', saving: 'Saving to FunFlix...' }[uploadStage] || 'Uploading...';

  return (
    <PageContainer>
      <PageHeader title="Upload to FunFlix" description="Share your creative short, skit, or series episode with the BeastBuck community." />

      <div className="max-w-3xl mx-auto space-y-6 pb-12">

        {/* Success Banner */}
        {uploadSuccess && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4 text-green-400 font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            Video published! Redirecting to your studio...
          </div>
        )}

        {/* Main Card */}
        <div className="bg-surface/40 border border-border rounded-xl p-6 sm:p-8 backdrop-blur-sm space-y-7">

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Video File <span className="text-[#E50914]">*</span>
            </label>
            <input id="video-upload" type="file" accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoSelect} className="hidden" disabled={uploading} />

            {!videoFile ? (
              <div
                onClick={() => document.getElementById('video-upload').click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleVideoDrop}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer select-none',
                  isDragging ? 'border-[#E50914] bg-[#E50914]/5 scale-[1.01]' : 'border-border hover:border-[#E50914]/50 hover:bg-white/[0.03]'
                )}
              >
                <UploadCloud className={cn('w-10 h-10 mx-auto mb-3 transition-colors', isDragging ? 'text-[#E50914]' : 'text-text-muted')} />
                <p className="text-sm font-bold text-white mb-1">{isDragging ? 'Drop your video here' : 'Click to browse or drag & drop'}</p>
                <p className="text-xs text-text-muted">MP4, WebM, MOV up to 2 GB</p>
              </div>
            ) : (
              <div className="border border-border rounded-xl p-4 bg-white/[0.03] flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E50914]/10 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-[#E50914]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{videoFile.name}</p>
                  <p className="text-xs text-text-muted">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={() => { setVideoFile(null); setUploadError(''); }}
                  disabled={uploading}
                  className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-white/5 transition disabled:opacity-40"
                  aria-label="Remove video">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Thumbnail Image
              <span className="ml-2 text-xs font-normal text-text-muted">(Recommended: 1280x720 - JPG, PNG, WebP)</span>
            </label>
            <input id="thumbnail-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleThumbnailSelect} className="hidden" disabled={uploading} />

            {!thumbnailFile ? (
              <div
                onClick={() => document.getElementById('thumbnail-upload').click()}
                onDragOver={(e) => { e.preventDefault(); setIsThumbnailDragging(true); }}
                onDragLeave={() => setIsThumbnailDragging(false)}
                onDrop={handleThumbnailDrop}
                className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none',
                  isThumbnailDragging ? 'border-[#E50914] bg-[#E50914]/5 scale-[1.01]' : 'border-border hover:border-[#E50914]/50 hover:bg-white/[0.03]'
                )}
              >
                <ImagePlus className={cn('w-8 h-8 mx-auto mb-2 transition-colors', isThumbnailDragging ? 'text-[#E50914]' : 'text-text-muted')} />
                <p className="text-sm font-bold text-white mb-1">{isThumbnailDragging ? 'Drop thumbnail here' : 'Click to add thumbnail'}</p>
                <p className="text-xs text-text-muted">This image appears on movie cards and the hero banner</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border bg-black group">
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full max-h-64 object-cover" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" onClick={() => document.getElementById('thumbnail-upload').click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition disabled:opacity-40">
                    Change
                  </button>
                  <button type="button" onClick={removeThumbnail} disabled={uploading}
                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-bold transition disabled:opacity-40">
                    Remove
                  </button>
                </div>
                {/* File name badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                  <p className="text-xs text-white/80 truncate">{thumbnailFile.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Title <span className="text-[#E50914]">*</span>
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title..." maxLength={100} disabled={uploading}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white placeholder:text-text-muted focus:outline-none focus:border-[#E50914]/60 transition disabled:opacity-50" />
            <p className="text-xs text-text-muted text-right mt-1">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your video about?" rows={3} maxLength={500} disabled={uploading}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white placeholder:text-text-muted focus:outline-none focus:border-[#E50914]/60 transition resize-none disabled:opacity-50" />
            <p className="text-xs text-text-muted text-right mt-1">{description.length}/500</p>
          </div>

          {/* Category + Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={uploading}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E50914]/60 transition disabled:opacity-50">
                <option>Comedy Skit</option>
                <option>Team Movie</option>
                <option>Challenge Entry</option>
                <option>Mini Series</option>
                <option>Documentary</option>
                <option>Tutorial</option>
                <option>Short Film</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} disabled={uploading}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E50914]/60 transition disabled:opacity-50">
                <option>Public</option>
                <option>Members Only</option>
                <option>Private</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {uploadError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{uploadError}</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="flex items-center gap-3 bg-[#E50914]/10 border border-[#E50914]/30 rounded-lg px-4 py-3">
              <Loader2 className="w-4 h-4 text-[#E50914] animate-spin shrink-0" />
              <p className="text-sm text-[#E50914] font-medium">{stageLabel}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/funflix"
            className="px-6 py-2.5 rounded-lg font-bold text-white bg-white/10 hover:bg-white/20 transition">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={uploading || uploadSuccess}
            className="px-8 py-2.5 rounded-lg font-bold text-black bg-[#E50914] hover:bg-[#b20710] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{stageLabel}</>
            ) : uploadSuccess ? (
              <><CheckCircle2 className="w-4 h-4" />Published!</>
            ) : (
              <><UploadCloud className="w-4 h-4" />Publish to FunFlix</>
            )}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
