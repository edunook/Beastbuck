import { cn } from '@shared/lib/utils';
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

const metricColors = {
  accent: 'text-cyan-100 from-cyan-300/18 via-sky-400/10 to-blue-500/10 border-cyan-200/20',
  success: 'text-emerald-100 from-emerald-300/18 via-teal-400/10 to-cyan-500/10 border-emerald-200/20',
  warning: 'text-amber-100 from-amber-300/18 via-orange-400/10 to-pink-500/10 border-amber-200/20',
  danger: 'text-rose-100 from-rose-300/18 via-red-400/10 to-orange-500/10 border-rose-200/20',
  purple: 'text-violet-100 from-violet-300/18 via-fuchsia-400/10 to-cyan-500/10 border-violet-200/20',
};

const badgeVariants = {
  default: 'bg-white/[0.055] text-slate-300 border-white/10',
  accent: 'bg-cyan-300/10 text-cyan-100 border-cyan-200/20',
  success: 'bg-emerald-300/10 text-emerald-100 border-emerald-200/20',
  warning: 'bg-amber-300/10 text-amber-100 border-amber-200/20',
  danger: 'bg-rose-300/10 text-rose-100 border-rose-200/20',
  purple: 'bg-violet-300/10 text-violet-100 border-violet-200/20',
};

const buttonVariants = {
  default: 'border-white/10 bg-white/[0.065] text-slate-200 hover:border-white/20 hover:bg-white/[0.1] hover:text-white',
  accent: 'border-cyan-200/25 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/16',
  danger: 'border-rose-200/25 bg-rose-300/10 text-rose-100 hover:bg-rose-300/16',
  success: 'border-emerald-200/25 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/16',
  warning: 'border-amber-200/25 bg-amber-300/10 text-amber-100 hover:bg-amber-300/16',
};

export function AdminMetric({ label, value, icon: Icon, trend, trendLabel, color = 'accent' }) {
  const tone = metricColors[color] || metricColors.accent;

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/78 via-slate-900/64 to-indigo-950/42 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200/25 hover:shadow-[0_28px_82px_rgba(14,165,233,0.1)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className={cn('absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl transition-opacity group-hover:opacity-90', tone)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 truncate font-heading text-2xl font-black text-white sm:text-3xl">{value ?? '-'}</p>
          {trend !== undefined && (
            <div className={cn('mt-3 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.68rem] font-black', trend > 0 ? badgeVariants.success : trend < 0 ? badgeVariants.danger : badgeVariants.default)}>
              {trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : trend < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              <span>{trendLabel || (trend > 0 ? `+${trend}` : trend)}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]', tone)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPanel({ title, icon: Icon, children, action, className, noPad = false }) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/78 via-slate-900/62 to-indigo-950/34 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl', className)}>
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300/14 via-violet-300/10 to-fuchsia-300/12 text-cyan-100">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <h2 className="truncate font-heading text-sm font-black uppercase tracking-[0.16em] text-white">{title}</h2>
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
      <div className={cn(!noPad && 'p-4 sm:p-5')}>{children}</div>
    </section>
  );
}

export function StatusBadge({ children, variant = 'default' }) {
  return (
    <span className={cn('inline-flex min-h-[28px] max-w-full items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em]', badgeVariants[variant] || badgeVariants.default)}>
      <span className="truncate">{children}</span>
    </span>
  );
}

export function AdminEmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.035] px-4 py-12 text-center">
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300/12 via-violet-300/10 to-fuchsia-300/12 text-cyan-100">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <p className="font-heading text-xl font-black text-white">{title || 'No data yet'}</p>
      {message && <p className="max-w-sm text-sm leading-6 text-slate-400">{message}</p>}
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
        'inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition-all hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        danger ? buttonVariants.danger : buttonVariants.default,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminActionButton({ onClick, children, className, variant = 'default', size = 'sm', ...props }) {
  const sizes = {
    xs: 'min-h-[34px] px-2.5 py-1 text-[11px]',
    sm: 'min-h-[38px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] px-4 py-2 text-sm',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl border font-black transition-all hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-200/25 disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant] || buttonVariants.default,
        sizes[size] || sizes.sm,
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
        'min-h-[42px] rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm font-bold text-white transition-colors hover:border-white/20 focus:border-cyan-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-200/20',
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
        'min-h-[42px] w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white placeholder:text-slate-500 transition-colors focus:border-cyan-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-200/20',
        className,
      )}
      {...props}
    />
  );
}

export function AdminToast({ message, onClear }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 shadow-[0_18px_40px_rgba(34,211,238,0.08)] sm:flex-row sm:items-center sm:justify-between">
      <span>{message}</span>
      <button onClick={onClear} className="inline-flex h-9 w-9 items-center justify-center self-end rounded-xl text-cyan-100/70 transition hover:bg-white/10 hover:text-cyan-50 sm:self-auto">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function LoadingRows({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.045] via-cyan-300/10 to-white/[0.045]" />
      ))}
    </div>
  );
}
