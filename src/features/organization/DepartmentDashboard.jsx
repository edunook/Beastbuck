import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, FlaskConical, Target, Route } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { OrganizationService } from '../../services/firebase/organization';
import { UsersService } from '../../services/firebase/users';

export default function DepartmentDashboard() {
  const { id } = useParams();
  const [data, setData] = useState({ department: null, labs: [], members: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const org = await OrganizationService.getOrganization();
      const dep = org.departments.find(d => d.id === id);
      const labs = org.labs.filter(l => l.departmentId === id && !l.archived);
      const mems = await UsersService.getAssignableMembers();
      setData({ department: dep, labs, members: mems });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading Department..." /></div>;
  if (!data.department) return <PageContainer><div className="p-8 text-center text-text-muted">Department not found</div></PageContainer>;

  const lead = data.members.find(m => m.id === data.department.leaderId);
  const goals = data.department.goals || [];
  const initiatives = data.department.initiatives || [];

  return (
    <PageContainer>
      <PageHeader
        title={data.department.name}
        description={data.department.description}
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Building2 className="h-6 w-6" /></div>}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.labs.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Labs</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-sm font-bold text-white">{lead?.displayName || lead?.username || 'Unassigned'}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Department Lead</p></CardContent></Card>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-accent" /> Objectives & Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? <p className="text-sm text-text-muted">No specific objectives set yet.</p> : (
              <ul className="space-y-2 text-sm text-text-soft list-disc list-inside">
                {goals.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5 text-accent" /> Current Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            {initiatives.length === 0 ? <p className="text-sm text-text-muted">No active initiatives.</p> : (
              <ul className="space-y-2 text-sm text-text-soft list-disc list-inside">
                {initiatives.map((init, i) => <li key={i}>{init}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <SectionWrapper title="Labs">
        {data.labs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <FlaskConical className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <h2 className="mb-1 text-lg font-bold text-white">No Labs</h2>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.labs.map(lab => {
              const labLead = data.members.find(m => m.id === lab.leadId);
              return (
                <Link to={`/organization/lab/${lab.id}`} key={lab.id} className="block transition hover:scale-[1.02]">
                  <Card className="rounded-lg h-full hover:border-accent/50 hover:bg-white/[0.05] transition">
                    <CardContent className="p-5">
                      <FlaskConical className="mb-3 h-6 w-6 text-accent" />
                      <h3 className="text-lg font-bold text-white">{lab.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-text-muted line-clamp-2">{lab.description}</p>
                      <p className="mt-3 text-xs text-text-muted">Lead: {labLead?.displayName || labLead?.username || 'Unassigned'}</p>
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
