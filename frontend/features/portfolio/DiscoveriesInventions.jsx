import { Lightbulb, Cpu, FileText, Image as ImageIcon, Award, FileCheck, Box, PlayCircle, Eye } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function DiscoveriesInventions() {
  const discoveries = [
    { id: 1, title: 'Novel AI Algorithm', findings: 'Improved accuracy by 40%', observations: 'Reduced training time', reports: 'Published in Nature', media: ['paper.pdf', 'data.csv'] },
    { id: 2, title: 'Quantum Computing Breakthrough', findings: 'Solved optimization problem', observations: 'New approach discovered', reports: 'Conference presentation', media: ['slides.pdf'] },
  ];

  const inventions = [
    { id: 1, title: 'Smart Home Hub', prototype: 'Working prototype', patentStatus: 'Pending', documentation: 'Technical specs complete', models: 'v2.0', demo: 'Available', media: ['demo.mp4', 'specs.pdf'] },
    { id: 2, title: 'Medical AI Assistant', prototype: 'Beta testing', patentStatus: 'Filed', documentation: 'User manual', models: 'v1.5', demo: 'Demo video', media: ['demo.mp4'] },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Discoveries & Inventions" 
        description="Sections for scientific discoveries (findings, observations, reports, supporting media) and inventions (prototype, patent status, documentation, models, demo, media)."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Scientific Discoveries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {discoveries.map((discovery) => (
                <div key={discovery.id} className="p-4 rounded-xl bg-white/5">
                  <h3 className="font-bold text-white mb-2">{discovery.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Lightbulb className="h-4 w-4" />
                      <span>{discovery.findings}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Eye className="h-4 w-4" />
                      <span>{discovery.observations}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <FileText className="h-4 w-4" />
                      <span>{discovery.reports}</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent">
                      <ImageIcon className="h-4 w-4" />
                      <span>{discovery.media.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              Add Discovery
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-accent" />
              Inventions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {inventions.map((invention) => (
                <div key={invention.id} className="p-4 rounded-xl bg-white/5">
                  <h3 className="font-bold text-white mb-2">{invention.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Box className="h-4 w-4" />
                      <span>{invention.prototype}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Award className="h-4 w-4" />
                      <span>{invention.patentStatus}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <FileCheck className="h-4 w-4" />
                      <span>{invention.documentation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Cpu className="h-4 w-4" />
                      <span>{invention.models}</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent">
                      <PlayCircle className="h-4 w-4" />
                      <span>{invention.demo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              Add Invention
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
