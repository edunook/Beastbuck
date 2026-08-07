import { useState } from 'react';
import { X, Zap, Calendar, Tag, AlertCircle, CheckCircle2, Clock, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import Button from '@frontend/components/ui/Button';
import { TasksService } from '@services/firestore/tasks';
import { useAuth } from '../../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { AIContextPanel } from '../../ai/AIContextPanel';

const PRIORITY_STYLES = {
  LOW:    { bg: 'bg-white/5',             text: 'text-text-muted',      label: 'Low' },
  NORMAL: { bg: 'bg-accent/10',           text: 'text-accent',          label: 'Normal' },
  HIGH:   { bg: 'bg-yellow-400/10',       text: 'text-yellow-400',      label: 'High' },
  URGENT: { bg: 'bg-status-danger/10',    text: 'text-status-danger',   label: 'Urgent' },
};

const STATUS_CONFIG = {
  TODO:         { icon: Clock,        color: 'text-text-muted',    label: 'To Do' },
  IN_PROGRESS:  { icon: AlertCircle,  color: 'text-accent',        label: 'In Progress' },
  UNDER_REVIEW: { icon: Clock,        color: 'text-yellow-400',    label: 'Under Review' },
  COMPLETED:    { icon: CheckCircle2, color: 'text-status-success',label: 'Completed' },
  CANCELLED:    { icon: X,            color: 'text-status-danger', label: 'Cancelled' },
};

const TYPE_LABELS = {
  PERSONAL: 'Personal',
  TEAM:     'Team',
  GLOBAL:   'Global Mission',
};

export function TaskDetailModal({ task, onClose, onSubmitProof, onReview, onTaskUpdated }) {
  const { user, roleData } = useAuth();
  const [progress, setProgress] = useState(Math.max(0, Math.min(100, task.progressPercent || 0)));
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [progressError, setProgressError] = useState(null);

  if (!task) return null;

  const isLeader = hasPermission(roleData?.role, 'canAssignTasks');
  const isAssignee = task.assigneeIds?.includes(user?.uid) || task.type === 'GLOBAL';
  const canSubmitProof = isAssignee && ['TODO', 'IN_PROGRESS'].includes(task.status);
  const canUpdateProgress = isAssignee && !['COMPLETED', 'CANCELLED'].includes(task.status);
  const canReview = isLeader && task.status === 'UNDER_REVIEW';

  const prio = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.NORMAL;
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const StatusIcon = statusCfg.icon;

  const handleProgressSave = async () => {
    if (progress === (task.progressPercent || 0)) return;
    setUpdatingProgress(true);
    setProgressError(null);
    try {
      const newStatus = progress === 100 ? 'UNDER_REVIEW'
        : progress > 0 ? 'IN_PROGRESS'
        : 'TODO';
      await TasksService.updateProgress(task.id, progress, newStatus);
      onTaskUpdated?.({ ...task, progressPercent: progress, status: newStatus });
    } catch {
      setProgressError('Failed to save. Try again.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const getProgressMessage = () => {
    if (progress === 0) return 'Not started';
    if (progress < 100) return 'In progress';
    return 'Ready for review';
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-border/50 p-4 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest', prio.bg, prio.text)}>
                {prio.label}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-text-muted uppercase tracking-widest">
                {TYPE_LABELS[task.type] || task.type}
              </span>
              <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 uppercase tracking-widest', statusCfg.color)}>
                <StatusIcon className="w-3 h-3" />
                {statusCfg.label}
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold text-white leading-tight">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Description</h3>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Meta Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-black/20 rounded-xl p-3 border border-border/50">
              <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase tracking-widest mb-1">
                <Zap className="w-3 h-3" /> Base XP
              </div>
              <div className="text-lg font-bold text-accent">{task.baseXP || 0} XP</div>
            </div>
            {task.bonusXP > 0 && (
              <div className="bg-yellow-400/5 rounded-xl p-3 border border-yellow-400/20">
                <div className="flex items-center gap-1.5 text-yellow-400/70 text-[10px] uppercase tracking-widest mb-1">
                  <Zap className="w-3 h-3" /> Bonus XP
                </div>
                <div className="text-lg font-bold text-yellow-400">+{task.bonusXP} XP</div>
              </div>
            )}
            {task.dueDate && (
              <div className="bg-black/20 rounded-xl p-3 border border-border/50">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase tracking-widest mb-1">
                  <Calendar className="w-3 h-3" /> Due Date
                </div>
                <div className="text-sm font-bold text-white">
                  {task.dueDate?.toDate ? task.dueDate.toDate().toLocaleDateString() : task.dueDate}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase tracking-widest mb-2">
                <Tag className="w-3 h-3" /> Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="text-xs bg-white/5 border border-border/50 rounded-full px-3 py-1 text-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template info */}
          {task.templateId && (
            <div className="flex items-center gap-2 text-xs text-text-muted bg-white/5 rounded-xl px-3 py-2 border border-border/50">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Created from template</span>
            </div>
          )}

          {/* Progress */}
          {canUpdateProgress && (
            <div className="bg-black/20 rounded-2xl p-4 border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Your Progress</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-accent">{progress}%</span>
                  <span className="text-xs text-text-muted">- {getProgressMessage()}</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>0%</span>
                <span className="text-yellow-400/70">Set to 100% - submits for review</span>
                <span>100%</span>
              </div>
              {progressError && <p className="text-status-danger text-xs mt-2">{progressError}</p>}
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                onClick={handleProgressSave}
                disabled={updatingProgress || progress === (task.progressPercent || 0)}
              >
                {updatingProgress ? 'Saving...' : 'Update Progress'}
              </Button>
            </div>
          )}

          {/* Progress bar (read-only for non-assignees) */}
          {!canUpdateProgress && (
            <div>
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>Progress</span>
                <span>{task.progressPercent || 0}%</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-accent to-accent-alt h-full rounded-full transition-all duration-700"
                  style={{ width: `${task.progressPercent || 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.attachments?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Attachments</h3>
              <div className="space-y-2">
                {task.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-white/5 border border-border/50 rounded-xl px-4 py-3 text-sm text-white hover:bg-white/10 transition-all group"
                  >
                    <FileText className="w-4 h-4 text-text-muted" />
                    <span className="flex-1 truncate">{att.name}</span>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {/* AI Assistant */}
          <div className="px-6 pb-4">
            <AIContextPanel
              title="AI Task Assistant"
              actions={[
                {
                  label: 'Break Into Subtasks',
                  prompt: `Break this task into smaller subtasks: "${task.title}". Description: ${task.description || 'N/A'}. Provide a numbered list of 3-6 concrete subtasks.`,
                  mode: 'project',
                },
                {
                  label: 'Estimate Difficulty',
                  prompt: `Estimate the difficulty and effort required for this task: "${task.title}". Description: ${task.description || 'N/A'}. Rate on a scale of 1-10, give a time estimate, and explain the main challenges.`,
                  mode: 'project',
                },
                {
                  label: 'Suggest Approach',
                  prompt: `Suggest the best approach to complete this task: "${task.title}". Description: ${task.description || 'N/A'}. Give step-by-step guidance.`,
                  mode: 'project',
                },
              ]}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-border/50 p-4 flex gap-3 justify-end flex-wrap">
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>

          {canSubmitProof && (
            <Button variant="primary" size="sm" onClick={() => onSubmitProof?.(task)}>
              <Zap className="w-4 h-4 mr-1.5" />
              Submit Proof
            </Button>
          )}

          {canReview && (
            <Button variant="secondary" size="sm" onClick={() => onReview?.(task)}
              className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
            >
              Review Submission
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
