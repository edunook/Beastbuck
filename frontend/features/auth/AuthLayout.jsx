import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Shield, Zap, Brain } from 'lucide-react';
import { AnimatedBackground } from '@frontend/components/background/AnimatedBackground';
import { FadeIn } from '@frontend/components/transitions/PageTransition';
import { cn } from '@shared/lib/utils';

const features = [
  { icon: Brain, label: 'AI-Powered Workspace', desc: 'Smart tools that adapt to you' },
  { icon: Shield, label: 'Bank-Grade Security', desc: 'End-to-end encrypted sessions' },
  { icon: Zap, label: 'Lightning Fast', desc: 'Built for speed and performance' },
];

export function AuthField({
  icon: Icon,
  type = 'text',
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  required,
  autoComplete,
  focused,
  trailing,
  error,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-soft pl-1">{label}</label>
      )}
      <div className="relative group">
        <div
          className={cn(
            'absolute -inset-px rounded-2xl bg-gradient-to-r from-accent/0 via-accent/40 to-accent-alt/0 opacity-0 blur-sm transition-opacity duration-500',
            focused && 'opacity-100',
            error && 'from-status-danger/40 via-status-danger/60 to-status-danger/40 opacity-100'
          )}
        />
        <div
          className={cn(
            'relative flex items-center rounded-2xl border bg-background/60 backdrop-blur-sm transition-all duration-300',
            focused
              ? 'border-accent/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
              : 'border-border hover:border-white/15',
            error && 'border-status-danger/50'
          )}
        >
          <div className="pl-4 pr-2 shrink-0">
            <Icon
              className={cn(
                'w-5 h-5 transition-colors duration-300',
                focused ? 'text-accent' : 'text-text-muted',
                error && 'text-status-danger'
              )}
            />
          </div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            className="flex-1 min-w-0 bg-transparent text-text placeholder:text-text-muted/70 py-3.5 sm:py-4 pr-3 outline-none text-base"
          />
          {trailing && <div className="pr-3 shrink-0">{trailing}</div>}
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col lg:flex-row overflow-hidden bg-background">
      <AnimatedBackground variant="mesh" intensity="medium" />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-[100px] animate-auth-orb-1" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full bg-accent-alt/10 blur-[120px] animate-auth-orb-2" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-status-success/5 blur-[80px] animate-auth-orb-3" />
      </div>

      {/* Brand panel — desktop only */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-10 xl:p-14 border-r border-border/40">
        <FadeIn delay={0}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
        </FadeIn>

        <div className="flex-1 flex flex-col justify-center py-12 max-w-md">
          <FadeIn delay={100}>
            <div className="flex items-center gap-4 mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full animate-auth-glow" />
                <img src="/logo.png" alt="BeastBuck" className="relative h-14 w-auto drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gradient font-[family-name:var(--font-heading)]">
                  BeastBuck
                </h2>
                <p className="text-sm text-text-muted">Premium Digital Workspace</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="text-4xl xl:text-5xl font-black text-text leading-[1.1] tracking-tight mb-5 font-[family-name:var(--font-heading)]">
              Build smarter.
              <br />
              <span className="text-gradient">Move faster.</span>
            </h1>
            <p className="text-lg text-text-soft leading-relaxed mb-12">
              Join thousands of creators using AI-powered tools to supercharge their workflow.
            </p>
          </FadeIn>

          <div className="space-y-5">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <FadeIn key={label} delay={300 + i * 100}>
                <div className="flex items-start gap-4 group">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-white/[0.04] border border-border flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-300">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-text text-sm">{label}</p>
                    <p className="text-sm text-text-muted mt-0.5">{desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <FadeIn delay={700}>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Trusted by teams worldwide</span>
          </div>
        </FadeIn>
      </aside>

      {/* Form panel */}
      <main className="relative flex-1 flex flex-col min-h-[100dvh] lg:min-h-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 sm:p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <img src="/logo.png" alt="BeastBuck" className="h-9 w-auto" />
          <div className="w-14" aria-hidden="true" />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-8 sm:pb-10 lg:p-10 xl:p-14">
          <FadeIn delay={150} className="w-full max-w-[420px]">
            {/* Mobile card wrapper */}
            <div className="relative">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-accent/20 via-transparent to-accent-alt/20 opacity-60 blur-sm pointer-events-none" />
              <div className="relative rounded-3xl border border-border/60 bg-surface/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4)]">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight font-[family-name:var(--font-heading)]">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="mt-2 text-text-soft text-sm sm:text-base">{subtitle}</p>
                  )}
                </div>

                {children}
              </div>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
