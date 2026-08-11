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
  Rocket,
  Target,
  Zap,
  Shield,
  Globe,
  Heart,
  Star,
} from 'lucide-react';
import { Input } from '@frontend/components/ui/Input';
import Button from '@frontend/components/ui/Button';
import { PublicDataService } from '@services/firestore/publicData';
import { MembershipService } from '@services/firestore/membership';
import { AnimatedBackground } from '@frontend/components/background/AnimatedBackground';
import { FadeIn, StaggeredChildren, ScaleIn, SlideIn } from '@frontend/components/transitions/PageTransition';
import { InteractiveCard } from '@frontend/components/ui/InteractiveCard';
import { cn } from '@shared/lib/utils';
import { useAuth } from '@frontend/features/auth/AuthContext';
import LandingHome from './LandingHome';

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
  return <LandingHome />;
}

export function PublicAbout() {
  return (
    <>
      <AnimatedBackground variant="mesh" intensity="medium" />
      <PageHero eyebrow="About" title="A public window into the BeastBuck invention lab." description="BeastBuck is a kid-friendly creative company OS. Public visitors can browse work, while private member tools stay protected." icon={BookOpen} />
      <PublicContainer>
        <StaggeredChildren staggerDelay={150}>
          {[
            {
              icon: Users,
              title: 'Visitors',
              description: 'Browse experiments, products, projects, achievements, and public profiles.',
              color: 'accent',
            },
            {
              icon: Rocket,
              title: 'Members',
              description: 'Create work, complete missions, earn XP, use chat, and collaborate inside the workspace.',
              color: 'status-success',
            },
            {
              icon: Shield,
              title: 'Leadership',
              description: 'Review applications, moderate content, approve structures, and guide the company.',
              color: 'status-warning',
            },
          ].map((item, index) => (
            <FadeIn key={index} delay={index * 150}>
              <InteractiveCard
                key={index}
                hoverable={true}
                depth={2}
                className="group p-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl" />
                  <div className="relative flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                      item.color === 'accent' ? "bg-accent/10" : item.color === 'status-success' ? "bg-status-success/10" : "bg-status-warning/10"
                    )}>
                      <item.icon className={cn(
                        "w-7 h-7",
                        item.color === 'accent' ? "text-accent" : item.color === 'status-success' ? "text-status-success" : "text-status-warning"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading text-xl font-bold text-text mb-2 group-hover:text-accent transition-colors">{item.title}</h2>
                      <p className="text-description text-text-muted leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              </InteractiveCard>
            </FadeIn>
          ))}
        </StaggeredChildren>

        {/* Mission Section */}
        <FadeIn delay={500}>
          <div className="mt-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 backdrop-blur-sm mb-6">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Our Mission</span>
              </div>
              <h2 className="font-heading text-4xl font-black text-text mb-4">Empowering Young Creators</h2>
              <p className="text-description text-text-muted max-w-2xl mx-auto">
                BeastBuck provides a safe, fun, and educational environment where kids can learn, create, and collaborate on real projects.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Zap, title: 'Learn', description: 'Gain skills in coding, design, and business through hands-on projects.' },
                { icon: Globe, title: 'Collaborate', description: 'Work with other young creators from around the world.' },
                { icon: Heart, title: 'Grow', description: 'Build your portfolio, earn XP, and showcase your achievements.' },
              ].map((item, index) => (
                <ScaleIn key={index} delay={index * 100}>
                  <InteractiveCard hoverable={true} depth={1} className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-premium-1 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-text" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-text mb-2">{item.title}</h3>
                    <p className="text-badge text-text-muted">{item.description}</p>
                  </InteractiveCard>
                </ScaleIn>
              ))}
            </div>
          </div>
        </FadeIn>
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
      <AnimatedBackground variant="aurora" intensity="medium" />
      <PageHero eyebrow="Hall of Fame" title="BeastBuck public achievements." description="Celebrate XP, contributions, scientists, developers, and inventors." icon={Trophy} />
      <PublicContainer>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && <p className="rounded-2xl border border-status-danger/30 bg-status-danger/10 p-6 text-center text-status-danger">{error}</p>}
        
        {!loading && !error && (
          <StaggeredChildren staggerDelay={100}>
            <div className="grid gap-6 lg:grid-cols-2">
              {groups.map(([title, people], groupIndex) => (
                <FadeIn key={title} delay={groupIndex * 100}>
                  <InteractiveCard hoverable={true} depth={2} className="group p-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl" />
                      <div className="relative">
                        <h2 className="mb-6 flex items-center gap-3 font-heading text-xl font-bold text-text">
                          <div className="w-10 h-10 rounded-xl bg-gradient-premium-1 flex items-center justify-center shrink-0">
                            <Medal className="h-5 w-5 text-text" />
                          </div>
                          <span className="truncate">{title}</span>
                        </h2>
                        <div className="space-y-2">
                          {people.slice(0, 8).length === 0 ? (
                            <div className="text-center py-8">
                              <Star className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                              <p className="text-badge text-text-muted">No members yet.</p>
                            </div>
                          ) : (
                            people.slice(0, 8).map((person, index) => (
                              <ScaleIn key={person.id} delay={index * 50}>
                                <Link
                                  to={`/members/${person.id}`}
                                  className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3 text-sm hover:border-accent/30 hover:bg-surface-100 transition-all duration-base group/item"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-premium-1 flex items-center justify-center text-text font-bold text-badge shrink-0">
                                      {index + 1}
                                    </div>
                                    <span className="font-medium text-text group-hover/item:text-accent transition-colors truncate">{person.displayName || person.username}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-status-success" />
                                    <span className="text-badge text-text-muted">{person.xp || 0} XP</span>
                                  </div>
                                </Link>
                              </ScaleIn>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </InteractiveCard>
                </FadeIn>
              ))}
            </div>
          </StaggeredChildren>
        )}
      </PublicContainer>
    </>
  );
}

export function JoinPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', age: '', motivation: '', interests: '', skills: '', contributionGoals: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

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
      <AnimatedBackground variant="particles" intensity="medium" />
      <PageHero eyebrow="Join" title="Apply for BeastBuck membership." description="Tell leadership what you want to learn, build, and contribute." icon={Users} />
      <PublicContainer className="max-w-4xl">
        <FadeIn>
          <InteractiveCard depth={3} className="group p-6 md:p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl" />
              <div className="relative">
                {status && (
                  <SlideIn direction="down">
                    <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent mb-6">
                      {status}
                    </div>
                  </SlideIn>
                )}
                
                <form onSubmit={submit} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 backdrop-blur-sm mb-4">
                      <Star className="h-4 w-4 text-accent" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Application Form</span>
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-text">Join BeastBuck</h3>
                    <p className="text-description text-text-muted mt-2">Fill out the form below to apply for membership</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <ScaleIn delay={0}>
                      <Input 
                        value={form.name} 
                        onChange={(event) => setForm(current => ({ ...current, name: event.target.value }))} 
                        placeholder="Name" 
                        required 
                        className="transition-all duration-base focus:scale-[1.02]"
                      />
                    </ScaleIn>
                    <ScaleIn delay={50}>
                      <Input 
                        value={form.username} 
                        onChange={(event) => setForm(current => ({ ...current, username: event.target.value.toLowerCase().replace(/\s+/g, '') }))} 
                        placeholder="Username" 
                        required 
                        className="transition-all duration-base focus:scale-[1.02]"
                      />
                    </ScaleIn>
                    <ScaleIn delay={100}>
                      <Input 
                        type="number" 
                        min="5" 
                        max="120" 
                        value={form.age} 
                        onChange={(event) => setForm(current => ({ ...current, age: event.target.value }))} 
                        placeholder="Age" 
                        required 
                        className="transition-all duration-base focus:scale-[1.02]"
                      />
                    </ScaleIn>
                  </div>

                  <div className="space-y-4">
                    {[
                      ['motivation', 'Why do you want to join BeastBuck?', Rocket],
                      ['interests', 'Interests', Heart],
                      ['skills', 'Current skills', Zap],
                      ['contributionGoals', 'Contribution goals', Target],
                    ].map(([field, placeholder, Icon], index) => (
                      <ScaleIn key={field} delay={index * 50}>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-text-muted pointer-events-none">
                            <Icon className="w-5 h-5" />
                          </div>
                          <textarea
                            key={field}
                            value={form[field]}
                            onChange={(event) => setForm(current => ({ ...current, [field]: event.target.value }))}
                            rows={3}
                            placeholder={placeholder}
                            required={field === 'motivation'}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 pl-12 text-sm text-text outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-base focus:scale-[1.01] resize-none"
                          />
                        </div>
                      </ScaleIn>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={busy}
                      variant="primary"
                      size="lg"
                      ripple={true}
                      className="min-h-[48px]"
                    >
                      {busy ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </InteractiveCard>
        </FadeIn>

        {/* Benefits Section */}
        <FadeIn delay={300}>
          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="font-heading text-2xl font-bold text-text mb-2">Why Join BeastBuck?</h3>
              <p className="text-description text-text-muted">Discover the benefits of becoming a member</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Zap, title: 'Learn Skills', description: 'Gain real-world skills in coding, design, and business' },
                { icon: Users, title: 'Collaborate', description: 'Work with other young creators from around the world' },
                { icon: Trophy, title: 'Earn XP', description: 'Complete missions and build your achievement portfolio' },
              ].map((item, index) => (
                <ScaleIn key={index} delay={index * 100}>
                  <InteractiveCard hoverable={true} depth={1} className="text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-premium-1 flex items-center justify-center mx-auto mb-4 shrink-0">
                      <item.icon className="w-6 h-6 text-text" />
                    </div>
                    <h4 className="font-heading text-lg font-bold text-text mb-2">{item.title}</h4>
                    <p className="text-badge text-text-muted">{item.description}</p>
                  </InteractiveCard>
                </ScaleIn>
              ))}
            </div>
          </div>
        </FadeIn>
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
