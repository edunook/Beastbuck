import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export function HealthBadge({ score }) {
  if (score >= 80) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-status-success/30 bg-status-success/10 px-2 py-1 text-xs font-bold text-status-success">
        <CheckCircle2 className="h-3.5 w-3.5" /> Healthy ({score})
      </div>
    );
  }
  if (score >= 50) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-status-warning/30 bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">
        <AlertCircle className="h-3.5 w-3.5" /> Needs Attention ({score})
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-status-danger/30 bg-status-danger/10 px-2 py-1 text-xs font-bold text-status-danger">
      <AlertTriangle className="h-3.5 w-3.5" /> At Risk ({score})
    </div>
  );
}

export function IntelligenceMetric({ label, value, icon: Icon, color = 'accent', trend }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-surface/50 p-5 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-surface/80">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-${color}/10 blur-2xl transition-all group-hover:bg-${color}/20`} />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="font-heading text-3xl font-black text-white">{value}</h3>
            {trend && (
              <span className={`text-xs font-bold ${trend > 0 ? 'text-status-success' : 'text-status-danger'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${color}/10 text-${color} border border-${color}/20`}>
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
        <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

export function IntelligencePanel({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/50 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/40 p-5">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-accent" />}
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
