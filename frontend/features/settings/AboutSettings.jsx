import { Info, FileText, Shield, BookOpen, Code, Users } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function AboutSettings() {

  const aboutData = {
    version: '2.0.0',
    buildNumber: '2024.02.28',
    releaseDate: 'February 28, 2024',
  };

  return (
    <PageContainer>
      <PageHeader 
        title="About Settings" 
        description="About section including version, build number, terms, privacy policy, open source licenses, and credits."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-accent" />
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-white/5">
                <span className="text-text-muted">Version</span>
                <span className="text-white font-bold">{aboutData.version}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/5">
                <span className="text-text-muted">Build Number</span>
                <span className="text-white font-bold">{aboutData.buildNumber}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/5">
                <span className="text-text-muted">Release Date</span>
                <span className="text-white">{aboutData.releaseDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Cookie Policy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Open Source
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-start">
                <Code className="h-4 w-4 mr-2" />
                Open Source Licenses
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Third-Party Licenses
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Development Team
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Contributors
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Acknowledgments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <p className="text-text-muted text-center">
            BeastBuck © 2024. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
