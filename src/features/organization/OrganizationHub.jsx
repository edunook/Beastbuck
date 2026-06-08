import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, Megaphone } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import { OrganizationService } from '../../services/firebase/organization';

export default function OrganizationHub() {
  const [data, setData] = useState({ divisions: [], announcements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrganizationService.getOrganization().then(org => {
      setData(org);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading Organization OS..." /></div>;

  const validDivisions = data.divisions.filter(d => !d.archived);
  const now = new Date();
  
  const validAnnouncements = data.announcements.filter(a => {
    if (a.expiresAt && new Date(a.expiresAt.toDate ? a.expiresAt.toDate() : a.expiresAt) < now) return false;
    if (a.scheduledFor && new Date(a.scheduledFor.toDate ? a.scheduledFor.toDate() : a.scheduledFor) > now) return false;
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Organization Hub"
        description="The heart of BeastBuck. Explore divisions, departments, labs, and teams."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Building2 className="h-6 w-6" /></div>}
      />

      <SectionWrapper title="Announcements">
        <div className="space-y-4">
          {validAnnouncements.length === 0 ? (
            <p className="text-sm text-text-muted">No active announcements.</p>
          ) : validAnnouncements.map(a => (
            <Card key={a.id} className={`rounded-lg ${a.pinned ? 'border-accent/40 bg-accent/5' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className={`h-4 w-4 ${a.pinned ? 'text-accent' : 'text-text-muted'}`} />
                  <h3 className="font-bold text-white">{a.title}</h3>
                  {a.pinned && <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">Pinned</span>}
                </div>
                <p className="text-sm text-text-soft whitespace-pre-wrap">{a.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper title="Divisions">
        {validDivisions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <h2 className="mb-1 text-lg font-bold text-white">No Divisions</h2>
            <p className="text-sm text-text-muted">Admins can create divisions in the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {validDivisions.map(division => {
              const deps = data.departments.filter(d => d.divisionId === division.id && !d.archived).length;
              return (
                <Link to={`/organization/division/${division.id}`} key={division.id} className="block transition hover:scale-[1.02]">
                  <Card className="rounded-lg h-full hover:border-accent/50 hover:bg-white/[0.05] transition">
                    <CardContent className="p-5">
                      <Shield className="mb-3 h-6 w-6 text-accent" />
                      <h3 className="text-lg font-bold text-white">{division.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-text-muted line-clamp-2">{division.description}</p>
                      <div className="mt-4 flex gap-4 text-xs font-bold text-text-soft">
                        <span>{deps} Departments</span>
                      </div>
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
