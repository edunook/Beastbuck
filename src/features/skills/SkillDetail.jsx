import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink, FileText, FlaskConical, FolderKanban, MessageSquare, Plus, Star, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SkillsService, RESOURCE_TYPES, SKILL_POST_TYPES } from '../../services/firebase/skills';
import { UsersService } from '../../services/firebase/users';
import { ExperimentsService } from '../../services/firebase/experiments';
import { OrganizationService } from '../../services/firebase/organization';
import { hasPermission } from '../../services/firebase/permissions';

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Recently';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function expertiseLevel(xp = 0) {
  const amount = Number(xp || 0);
  if (amount >= 500) return 'Expert';
  if (amount >= 250) return 'Advanced';
  if (amount >= 100) return 'Builder';
  if (amount > 0) return 'Learner';
  return 'New';
}

function PostForm({ skillId, author, onCreated }) {
  const [form, setForm] = useState({ skillId, type: 'Discussion', title: '', body: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await SkillsService.createPost({ ...form, skillId }, author);
      setForm({ skillId, type: 'Discussion', title: '', body: '' });
      await onCreated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-black/20 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <select value={form.type} onChange={(event) => setForm(current => ({ ...current, type: event.target.value }))} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
          {SKILL_POST_TYPES.map(type => <option key={type}>{type}</option>)}
        </select>
        <Input className="md:col-span-2" value={form.title} onChange={(event) => setForm(current => ({ ...current, title: event.target.value }))} placeholder="Post title" required />
      </div>
      <textarea value={form.body} onChange={(event) => setForm(current => ({ ...current, body: event.target.value }))} rows={3} placeholder="Share a question, guide, tutorial, challenge, resource note, or discovery..." required className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
      <div className="flex justify-end"><Button type="submit" disabled={busy}><Plus className="mr-2 h-4 w-4" />Post</Button></div>
    </form>
  );
}

function ResourceForm({ skillId, author, onCreated }) {
  const [form, setForm] = useState({ skillId, type: 'website', title: '', description: '', url: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await SkillsService.createResource({ ...form, skillId }, author);
      setForm({ skillId, type: 'website', title: '', description: '', url: '' });
      await onCreated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-black/20 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <select value={form.type} onChange={(event) => setForm(current => ({ ...current, type: event.target.value }))} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
          {RESOURCE_TYPES.map(type => <option key={type}>{type}</option>)}
        </select>
        <Input className="md:col-span-2" value={form.title} onChange={(event) => setForm(current => ({ ...current, title: event.target.value }))} placeholder="Resource title" required />
      </div>
      <Input value={form.url} onChange={(event) => setForm(current => ({ ...current, url: event.target.value }))} placeholder="https://..." required />
      <textarea value={form.description} onChange={(event) => setForm(current => ({ ...current, description: event.target.value }))} rows={2} placeholder="Why this resource is useful" className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
      <div className="flex justify-end"><Button type="submit" disabled={busy}><Plus className="mr-2 h-4 w-4" />Add Resource</Button></div>
    </form>
  );
}

export default function SkillDetail() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [network, setNetwork] = useState({ skill: null, discussions: [], challenges: [], resources: [] });
  const [members, setMembers] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canManage = hasPermission(roleData?.role, 'canManageMembers');

  const author = useMemo(() => ({
    uid: user?.uid,
    name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
  }), [roleData?.displayName, roleData?.username, user?.displayName, user?.uid]);

  const loadNetwork = async () => {
    setError('');
    try {
      const [nextNetwork, nextMembers, nextExperiments, organization] = await Promise.all([
        SkillsService.getSkillNetwork(skillId),
        UsersService.getAssignableMembers(),
        ExperimentsService.searchExperiments({ search: skillId }),
        OrganizationService.getOrganization(),
      ]);
      setNetwork(nextNetwork);
      setMembers(nextMembers.filter(member => Number(member.skillXp?.[skillId] || 0) > 0 || member.specializations?.includes(nextNetwork.skill?.badge)));
      setExperiments(nextExperiments);
      const needle = [nextNetwork.skill?.name, skillId].join(' ').toLowerCase();
      setProjects(organization.projects.filter(project =>
        project.status !== 'ARCHIVED' && [project.title, project.description].join(' ').toLowerCase().split(/\s+/).some(word => needle.includes(word))
      ));
    } catch (err) {
      console.error('Skill network load failed:', err);
      setError('Could not load this skill ecosystem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => loadNetwork(), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId]);

  const featureResource = async (resource) => {
    await SkillsService.featureResource(resource.id, !resource.featured);
    await loadNetwork();
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading skill..." /></div>;
  if (!network.skill) return <PageContainer><div className="rounded-2xl border border-border bg-surface p-8 text-center text-white">Skill not found.</div></PageContainer>;

  const currentXp = roleData?.skillXp?.[skillId] || 0;

  return (
    <PageContainer>
      <div className="mb-5">
        <Button variant="ghost" onClick={() => navigate('/workspace/skills')}><ArrowLeft className="mr-2 h-4 w-4" />Back to Skills</Button>
      </div>
      {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}
      <section className="mb-6 rounded-2xl border border-border bg-surface/70 p-5 md:p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{network.skill.category}</span>
          {network.skill.badge && <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{network.skill.badge} badge path</span>}
        </div>
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">{network.skill.name}</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-text-muted">{network.skill.overview || network.skill.description}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-white/[0.03] p-3"><b className="text-white">{currentXp}</b><br /><span className="text-xs text-text-muted">Your Skill XP</span></div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-3"><b className="text-white">{expertiseLevel(currentXp)}</b><br /><span className="text-xs text-text-muted">Expertise</span></div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-3"><b className="text-white">{network.challenges.length}</b><br /><span className="text-xs text-text-muted">Challenges</span></div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-3"><b className="text-white">{network.resources.length}</b><br /><span className="text-xs text-text-muted">Resources</span></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-5 w-5 text-accent" />Discussions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <PostForm skillId={skillId} author={author} onCreated={loadNetwork} />
              {network.discussions.length === 0 ? <p className="text-sm text-text-muted">No discussions yet.</p> : network.discussions.map(post => (
                <article key={post.id} className="rounded-xl border border-border bg-white/[0.03] p-4">
                  <div className="mb-2 flex flex-wrap gap-2"><span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{post.type}</span><span className="text-xs text-text-muted">{formatDate(post.createdAt)}</span></div>
                  <h3 className="font-bold text-white">{post.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-soft">{post.body}</p>
                  <p className="mt-3 text-xs text-text-muted">By {post.authorName || 'Member'}</p>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Star className="h-5 w-5 text-accent" />Challenges</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {network.challenges.length === 0 ? <p className="text-sm text-text-muted">No challenges yet.</p> : network.challenges.map(challenge => (
                <article key={challenge.id} className="rounded-xl border border-border bg-white/[0.03] p-4">
                  <h3 className="font-bold text-white">{challenge.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-soft">{challenge.body}</p>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-accent" />Resources</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ResourceForm skillId={skillId} author={author} onCreated={loadNetwork} />
              {network.resources.length === 0 ? <p className="text-sm text-text-muted">No resources yet.</p> : network.resources.map(resource => (
                <article key={resource.id} className="rounded-xl border border-border bg-white/[0.03] p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{resource.type}</span>
                    {resource.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
                  </div>
                  <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-white hover:text-accent">{resource.title}<ExternalLink className="h-4 w-4" /></a>
                  {resource.description && <p className="mt-2 text-sm leading-6 text-text-muted">{resource.description}</p>}
                  {canManage && <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={() => featureResource(resource)}>{resource.featured ? 'Unfeature' : 'Feature Resource'}</Button>}
                </article>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-accent" />Members</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {members.length === 0 ? <p className="text-sm text-text-muted">Members appear after earning skill XP or badges.</p> : members.map(member => (
                <Link key={member.id} to={`/profile/${member.id}`} className="block rounded-xl border border-border bg-white/[0.03] p-3 hover:border-accent/40">
                  <p className="text-sm font-bold text-white">{member.displayName || member.username}</p>
                  <p className="mt-1 text-xs text-text-muted">{member.skillXp?.[skillId] || 0} XP / {expertiseLevel(member.skillXp?.[skillId] || 0)}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FolderKanban className="h-5 w-5 text-accent" />Projects</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {projects.length === 0 ? <p className="text-sm text-text-muted">No linked projects yet.</p> : projects.map(project => <p key={project.id} className="rounded-xl border border-border bg-white/[0.03] p-3 text-sm font-bold text-white">{project.title}</p>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FlaskConical className="h-5 w-5 text-accent" />Experiments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {experiments.length === 0 ? <p className="text-sm text-text-muted">No linked experiments yet.</p> : experiments.map(experiment => <Link key={experiment.id} to={`/workspace/experiments/${experiment.id}`} className="block rounded-xl border border-border bg-white/[0.03] p-3 text-sm font-bold text-white hover:border-accent/40">{experiment.title}</Link>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-accent" />Overview</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-7 text-text-soft">{network.skill.description || network.skill.overview}</p></CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
