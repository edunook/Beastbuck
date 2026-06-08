import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Medal,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import heroImage from '../../assets/hero.png';

const featuredProducts = [
  {
    name: 'Invention Showcase',
    detail: 'A kid-safe marketplace for prototypes, posters, models, and product ideas.',
    icon: ShoppingBag,
  },
  {
    name: 'Mission Board',
    detail: 'Tasks, proof submissions, reviews, and XP awards in one workflow.',
    icon: Target,
  },
  {
    name: 'BeastBuck OS',
    detail: 'A member dashboard for announcements, activity, achievements, and teams.',
    icon: BriefcaseBusiness,
  },
];

const experiments = [
  'Balloon rocket physics',
  'Water filtration challenge',
  'Paper bridge engineering',
  'Solar oven prototype',
];

const spotlights = [
  { label: 'MAIN_CEO', value: 'Strategy, approvals, analytics, and company direction' },
  { label: 'CO_CEO', value: 'Operations, challenges, announcements, and moderation' },
  { label: 'LEADER', value: 'Team missions, reviews, and member support' },
  { label: 'MEMBER', value: 'Projects, experiments, products, tasks, and learning' },
];

const ecosystem = [
  ['Physics', FlaskConical],
  ['AI', Bot],
  ['Coding', Wrench],
  ['Engineering', Lightbulb],
  ['Marketing', Rocket],
  ['Leadership', Users],
  ['Mathematics', Brain],
  ['English', GraduationCap],
];

const buildOrder = [
  'React + backend foundation',
  'Auth and member roles',
  'Tasks, missions, and XP',
  'Chat, teams, and profiles',
  'Experiments, products, and skills',
  'Analytics and AI assistant',
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
      <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-text-soft">{description}</p> : null}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, children }) {
  return (
    <article className="rounded-lg border border-border bg-white/[0.04] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
      <p className="text-sm leading-6 text-text-muted">{children}</p>
    </article>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-white">
      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <img
          src={heroImage}
          alt="BeastBuck invention lab workspace"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,7,0.18),#050507_96%)]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="BeastBuck home">
            <img src="/logo.png" alt="BeastBuck" className="h-10 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-text-soft md:flex">
            <a href="#products" className="hover:text-white">Products</a>
            <a href="#experiments" className="hover:text-white">Experiments</a>
            <a href="#skills" className="hover:text-white">Skills</a>
            <a href="#join" className="hover:text-white">Join</a>
          </nav>
          <Link
            to="/signin"
            className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
          >
            Sign In
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-5 pb-24 pt-14 md:min-h-[calc(92vh-80px)] md:px-8 md:pt-8">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-accent">
              <Rocket className="h-4 w-4" />
              Kid-friendly company OS
            </p>
            <h1 className="font-heading text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl md:text-7xl">
              Build inventions, run missions, and grow a real creative company.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-soft">
              BeastBuck combines a learning platform, task manager, experiment hub, product marketplace,
              social workspace, achievement system, and AI-ready invention lab for young creators.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-black text-background transition hover:bg-cyan-300"
              >
                Apply for membership
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15"
              >
                Open OS dashboard
              </Link>
            </div>
          </div>

          <div className="mt-14 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['16+', 'planned modules'],
              ['8', 'skill ecosystems'],
              ['5', 'member roles'],
              ['100%', 'project focused'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/30 p-4 backdrop-blur">
                <div className="font-heading text-2xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="About BeastBuck"
            title="One workspace for every part of the company"
            description="Members can learn, invent, collaborate, complete missions, earn XP, and turn project work into a growing portfolio."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={ShieldCheck} title="Safe roles">
              MAIN_CEO, CO_CEO, LEADER, MEMBER, and VISITOR roles create clear access boundaries.
            </FeatureCard>
            <FeatureCard icon={MessageSquareText} title="Team collaboration">
              Channels, announcements, pinned updates, and future reactions keep teams connected.
            </FeatureCard>
            <FeatureCard icon={Medal} title="XP and badges">
              Tasks, products, experiments, and challenges feed levels, achievements, and profile badges.
            </FeatureCard>
            <FeatureCard icon={Brain} title="Assessment center">
              Strength tests identify Scientist, Engineer, Developer, Artist, Inventor, and Leader badges.
            </FeatureCard>
          </div>
        </div>
      </section>

      <section id="products" className="border-y border-border bg-white/[0.03] px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Featured Products"
            title="A marketplace for member-made ideas"
            description="BeastBuck is designed to showcase kid-built products with moderation, reviews, ratings, creators, prices, and sales tracking."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {featuredProducts.map(({ name, detail, icon: Icon }) => (
              <FeatureCard key={name} icon={Icon} title={name}>{detail}</FeatureCard>
            ))}
          </div>
        </div>
      </section>

      <section id="experiments" className="px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-accent">Experiments Lab</p>
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">Research, test, document, and share discoveries.</h2>
            <p className="mt-4 text-base leading-7 text-text-soft">
              Each experiment can hold photos, difficulty, description, results, team members,
              comments, and XP rewards so learning turns into visible progress.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {experiments.map((experiment) => (
              <div key={experiment} className="flex items-center gap-3 rounded-lg border border-border bg-white/[0.04] p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-status-success" />
                <span className="font-semibold text-text-soft">{experiment}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white/[0.03] px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Member Spotlight"
            title="Clear roles, visible growth"
            description="Permission roles stay simple. Future strengths become profile badges instead of creating a confusing access system."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {spotlights.map((role) => (
              <article key={role.label} className="rounded-lg border border-border bg-background p-5">
                <div className="mb-3 inline-flex rounded-lg bg-accent/10 px-3 py-1 text-xs font-black tracking-[0.16em] text-accent">
                  {role.label}
                </div>
                <p className="text-text-soft">{role.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Skill Ecosystems"
            title="Learning tracks connected to real projects"
            description="Each ecosystem can grow posts, projects, challenges, and discussions around the skills BeastBuck members use."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ecosystem.map(([name, Icon]) => (
              <div key={name} className="rounded-lg border border-border bg-white/[0.04] p-4 text-center">
                <Icon className="mx-auto mb-3 h-6 w-6 text-accent" />
                <div className="text-sm font-bold text-white">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white/[0.03] px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-accent">Build Roadmap</p>
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">Built in the order that keeps it maintainable.</h2>
            <p className="mt-4 text-base leading-7 text-text-soft">
              The platform starts with foundation, authentication, shell, tasks, profiles, XP, labs,
              marketplace, teams, notifications, analytics, then AI.
            </p>
          </div>
          <div className="space-y-3">
            {buildOrder.map((item, index) => (
              <div key={item} className="flex items-center gap-4 rounded-lg border border-border bg-background p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-black text-background">
                  {index + 1}
                </span>
                <span className="font-semibold text-text-soft">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="join" className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-5xl rounded-lg border border-accent/25 bg-accent/10 p-8 text-center md:p-12">
          <Trophy className="mx-auto mb-5 h-10 w-10 text-accent" />
          <h2 className="font-heading text-3xl font-black text-white md:text-5xl">Join the BeastBuck invention lab.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-soft">
            Apply as a member, start completing missions, publish experiments, build products,
            and grow a portfolio of real company work.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-black text-background transition hover:bg-cyan-300"
            >
              Start application
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15"
            >
              Member sign in
              <BadgeCheck className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
