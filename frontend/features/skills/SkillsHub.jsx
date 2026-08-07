import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Brain, FileText, GraduationCap, Search, Star, Trophy, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { hasPermission } from '@shared/permissions/permissions';
import { UsersService } from '@services/firestore/users';
import { SkillsService, DEFAULT_SKILLS, RESOURCE_TYPES } from '@services/firestore/skills';
import { SPECIALIZATIONS } from '@shared/constants/specializations';

const EMPTY_SKILL = { name: '', overview: '', category: 'Knowledge', badge: 'researcher', featured: true };
const EMPTY_CHALLENGE = { skillId: 'physics', type: 'Challenge', title: '', body: '' };
const EMPTY_RESOURCE = { skillId: 'physics', type: 'website', title: '', description: '', url: '', featured: false };

function getExpertiseLevel(xp = 0) {
  const amount = Number(xp || 0);
  if (amount >= 500) return 'Expert';
  if (amount >= 250) return 'Advanced';
  if (amount >= 100) return 'Builder';
  if (amount > 0) return 'Learner';
  return 'New';
}

function topSkillEntries(skillXp = {}, skills = []) {
  return Object.entries(skillXp)
    .map(([skillId, xp]) => ({ skillId, xp: Number(xp || 0), skill: skills.find(item => item.id === skillId) }))
    .filter(item => item.skill)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);
}

function CeoSkillControls({ skills, members, onRefresh }) {
  const { user, roleData } = useAuth();
  const [mode, setMode] = useState('skill');
  const [skillForm, setSkillForm] = useState(EMPTY_SKILL);
  const [challengeForm, setChallengeForm] = useState(EMPTY_CHALLENGE);
  const [resourceForm, setResourceForm] = useState(EMPTY_RESOURCE);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('scientist');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const selectedMemberValue = selectedMember || members[0]?.id || '';

  const author = useMemo(() => ({
    uid: user?.uid,
    name: roleData?.displayName || roleData?.username || user?.displayName || 'Leadership',
  }), [roleData?.displayName, roleData?.username, user?.displayName, user?.uid]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'skill') {
        await SkillsService.createSkill(skillForm, user.uid);
        setSkillForm(EMPTY_SKILL);
        setMessage('Skill ecosystem created.');
      } else if (mode === 'challenge') {
        await SkillsService.createPost(challengeForm, author);
        setChallengeForm({ ...EMPTY_CHALLENGE, skillId: skills[0]?.id || 'physics' });
        setMessage('Skill challenge created.');
      } else if (mode === 'resource') {
        await SkillsService.createResource(resourceForm, author);
        setResourceForm({ ...EMPTY_RESOURCE, skillId: skills[0]?.id || 'physics' });
        setMessage('Resource created.');
      } else {
        await SkillsService.awardBadge(selectedMemberValue, selectedBadge);
        setMessage('Skill badge awarded.');
      }
      await onRefresh();
    } catch (err) {
      console.error('Skill CEO control failed:', err);
      setMessage('Action failed. Check required fields and permissions.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Award className="h-5 w-5 text-accent" />CEO Skill Controls</CardTitle>
        <CardDescription>Create skills, publish challenges/resources, and award specialization badges.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {message && <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">{message}</div>}
        <div className="grid gap-2 sm:grid-cols-4">
          {[
            ['skill', 'Skill'],
            ['challenge', 'Challenge'],
            ['resource', 'Resource'],
            ['badge', 'Badge'],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setMode(id)} className={`rounded-xl border px-3 py-2 text-sm font-bold ${mode === id ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border bg-white/[0.03] text-text-soft hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'skill' && (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <Input value={skillForm.name} onChange={(event) => setSkillForm(current => ({ ...current, name: event.target.value }))} placeholder="Skill name" required />
                <Input value={skillForm.category} onChange={(event) => setSkillForm(current => ({ ...current, category: event.target.value }))} placeholder="Category" />
                <select value={skillForm.badge} onChange={(event) => setSkillForm(current => ({ ...current, badge: event.target.value }))} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                  {SPECIALIZATIONS.map(badge => <option key={badge.id} value={badge.id}>{badge.name}</option>)}
                </select>
              </div>
              <textarea value={skillForm.overview} onChange={(event) => setSkillForm(current => ({ ...current, overview: event.target.value }))} rows={3} required placeholder="Skill overview" className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
            </>
          )}
          {mode === 'challenge' && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <select value={challengeForm.skillId} onChange={(event) => setChallengeForm(current => ({ ...current, skillId: event.target.value }))} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                  {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
                <Input value={challengeForm.title} onChange={(event) => setChallengeForm(current => ({ ...current, title: event.target.value }))} placeholder="Challenge title" required />
              </div>
              <textarea value={challengeForm.body} onChange={(event) => setChallengeForm(current => ({ ...current, body: event.target.value }))} rows={3} required placeholder="Challenge instructions" className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
            </>
          )}
          {mode === 'resource' && (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <select value={resourceForm.skillId} onChange={(event) => setResourceForm(current => ({ ...current, skillId: event.target.value }))} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                  {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
                <select value={resourceForm.type} onChange={(event) => setResourceForm(current => ({ ...current, type: event.target.value }))} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                  {RESOURCE_TYPES.map(type => <option key={type}>{type}</option>)}
                </select>
                <Input value={resourceForm.title} onChange={(event) => setResourceForm(current => ({ ...current, title: event.target.value }))} placeholder="Resource title" required />
              </div>
              <Input value={resourceForm.url} onChange={(event) => setResourceForm(current => ({ ...current, url: event.target.value }))} placeholder="https://..." required />
              <textarea value={resourceForm.description} onChange={(event) => setResourceForm(current => ({ ...current, description: event.target.value }))} rows={2} placeholder="Resource summary" className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
            </>
          )}
          {mode === 'badge' && (
            <div className="grid gap-3 md:grid-cols-2">
              <select value={selectedMemberValue} onChange={(event) => setSelectedMember(event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {members.map(member => <option key={member.id} value={member.id}>{member.displayName || member.username}</option>)}
              </select>
              <select value={selectedBadge} onChange={(event) => setSelectedBadge(event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {SPECIALIZATIONS.filter(item => item.id !== 'leader').map(badge => <option key={badge.id} value={badge.id}>{badge.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Run Control'}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

function SkillCard({ skill, currentUser }) {
  const xp = currentUser?.skillXp?.[skill.id] || 0;
  return (
    <Card className="rounded-lg">
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Brain className="h-7 w-7 text-accent" />
          {skill.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
        </div>
        <Link to={`/workspace/skills/${skill.id}`}><h3 className="text-lg font-bold text-white hover:text-accent">{skill.name}</h3></Link>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{skill.overview || skill.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-border bg-white/[0.03] p-3"><b className="text-white">{xp}</b><br /><span className="text-text-muted">{skill.name} XP</span></div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-3"><b className="text-white">{getExpertiseLevel(xp)}</b><br /><span className="text-text-muted">Level</span></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SkillsHub() {
  const { user, roleData } = useAuth();
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canManage = hasPermission(roleData?.role, 'canManageMembers');

  const loadSkills = async () => {
    setError('');
    try {
      const [nextSkills, nextMembers] = await Promise.all([
        SkillsService.getSkills(),
        UsersService.getAssignableMembers(),
      ]);
      setSkills(nextSkills);
      setMembers(nextMembers);
    } catch (err) {
      console.error('Skills load failed:', err);
      setError('Could not load the Skills Knowledge Network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => loadSkills(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (canManage && user?.uid) {
      SkillsService.seedDefaultSkills(user.uid).then(loadSkills).catch((err) => console.error('Default skill seed failed:', err));
    }
  }, [canManage, user?.uid]);

  const filtered = skills.filter(skill =>
    [skill.name, skill.overview, skill.description, skill.category].join(' ').toLowerCase().includes(search.toLowerCase())
  );
  const topSkills = topSkillEntries(roleData?.skillXp || {}, skills);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading skills..." /></div>;

  return (
    <PageContainer>
      <PageHeader
        title="Skill Ecosystems"
        description="Learning hub and knowledge network for BeastBuck skills, challenges, resources, projects, and experiments."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><GraduationCap className="h-6 w-6" /></div>}
      />
      {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}
      {canManage && <SectionWrapper><CeoSkillControls skills={skills} members={members} onRefresh={loadSkills} /></SectionWrapper>}

      <SectionWrapper>
        <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
          <Card className="rounded-lg">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Search className="h-5 w-5 text-accent" />Knowledge Search</CardTitle></CardHeader>
            <CardContent className="pt-0"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Physics, AI, Engineering..." /></CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-accent" />Your Top Skills</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {topSkills.length === 0 ? <p className="text-sm text-text-muted">Skill XP appears as you post, share resources, and complete challenges.</p> : topSkills.map(item => (
                <div key={item.skillId} className="flex justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
                  <span className="font-bold text-white">{item.skill.name}</span>
                  <span className="text-text-muted">{item.xp} XP / {getExpertiseLevel(item.xp)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      <SectionWrapper title="Skill Network">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(skill => <SkillCard key={skill.id} skill={skill} currentUser={roleData} />)}
        </div>
      </SectionWrapper>

      <SectionWrapper title="Knowledge Model">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [BookOpen, 'Discussions', 'Questions, guides, tutorials, discoveries, and peer learning.'],
            [FileText, 'Resources', 'Books, PDFs, videos, websites, and articles.'],
            [Star, 'Challenges', 'Skill-building missions with skill-specific XP rewards.'],
            [Users, 'Members', 'Profiles show skill XP, expertise levels, and earned badges.'],
          ].map(([Icon, title, detail]) => (
            <Card key={title} className="rounded-lg"><CardContent className="p-5"><Icon className="mb-3 h-6 w-6 text-accent" /><h3 className="font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-text-muted">{detail}</p></CardContent></Card>
          ))}
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}
