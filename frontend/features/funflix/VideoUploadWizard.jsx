import { useState } from 'react';
import { Film, ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { MediaUploader } from '@frontend/components/ui/MediaUploader';
import { uploadFile } from '@services/storage/storage';

export function VideoUploadWizard() {
  const [step, setStep] = useState(1);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [formData, setFormData] = useState({
    videoFile: null,
    thumbnailFile: null,
    title: '',
    description: '',
    category: 'comedy',
    tags: [],
    visibility: 'public',
    videoKey: null,
    videoURL: null,
    thumbnailKey: null,
    thumbnailURL: null,
  });

  const handleVideoUploaded = (mediaResult) => {
    setFormData(prev => ({
      ...prev,
      videoKey: mediaResult.objectKey,
      videoURL: mediaResult.url || mediaResult.cdnUrl,
      title: prev.title || mediaResult.sanitizedName || 'My Video',
    }));
  };

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const result = await uploadFile(file, { folder: 'funflix/thumbnails' });
      setFormData(prev => ({
        ...prev,
        thumbnailFile: file,
        thumbnailKey: result.key || result.objectKey,
        thumbnailURL: result.url || result.cdnUrl,
      }));
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
      alert('Failed to upload thumbnail image.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    alert('Video published successfully to FunFlix!');
  };

  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      videoFile: null,
      videoKey: null,
      videoURL: null,
    }));
  };

  const removeThumbnail = () => {
    setFormData(prev => ({
      ...prev,
      thumbnailFile: null,
      thumbnailKey: null,
      thumbnailURL: null,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Video</h1>
        <p className="text-text-muted">Direct high-speed Backblaze B2 upload & Cloudflare CDN streaming</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= stepNum
                ? 'border-accent bg-accent text-black'
                : 'border-border text-text-muted'
            }`}>
              {step > stepNum ? <Check className="h-5 w-5" /> : stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > stepNum ? 'bg-accent' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Upload Video File'}
            {step === 2 && 'Video Details'}
            {step === 3 && 'Thumbnail & Settings'}
            {step === 4 && 'Review & Publish'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              {!formData.videoURL ? (
                <MediaUploader
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                  folder="funflix/videos"
                  visibility={formData.visibility}
                  label="Click or drag video file here"
                  description="MP4, WebM, MOV, or M4V with resumable multipart upload"
                  onUploadSuccess={handleVideoUploaded}
                />
              ) : (
                <div className="border border-border rounded-xl p-5 bg-white/[0.03] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent">
                        <Film className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Video Ready for Streaming</p>
                        <p className="text-xs text-text-muted truncate max-w-md">{formData.videoKey}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeVideo}>
                      <X className="mr-2 h-4 w-4" /> Replace
                    </Button>
                  </div>
                  <video
                    src={formData.videoURL}
                    controls
                    className="w-full max-h-64 rounded-xl bg-black border border-border"
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your video..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="comedy">Comedy</option>
                  <option value="drama">Drama</option>
                  <option value="action">Action</option>
                  <option value="documentary">Documentary</option>
                  <option value="animation">Animation</option>
                  <option value="shorts">Shorts</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Tags (comma separated)</label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="e.g., funny, viral, creative"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Thumbnail</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  {formData.thumbnailURL ? (
                    <div className="space-y-3">
                      <img src={formData.thumbnailURL} alt="Thumbnail" className="max-h-48 mx-auto rounded-lg" />
                      <Button variant="ghost" size="sm" onClick={removeThumbnail}>
                        <X className="mr-2 h-4 w-4" /> Remove Thumbnail
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <p className="text-sm text-white font-medium mb-1">Upload thumbnail image</p>
                      <p className="text-xs text-text-muted mb-3">JPG, PNG, WebP or AVIF</p>
                      <input
                        type="file"
                        onChange={handleThumbnailUpload}
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        disabled={uploadingThumbnail}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition">
                        {uploadingThumbnail ? 'Uploading...' : 'Browse Image'}
                      </span>
                    </label>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="public">Public</option>
                  <option value="members">Members Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-white/[0.03]">
                <h3 className="font-bold text-white mb-2">{formData.title || 'Untitled'}</h3>
                <p className="text-sm text-text-soft">{formData.description || 'No description'}</p>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Category:</span>
                  <span className="text-white">{formData.category || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Visibility:</span>
                  <span className="text-white">{formData.visibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Storage Key:</span>
                  <span className="text-white text-xs font-mono">{formData.videoKey || 'Not uploaded'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Delivery:</span>
                  <span className="text-accent text-xs font-semibold">Cloudflare CDN Edge</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext} disabled={step === 1 && !formData.videoURL}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!formData.videoURL}>
                <Check className="mr-2 h-4 w-4" />
                Publish Video
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
