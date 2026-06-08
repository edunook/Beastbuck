import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Shield } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import { OrganizationService } from '../../services/firebase/organization';
import { UsersService } from '../../services/firebase/users';

export default function DivisionDashboard() {
  const { id } = useParams();
  const [data, setData] = useState({ division: null, departments: [], members: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const org = await OrganizationService.getOrganization();
      const div = org.divisions.find(d => d.id === id);
      const deps = org.departments.filter(d => d.divisionId === id && !d.archived);
      const mems = await UsersService.getAssignableMembers();
      setData({ division: div, departments: deps, members: mems });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading Division..." /></div>;
  if (!data.division) return <PageContainer><div className="p-8 text-center text-text-muted">Division not found</div></PageContainer>;

  const lead = data.members.find(m => m.id === data.division.leadId);

  return (
    <PageContainer>
      <PageHeader
        title={data.division.name}
        description={data.division.description}
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Shield className="h-6 w-6" /></div>}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.departments.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Departments</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-sm font-bold text-white">{lead?.displayName || lead?.username || 'Unassigned'}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Division Lead</p></CardContent></Card>
      </div>

      <SectionWrapper title="Departments">
        {data.departments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <h2 className="mb-1 text-lg font-bold text-white">No Departments</h2>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.departments.map(dep => {
              const depLead = data.members.find(m => m.id === dep.leaderId);
              return (
                <Link to={`/organization/department/${dep.id}`} key={dep.id} className="block transition hover:scale-[1.02]">
                  <Card className="rounded-lg h-full hover:border-accent/50 hover:bg-white/[0.05] transition">
                    <CardContent className="p-5">
                      <Building2 className="mb-3 h-6 w-6 text-accent" />
                      <h3 className="text-lg font-bold text-white">{dep.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-text-muted line-clamp-2">{dep.description}</p>
                      <p className="mt-3 text-xs text-text-muted">Lead: {depLead?.displayName || depLead?.username || 'Unassigned'}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
