import { cn } from '@shared/lib/utils';
import { CheckCircle2, Clock, AlertCircle, Zap, Flame, Target, Calendar } from 'lucide-react';

const PRIORITY_CONFIG = {
  LOW: {
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    label: 'Low'
  },
  NORMAL: {
    color: 'text-accent',
    bg: 'bg-accent/20',
    border: 'border-accent/30',
    label: 'Normal'
  },
  HIGH: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    label: 'High'
  },
  URGENT: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    label: 'Urgent'
  },
};

const STATUS_CONFIG = {
  TODO: {
    icon: Clock,
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    label: 'To Do'
  },
  IN_PROGRESS: {
    icon: AlertCircle,
    color: 'text-accent',
    bg: 'bg-accent/20',
    label: 'In Progress'
  },
  UNDER_REVIEW: {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    label: 'Under Review'
  },
  COMPLETED: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    label: 'Completed'
  },
  CANCELLED: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    label: 'Cancelled'
  },
};

export function TaskCard({ task, onClick }) {
  if (!task) return null;

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const StatusIcon = status.icon;

  return (
    <div
      onClick={() => onClick?.(task)}
      className="group relative rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 cursor-pointer hover:border-accent/50 hover:bg-white/10 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300"
    >
      {/* Priority Badge */}
      <div className="absolute top-3 right-3">
        <span className={cn(
          "text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg border",
          priority.bg,
          priority.color,
          priority.border
        )}>
          {priority.label}
        </span>
      </div>

      {/* Header */}
      <div className="mb-3 sm:mb-4 pr-16">
        <h4 className="font-bold text-white text-sm sm:text-base line-clamp-2 leading-tight group-hover:text-accent transition-colors">
          {task.title || 'Untitled Task'}
        </h4>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-text-muted line-clamp-2 mb-4">
        {task.description || 'No description'}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] sm:text-xs text-text-muted mb-1.5">
          <span>Progress</span>
          <span className="font-bold text-white">{task.progressPercent || 0}%</span>
        </div>
        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, task.progressPercent || 0))}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs sm:text-sm border-t border-white/10 pt-3">
        <div className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-lg",
          status.bg
        )}>
          <StatusIcon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", status.color)} />
          <span className={cn("font-medium", status.color)}>{status.label}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-accent">
          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{task.baseXP || 0} XP</span>
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-[10px] sm:text-xs px-2 py-0.5 rounded-lg bg-white/5 text-text-muted"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-lg bg-white/5 text-text-muted">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center gap-1.5 mt-3 text-[10px] sm:text-xs text-text-muted">
          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}
