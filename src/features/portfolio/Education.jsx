import { GraduationCap, Award, Calendar } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function Education() {
  const education = [
    { id: 1, institution: 'MIT', degree: 'Ph.D. in Computer Science', field: 'Artificial Intelligence', startYear: 2018, endYear: 2023, current: false, achievements: 'Summa Cum Laude, Best Thesis Award' },
    { id: 2, institution: 'Stanford University', degree: 'M.S. in Computer Science', field: 'Machine Learning', startYear: 2016, endYear: 2018, current: false, achievements: 'Dean\'s List' },
    { id: 3, institution: 'UC Berkeley', degree: 'B.S. in Computer Science', field: 'Software Engineering', startYear: 2012, endYear: 2016, current: false, achievements: 'Magna Cum Laude' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Education" 
        description="Education section with school, college, university, degree, field, start year, end year, current status, achievements, and certificates."
        hero={true}
        action={
          <Button className="bg-purple-600 hover:bg-purple-700">
            Add Education
          </Button>
        }
      />

      <div className="space-y-4">
        {education.map((edu) => (
          <Card key={edu.id} className="hover:border-accent/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-xl mb-1">{edu.institution}</h3>
                  <p className="text-accent font-bold mb-2">{edu.degree}</p>
                  <p className="text-text-muted mb-3">{edu.field}</p>
                  <div className="flex items-center gap-4 text-sm text-text-muted mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{edu.startYear} - {edu.endYear}</span>
                    </div>
                    {edu.current && (
                      <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <Award className="h-4 w-4" />
                    <span>{edu.achievements}</span>
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
