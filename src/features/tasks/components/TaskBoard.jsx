import { TaskCard } from './TaskCard';

export function TaskBoard({ tasks = [], onTaskClick }) {
  // Group tasks by status
  const columns = {
    'TODO': tasks.filter(t => t.status === 'TODO'),
    'IN_PROGRESS': tasks.filter(t => t.status === 'IN_PROGRESS'),
    'UNDER_REVIEW': tasks.filter(t => t.status === 'UNDER_REVIEW'),
    'COMPLETED': tasks.filter(t => t.status === 'COMPLETED'),
  };

  const getColumnColor = (status) => {
    switch (status) {
      case 'TODO': return 'border-border/50 text-text-muted';
      case 'IN_PROGRESS': return 'border-accent/30 text-accent';
      case 'UNDER_REVIEW': return 'border-yellow-400/30 text-yellow-400';
      case 'COMPLETED': return 'border-status-success/30 text-status-success';
      default: return 'border-border';
    }
  };

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 custom-scrollbar h-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] snap-x">
      {Object.entries(columns).map(([status, statusTasks]) => (
        <div key={status} className="flex-none w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px] flex flex-col snap-start">

          {/* Column Header */}
          <div className={`mb-4 pb-2 border-b-2 flex items-center justify-between ${getColumnColor(status)}`}>
            <h3 className="font-bold text-sm tracking-wider uppercase">
              {status.replace('_', ' ')}
            </h3>
            <span className="text-xs bg-surface px-2 py-0.5 rounded-full border border-border">
              {statusTasks.length}
            </span>
          </div>

          {/* Column Body */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {statusTasks.length === 0 ? (
              <div className="h-24 border border-dashed border-border/50 rounded-xl flex items-center justify-center text-text-muted text-sm">
                No tasks
              </div>
            ) : (
              statusTasks.map(task => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
