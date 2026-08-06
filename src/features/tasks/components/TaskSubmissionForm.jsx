import { useState } from 'react';
import { X, Upload, Trash2, FileText, Link, Zap } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { TasksService } from '../../../services/firebase/tasks';
import { useAuth } from '../../auth/AuthContext';
import { isCloudinaryConfigured, uploadProofFile } from '../../../services/cloudinary/uploads';

export function TaskSubmissionForm({ task, onClose, onSuccess }) {
  const { user } = useAuth();
  const [proofText, setProofText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [newAttach, setNewAttach] = useState({ name: '', url: '', type: 'link' });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!task) return null;

  const addAttachment = () => {
    const url = newAttach.url?.trim();
    if (!url) return;
    if (attachments.length >= 10) {
      setError('You can attach up to 10 proof files or links.');
      return;
    }
    setAttachments(prev => [...prev, {
      type: newAttach.type || 'link',
      name: newAttach.name?.trim() || url,
      url: url,
      uploadedAt: new Date().toISOString(),
    }]);
    setNewAttach({ name: '', url: '', type: 'link' });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (attachments.length >= 10) {
      setError('You can attach up to 10 proof files or links.');
      return;
    }

    setUploadingFile(true);
    setError(null);

    try {
      const attachment = await uploadProofFile(file, {
        folder: `beastbuck/tasks/${task.id}`,
      });
      setAttachments(prev => [...prev, attachment]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'File upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofText.trim()) { setError('Please describe your work.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await TasksService.submitTaskProof(task.id, user.uid, proofText.trim(), attachments);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-border/50 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <h2 className="font-heading font-bold text-white">Submit Proof</h2>
            </div>
            <p className="text-xs text-text-muted line-clamp-1">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-5">

          {/* XP Reminder */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <Zap className="w-4 h-4 text-accent shrink-0" />
            <p className="text-sm text-white/80">
              Complete this mission to earn <span className="font-bold text-accent">{task.baseXP} XP</span>
              {task.bonusXP > 0 && <span className="text-yellow-400"> + up to {task.bonusXP} bonus XP</span>}
            </p>
          </div>

          {/* Proof Text */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
              Work Description <span className="text-status-danger">*</span>
            </label>
            <textarea
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="Describe what you accomplished, how you completed the task, and any relevant details..."
              rows={5}
              required
              className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none transition-all custom-scrollbar"
            />
            <div className="text-right text-[10px] text-text-muted mt-1">{proofText.length} chars</div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
              <div className="flex items-center gap-1.5">
                <Link className="w-3 h-3" /> Proof Links / References
              </div>
            </label>

            {/* Existing attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 border border-border/50 rounded-xl px-3 py-2">
                    <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="flex-1 text-xs text-white truncate">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-status-danger/60 hover:text-status-danger transition-colors p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new attachment */}
            <div className="bg-black/20 border border-border/50 rounded-xl p-3 space-y-2">
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Upload proof file</div>
                    <p className="mt-0.5 text-[10px] text-text-muted">
                      Images, videos, and documents upload to Cloudinary.
                    </p>
                  </div>
                  <label
                    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border/50 px-3 py-2 text-xs font-bold text-white transition-all ${
                      isCloudinaryConfigured && !uploadingFile
                        ? 'bg-white/10 hover:bg-white/20'
                        : 'bg-white/5 opacity-50'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingFile ? 'Uploading...' : 'Choose file'}
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileUpload}
                      disabled={!isCloudinaryConfigured || uploadingFile}
                    />
                  </label>
                </div>
                {!isCloudinaryConfigured && (
                  <p className="mt-2 text-[10px] text-status-warning">
                    Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to enable uploads.
                  </p>
                )}
              </div>

              <select
                value={newAttach.type}
                onChange={(e) => setNewAttach(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-black/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent/50"
              >
                <option value="link">Link / URL</option>
                <option value="image">Image URL</option>
                <option value="document">Document URL</option>
                <option value="video">Video URL</option>
              </select>
              <input
                type="text"
                placeholder="Display name (optional)"
                value={newAttach.name}
                onChange={(e) => setNewAttach(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-black/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={newAttach.url}
                  onChange={(e) => setNewAttach(p => ({ ...p, url: e.target.value }))}
                  className="flex-1 bg-black/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
                <button
                  type="button"
                  onClick={addAttachment}
                  disabled={!newAttach.url.trim()}
                  className="px-3 py-1.5 rounded-lg bg-white/10 border border-border/50 text-xs text-white hover:bg-white/20 disabled:opacity-40 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">
              Cloudinary uploads and external links supported. Max 10 attachments.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-status-danger/10 border border-status-danger/20 rounded-xl px-4 py-3 text-sm text-status-danger">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting || !proofText.trim()}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
