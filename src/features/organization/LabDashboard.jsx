import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FlaskConical, FolderKanban, Users } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import { OrganizationService } from '../../services/firebase/organization';
import { UsersService } from '../../services/firebase/users';

export default function LabDashboard() {
  const { id } = useParams();
  const [data, setData] = useState({ lab: null, projects: [], teams: [], members: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const org = await OrganizationService.getOrganization();
      const lab = org.labs.find(l => l.id === id);
      const projects = org.projects.filter(p => p.labId === id && p.status !== 'ARCHIVED');
      const teams = org.teams.filter(t => t.labId === id);
      const mems = await UsersService.getAssignableMembers();
      setData({ lab, projects, teams, members: mems });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading Lab..." /></div>;
  if (!data.lab) return <PageContainer><div className="p-8 text-center text-text-muted">Lab not found</div></PageContainer>;

  const lead = data.members.find(m => m.id === data.lab.leadId);

  return (
    <PageContainer>
      <PageHeader
        title={data.lab.name}
        description={data.lab.description}
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><FlaskConical className="h-6 w-6" /></div>}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.projects.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Active Projects</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.teams.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Teams</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-sm font-bold text-white">{lead?.displayName || lead?.username || 'Unassigned'}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Lab Lead</p></CardContent></Card>
      </div>

      <SectionWrapper title="Active Projects">
        {data.projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <FolderKanban className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <h2 className="mb-1 text-lg font-bold text-white">No Projects</h2>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.projects.map(proj => {
              const projOwner = data.members.find(m => m.id === proj.ownerId);
              return (
                <Card key={proj.id} className="rounded-lg">
                  <CardContent className="p-5">
                    <FolderKanban className="mb-3 h-6 w-6 text-accent" />
                    <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-muted line-clamp-2">{proj.description}</p>
                    <p className="mt-3 text-xs text-text-muted">Owner: {projOwner?.displayName || projOwner?.username || 'Unassigned'}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </SectionWrapper>
      
      <SectionWrapper title="Teams">
        {data.teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <h2 className="mb-1 text-lg font-bold text-white">No Teams</h2>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.teams.map(team => (
              <Link to={`/organization/team/${team.id}`} key={team.id} className="block transition hover:scale-[1.02]">
                <Card className="rounded-lg h-full hover:border-accent/50 hover:bg-white/[0.05] transition">
                  <CardContent className="p-5">
                    <Users className="mb-3 h-6 w-6 text-accent" />
                    <h3 className="text-lg font-bold text-white">{team.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-muted line-clamp-2">{team.description}</p>
                    <p className="mt-3 text-xs text-text-muted">{(team.members || []).length} Members</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
