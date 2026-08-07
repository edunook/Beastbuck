import { useState } from 'react';
import { Upload, X, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { isCloudinaryConfigured, uploadChallengeMedia } from '@services/storage/cloudinary';

export default function ChallengeSubmissionForm({ onSubmit, isSubmitting }) {
  const [content, setContent] = useState('');
  const [links, setLinks] = useState(['']);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ content: '', links: [] });

  const validateContent = (value) => {
    if (value.length > 5000) {
      return 'Description must be less than 5000 characters';
    }
    return '';
  };

  const validateUrl = (url) => {
    if (!url.trim()) return '';
    try {
      new URL(url);
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleFileSelect = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length || !isCloudinaryConfigured) return;

    setUploading(true);
    setError(null);
    try {
      const uploadPromises = selected.map(file => uploadChallengeMedia(file));
      const results = await Promise.all(uploadPromises);
      setFiles(prev => [...prev, ...results]);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Media upload failed. Try a smaller file or check Cloudinary settings.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateLink = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
    
    const newLinkErrors = [...fieldErrors.links];
    newLinkErrors[index] = validateUrl(value);
    setFieldErrors(prev => ({ ...prev, links: newLinkErrors }));
  };

  const addLink = () => setLinks([...links, '']);

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const contentError = validateContent(content);
    const linkErrors = links.map(validateUrl);
    
    setFieldErrors({ content: contentError, links: linkErrors });
    
    if (contentError || linkErrors.some(err => err)) {
      setError('Please fix the validation errors before submitting.');
      return;
    }
    
    if (!content.trim() && files.length === 0 && links.filter(l => l.trim()).length === 0) {
      setError('Please provide a description, file, or link for your submission.');
      return;
    }
    
    onSubmit({
      content,
      media: files,
      links: links.filter(l => l.trim())
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border/60 bg-surface/50 p-6">
      <div>
        <h3 className="mb-1 font-heading text-xl font-bold text-white">Submit Your Entry</h3>
        <p className="text-sm text-text-muted">Showcase your work to the judges.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-status-danger/10 p-3 text-sm text-status-danger border border-status-danger/20">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-text-soft">
          Description <span className="text-text-muted font-normal">({content.length}/5000)</span>
        </label>
        <textarea
          value={content}
          onChange={e => {
            const value = e.target.value;
            setContent(value);
            setFieldErrors(prev => ({ ...prev, content: validateContent(value) }));
          }}
          placeholder="Explain your solution, approach, or project..."
          rows={5}
          className={`w-full rounded-xl border bg-black/20 p-3 text-white placeholder-text-muted/50 focus:outline-none focus:ring-1 ${
            fieldErrors.content 
              ? 'border-status-danger focus:border-status-danger focus:ring-status-danger' 
              : 'border-border focus:border-accent focus:ring-accent'
          }`}
        />
        {fieldErrors.content && (
          <p className="mt-1 text-xs text-status-danger">{fieldErrors.content}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-text-soft">Media Uploads</label>
        <div className="flex flex-wrap gap-4">
          {files.map((file, i) => (
            <div key={i} className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-black/40">
              {file.resourceType === 'image' ? (
                <img src={file.url} alt="Upload" className="h-full w-full object-cover" />
              ) : file.resourceType === 'video' ? (
                <video src={file.url} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-xs text-text-muted break-all px-2">{file.originalName}</div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-status-danger"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <label className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border transition-colors ${
            !isCloudinaryConfigured || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent hover:bg-accent/5'
          }`}>
            {uploading ? <Loader2 className="h-6 w-6 animate-spin text-accent" /> : <Upload className="h-6 w-6 text-text-muted" />}
            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Add</span>
            <input
              type="file"
              multiple
              className="hidden"
              disabled={!isCloudinaryConfigured || uploading}
              onChange={handleFileSelect}
            />
          </label>
        </div>
        {!isCloudinaryConfigured && (
          <p className="mt-2 text-xs text-status-warning">Cloudinary is not configured. Media uploads are disabled.</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-text-soft">External Links (GitHub, Figma, etc.)</label>
        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="url"
                  value={link}
                  onChange={e => updateLink(i, e.target.value)}
                  placeholder="https://..."
                  className={`w-full rounded-xl border bg-black/20 py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none ${
                    fieldErrors.links[i]
                      ? 'border-status-danger focus:border-status-danger'
                      : 'border-border focus:border-accent'
                  }`}
                />
                {fieldErrors.links[i] && (
                  <p className="mt-1 text-xs text-status-danger">{fieldErrors.links[i]}</p>
                )}
              </div>
              {links.length > 1 && (
                <button type="button" onClick={() => removeLink(i)} className="rounded-xl border border-border px-3 text-text-muted hover:bg-white/5 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addLink} className="text-xs font-bold text-accent hover:text-accent-hover">
            + Add another link
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-black transition-all hover:bg-accent-hover disabled:opacity-50"
      >
        {isSubmitting ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>
        ) : (
          <><CheckCircle2 className="h-5 w-5" /> Submit Entry</>
        )}
      </button>
    </form>
  );
}
