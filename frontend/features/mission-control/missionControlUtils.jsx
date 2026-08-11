import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@shared/lib/utils';

const toneMap = {
  accent: {
    metric: 'from-cyan-300/18 via-sky-400/10 to-blue-500/10 border-cyan-200/20 text-cyan-100',
    badge: 'border-cyan-200/25 bg-cyan-300/10 text-cyan-100',
  },
  success: {
    metric: 'from-emerald-300/18 via-teal-400/10 to-cyan-500/10 border-emerald-200/20 text-emerald-100',
    badge: 'border-emerald-200/25 bg-emerald-300/10 text-emerald-100',
  },
  warning: {
    metric: 'from-amber-300/18 via-orange-400/10 to-pink-500/10 border-amber-200/20 text-amber-100',
    badge: 'border-amber-200/25 bg-amber-300/10 text-amber-100',
  },
  danger: {
    metric: 'from-rose-300/18 via-red-400/10 to-orange-500/10 border-rose-200/20 text-rose-100',
    badge: 'border-rose-200/25 bg-rose-300/10 text-rose-100',
  },
  purple: {
    metric: 'from-violet-300/18 via-fuchsia-400/10 to-cyan-500/10 border-violet-200/20 text-violet-100',
    badge: 'border-violet-200/25 bg-violet-300/10 text-violet-100',
  },
};

function getHealthTone(score) {
  if (score >= 80) return toneMap.success.badge;
  if (score >= 50) return toneMap.warning.badge;
  return toneMap.danger.badge;
}

export function HealthBadge({ score }) {
  const label = score >= 80 ? 'Healthy' : score >= 50 ? 'Needs Attention' : 'At Risk';
  const Icon = score >= 80 ? CheckCircle2 : score >= 50 ? AlertCircle : AlertTriangle;

  return (
    <div className={cn('inline-flex min-h-[30px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black', getHealthTone(score))}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label} ({score})</span>
    </div>
  );
}

export function IntelligenceMetric({ label, value, icon: Icon, color = 'accent', trend }) {
  const tone = toneMap[color]?.metric || toneMap.accent.metric;

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/64 to-indigo-950/36 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200/25 hover:shadow-[0_28px_82px_rgba(14,165,233,0.1)] sm:p-5">
      <div className={cn('absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl transition-opacity group-hover:opacity-90', tone)} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-2">
            <h3 className="truncate font-heading text-2xl font-black text-white sm:text-3xl">{value}</h3>
            {trend && (
              <span className={cn('rounded-full border px-2 py-0.5 text-xs font-black', trend > 0 ? toneMap.success.badge : toneMap.danger.badge)}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
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

export function LoadingRows({ count = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 w-full animate-pulse rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.045] via-cyan-300/10 to-white/[0.045]" />
      ))}
    </div>
  );
}

export function IntelligencePanel({ title, icon: Icon, children, action }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/64 to-indigo-950/36 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300/14 via-violet-300/10 to-fuchsia-300/12 text-cyan-100">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <h3 className="truncate font-heading text-sm font-black uppercase tracking-[0.16em] text-white">{title}</h3>
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
