import { TaskCard } from './TaskCard';
import { cn } from '@shared/lib/utils';
import { Clock, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

const animations = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-hide::-webkit-scrollbar-thumb {
    background: transparent;
  }
`;

const COLUMN_CONFIG = {
  'TODO': {
    label: 'To Do',
    icon: Clock,
    color: 'from-gray-500/20 to-gray-600/20',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-400',
    bgBadge: 'bg-gray-500/20'
  },
  'IN_PROGRESS': {
    label: 'In Progress',
    icon: AlertCircle,
    color: 'from-accent/20 to-cyan-500/20',
    borderColor: 'border-accent/30',
    textColor: 'text-accent',
    bgBadge: 'bg-accent/20'
  },
  'UNDER_REVIEW': {
    label: 'Under Review',
    icon: FileText,
    color: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    bgBadge: 'bg-yellow-500/20'
  },
  'COMPLETED': {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    bgBadge: 'bg-green-500/20'
  },
};

export function TaskBoard({ tasks = [], onTaskClick }) {
  // Group tasks by status
  const columns = {
    'TODO': tasks.filter(t => t.status === 'TODO'),
    'IN_PROGRESS': tasks.filter(t => t.status === 'IN_PROGRESS'),
    'UNDER_REVIEW': tasks.filter(t => t.status === 'UNDER_REVIEW'),
    'COMPLETED': tasks.filter(t => t.status === 'COMPLETED'),
  };

  return (
    <>
      <style>{animations}</style>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide h-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] snap-x">
      {Object.entries(columns).map(([status, statusTasks], index) => {
        const config = COLUMN_CONFIG[status] || COLUMN_CONFIG['TODO'];
        const ColumnIcon = config.icon;
        
        return (
          <div 
            key={status} 
            className="flex-none w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px] flex flex-col snap-start animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Column Header */}
            <div className={cn(
              "mb-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-br border",
              config.color,
              config.borderColor
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ColumnIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", config.textColor)} />
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {config.label}
                  </h3>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold text-white",
                  config.bgBadge
                )}>
                  {statusTasks.length}
                </span>
              </div>
            </div>

            {/* Column Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {statusTasks.length === 0 ? (
                <div className="h-24 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-text-muted text-sm">
                  No tasks
                </div>
              ) : (
                statusTasks.map((task, taskIndex) => (
                  <div 
                    key={task.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${(index * 0.1) + (taskIndex * 0.05)}s` }}
                  >
                    <TaskCard task={task} onClick={onTaskClick} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
}

export default TaskBoard;
