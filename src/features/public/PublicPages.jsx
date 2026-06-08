import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  FlaskConical,
  Medal,
  Package,
  Search,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import heroImage from '../../assets/hero.png';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PublicDataService } from '../../services/firebase/publicData';
import { MembershipService } from '../../services/firebase/membership';

function PublicContainer({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16 ${className}`}>{children}</div>;
}

function PageHero({ eyebrow, title, description, icon: Icon = Sparkles }) {
  return (
    <section className="relative border-b border-border bg-white/[0.03] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      
      <PublicContainer className="relative">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 backdrop-blur-sm">
            <Icon className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
          </div>
          <h1 className="font-heading text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-text-soft">{description}</p>
        </div>
      </PublicContainer>
    </section>
  );
}

function PublicCard({ children }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.06] hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </article>
  );
}

function usePublicList(loader) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    loader()
      .then(result => { if (!cancelled) setItems(result); })
      .catch((err) => { console.error('Public data load failed:', err); if (!cancelled) setError('Could not load this public page.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loader]);

  return { items, loading, error };
}

function filteredItems(items, search, fields) {
  const needle = search.toLowerCase();
  return items.filter(item => fields.map(field => item[field] || '').join(' ').toLowerCase().includes(needle));
}

export function PublicHome() {
  return (
    <>
      <section className="relative isolate min-h-screen overflow-hidden flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[200px]" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <PublicContainer className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent blur-xl opacity-50 animate-pulse" />
                <img src="/logo.png" alt="BeastBuck" className="relative h-20 w-auto" />
              </div>
            </div>

            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-6 py-3 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Public Invention Network</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl mb-6">
              <span className="block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                Build Inventions
              </span>
              <span className="block mt-2 bg-gradient-to-r from-accent via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Run Missions
              </span>
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-accent bg-clip-text text-transparent">
                Grow Your Portfolio
              </span>
            </h1>

            <p className="mt-8 max-w-2xl mx-auto text-xl leading-relaxed text-text-soft">
              A kid-friendly creative company OS where young creators can experiment, build products, complete missions, earn XP, and showcase their work to the world.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col gap-4 sm:flex-row justify-center">
              <Link 
                to="/signup" 
                className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-accent via-purple-500 to-cyan-500 px-10 py-5 font-black text-white text-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
                <span className="relative">Create Account</span>
                <ArrowRight className="relative h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/experiments" 
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-10 py-5 font-bold text-white text-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30"
              >
                Browse Public Work
              </Link>
            </div>
          </div>
        </PublicContainer>
      </section>
    </>
  );
}

export function PublicAbout() {
  return (
    <>
      <PageHero eyebrow="About" title="A public window into the BeastBuck invention lab." description="BeastBuck is a kid-friendly creative company OS. Public visitors can browse work, while private member tools stay protected." icon={BookOpen} />
      <PublicContainer>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Visitors', 'Browse experiments, products, projects, achievements, and public profiles.'],
            ['Members', 'Create work, complete missions, earn XP, use chat, and collaborate inside the workspace.'],
            ['Leadership', 'Review applications, moderate content, approve structures, and guide the company.'],
          ].map(([title, detail]) => <PublicCard key={title}><h2 className="font-bold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-text-muted">{detail}</p></PublicCard>)}
        </div>
      </PublicContainer>
    </>
  );
}

export function PublicExperiments() {
  const loader = useMemo(() => () => PublicDataService.getExperiments(), []);
  const { items, loading, error } = usePublicList(loader);
  const [search, setSearch] = useState('');
  const results = filteredItems(items, search, ['title', 'description', 'category', 'authorName']);

  return (
    <>
      <PageHero eyebrow="Experiments" title="Public experiments and discoveries." description="Browse member research without entering the private workspace." icon={FlaskConical} />
      <PublicContainer>
        <SearchBar value={search} onChange={setSearch} placeholder="Search experiments..." />
        <PublicGrid loading={loading} error={error} empty="No public experiments yet.">
          {results.map(item => <PublicCard key={item.id}><p className="mb-2 text-xs font-bold text-accent">{item.category || 'Experiment'}</p><h2 className="font-bold text-white">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{item.description}</p><p className="mt-4 text-xs text-text-muted">By {item.authorName || item.authorUsername || 'Member'} / {item.status}</p></PublicCard>)}
        </PublicGrid>
      </PublicContainer>
    </>
  );
}

export function PublicMarketplace() {
  const loader = useMemo(() => () => PublicDataService.getProducts(), []);
  const { items, loading, error } = usePublicList(loader);
  const [search, setSearch] = useState('');
  const results = filteredItems(items, search, ['title', 'description', 'category', 'creatorName']);

  return (
    <>
      <PageHero eyebrow="Marketplace" title="Public product showcase." description="Explore products and prototypes made by BeastBuck members." icon={Package} />
      <PublicContainer>
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
        <PublicGrid loading={loading} error={error} empty="No public products yet.">
          {results.map(item => <PublicCard key={item.id}>{item.media?.find(media => media.type === 'image') && <img src={item.media.find(media => media.type === 'image').url} alt="" className="mb-4 h-40 w-full rounded-lg object-cover" />}<p className="mb-2 text-xs font-bold text-accent">{item.category || 'Product'}</p><h2 className="font-bold text-white">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{item.description}</p><p className="mt-4 text-xs text-text-muted">By {item.creatorName || item.creatorUsername || 'Member'} / ${Number(item.price || 0).toFixed(2)}</p></PublicCard>)}
        </PublicGrid>
      </PublicContainer>
    </>
  );
}

export function PublicProjects() {
  const loader = useMemo(() => () => PublicDataService.getProjects(), []);
  const { items, loading, error } = usePublicList(loader);
  const [search, setSearch] = useState('');
  const results = filteredItems(items, search, ['title', 'description', 'status']);

  return (
    <>
      <PageHero eyebrow="Projects" title="Public organization projects." description="Browse active and completed work from departments and labs." icon={Building2} />
      <PublicContainer>
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects..." />
        <PublicGrid loading={loading} error={error} empty="No public projects yet.">
          {results.map(item => <PublicCard key={item.id}><p className="mb-2 text-xs font-bold text-accent">{item.status}</p><h2 className="font-bold text-white">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{item.description}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-accent" style={{ width: `${item.progressPercent || 0}%` }} /></div><p className="mt-2 text-xs text-text-muted">{item.progressPercent || 0}% progress</p></PublicCard>)}
        </PublicGrid>
      </PublicContainer>
    </>
  );
}

export function HallOfFame() {
  const loader = useMemo(() => () => PublicDataService.getHallOfFame(), []);
  const { items, loading, error } = usePublicList(loader);
  const groups = [
    ['Top XP', items],
    ['Top Contributors', [...items].sort((a, b) => ((b.stats?.experimentsCount || 0) + (b.stats?.productsCount || 0)) - ((a.stats?.experimentsCount || 0) + (a.stats?.productsCount || 0)))],
    ['Top Scientists', items.filter(item => item.specializations?.includes('scientist'))],
    ['Top Developers', items.filter(item => item.specializations?.includes('developer'))],
    ['Top Inventors', items.filter(item => item.specializations?.includes('inventor'))],
  ];

  return (
    <>
      <PageHero eyebrow="Hall of Fame" title="BeastBuck public achievements." description="Celebrate XP, contributions, scientists, developers, and inventors." icon={Trophy} />
      <PublicContainer>
        {loading && <p className="text-text-muted">Loading hall of fame...</p>}
        {error && <p className="text-status-danger">{error}</p>}
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map(([title, people]) => <PublicCard key={title}><h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Medal className="h-5 w-5 text-accent" />{title}</h2><div className="space-y-2">{people.slice(0, 8).length === 0 ? <p className="text-sm text-text-muted">No members yet.</p> : people.slice(0, 8).map((person, index) => <Link key={person.id} to={`/members/${person.id}`} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-sm hover:bg-white/[0.06]"><span className="font-bold text-white">#{index + 1} {person.displayName || person.username}</span><span className="text-text-muted">{person.xp || 0} XP</span></Link>)}</div></PublicCard>)}
        </div>
      </PublicContainer>
    </>
  );
}

export function JoinPage() {
  const [form, setForm] = useState({ name: '', username: '', age: '', motivation: '', interests: '', skills: '', contributionGoals: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      await MembershipService.submitApplication(form);
      setForm({ name: '', username: '', age: '', motivation: '', interests: '', skills: '', contributionGoals: '' });
      setStatus('Application submitted. Leadership will review it soon.');
    } catch (err) {
      console.error('Membership application failed:', err);
      setStatus('Application could not be submitted. Please check required fields.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Join" title="Apply for BeastBuck membership." description="Tell leadership what you want to learn, build, and contribute." icon={Users} />
      <PublicContainer className="max-w-4xl">
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-surface p-5 md:p-6">
          {status && <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">{status}</div>}
          <div className="grid gap-4 md:grid-cols-3">
            <Input value={form.name} onChange={(event) => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Name" required />
            <Input value={form.username} onChange={(event) => setForm(current => ({ ...current, username: event.target.value.toLowerCase().replace(/\s+/g, '') }))} placeholder="Username" required />
            <Input type="number" min="5" max="120" value={form.age} onChange={(event) => setForm(current => ({ ...current, age: event.target.value }))} placeholder="Age" required />
          </div>
          {[
            ['motivation', 'Why do you want to join BeastBuck?'],
            ['interests', 'Interests'],
            ['skills', 'Current skills'],
            ['contributionGoals', 'Contribution goals'],
          ].map(([field, placeholder]) => <textarea key={field} value={form[field]} onChange={(event) => setForm(current => ({ ...current, [field]: event.target.value }))} rows={3} placeholder={placeholder} required={field === 'motivation'} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />)}
          <div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit Application'}</Button></div>
        </form>
      </PublicContainer>
    </>
  );
}

export function PublicMemberProfile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState({ experiments: [], products: [], projects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([PublicDataService.getPublicProfile(uid), PublicDataService.getProfileContent(uid)])
      .then(([nextProfile, nextContent]) => { if (!cancelled) { setProfile(nextProfile); setContent(nextContent); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [uid]);

  if (loading) return <PublicContainer><p className="text-text-muted">Loading public profile...</p></PublicContainer>;
  if (!profile) return <PublicContainer><p className="text-text-muted">Public profile not found.</p></PublicContainer>;

  return (
    <>
      <PageHero eyebrow="Public Profile" title={profile.displayName || profile.username || 'Member'} description={`Level ${profile.level || 1} / ${profile.xp || 0} XP`} icon={Award} />
      <PublicContainer>
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-5">
            <ProfileSection title="Experiments" items={content.experiments} />
            <ProfileSection title="Products" items={content.products} />
            <ProfileSection title="Projects" items={content.projects} />
          </div>
          <PublicCard>
            <h2 className="mb-3 font-bold text-white">Specializations</h2>
            <div className="flex flex-wrap gap-2">{(profile.specializations || []).length === 0 ? <p className="text-sm text-text-muted">No public badges yet.</p> : profile.specializations.map(item => <span key={item} className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{item}</span>)}</div>
            <h2 className="mb-3 mt-6 font-bold text-white">Achievements</h2>
            <div className="space-y-2">{(profile.achievements || []).length === 0 ? <p className="text-sm text-text-muted">No public achievements yet.</p> : profile.achievements.map((item, index) => <p key={index} className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-text-soft">{item.title || item.id || item}</p>)}</div>
          </PublicCard>
        </div>
      </PublicContainer>
    </>
  );
}

function ProfileSection({ title, items }) {
  return <PublicCard><h2 className="mb-3 font-bold text-white">{title}</h2>{items.length === 0 ? <p className="text-sm text-text-muted">Nothing public yet.</p> : <div className="grid gap-3 md:grid-cols-2">{items.map(item => <div key={item.id} className="rounded-lg bg-white/[0.03] p-3"><h3 className="font-bold text-white">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-text-muted">{item.description}</p></div>)}</div>}</PublicCard>;
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-2xl blur opacity-0 transition-opacity duration-300 focus-within:opacity-100" />
      <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-accent/30 focus-within:bg-black/50">
        <Search className="absolute left-4 h-5 w-5 text-text-muted" />
        <Input 
          value={value} 
          onChange={(event) => onChange(event.target.value)} 
          placeholder={placeholder} 
          className="pl-12 py-4 bg-transparent text-white placeholder:text-text-muted border-0 outline-none"
        />
      </div>
    </div>
  );
}

function PublicGrid({ loading, error, empty, children }) {
  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <p className="rounded-2xl border border-status-danger/30 bg-status-danger/10 p-6 text-center text-status-danger">{error}</p>;
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  if (!count) return (
    <div className="rounded-2xl border border-white/10 p-12 text-center text-text-muted">
      <p className="text-caption">{empty}</p>
    </div>
  );
  return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function PublicFooter() {
  return (
    <footer className="relative border-t border-border px-5 py-12 text-center">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-4xl">
        <img src="/logo.png" alt="BeastBuck" className="mx-auto h-12 w-auto mb-6 opacity-80" />
        <p className="text-sm text-text-muted mb-4">
          BeastBuck public pages protect internal workspace tools.
        </p>
        <Link to="/signin" className="inline-flex items-center gap-2 text-accent hover:text-cyan-400 font-semibold transition-colors hover:underline">
          Members sign in here
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </footer>
  );
}
