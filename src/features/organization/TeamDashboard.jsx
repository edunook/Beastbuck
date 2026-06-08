import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Crown } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import { TeamsService } from '../../services/firebase/teams';
import { UsersService } from '../../services/firebase/users';

export default function TeamDashboard() {
  const { id } = useParams();
  const [data, setData] = useState({ team: null, members: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const team = await TeamsService.getTeam(id);
      if (!team) {
        setLoading(false);
        return;
      }
      
      const memberDocs = await Promise.all((team.members || []).map(mid => UsersService.getUserProfile(mid)));
      setData({ team, members: memberDocs.filter(Boolean) });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading Team..." /></div>;
  if (!data.team) return <PageContainer><div className="p-8 text-center text-text-muted">Team not found</div></PageContainer>;

  const lead = data.members.find(m => m.id === data.team.leaderId);
  const teamXP = data.members.reduce((acc, m) => acc + (m.xp || 0), 0);

  return (
    <PageContainer>
      <PageHeader
        title={data.team.name}
        description={data.team.description}
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Users className="h-6 w-6" /></div>}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.members.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Members</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{teamXP.toLocaleString()}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Combined Member XP</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold uppercase overflow-hidden">
            {lead?.avatar ? <img src={lead.avatar} alt="avatar" className="h-full w-full object-cover" /> : (lead?.displayName?.[0] || lead?.username?.[0] || '?')}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{lead?.displayName || lead?.username || 'Unassigned'}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Team Leader</p>
          </div>
        </CardContent></Card>
      </div>

      <SectionWrapper title="Team Roster">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.members.map(member => (
            <Link to={`/profile/${member.id}`} key={member.id} className="block transition hover:scale-[1.02]">
              <Card className="rounded-lg h-full hover:border-accent/50 hover:bg-white/[0.05] transition">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white font-bold uppercase overflow-hidden">
                    {member.avatar ? <img src={member.avatar} alt="avatar" className="h-full w-full object-cover" /> : (member.displayName?.[0] || member.username?.[0] || '?')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white flex items-center gap-1">
                      {member.displayName || member.username}
                      {member.id === data.team.leaderId && <Crown className="h-3 w-3 text-yellow-500" />}
                    </p>
                    <p className="truncate text-xs text-text-muted">Level {member.level || 1}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}
