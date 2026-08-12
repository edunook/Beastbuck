import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  ChevronDown,
  FlaskConical,
  Headphones,
  MessageSquare,
  Package,
  Play,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import Button from '@frontend/components/ui/Button';
import { AnimatedBackground } from '@frontend/components/background/AnimatedBackground';
import { FadeIn, ScaleIn, StaggeredChildren } from '@frontend/components/transitions/PageTransition';
import { InteractiveCard } from '@frontend/components/ui/InteractiveCard';
import { cn } from '@shared/lib/utils';
import heroImage from '@frontend/assets/hero.png';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 100}%`,
  top: `${(i * 23 + 9) % 100}%`,
  delay: `${(i % 7) * 0.6}s`,
  duration: `${7 + (i % 4) * 2}s`,
}));

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Workspace',
    description: 'Smart assistants, prompt labs, and co-pilots that adapt to how you build.',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
  },
  {
    icon: FlaskConical,
    title: 'Experiment Lab',
    description: 'Run discoveries, publish research, and iterate in a safe creative sandbox.',
    color: 'text-status-success',
    bg: 'bg-status-success/10 border-status-success/20',
  },
  {
    icon: Target,
    title: 'Mission Control',
    description: 'Complete missions, earn XP, and climb leaderboards with your team.',
    color: 'text-accent-alt',
    bg: 'bg-accent-alt/10 border-accent-alt/20',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Collab',
    description: 'Chat, voice rooms, war rooms, and brainstorm sessions — all in one place.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10 border-cyan-400/20',
  },
  {
    icon: Package,
    title: 'Product Studio',
    description: 'Ship prototypes, showcase in the marketplace, and grow your portfolio.',
    color: 'text-status-warning',
    bg: 'bg-status-warning/10 border-status-warning/20',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Role-based access, encrypted sessions, and enterprise-grade Firebase security.',
    color: 'text-text-soft',
    bg: 'bg-white/[0.04] border-border',
  },
];

const STEPS = [
  {
    step: '01',
    icon: Rocket,
    title: 'Create your identity',
    description: 'Sign up in seconds with a username and jump into your personal workspace.',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Build & experiment',
    description: 'Launch projects, run experiments, and collaborate with creators worldwide.',
  },
  {
    step: '03',
    icon: Trophy,
    title: 'Grow your legacy',
    description: 'Earn XP, unlock achievements, and showcase your work on the public hall of fame.',
  },
];

const MODULES = [
  { icon: FlaskConical, label: 'Experiments', path: '/experiments', gradient: 'from-accent/20 to-cyan-500/10' },
  { icon: Package, label: 'Marketplace', path: '/public-marketplace', gradient: 'from-accent-alt/20 to-purple-500/10' },
  { icon: Headphones, label: 'Collaboration', path: '/about', gradient: 'from-status-success/20 to-emerald-500/10' },
  { icon: Trophy, label: 'Hall of Fame', path: '/hall-of-fame', gradient: 'from-status-warning/20 to-amber-500/10' },
];

function SectionLabel({ children, icon: Icon = Sparkles }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 backdrop-blur-sm">
      <Icon className="h-4 w-4 text-accent" />
      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">{children}</span>
    </div>
  );
}

function HeroPreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/30 via-accent-alt/20 to-transparent blur-2xl opacity-60 animate-landing-glow" />
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/80 p-1 shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-landing-float">
        <div className="rounded-[1.35rem] border border-white/5 bg-background/80 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-status-danger/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-status-warning/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-status-success/80" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Live workspace</span>
          </div>

          <img
            src={heroImage}
            alt="BeastBuck workspace preview"
            className="mb-4 w-full rounded-2xl border border-border/50 object-cover shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default function LandingHome() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[100dvh] flex flex-col">
        <AnimatedBackground variant="mesh" intensity="medium" className="opacity-90" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-[120px] animate-auth-orb-1" />
          <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-accent-alt/10 blur-[140px] animate-auth-orb-2" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-status-success/5 blur-[100px] animate-auth-orb-3" />
          <div className="absolute inset-0 landing-grid opacity-[0.35]" />
          {PARTICLES.map((p) => (
            <span
              key={p.id}
              className="absolute h-1 w-1 rounded-full bg-white/25 animate-landing-particle"
              style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-16 pt-8 md:px-8 lg:pb-24 lg:pt-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="text-center lg:text-left">
              <FadeIn delay={0}>
                <SectionLabel icon={Sparkles}>Premium Digital Workspace</SectionLabel>
              </FadeIn>

              <FadeIn delay={100}>
                <h1 className="font-[family-name:var(--font-heading)] text-4xl font-black leading-[1.05] tracking-tight text-text sm:text-5xl md:text-6xl xl:text-7xl">
                  Build smarter.
                  <span className="mt-2 block text-gradient animate-landing-shimmer bg-[length:200%_auto]">
                    Move faster.
                  </span>
                  <span className="mt-2 block text-text-soft">Grow your legacy.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={200}>
                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-soft sm:text-lg lg:mx-0">
                  BeastBuck is the all-in-one creative company OS — experiments, missions, AI tools,
                  collaboration, and a public portfolio that grows with you.
                </p>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      ripple
                      className="w-full !rounded-2xl !px-8 !py-4 !text-base !font-black !shadow-[0_8px_32px_rgba(0,240,255,0.28)] sm:w-auto"
                    >
                      Get started free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/signin" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full !rounded-2xl !px-8 !py-4 !text-base sm:w-auto"
                    >
                      Sign in
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={200} className="order-first lg:order-last">
              <HeroPreviewCard />
            </FadeIn>
          </div>

          <FadeIn delay={600} className="mt-12 flex justify-center lg:mt-16">
            <a
              href="#features"
              className="group inline-flex flex-col items-center gap-2 text-text-muted transition-colors hover:text-accent"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Explore</span>
              <ChevronDown className="h-5 w-5 animate-landing-bounce" />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative border-t border-border/40 bg-background py-16 md:py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <SectionLabel>Platform</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-black text-text sm:text-4xl md:text-5xl">
              Everything you need to{' '}
              <span className="text-gradient">ship bold ideas</span>
            </h2>
            <p className="mt-4 text-base text-text-soft sm:text-lg">
              One workspace for creation, collaboration, and growth — designed to feel premium on every screen.
            </p>
          </FadeIn>

          <StaggeredChildren staggerDelay={80} className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {FEATURES.map((feature) => (
              <InteractiveCard key={feature.title} hoverable tilt tiltMax={6} depth={2} className="h-full p-6">
                <div
                  className={cn(
                    'mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border',
                    feature.bg
                  )}
                >
                  <feature.icon className={cn('h-6 w-6', feature.color)} />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-text">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{feature.description}</p>
              </InteractiveCard>
            ))}
          </StaggeredChildren>
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden border-t border-border/40 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-accent-alt/[0.03]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <SectionLabel icon={Play}>How it works</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-black text-text sm:text-4xl">
              From signup to spotlight in three steps
            </h2>
          </FadeIn>

          <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
            <div className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-10 hidden h-px bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 md:block" />
            {STEPS.map((item, index) => (
              <ScaleIn key={item.step} delay={index * 120}>
                <div className="relative text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 shadow-[0_0_30px_rgba(0,240,255,0.12)]">
                    <item.icon className="h-7 w-7 text-accent" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-accent">{item.step}</span>
                  <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold text-text">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">{item.description}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Explore modules */}
      <section className="border-t border-border/40 bg-surface/20 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <FadeIn className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <SectionLabel icon={Rocket}>Explore</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-black text-text sm:text-4xl">
                Browse the public universe
              </h2>
              <p className="mt-3 text-text-soft">
                See what creators are building before you join — experiments, products, achievements, and more.
              </p>
            </div>
            <Link to="/about" className="shrink-0">
              <Button variant="ghost" className="gap-2">
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((mod, index) => (
              <FadeIn key={mod.path} delay={index * 80}>
                <Link to={mod.path} className="group block h-full">
                  <div
                    className={cn(
                      'relative h-full overflow-hidden rounded-2xl border border-border/60 bg-background/60 p-6 transition-all duration-300',
                      'hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                        mod.gradient
                      )}
                    />
                    <div className="relative">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white/[0.04] transition-colors group-hover:border-accent/30 group-hover:bg-accent/10">
                        <mod.icon className="h-5 w-5 text-accent" />
                      </div>
                      <h3 className="font-bold text-text transition-colors group-hover:text-accent">{mod.label}</h3>
                      <p className="mt-2 flex items-center gap-1 text-sm text-text-muted">
                        View public page
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </p>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-border/40 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent-alt/10 to-accent/10 animate-landing-gradient" />
        <div className="absolute inset-0 landing-grid opacity-20" />
        <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
          <FadeIn>
            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-surface/70 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-12">
              <Sparkles className="mx-auto h-8 w-8 text-accent animate-auth-glow" />
              <h2 className="mt-6 font-[family-name:var(--font-heading)] text-3xl font-black text-text sm:text-4xl md:text-5xl">
                Ready to build your{' '}
                <span className="text-gradient">next big thing</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-text-soft">
                Join BeastBuck today — free to start, powerful enough to grow with your ambitions.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" ripple className="w-full !rounded-2xl sm:w-auto">
                    Create free account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/join" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full !rounded-2xl sm:w-auto">
                    Apply for membership
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
