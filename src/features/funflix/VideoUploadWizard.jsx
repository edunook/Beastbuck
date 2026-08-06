import { useState } from 'react';
import { Upload, Film, FileText, ChevronRight, ChevronLeft, Check, Loader2, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { uploadToPinata } from '../../services/pinata';

export function VideoUploadWizard() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    videoFile: null,
    thumbnailFile: null,
    title: '',
    description: '',
    category: '',
    tags: [],
    visibility: 'public',
    videoCID: null,
    thumbnailCID: null,
  });

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToPinata(file);
      setFormData(prev => ({
        ...prev,
        videoFile: file,
        videoCID: result.cid,
        videoURL: result.url,
      }));
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToPinata(file);
      setFormData(prev => ({
        ...prev,
        thumbnailFile: file,
        thumbnailCID: result.cid,
        thumbnailURL: result.url,
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // In production, save to Firestore
    console.log('Video metadata:', formData);
    alert('Video uploaded successfully!');
  };

  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      videoFile: null,
      videoCID: null,
      videoURL: null,
    }));
    setUploadProgress(0);
  };

  const removeThumbnail = () => {
    setFormData(prev => ({
      ...prev,
      thumbnailFile: null,
      thumbnailCID: null,
      thumbnailURL: null,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Video</h1>
        <p className="text-text-muted">Share your content with the FunFlix community</p>
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
            <>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                {formData.videoFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Film className="h-12 w-12 text-accent" />
                      <div className="text-left">
                        <p className="font-bold text-white">{formData.videoFile.name}</p>
                        <p className="text-sm text-text-muted">{(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    {uploading && (
                      <div className="space-y-2">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-text-muted">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                    <Button variant="ghost" onClick={removeVideo}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-text-muted mb-4" />
                    <p className="text-white font-bold mb-2">Click to upload video</p>
                    <p className="text-sm text-text-muted mb-4">MP4, WebM, or MOV (max 2GB)</p>
                    <input
                      type="file"
                      onChange={handleVideoUpload}
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </>
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
                  <option value="">Select category</option>
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
                  {formData.thumbnailFile ? (
                    <div className="space-y-3">
                      <img src={formData.thumbnailURL} alt="Thumbnail" className="max-h-48 mx-auto rounded-lg" />
                      <Button variant="ghost" onClick={removeThumbnail}>
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="mx-auto h-8 w-8 text-text-muted mb-2" />
                      <p className="text-sm text-text-muted mb-2">Upload thumbnail image</p>
                      <input
                        type="file"
                        onChange={handleThumbnailUpload}
                        accept="image/*"
                        className="hidden"
                      />
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
                  <span className="text-text-muted">Video CID:</span>
                  <span className="text-white text-xs">{formData.videoCID || 'Not uploaded'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Thumbnail CID:</span>
                  <span className="text-white text-xs">{formData.thumbnailCID || 'Not uploaded'}</span>
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
              <Button onClick={handleNext} disabled={step === 1 && !formData.videoCID}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!formData.videoCID}>
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
