import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Atom,
  Bot,
  BriefcaseBusiness,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useAI } from '../ai/AIProvider';
import { UniverseService } from '../../services/firebase/universe';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function UniverseHome() {
  const { user } = useAuth();
  const { openAssistant } = useAI();
  const [data, setData] = useState(null);
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const dashboard = await UniverseService.getUniverseDashboard(user.uid);
        if (cancelled) return;
        setData(dashboard);
        const resolved = {};
        for (const col of dashboard.collections.slice(0, 3)) {
          resolved[col.id] = await UniverseService.resolveSmartCollection(col);
        }
        if (!cancelled) setCollections(resolved);
      } catch (err) {
        console.error('Universe dashboard failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><CardSkeleton /></div>
            <div><CardSkeleton /></div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const { goals = [], recommendations = [], projects = [], tasks = [], enrollments = [], journey = {} } = data || {};

  return (
    <PageContainer>
      <PageHeader
        title="BeastBuck Universe"
        description="Your intelligent operating system — knowledge, people, projects, and opportunities in one place."
        hero={true}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/search">
              <Button variant="secondary" size="sm">
                <Search className="mr-2 h-4 w-4" /> Search Everything
              </Button>
            </Link>
            <Button size="sm" onClick={() => openAssistant('general', { type: 'universe', data: { page: 'universe' } })}>
              <Bot className="mr-2 h-4 w-4" /> AI Assistant
            </Button>
          </div>
        }
      />

      <SectionWrapper>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active Goals', value: goals.filter(g => g.status === 'ACTIVE').length, icon: Target, link: '/universe/goals' },
            { label: 'Projects', value: projects.length, icon: Lightbulb, link: '/workspace' },
            { label: 'Milestones', value: Object.keys(journey.milestones || {}).length, icon: Zap, link: '/profile' },
          ].map(({ label, value, icon: Icon, link }) => (
            <Link key={label} to={link}>
              <Card className="rounded-xl transition hover:border-accent/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-xs text-text-muted">{label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionWrapper title="Recommended For You" className="lg:col-span-2">
          {recommendations.length === 0 ? (
            <EmptyState icon={Sparkles} title="No recommendations yet" description="Set interests in your profile to personalize your BeastBuck experience." gradient={true} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendations.map((rec, i) => (
                <Link key={i} to={rec.link || '#'}>
                  <Card className="rounded-xl transition hover:border-accent/20">
                    <CardContent className="p-4">
                      <p className="text-xs font-bold uppercase text-accent">{rec.type}</p>
                      <h3 className="mt-1 font-bold text-white">{rec.title}</h3>
                      <p className="mt-1 text-sm text-text-muted">{rec.reason}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </SectionWrapper>

        <SectionWrapper title="Quick AI">
          <Card className="rounded-xl border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardContent className="space-y-3 p-4">
              <p className="text-sm text-text-muted">Ask the BeastBuck assistant:</p>
              {[
                'What should I work on next?',
                'Which research relates to AI?',
                'Recommend a venture team.',
              ].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => openAssistant('general', { type: 'universe', data: { question: q } })}
                  className="block w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-left text-sm text-white transition hover:border-accent/30 hover:bg-accent/5"
                >
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>
        </SectionWrapper>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionWrapper title="Your Goals">
          {goals.length === 0 ? (
            <EmptyState 
              icon={Target} 
              title="No goals yet" 
              description="Set your first goal to track your progress in the BeastBuck ecosystem."
              action={<Link to="/universe/goals"><Button size="sm">Create a Goal</Button></Link>}
            />
          ) : (
            <div className="space-y-2">
              {goals.slice(0, 4).map(g => (
                <Card key={g.id} className="rounded-xl">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-xs font-bold text-accent">{g.type}</p>
                      <p className="font-bold text-white">{g.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">{g.progress || 0}%</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </SectionWrapper>

        <SectionWrapper title="Tasks & Projects">
          <div className="space-y-2">
            {tasks.slice(0, 3).map(t => (
              <Card key={t.id} className="rounded-xl">
                <CardContent className="p-3">
                  <p className="font-bold text-white">{t.title}</p>
                  <p className="text-xs text-text-muted">{t.status}</p>
                </CardContent>
              </Card>
            ))}
            {projects.slice(0, 2).map(p => (
              <Card key={p.id} className="rounded-xl">
                <CardContent className="p-3">
                  <p className="font-bold text-white">{p.title}</p>
                  <p className="text-xs text-text-muted">{p.status} · Project</p>
                </CardContent>
              </Card>
            ))}
            {tasks.length === 0 && projects.length === 0 && (
              <EmptyState 
                icon={Lightbulb} 
                title="No active tasks or projects" 
                description="Your tasks and projects will appear here once you start working on them."
              />
            )}
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper title="Smart Collections">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data?.collections || []).map(col => (
            <Card key={col.id} className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  {col.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(collections[col.id] || []).slice(0, 4).map((item, i) => (
                  <Link key={i} to={item.link || '#'} className="block text-sm text-text-soft hover:text-accent">
                    {item.title}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper title="Ecosystem">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[
            { name: 'Research', path: '/innovation', icon: FlaskConical },
            { name: 'Ventures', path: '/ventures', icon: BriefcaseBusiness },
            { name: 'Community', path: '/communities', icon: Users },
            { name: 'Marketplace', path: '/marketplace', icon: Atom },
            { name: 'Knowledge Graph', path: '/universe/graph', icon: Sparkles },
            { name: 'Search', path: '/search', icon: Search },
          ].map(({ name, path, icon: Icon }) => (
            <Link
              key={name}
              to={path}
              className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] px-4 py-3 transition hover:border-accent/30 hover:bg-accent/5"
            >
              <Icon className="h-5 w-5 text-accent" />
              <span className="text-sm font-bold text-white">{name}</span>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}
