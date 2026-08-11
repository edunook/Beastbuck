import React, { useState } from 'react';
import { X, Zap, Calendar, Tag, AlertCircle, CheckCircle2, Clock, ChevronRight, FileText, User, Target, Award } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import Button from '@frontend/components/ui/Button';
import { TasksService } from '@services/firestore/tasks';
import { useAuth } from '../../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { AIContextPanel } from '../../ai/AIContextPanel';

const PRIORITY_STYLES = {
  LOW:    { bg: 'bg-gray-500/20',  text: 'text-gray-400',  label: 'Low' },
  NORMAL: { bg: 'bg-accent/20',    text: 'text-accent',     label: 'Normal' },
  HIGH:   { bg: 'bg-yellow-500/20',text: 'text-yellow-400',label: 'High' },
  URGENT: { bg: 'bg-red-500/20',   text: 'text-red-400',   label: 'Urgent' },
};

const STATUS_CONFIG = {
  TODO:         { icon: Clock,        color: 'text-gray-400',  label: 'To Do' },
  IN_PROGRESS:  { icon: AlertCircle,  color: 'text-accent',     label: 'In Progress' },
  UNDER_REVIEW: { icon: Clock,        color: 'text-yellow-400',label: 'Under Review' },
  COMPLETED:    { icon: CheckCircle2, color: 'text-green-400', label: 'Completed' },
  CANCELLED:    { icon: X,            color: 'text-red-400',   label: 'Cancelled' },
};

const TYPE_CONFIG = {
  PERSONAL: { label: 'Personal', icon: User },
  TEAM:     { label: 'Team',     icon: Target },
  GLOBAL:   { label: 'Global Mission', icon: Award },
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
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-3xl shadow-2xl scrollbar-hide">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-xl border-b border-white/10 p-4 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={cn('text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest', prio.bg, prio.text)}>
                {prio.label}
              </span>
              {TYPE_CONFIG[task.type] && (
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 text-text-muted uppercase tracking-widest flex items-center gap-1">
                  {React.createElement(TYPE_CONFIG[task.type].icon, { className: "h-3 w-3" })}
                  {TYPE_CONFIG[task.type].label}
                </span>
              )}
              <span className={cn('flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 uppercase tracking-widest', statusCfg.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusCfg.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* Description */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-3">Description</h3>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Meta Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <div className="flex items-center gap-1.5 text-text-muted text-[10px] sm:text-xs uppercase tracking-widest mb-2">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" /> Base XP
              </div>
              <div className="text-lg sm:text-xl font-bold text-accent">{task.baseXP || 0} XP</div>
            </div>
            {task.bonusXP > 0 && (
              <div className="bg-yellow-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-yellow-500/20">
                <div className="flex items-center gap-1.5 text-yellow-400/70 text-[10px] sm:text-xs uppercase tracking-widest mb-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" /> Bonus XP
                </div>
                <div className="text-lg sm:text-xl font-bold text-yellow-400">+{task.bonusXP} XP</div>
              </div>
            )}
            {task.dueDate && (
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] sm:text-xs uppercase tracking-widest mb-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" /> Due Date
                </div>
                <div className="text-sm sm:text-base font-bold text-white">
                  {task.dueDate?.toDate ? task.dueDate.toDate().toLocaleDateString() : task.dueDate}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-text-muted text-[10px] sm:text-xs uppercase tracking-widest mb-3">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4" /> Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="text-xs sm:text-sm bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template info */}
          {task.templateId && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted bg-white/5 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-white/10">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Created from template</span>
            </div>
          )}

          {/* Progress */}
          {canUpdateProgress && (
            <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest">Your Progress</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-accent">{progress}%</span>
                  <span className="text-xs sm:text-sm text-text-muted">- {getProgressMessage()}</span>
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
              <div className="flex justify-between text-[10px] sm:text-xs text-text-muted mt-1">
                <span>0%</span>
                <span className="text-yellow-400/70 hidden sm:inline">Set to 100% - submits for review</span>
                <span className="text-yellow-400/70 sm:hidden">100% = review</span>
                <span>100%</span>
              </div>
              {progressError && <p className="text-red-400 text-xs mt-2">{progressError}</p>}
              <Button
                onClick={handleProgressSave}
                disabled={updatingProgress || progress === (task.progressPercent || 0)}
                className="mt-3 w-full text-sm sm:text-base"
              >
                {updatingProgress ? 'Saving...' : 'Update Progress'}
              </Button>
            </div>
          )}

          {/* Progress bar (read-only for non-assignees) */}
          {!canUpdateProgress && (
            <div>
              <div className="flex justify-between text-xs sm:text-sm text-text-muted mb-2">
                <span>Progress</span>
                <span className="font-bold text-white">{task.progressPercent || 0}%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all duration-700"
                  style={{ width: `${task.progressPercent || 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.attachments?.length > 0 && (
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-3">Attachments</h3>
              <div className="space-y-2">
                {task.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 text-sm sm:text-base text-white hover:bg-white/10 transition-all group"
                  >
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
                    <span className="flex-1 truncate">{att.name}</span>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted group-hover:text-white transition-colors" />
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
        <div className="sticky bottom-0 bg-black/50 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6 flex gap-3 sm:gap-4 justify-end flex-wrap">
          <Button variant="secondary" onClick={onClose} className="text-sm sm:text-base">Close</Button>

          {canSubmitProof && (
            <Button onClick={() => onSubmitProof?.(task)} className="text-sm sm:text-base">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Submit Proof
            </Button>
          )}

          {canReview && (
            <Button 
              variant="secondary" 
              onClick={() => onReview?.(task)}
              className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 text-sm sm:text-base"
            >
              Review Submission
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
