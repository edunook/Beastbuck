import { cn } from '@shared/lib/utils';
import { PresenceService } from '@services/realtime/presence';

export default function PresenceIndicator({ state, showLabel = false, className, dotClassName, labelClassName }) {
  const colorClass = PresenceService.getPresenceColor(state);
  const label = PresenceService.getPresenceLabel(state);

  return (
    <div className={cn("flex items-center gap-2", className)} title={label}>
      <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", colorClass, dotClassName)} />
      {showLabel && (
        <span className={cn("text-badge text-text-muted", labelClassName)}>
          {label}
        </span>
      )}
    </div>
  );
}
