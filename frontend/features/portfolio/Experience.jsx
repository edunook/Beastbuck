import { BriefcaseBusiness, Calendar, Award } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function Experience() {
  const experiences = [
    { id: 1, type: 'Internship', company: 'Google', role: 'Software Engineer Intern', startDate: '2023-06', endDate: '2023-09', description: 'Worked on AI/ML projects, developed production code, collaborated with cross-functional teams.', achievements: 'Received full-time offer, Published internal paper' },
    { id: 2, type: 'Full-time', company: 'Microsoft', role: 'Software Engineer', startDate: '2021-09', endDate: '2023-05', description: 'Built scalable systems, mentored junior engineers, led feature development.', achievements: 'Promoted twice, Employee of the Month' },
    { id: 3, type: 'Volunteer', company: 'Open Source Community', role: 'Contributor', startDate: '2020-01', endDate: 'Present', description: 'Contributed to major open-source projects, reviewed PRs, participated in discussions.', achievements: 'Top contributor, Maintainer role' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Experience" 
        description="Professional experience tracking for internships, volunteer work, organizations, companies, start date, end date, role, description, and achievements."
        hero={true}
        action={
          <Button className="bg-purple-600 hover:bg-purple-700">
            Add Experience
          </Button>
        }
      />

      <div className="space-y-4">
        {experiences.map((exp) => (
          <Card key={exp.id} className="hover:border-accent/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-xl">{exp.company}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      exp.type === 'Internship' ? 'bg-purple-500/10 text-purple-400' :
                      exp.type === 'Full-time' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {exp.type}
                    </span>
                  </div>
                  <p className="text-accent font-bold mb-2">{exp.role}</p>
                  <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-text-muted mb-3">{exp.description}</p>
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <Award className="h-4 w-4" />
                    <span>{exp.achievements}</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
