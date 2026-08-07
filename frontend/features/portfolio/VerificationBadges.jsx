import { Shield, Award, GraduationCap, Lightbulb, Film, BriefcaseBusiness, Users, Building2, FlaskConical, Crown } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function VerificationBadges() {
  const badges = [
    { id: 'member', name: 'Verified Member', icon: Shield, color: 'purple', description: 'Verified BeastBuck member' },
    { id: 'researcher', name: 'Researcher', icon: FlaskConical, color: 'cyan', description: 'Active researcher' },
    { id: 'mentor', name: 'Mentor', icon: GraduationCap, color: 'emerald', description: 'Community mentor' },
    { id: 'innovator', name: 'Innovator', icon: Lightbulb, color: 'amber', description: 'Innovation leader' },
    { id: 'creator', name: 'Creator', icon: Film, color: 'pink', description: 'Content creator' },
    { id: 'founder', name: 'Founder', icon: BriefcaseBusiness, color: 'red', description: 'Venture founder' },
    { id: 'community-leader', name: 'Community Leader', icon: Users, color: 'blue', description: 'Community leader' },
    { id: 'dept-head', name: 'Department Head', icon: Building2, color: 'violet', description: 'Department head' },
    { id: 'lab-head', name: 'Lab Head', icon: FlaskConical, color: 'orange', description: 'Lab head' },
    { id: 'ceo', name: 'CEO', icon: Crown, color: 'teal', description: 'Chief Executive Officer' },
    { id: 'co-ceo', name: 'Co-CEO', icon: Crown, color: 'rose', description: 'Co-Chief Executive Officer' },
    { id: 'founder-badge', name: 'Founder', icon: Award, color: 'indigo', description: 'Platform founder' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400 shadow-purple-500/20',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 shadow-cyan-500/20',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-amber-500/20',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400 shadow-pink-500/20',
      red: 'bg-red-500/20 border-red-500/30 text-red-400 shadow-red-500/20',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-blue-500/20',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400 shadow-violet-500/20',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400 shadow-orange-500/20',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400 shadow-teal-500/20',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-rose-500/20',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 shadow-indigo-500/20',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Verification Badges" 
        description="Badge system with glow effects for verified members, researchers, mentors, innovators, creators, founders, community leaders, department heads, lab heads, CEOs, and co-CEOs."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <Card key={badge.id} className={`hover:border-accent/50 transition-all ${getColorClass(badge.color)} shadow-lg`}>
              <CardContent className="p-6">
                <div className={`p-4 rounded-xl ${getColorClass(badge.color)} mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-white mb-2">{badge.name}</h3>
                <p className="text-text-muted text-sm">{badge.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
