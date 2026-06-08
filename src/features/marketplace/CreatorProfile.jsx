import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Award, BookOpen, Download, FlaskConical, PackageOpen, Star, UserPlus, Users } from 'lucide-react';
import { MarketplaceService } from '../../services/firebase/marketplace';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { LoadingState, PageHeader } from '../../components/ui/UIElements';
import { useAuth } from '../auth/AuthContext';
import { ResourceCard } from './MarketplaceHome';

export default function CreatorProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setData(await MarketplaceService.getCreatorProfile(username));
      } catch (err) {
        console.error('Creator profile failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  const follow = async () => {
    if (!user?.uid || !data?.uid) return;
    await MarketplaceService.followCreator(data.uid, user.uid);
    setFollowing(true);
  };

  if (loading) return <PageContainer><LoadingState text="Loading creator..." /></PageContainer>;
  if (!data?.profile) return <PageContainer><div className="py-20 text-center text-white">Creator not found</div></PageContainer>;

  const { profile, resources, collections, research, courses } = data;

  return (
    <PageContainer>
      <PageHeader
        title={profile.displayName || profile.username}
        description={profile.bio || 'BeastBuck creator sharing resources, research, inventions, courses, and toolkits.'}
        action={<button onClick={follow} disabled={following} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black disabled:opacity-50"><UserPlus className="h-4 w-4" />{following ? 'Following' : 'Follow Creator'}</button>}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Resources" value={resources.length} icon={PackageOpen} />
        <Stat label="Downloads" value={profile.downloads || 0} icon={Download} />
        <Stat label="Followers" value={profile.followers || 0} icon={Users} />
        <Stat label="Reputation" value={profile.reputation || 0} icon={Star} />
        <Stat label="Collections" value={collections.length} icon={Award} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {(profile.specializations || []).map(item => <span key={item} className="rounded-lg border border-border bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-text-soft">{item}</span>)}
      </div>

      <SectionWrapper title="Published Resources">
        {resources.length === 0 ? <p className="text-sm text-text-muted">No resources yet.</p> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{resources.map(item => <ResourceCard key={item.id} item={item} />)}</div>}
      </SectionWrapper>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Collections" icon={Award}>{collections.length ? collections.map(item => <Item key={item.id} title={item.title} detail={item.description || item.category} />) : <p className="text-sm text-text-muted">No collections yet.</p>}</Panel>
        <Panel title="Research & Innovation" icon={FlaskConical}>{research.length ? research.map(item => <Item key={item.id} title={item.title} detail={item.projectType || item.status} />) : <p className="text-sm text-text-muted">No research published yet.</p>}</Panel>
        <Panel title="Courses" icon={BookOpen}>{courses.length ? courses.map(item => <Item key={item.id} title={item.title} detail={item.difficulty || item.category} />) : <p className="text-sm text-text-muted">No courses yet.</p>}</Panel>
      </div>
    </PageContainer>
  );
}

function Stat({ label, value, icon: Icon }) {
  return <div className="rounded-xl border border-border bg-white/[0.02] p-4"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p><Icon className="h-4 w-4 text-accent" /></div><p className="font-heading text-3xl font-black text-white">{value}</p></div>;
}

function Panel({ title, icon: Icon, children }) {
  return <section className="rounded-xl border border-border bg-surface/40 p-5"><h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-white"><Icon className="h-4 w-4 text-accent" />{title}</h2>{children}</section>;
}

function Item({ title, detail }) {
  return <div className="mb-2 rounded-lg border border-border bg-white/5 px-3 py-2"><p className="font-bold text-white">{title}</p><p className="text-sm text-text-muted">{detail}</p></div>;
}
