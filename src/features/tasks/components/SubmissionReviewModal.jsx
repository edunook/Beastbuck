import { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Zap, FileText, ExternalLink, Loader2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { TasksService } from '../../../services/firebase/tasks';

export function SubmissionReviewModal({ task, onClose, onReviewed }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [feedback, setFeedback] = useState('');
  const [bonusXP, setBonusXP] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!task) return;
    const load = async () => {
      setLoading(true);
      try {
        const sub = await TasksService.getSubmissionForTask(task.id);
        setSubmission(sub);
      } catch {
        setError('Could not load submission.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [task]);

  if (!task) return null;

  const handleReview = async () => {
    if (!submission) return;
    setSubmitting(true);
    setError(null);
    try {
      await TasksService.reviewSubmission(
        submission.id,
        task.id,
        submission.authorId,
        decision,
        feedback.trim(),
        task.baseXP || 0,
        decision === 'APPROVED' ? Number(bonusXP) : 0
      );
      onReviewed?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      setError('Review failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalXP = (task.baseXP || 0) + (decision === 'APPROVED' ? Number(bonusXP) : 0);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-surface border border-yellow-400/20 rounded-2xl shadow-2xl custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-border/50 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <h2 className="font-heading font-bold text-white">Review Submission</h2>
            </div>
            <p className="text-xs text-text-muted line-clamp-1">{task.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5">

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading submission...</span>
            </div>
          ) : !submission ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No pending submission found for this task.
            </div>
          ) : (
            <>
              {/* Submission Content */}
              <div className="bg-black/20 border border-border/50 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Work Description</h3>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {submission.proofText}
                </p>
              </div>

              {/* Attachments */}
              {submission.attachments?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Proof Attachments</h3>
                  <div className="space-y-2">
                    {submission.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 bg-white/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all group"
                      >
                        <FileText className="w-4 h-4 text-text-muted shrink-0" />
                        <span className="flex-1 truncate text-xs">{att.name || att.url}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Toggle */}
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Decision</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      decision === 'APPROVED'
                        ? 'border-status-success bg-status-success/10 text-status-success'
                        : 'border-border/50 bg-black/20 text-text-muted hover:border-status-success/50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      decision === 'REJECTED'
                        ? 'border-status-danger bg-status-danger/10 text-status-danger'
                        : 'border-border/50 bg-black/20 text-text-muted hover:border-status-danger/50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Bonus XP (only when approving) */}
              {decision === 'APPROVED' && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">XP Award</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-muted">Total</div>
                      <div className="text-lg font-bold text-accent">{totalXP} XP</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-black/20 rounded-lg px-3 py-2 text-center">
                      <div className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Base XP</div>
                      <div className="font-bold text-white">{task.baseXP || 0}</div>
                    </div>
                    <div className="bg-black/20 rounded-lg px-3 py-2">
                      <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Bonus XP</div>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        step="10"
                        value={bonusXP}
                        onChange={(e) => setBonusXP(Math.max(0, Math.min(500, Number(e.target.value))))}
                        className="w-full bg-transparent text-yellow-400 font-bold text-center focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted">
                    Bonus XP rewards exceptional work. Optional - max 500 bonus XP per task.
                  </p>
                </div>
              )}

              {/* Feedback */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                  Feedback {decision === 'REJECTED' && <span className="text-status-danger">*</span>}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={decision === 'APPROVED'
                    ? 'Optional: Great job! Add encouraging feedback...'
                    : 'Required: Explain what needs improvement...'}
                  rows={3}
                  required={decision === 'REJECTED'}
                  className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none transition-all"
                />
              </div>

              {error && (
                <div className="bg-status-danger/10 border border-status-danger/20 rounded-xl px-4 py-3 text-sm text-status-danger">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={decision === 'APPROVED' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={handleReview}
                  disabled={submitting || (decision === 'REJECTED' && !feedback.trim())}
                  className="flex-1"
                >
                  {submitting ? 'Processing...' : decision === 'APPROVED' ? `Approve & Award ${totalXP} XP` : 'Reject & Return'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
