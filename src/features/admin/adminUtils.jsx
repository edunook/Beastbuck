import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function AdminMetric({ label, value, icon: Icon, trend, trendLabel, color = 'accent' }) {
  const colorMap = {
    accent: 'text-accent bg-accent/10 shadow-glow-1',
    success: 'text-status-success bg-status-success/10 shadow-glow-success',
    warning: 'text-status-warning bg-status-warning/10',
    danger: 'text-status-danger bg-status-danger/10',
    purple: 'text-accent-alt bg-accent-alt/10 shadow-glow-purple',
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface/80 to-black/40 p-4 transition-all duration-200 hover:border-white/15 hover:shadow-depth-2 hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-lg', colorMap[color] || colorMap.accent)}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-heading text-metric font-bold text-white">{value ?? '—'}</p>
        <p className="mt-1 text-badge font-bold uppercase tracking-widest text-text-muted">{label}</p>
        {trend !== undefined && (
          <div className={cn('mt-2 flex items-center gap-1 text-badge font-bold', trend > 0 ? 'text-status-success' : trend < 0 ? 'text-status-danger' : 'text-text-muted')}>
            {trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : trend < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            <span>{trendLabel || (trend > 0 ? `+${trend}` : trend)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPanel({ title, icon: Icon, children, action, className, noPad = false }) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-gradient-to-br from-surface/80 to-black/30 shadow-depth-1', className)}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <h2 className="font-heading text-badge font-bold uppercase tracking-wider text-white">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={cn(!noPad && 'p-5')}>{children}</div>
    </div>
  );
}

export function StatusBadge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-white/5 text-text-soft border-white/10',
    accent: 'bg-accent/10 text-accent border-accent/20',
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    danger: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    purple: 'bg-accent-alt/10 text-accent-alt border-accent-alt/20',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-badge font-bold', variants[variant] || variants.default)}>
      {children}
    </span>
  );
}

export function AdminEmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-text-muted">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <p className="font-bold text-white text-section-title">{title}</p>
      {message && <p className="max-w-xs text-caption text-text-muted">{message}</p>}
    </div>
  );
}

export function AdminConfirmButton({ onConfirm, children, className, danger = false, ...props }) {
  const handleClick = () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      onConfirm();
    }
  };
  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-badge font-bold transition-all hover:-translate-y-0.5 active:scale-95',
        danger
          ? 'border-status-danger/20 bg-status-danger/10 text-status-danger hover:bg-status-danger/20'
          : 'border-white/10 bg-white/5 text-text-soft hover:bg-white/10 hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminActionButton({ onClick, children, className, variant = 'default', size = 'sm', ...props }) {
  const variants = {
    default: 'border-white/10 bg-white/5 text-text-soft hover:bg-white/10 hover:text-white',
    accent: 'border-accent/20 bg-accent/10 text-accent hover:bg-accent/20',
    danger: 'border-status-danger/20 bg-status-danger/10 text-status-danger hover:bg-status-danger/20',
    success: 'border-status-success/20 bg-status-success/10 text-status-success hover:bg-status-success/20',
    warning: 'border-status-warning/20 bg-status-warning/10 text-status-warning hover:bg-status-warning/20',
  };
  const sizes = {
    xs: 'px-2 py-1 text-[11px]',
    sm: 'px-3 py-1.5 text-badge',
    md: 'px-4 py-2 text-caption',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-bold transition-all hover:-translate-y-0.5 active:scale-95',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminSelect({ value, onChange, options, placeholder, className }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={cn(
        'h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-badge text-white transition-colors hover:border-white/15 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20',
        className,
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  );
}

export function AdminInput({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-caption text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors',
        className,
      )}
      {...props}
    />
  );
}

export function AdminToast({ message, onClear }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-caption text-accent shadow-glow-1">
      <span>{message}</span>
      <button onClick={onClear} className="ml-4 text-accent/60 hover:text-accent">✕</button>
    </div>
  );
}

export function LoadingRows({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5 border border-white/10" />
      ))}
    </div>
  );
}
