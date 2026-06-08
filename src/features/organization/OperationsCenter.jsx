import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, AlertCircle, Clock, FlaskConical, ShieldAlert, Users } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import { OrganizationService } from '../../services/firebase/organization';

export default function OperationsCenter() {
  const [data, setData] = useState({ org: null, alerts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const org = await OrganizationService.getOrganization();
      const now = new Date();
      
      const alerts = [];
      
      // Overdue projects
      org.projects.forEach(p => {
        if (p.status !== 'COMPLETED' && p.status !== 'ARCHIVED' && p.targetDate) {
          const target = new Date(p.targetDate);
          if (target < now) {
            alerts.push({ id: `p-${p.id}`, type: 'DANGER', title: 'Overdue Project', message: `Project "${p.title}" is overdue.`, icon: Clock });
          }
        }
      });
      
      // Stalled Research
      org.projects.filter(p => p.projectType === 'RESEARCH' && p.status === 'ON_HOLD').forEach(p => {
        alerts.push({ id: `r-${p.id}`, type: 'WARNING', title: 'Stalled Research', message: `Research "${p.title}" is currently on hold.`, icon: FlaskConical });
      });

      // Teams with no members
      org.teams.forEach(t => {
        if (!t.members || t.members.length === 0) {
          alerts.push({ id: `t-${t.id}`, type: 'WARNING', title: 'Empty Team', message: `Team "${t.name}" has no members.`, icon: Users });
        }
      });

      setData({ org, alerts });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading Operations Center..." /></div>;

  return (
    <PageContainer>
      <PageHeader
        title="Operations Center"
        description="Global real-time pulse of BeastBuck's health, operations, and alerts."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Activity className="h-6 w-6" /></div>}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.org.divisions.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Divisions</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.org.departments.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Departments</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.org.labs.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Labs</p></CardContent></Card>
        <Card className="rounded-lg"><CardContent className="p-5"><p className="text-2xl font-black text-white">{data.org.teams.length}</p><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Teams</p></CardContent></Card>
      </div>

      <SectionWrapper title="Executive Alerts">
        {data.alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-status-success/20 bg-status-success/5 p-8 text-center">
            <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-status-success" />
            <h2 className="mb-1 text-lg font-bold text-status-success">All Systems Nominal</h2>
            <p className="text-sm text-status-success/70">No critical alerts or warnings across the organization.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.alerts.map(alert => (
              <div key={alert.id} className={`flex items-start gap-4 rounded-xl border p-4 ${
                alert.type === 'DANGER' ? 'border-status-danger/30 bg-status-danger/10' : 'border-status-warning/30 bg-status-warning/10'
              }`}>
                {alert.type === 'DANGER' ? <AlertCircle className="h-5 w-5 text-status-danger shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />}
                <div>
                  <h4 className={`font-bold ${alert.type === 'DANGER' ? 'text-status-danger' : 'text-status-warning'}`}>{alert.title}</h4>
                  <p className="mt-1 text-sm text-text-soft">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
