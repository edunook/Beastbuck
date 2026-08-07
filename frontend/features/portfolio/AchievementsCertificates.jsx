import { Award, Download, Share2, CheckCircle, Sparkles, GraduationCap, FileText, MessageSquare, Lightbulb, Shield, Trophy, Users } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function AchievementsCertificates() {
  const achievements = [
    { id: 1, title: 'First Project', description: 'Completed your first project', xp: 100, date: '2023-01-15', category: 'Projects', rarity: 'Common' },
    { id: 2, title: 'Research Pioneer', description: 'Published first research paper', xp: 500, date: '2023-03-20', category: 'Research', rarity: 'Rare' },
    { id: 3, title: 'Innovation Master', description: 'Created breakthrough invention', xp: 1000, date: '2023-06-10', category: 'Innovation', rarity: 'Legendary' },
  ];

  const certificates = [
    { id: 1, title: 'Machine Learning Course', type: 'Course Certificate', issuer: 'Coursera', date: '2023-02-28', verified: true },
    { id: 2, title: 'Research Excellence', type: 'Research Certificate', issuer: 'MIT', date: '2023-05-15', verified: true },
    { id: 3, title: 'Mentorship Program', type: 'Mentorship Certificate', issuer: 'BeastBuck', date: '2023-04-10', verified: true },
    { id: 4, title: 'Community Leader', type: 'Community Certificate', issuer: 'BeastBuck', date: '2023-07-01', verified: true },
    { id: 5, title: 'Innovation Award', type: 'Innovation Certificate', issuer: 'Tech Awards', date: '2023-06-20', verified: true },
    { id: 6, title: 'Leadership Excellence', type: 'Leadership Certificate', issuer: 'Harvard', date: '2023-03-25', verified: true },
  ];

  const getRarityColor = (rarity) => {
    const colors = {
      Common: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      Rare: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      Epic: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      Legendary: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    };
    return colors[rarity] || colors.Common;
  };

  const getCertificateIcon = (type) => {
    const icons = {
      'Course Certificate': GraduationCap,
      'Research Certificate': FileText,
      'Mentorship Certificate': MessageSquare,
      'Community Certificate': Users,
      'Innovation Certificate': Lightbulb,
      'Leadership Certificate': Shield,
    };
    return icons[type] || Award;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Achievements & Certificates" 
        description="Achievements (title, description, XP earned, date, category, rarity with animated unlock effects) and Certificates (course, research, mentorship, community, innovation, leadership certificates with verification button, download PDF, share button)."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  <div className={`p-3 rounded-xl ${getRarityColor(achievement.rarity)}`}>
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{achievement.title}</h3>
                    <p className="text-text-muted text-sm">{achievement.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-accent">+{achievement.xp} XP</span>
                      <span className="text-text-muted">{achievement.date}</span>
                      <span className={`px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-accent" />
              Certificates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {certificates.map((cert) => {
                const Icon = getCertificateIcon(cert.type);
                return (
                  <div key={cert.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                    <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{cert.title}</h3>
                      <p className="text-text-muted text-sm">{cert.type}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="text-text-muted">{cert.issuer}</span>
                        <span className="text-text-muted">•</span>
                        <span className="text-text-muted">{cert.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {cert.verified && (
                        <Button size="sm" variant="secondary" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified
                        </Button>
                      )}
                      <Button size="sm" variant="secondary">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
