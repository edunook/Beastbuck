import { Card, CardContent } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const PRIORITY_COLORS = {
  LOW: 'text-text-muted',
  NORMAL: 'text-accent',
  HIGH: 'text-yellow-400',
  URGENT: 'text-status-danger'
};

const STATUS_ICONS = {
  TODO: Clock,
  IN_PROGRESS: AlertCircle,
  UNDER_REVIEW: Clock,
  COMPLETED: CheckCircle2,
  CANCELLED: AlertCircle
};

export function TaskCard({ task, onClick }) {
  const StatusIcon = STATUS_ICONS[task.status] || Clock;
  
  return (
    <Card 
      className="cursor-pointer hover:border-accent/50 transition-colors bg-surface/50 hover:bg-surface"
      onClick={() => onClick?.(task)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight">
            {task.title}
          </h4>
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 bg-white/5", PRIORITY_COLORS[task.priority])}>
            {task.priority}
          </span>
        </div>
        
        <p className="text-xs text-text-muted line-clamp-2 mb-4">
          {task.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-text-muted mb-1">
            <span>Progress</span>
            <span>{task.progressPercent || 0}%</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full rounded-full transition-all duration-500" 
              style={{ width: `${task.progressPercent || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted border-t border-border/50 pt-3">
          <div className="flex items-center gap-1.5">
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{task.status.replace('_', ' ').toLowerCase()}</span>
          </div>
          <div className="font-medium text-accent">
            {task.baseXP} XP
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
