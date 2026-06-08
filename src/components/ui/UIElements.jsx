import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PageHeader({ title, description, action, className, hero = false, gradient = false }) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8",
      hero && "relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-subtle-1 border border-border shadow-depth-2",
      gradient && "bg-gradient-premium-1",
      className
    )}>
      <div className={cn(hero ? "relative z-10" : "")}>
        <h1 className={cn(
          "font-heading font-bold text-text tracking-tight",
          hero ? "text-hero" : "text-page-title"
        )}>{title}</h1>
        {description && <p className={cn(
          "text-text-muted mt-1",
          hero ? "text-description" : "text-description"
        )}>{description}</p>}
      </div>
      {action && <div className={cn("shrink-0", hero && "relative z-10")}>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-2xl bg-surface", className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-text-muted" />
        </div>
      )}
      <h3 className="text-section-title font-bold text-text mb-2">{title}</h3>
      {description && <p className="text-description text-text-muted max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingState({ text = "Loading...", className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 min-h-[200px]", className)}>
      <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
      <p className="text-badge text-text-muted">{text}</p>
    </div>
  );
}
