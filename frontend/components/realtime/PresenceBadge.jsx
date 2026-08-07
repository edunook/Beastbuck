import { PresenceService } from '@services/realtime/presence';
import { cn } from '@shared/lib/utils';

export default function PresenceBadge({
  state = 'offline',
  size = 'md',
  showLabel = false,
  activity,
  className,
}) {
  const color = PresenceService.getPresenceColor(state);
  const label = PresenceService.getPresenceLabel(state);
  const sizeClass = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-2.5 w-2.5';

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn('shrink-0 rounded-full border-2 border-surface', sizeClass, color)}
        title={activity ? `${label} · ${activity}` : label}
      />
      {showLabel && (
        <span className="text-xs text-text-muted">
          {label}
          {activity ? ` · ${activity}` : ''}
        </span>
      )}
    </span>
  );
}

export function PresenceDot({ state, className }) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full border border-surface',
        PresenceService.getPresenceColor(state),
        className
      )}
    />
  );
}
