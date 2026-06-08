import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  Compass,
  Flag,
  Lightbulb,
  MessageSquare,
  Plus,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CommunityService, DEFAULT_COMMUNITIES } from '../../services/firebase/community';
import { UniverseService } from '../../services/firebase/universe';
import { hasPermission } from '../../services/firebase/permissions';

const POST_TYPES = ['DISCUSSION', 'PROJECT', 'INVENTION', 'RESEARCH', 'QUESTION', 'VENTURE_UPDATE'];
const SHOWCASE_TYPES = ['PROJECT', 'INVENTION', 'RESEARCH', 'DOCUMENT', 'CERTIFICATE', 'ACHIEVEMENT'];
const REACTIONS = [
  ['useful', 'Useful'],
  ['insightful', 'Insightful'],
  ['innovative', 'Innovative'],
  ['supportive', 'Supportive'],
];
const COMMENT_REACTIONS = [
  ['useful', 'Useful'],
  ['supportive', 'Supportive'],
];

function getAuthor(user, roleData) {
  return {
    uid: user?.uid,
    name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
    username: roleData?.username || user?.displayName || '',
  };
}

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Recently';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function reputation(profile) {
  const rep = profile?.reputation || {};
  return [
    ['Contribution', rep.contributionScore || 0],
    ['Knowledge', rep.knowledgeScore || 0],
    ['Innovation', rep.innovationScore || 0],
    ['Collaboration', rep.collaborationScore || 0],
  ];
}

function ReportButton({ targetType, targetId, reporter }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return;
    await CommunityService.reportContent({ targetType, targetId, reason, reporter });
    setSent(true);
    setOpen(false);
    setReason('');
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(current => !current)} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-status-warning">
        <Flag className="h-3.5 w-3.5" /> {sent ? 'Reported' : 'Report'}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-border bg-surface p-3 shadow-2xl">
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why should this be reviewed?" rows={3} className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent" />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" size="sm" onClick={submit} disabled={!reason.trim()}>Send</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CommunitiesPage() {
  const { user, roleData } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [memberships, setMemberships] = useState({});
  const [loading, setLoading] = useState(true);
  const author = useMemo(() => getAuthor(user, roleData), [roleData, user]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (user?.uid) await CommunityService.seedDefaultCommunities(user.uid);
        const result = await CommunityService.getCommunities();
        if (cancelled) return;
        setCommunities(result);
        const states = {};
        await Promise.all(result.map(async community => {
          states[community.id] = await CommunityService.getMembership(community.id, user?.uid);
        }));
        if (!cancelled) setMemberships(states);
      } catch (err) {
        console.error('Communities load failed:', err);
        if (!cancelled) setCommunities(DEFAULT_COMMUNITIES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const toggleJoin = async (community) => {
    if (memberships[community.id]) {
      await CommunityService.leaveCommunity(community.id, user.uid);
      setMemberships(current => ({ ...current, [community.id]: null }));
    } else {
      await CommunityService.joinCommunity(community, author);
      setMemberships(current => ({ ...current, [community.id]: { communityId: community.id, userId: user.uid } }));
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Communities" description="Join communities for programming, science, robotics, AI, design, marketing, engineering, innovation, and leadership." hero={true} action={<Users className="h-8 w-8 text-accent" />} />
      <SectionWrapper>
        <Card className="rounded-lg border-accent/20 bg-accent/5">
          <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_18rem] md:items-center">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-white"><Bot className="h-5 w-5 text-accent" />AI Community Recommendations</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">Recommended starting points: AI, Programming, Innovation, and Science based on BeastBuck's current academy, research, and workspace roadmap.</p>
            </div>
            <Link to="/discover" className="inline-flex justify-center rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-bold text-accent hover:bg-accent/15">Explore Discovery</Link>
          </CardContent>
        </Card>
      </SectionWrapper>
      <SectionWrapper>
        {loading ? <LoadingState text="Loading communities..." /> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {communities.map(community => (
              <Card key={community.id} className="rounded-lg">
                <CardContent className="p-5">
                  <p className="mb-3 w-fit rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{community.category}</p>
                  <Link to={`/communities/${community.id}`}><h2 className="text-lg font-bold text-white hover:text-accent">{community.name}</h2></Link>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{community.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-text-muted">
                    <span>{community.memberCount || 0} members</span>
                    <span>{community.postCount || 0} posts</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant={memberships[community.id] ? 'secondary' : 'primary'} onClick={() => toggleJoin(community)} className="flex-1">
                      {memberships[community.id] ? 'Leave' : 'Join'}
                    </Button>
                    <Link to={`/communities/${community.id}`} className="flex-1 rounded-xl border border-border px-3 py-1.5 text-center text-sm font-bold text-text-soft hover:text-white">Open</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}

export function CommunityDetailPage() {
  const { communityId } = useParams();
  const { user, roleData } = useAuth();
  const [community, setCommunity] = useState(null);
  const [membership, setMembership] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'DISCUSSION', category: '' });
  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const author = useMemo(() => getAuthor(user, roleData), [roleData, user]);
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');

  const reloadCommunity = async () => {
    const [nextCommunity, nextMembership] = await Promise.all([
      CommunityService.getCommunity(communityId),
      CommunityService.getMembership(communityId, user?.uid),
    ]);
    const nextPosts = await CommunityService.getCommunityPosts(communityId);
    const nextComments = await CommunityService.getComments(nextPosts.map(post => post.id));
    setCommunity(nextCommunity);
    setMembership(nextMembership);
    setPosts(nextPosts);
    setComments(nextComments);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadCommunity() {
      try {
        const [nextCommunity, nextMembership] = await Promise.all([
          CommunityService.getCommunity(communityId),
          CommunityService.getMembership(communityId, user?.uid),
        ]);
        const nextPosts = await CommunityService.getCommunityPosts(communityId);
        const nextComments = await CommunityService.getComments(nextPosts.map(post => post.id));
        if (cancelled) return;
        setCommunity(nextCommunity);
        setMembership(nextMembership);
        setPosts(nextPosts);
        setComments(nextComments);
      } catch (err) {
        console.error('Community detail failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCommunity();
    return () => { cancelled = true; };
  }, [communityId, user?.uid]);

  const join = async () => {
    await CommunityService.joinCommunity(community, author);
    await reloadCommunity();
  };

  const submitPost = async (event) => {
    event.preventDefault();
    await CommunityService.createPost(community, { ...postForm, category: postForm.category || community.category }, author);
    setPostForm({ title: '', content: '', type: 'DISCUSSION', category: '' });
    await reloadCommunity();
  };

  const submitComment = async (postId, parentCommentId = null) => {
    const key = parentCommentId || postId;
    const text = commentDrafts[key] || '';
    await CommunityService.addComment({ postId, communityId, parentCommentId, text, author });
    setCommentDrafts(current => ({ ...current, [key]: '' }));
    setReplyTo(null);
    await reloadCommunity();
  };

  const react = async (post, key) => {
    const users = Array.isArray(post.reactions?.[key]) ? post.reactions[key] : [];
    await CommunityService.reactToPost(post.id, key, user.uid, users.includes(user.uid));
    await reloadCommunity();
  };

  const reactToComment = async (comment, key) => {
    const users = Array.isArray(comment.reactions?.[key]) ? comment.reactions[key] : [];
    await CommunityService.reactToComment(comment.id, key, user.uid, users.includes(user.uid));
    await reloadCommunity();
  };

  const removeContent = async (targetType, targetId) => {
    if (!window.confirm('Remove this content from the community?')) return;
    await CommunityService.removeContent(targetType, targetId);
    await reloadCommunity();
  };

  const commentsFor = (postId, parentCommentId = null) => comments.filter(comment => comment.postId === postId && (comment.parentCommentId || null) === parentCommentId);

  if (loading) return <PageContainer><LoadingState text="Loading community..." /></PageContainer>;
  if (!community) return <PageContainer><Empty icon={Users} title="Community not found" /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader title={community.name} description={community.description} action={<Button onClick={join} disabled={Boolean(membership)}>{membership ? 'Joined' : 'Join Community'}</Button>} />
      <SectionWrapper>
        <Card className="rounded-lg">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5 text-accent" />Start a Discussion</CardTitle></CardHeader>
          <CardContent>
            {!membership ? (
              <p className="text-sm text-text-muted">Join this community to post and comment.</p>
            ) : (
              <form onSubmit={submitPost} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-[1fr_12rem]">
                  <Input value={postForm.title} onChange={(event) => setPostForm(current => ({ ...current, title: event.target.value }))} placeholder="Post title" required />
                  <select value={postForm.type} onChange={(event) => setPostForm(current => ({ ...current, type: event.target.value }))} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                    {POST_TYPES.map(type => <option key={type}>{type}</option>)}
                  </select>
                </div>
                <textarea value={postForm.content} onChange={(event) => setPostForm(current => ({ ...current, content: event.target.value }))} placeholder="Share a project, invention, research update, question, or venture note..." rows={4} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent" required />
                <div className="flex justify-end"><Button type="submit">Publish</Button></div>
              </form>
            )}
          </CardContent>
        </Card>
      </SectionWrapper>
      <SectionWrapper>
        <div className="space-y-4">
          {posts.length === 0 ? <Empty icon={MessageSquare} title="No discussions yet" /> : posts.map(post => (
            <Card key={post.id} className="rounded-lg">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="mb-2 w-fit rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{post.type}</p>
                    <h2 className="text-lg font-bold text-white">{post.title}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-text-soft">{post.content}</p>
                    <p className="mt-3 text-xs text-text-muted">By {post.authorName} / {formatDate(post.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {canModerate && <button type="button" onClick={() => removeContent('POST', post.id)} className="text-xs font-bold text-status-danger hover:text-white">Remove</button>}
                    <ReportButton targetType="POST" targetId={post.id} reporter={author} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {REACTIONS.map(([key, label]) => {
                    const users = Array.isArray(post.reactions?.[key]) ? post.reactions[key] : [];
                    const active = users.includes(user?.uid);
                    return <button key={key} type="button" onClick={() => react(post, key)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${active ? 'border-accent/40 bg-accent/10 text-white' : 'border-border text-text-muted hover:text-white'}`}>{label} {users.length || ''}</button>;
                  })}
                </div>
                <div className="mt-5 space-y-3">
                  {commentsFor(post.id).map(comment => (
                    <div key={comment.id} className="rounded-xl border border-border bg-white/[0.03] p-3">
                      <div className="flex justify-between gap-3">
                        <p className="text-sm font-bold text-white">{comment.authorName}</p>
                        <div className="flex items-center gap-3">
                          {canModerate && <button type="button" onClick={() => removeContent('COMMENT', comment.id)} className="text-xs font-bold text-status-danger hover:text-white">Remove</button>}
                          <ReportButton targetType="COMMENT" targetId={comment.id} reporter={author} />
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-text-soft">{comment.text}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {COMMENT_REACTIONS.map(([key, label]) => {
                          const users = Array.isArray(comment.reactions?.[key]) ? comment.reactions[key] : [];
                          const active = users.includes(user?.uid);
                          return <button key={key} type="button" onClick={() => reactToComment(comment, key)} className={`rounded-full border px-2.5 py-1 text-xs font-bold ${active ? 'border-accent/40 bg-accent/10 text-white' : 'border-border text-text-muted hover:text-white'}`}>{label} {users.length || ''}</button>;
                        })}
                      </div>
                      <button type="button" onClick={() => setReplyTo(comment.id)} className="mt-2 text-xs font-bold text-accent">Reply</button>
                      {commentsFor(post.id, comment.id).map(reply => <p key={reply.id} className="ml-4 mt-2 rounded-lg bg-black/20 p-2 text-sm text-text-muted">{reply.authorName}: {reply.text}</p>)}
                      {replyTo === comment.id && <CommentBox value={commentDrafts[comment.id] || ''} onChange={value => setCommentDrafts(current => ({ ...current, [comment.id]: value }))} onSubmit={() => submitComment(post.id, comment.id)} onCancel={() => setReplyTo(null)} />}
                    </div>
                  ))}
                  {membership && <CommentBox value={commentDrafts[post.id] || ''} onChange={value => setCommentDrafts(current => ({ ...current, [post.id]: value }))} onSubmit={() => submitComment(post.id)} />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}

function CommentBox({ value, onChange, onSubmit, onCancel }) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Write a comment..." className="h-10 flex-1 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent" />
      <Button type="button" size="sm" onClick={onSubmit} disabled={!value.trim()}>Send</Button>
      {onCancel && <Button type="button" size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>}
    </div>
  );
}

export function PublicUserPage() {
  const { username } = useParams();
  const { user, roleData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [followState, setFollowState] = useState({ following: false, mutual: false });
  const [loading, setLoading] = useState(true);
  const author = useMemo(() => getAuthor(user, roleData), [roleData, user]);

  useEffect(() => {
    let cancelled = false;
    CommunityService.getPublicProfileByUsername(username)
      .then(async result => {
        if (cancelled) return;
        setProfile(result);
        if (result && user?.uid) setFollowState(await CommunityService.getFollowState(user.uid, result.uid));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [username, user?.uid]);

  const toggleFollow = async () => {
    if (!profile || !user?.uid) return;
    if (followState.following) await CommunityService.unfollowMember(user.uid, profile.uid);
    else await CommunityService.followMember(author, { uid: profile.uid, name: profile.displayName || profile.username });
    setFollowState(await CommunityService.getFollowState(user.uid, profile.uid));
  };

  if (loading) return <PageContainer><LoadingState text="Loading public profile..." /></PageContainer>;
  if (!profile) return <PageContainer><Empty icon={Users} title="Public profile not found" /></PageContainer>;

  return (
    <PageContainer>
      <section className="rounded-2xl border border-border bg-surface/70 p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-accent/30 bg-accent/10 text-3xl font-black text-accent">
            {profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : (profile.displayName || profile.username || 'M')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-3xl font-bold text-white">{profile.displayName || profile.username}</h1>
            <p className="mt-1 text-sm text-text-muted">@{profile.username} / Level {profile.level || 1} / {profile.xp || 0} XP</p>
            {followState.mutual && <p className="mt-2 text-xs font-bold text-accent">Mutual connection</p>}
          </div>
          {user?.uid !== profile.uid && <Button onClick={toggleFollow}>{followState.following ? 'Unfollow' : 'Follow'}</Button>}
        </div>
      </section>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <PublicProfileSection title="Achievements" items={profile.achievements || []} />
          <PublicProfileSection title="Certificates" items={profile.certificates || []} />
          <PublicProfileSection title="Inventions" items={profile.inventions || []} />
          <PublicProfileSection title="Research" items={profile.research || []} />
          <PublicProfileSection title="Projects" items={profile.projects || []} />
          <PublicProfileSection title="Portfolios" items={profile.portfolios || []} />
          <PublicProfileSection title="Activity" items={profile.activity || []} />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Reputation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reputation(profile).map(([label, value]) => <div key={label} className="flex justify-between rounded-xl border border-border p-3 text-sm"><span className="text-text-muted">{label}</span><span className="font-bold text-white">{value}</span></div>)}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function PublicProfileSection({ title, items }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent>{items.length === 0 ? <p className="text-sm text-text-muted">Nothing public yet.</p> : <div className="grid gap-3 md:grid-cols-2">{items.map((item, index) => <div key={item.id || index} className="rounded-xl border border-border bg-white/[0.03] p-3"><h3 className="font-bold text-white">{item.title || item.name || item.id || item}</h3><p className="mt-1 text-sm text-text-muted">{item.description || item.detail || ''}</p></div>)}</div>}</CardContent>
    </Card>
  );
}

export function ShowcasePage() {
  const { user, roleData } = useAuth();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'PROJECT', sourceCollection: '', sourceId: '' });
  const [loading, setLoading] = useState(true);
  const author = useMemo(() => getAuthor(user, roleData), [roleData, user]);
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');

  const load = async () => {
    const result = await CommunityService.getShowcases(filters);
    setItems(result);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    CommunityService.getShowcases(filters).then(result => { if (!cancelled) setItems(result); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters]);

  const submit = async (event) => {
    event.preventDefault();
    await CommunityService.createShowcase(form, author);
    setForm({ title: '', description: '', type: 'PROJECT', sourceCollection: '', sourceId: '' });
    setFormOpen(false);
    await load();
  };

  const removeShowcase = async (showcaseId) => {
    if (!window.confirm('Remove this showcase?')) return;
    await CommunityService.removeContent('SHOWCASE', showcaseId);
    await load();
  };

  return (
    <PageContainer>
      <PageHeader title="Public Showcase" description="Feature inventions, projects, research, documents, certificates, achievements, and portfolio work." action={<Button onClick={() => setFormOpen(true)}><Plus className="mr-2 h-4 w-4" />Showcase Work</Button>} />
      {formOpen && <SectionWrapper><Card><CardContent className="p-5"><form onSubmit={submit} className="space-y-3"><div className="flex justify-between"><h2 className="font-bold text-white">Create Showcase</h2><button type="button" onClick={() => setFormOpen(false)}><X className="h-4 w-4 text-text-muted" /></button></div><Input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} placeholder="Title" required /><textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} rows={3} placeholder="Description" className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent" /><div className="grid gap-3 md:grid-cols-3"><select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value }))} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white">{SHOWCASE_TYPES.map(type => <option key={type}>{type}</option>)}</select><Input value={form.sourceCollection} onChange={event => setForm(current => ({ ...current, sourceCollection: event.target.value }))} placeholder="Source collection" /><Input value={form.sourceId} onChange={event => setForm(current => ({ ...current, sourceId: event.target.value }))} placeholder="Source ID" /></div><div className="flex justify-end"><Button type="submit">Publish Showcase</Button></div></form></CardContent></Card></SectionWrapper>}
      <SectionWrapper><Card className="rounded-lg"><CardContent className="grid gap-3 p-4 md:grid-cols-2"><Input value={filters.search} onChange={event => { setLoading(true); setFilters(current => ({ ...current, search: event.target.value })); }} placeholder="Search showcases..." /><select value={filters.type} onChange={event => { setLoading(true); setFilters(current => ({ ...current, type: event.target.value })); }} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white"><option value="">All types</option>{SHOWCASE_TYPES.map(type => <option key={type}>{type}</option>)}</select></CardContent></Card></SectionWrapper>
      <SectionWrapper>{loading ? <LoadingState text="Loading showcases..." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.length === 0 ? <Empty icon={Star} title="No showcases yet" /> : items.map(item => <Card key={item.id} className="rounded-lg"><CardContent className="p-5"><p className="mb-2 w-fit rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{item.type}</p><h2 className="font-bold text-white">{item.title}</h2><p className="mt-2 line-clamp-4 text-sm leading-6 text-text-muted">{item.description}</p><p className="mt-4 text-xs text-text-muted">By {item.authorName} / {formatDate(item.createdAt)}</p><div className="mt-3 flex items-center gap-3">{canModerate && <button type="button" onClick={() => removeShowcase(item.id)} className="text-xs font-bold text-status-danger hover:text-white">Remove</button>}<ReportButton targetType="SHOWCASE" targetId={item.id} reporter={author} /></div></CardContent></Card>)}</div>}</SectionWrapper>
    </PageContainer>
  );
}

export function DiscoverPage() {
  const [data, setData] = useState({ members: [], showcases: [], posts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    CommunityService.getDiscoveryData().then(result => { if (!cancelled) setData(result); }).catch(err => console.error('Discovery failed:', err)).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <PageContainer>
      <PageHeader title="Discover" description="Trending members, projects, inventions, research, showcases, and community discussions." action={<Compass className="h-8 w-8 text-accent" />} />
      <SectionWrapper>
        <Card className="rounded-lg border-accent/20 bg-accent/5"><CardContent className="grid gap-4 p-5 md:grid-cols-3"><Info icon={Bot} title="AI Member Matches" text="Recommended members use XP, badges, and public reputation trends." /><Info icon={Brain} title="AI Community Picks" text="Programming, AI, Science, and Innovation are strong starting recommendations." /><Info icon={Sparkles} title="AI Project Ideas" text="Use discussion summaries to find research, inventions, and build partners." /></CardContent></Card>
      </SectionWrapper>
      {loading ? <LoadingState text="Loading discovery..." /> : (
        <div className="grid gap-5 xl:grid-cols-3">
          <DiscoverColumn title="Trending Members" icon={Users}>{data.members.map(member => <Link key={member.id} to={`/profile/${member.id}`} className="block rounded-xl border border-border p-3 hover:border-accent/40"><p className="font-bold text-white">{member.displayName || member.username}</p><p className="text-xs text-text-muted">{member.xp || 0} XP / Reputation {member.reputation?.totalScore || 0}</p></Link>)}</DiscoverColumn>
          <DiscoverColumn title="Trending Showcases" icon={Lightbulb}>{data.showcases.map(item => <Link key={item.id} to="/showcase" className="block rounded-xl border border-border p-3 hover:border-accent/40"><p className="font-bold text-white">{item.title}</p><p className="text-xs text-text-muted">{item.type} by {item.authorName}</p></Link>)}</DiscoverColumn>
          <DiscoverColumn title="Trending Discussions" icon={MessageSquare}>{data.posts.map(item => <Link key={item.id} to={`/communities/${item.communityId}`} className="block rounded-xl border border-border p-3 hover:border-accent/40"><p className="font-bold text-white">{item.title}</p><p className="text-xs text-text-muted">{item.type} in {item.communityName}</p></Link>)}</DiscoverColumn>
        </div>
      )}
      <SectionWrapper title="Community Leaderboards" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{['Top Contributors', 'Top Researchers', 'Top Inventors', 'Top Learners', 'Top Builders', 'Top Community Members'].map(label => <Card key={label} className="rounded-lg"><CardContent className="p-5"><h2 className="mb-3 flex items-center gap-2 font-bold text-white"><Trophy className="h-5 w-5 text-accent" />{label}</h2>{data.members.slice(0, 5).map((member, index) => <p key={member.id} className="flex justify-between rounded-lg px-2 py-1 text-sm"><span className="text-text-soft">#{index + 1} {member.displayName || member.username}</span><span className="font-bold text-white">{member.reputation?.totalScore || member.xp || 0}</span></p>)}</CardContent></Card>)}</div>
      </SectionWrapper>
    </PageContainer>
  );
}

function Info({ icon: Icon, title, text }) {
  return <div><Icon className="mb-3 h-5 w-5 text-accent" /><h2 className="font-bold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-text-muted">{text}</p></div>;
}

function DiscoverColumn({ title, icon: Icon, children }) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return <Card className="rounded-lg"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Icon className="h-5 w-5 text-accent" />{title}</CardTitle></CardHeader><CardContent className="space-y-3 pt-0">{count ? children : <p className="text-sm text-text-muted">Nothing trending yet.</p>}</CardContent></Card>;
}

function Empty({ icon: Icon = AlertTriangle, title }) {
  return <div className="rounded-2xl border border-dashed border-border p-8 text-center"><Icon className="mx-auto mb-3 h-10 w-10 text-text-muted" /><h2 className="font-bold text-white">{title}</h2></div>;
}
