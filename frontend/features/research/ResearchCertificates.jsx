import { useState, useEffect } from 'react';
import { Award, Download, CheckCircle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function ResearchCertificates() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = () => {
    // Simulated certificates data
    setCertificates([
      {
        id: 1,
        name: 'First Research',
        description: 'Awarded for publishing your first research paper',
        icon: '🎯',
        color: 'emerald',
        earned: true,
        earnedDate: '2024-01-15',
      },
      {
        id: 2,
        name: '10 Research Papers',
        description: 'Awarded for publishing 10 research papers',
        icon: '📚',
        color: 'purple',
        earned: true,
        earnedDate: '2024-03-20',
      },
      {
        id: 3,
        name: 'Top Researcher',
        description: 'Awarded for being in the top 10% of researchers',
        icon: '🏆',
        color: 'amber',
        earned: false,
        progress: 75,
      },
      {
        id: 4,
        name: 'Most Helpful',
        description: 'Awarded for getting 100+ likes on research',
        icon: '❤️',
        color: 'red',
        earned: true,
        earnedDate: '2024-05-10',
      },
      {
        id: 5,
        name: 'Community Favorite',
        description: 'Awarded for getting 50+ bookmarks on research',
        icon: '⭐',
        color: 'cyan',
        earned: false,
        progress: 40,
      },
      {
        id: 6,
        name: 'Innovation Award',
        description: 'Awarded for getting 10+ citations on research',
        icon: '💡',
        color: 'amber',
        earned: false,
        progress: 60,
      },
      {
        id: 7,
        name: 'Research Marathon',
        description: 'Awarded for earning 5000+ research XP',
        icon: '🏃',
        color: 'emerald',
        earned: false,
        progress: 85,
      },
      {
        id: 8,
        name: 'Young Scientist',
        description: 'Awarded for earning 10000+ research XP',
        icon: '🔬',
        color: 'purple',
        earned: false,
        progress: 30,
      },
    ]);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Certificates" 
        description="Earn certificates for your research achievements!"
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {certificates.map((cert) => (
          <Card key={cert.id} className={`overflow-hidden ${cert.earned ? 'border-accent/30' : 'border-border'}`}>
            <CardContent className="p-6">
              <div className="text-center">
                <div className={`text-5xl mb-4 ${cert.earned ? '' : 'grayscale opacity-50'}`}>
                  {cert.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{cert.name}</h3>
                <p className="text-text-muted text-sm mb-4">{cert.description}</p>
                
                {cert.earned ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-bold">Earned</span>
                    </div>
                    <p className="text-xs text-text-muted">{cert.earnedDate}</p>
                    <Button size="sm" variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all" 
                        style={{ width: `${cert.progress}%` }} 
                      />
                    </div>
                    <p className="text-xs text-text-muted">{cert.progress}% complete</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Award className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">How to Earn Certificates</h3>
              <p className="text-text-soft text-sm">
                Complete research, get likes and bookmarks, earn XP, and participate in challenges 
                to unlock certificates. Share your certificates on social media to showcase your achievements!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
