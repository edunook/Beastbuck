import { Loader2 } from 'lucide-react';
import { cn } from '@shared/lib/utils';

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

export function SkeletonMessage({ isOwnMessage = false }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex max-w-[min(92%,42rem)] sm:max-w-[min(84%,42rem)] gap-2 sm:gap-3 rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 ${
        isOwnMessage
          ? 'border-accent/10 bg-accent/5 flex-row-reverse'
          : 'border-white/10 bg-white/[0.02]'
      }`}>
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/10 animate-pulse shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          {!isOwnMessage && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-16 rounded-full bg-white/5 animate-pulse" />
            </div>
          )}
          <div className={`space-y-1.5 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            <div className={`h-3 rounded-full bg-white/10 animate-pulse ${isOwnMessage ? 'ml-auto' : ''}`} style={{ width: '70%' }} />
            <div className={`h-3 rounded-full bg-white/5 animate-pulse ${isOwnMessage ? 'ml-auto' : ''}`} style={{ width: '50%' }} />
            {!isOwnMessage && (
              <div className={`h-3 rounded-full bg-white/5 animate-pulse`} style={{ width: '60%' }} />
            )}
          </div>
          <div className="flex gap-1.5 mt-2">
            <div className="h-6 w-12 rounded-full bg-white/5 animate-pulse" />
            <div className="h-6 w-12 rounded-full bg-white/5 animate-pulse" />
            <div className="h-6 w-12 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-2 sm:p-3 md:p-4">
      {[...Array(8)].map((_, i) => (
        <SkeletonMessage key={i} isOwnMessage={i % 3 === 0} />
      ))}
    </div>
  );
}
