import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Award, Shield, FlaskConical, Lightbulb, Film, BriefcaseBusiness, Users, Building2, Crown } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function MembershipBadge() {
  const { user } = useAuth();

  const badges = [
    { id: 'member', name: 'Member', icon: Shield, color: 'purple', gradient: 'from-purple-500 to-purple-700' },
    { id: 'senior', name: 'Senior Member', icon: Award, color: 'cyan', gradient: 'from-cyan-500 to-cyan-700' },
    { id: 'researcher', name: 'Researcher', icon: FlaskConical, color: 'emerald', gradient: 'from-emerald-500 to-emerald-700' },
    { id: 'innovator', name: 'Innovator', icon: Lightbulb, color: 'amber', gradient: 'from-amber-500 to-amber-700' },
    { id: 'mentor', name: 'Mentor', icon: Users, color: 'pink', gradient: 'from-pink-500 to-pink-700' },
    { id: 'lab-head', name: 'Lab Head', icon: FlaskConical, color: 'red', gradient: 'from-red-500 to-red-700' },
    { id: 'dept-lead', name: 'Department Lead', icon: Building2, color: 'blue', gradient: 'from-blue-500 to-blue-700' },
    { id: 'ceo', name: 'CEO', icon: Crown, color: 'violet', gradient: 'from-violet-500 to-violet-700' },
    { id: 'co-ceo', name: 'Co-CEO', icon: Crown, color: 'orange', gradient: 'from-orange-500 to-orange-700' },
    { id: 'founder', name: 'Founder', icon: Award, color: 'teal', gradient: 'from-teal-500 to-teal-700' },
  ];

  const getGlowClass = (color) => {
    const glows = {
      purple: 'shadow-purple-500/50',
      cyan: 'shadow-cyan-500/50',
      emerald: 'shadow-emerald-500/50',
      amber: 'shadow-amber-500/50',
      pink: 'shadow-pink-500/50',
      red: 'shadow-red-500/50',
      blue: 'shadow-blue-500/50',
      violet: 'shadow-violet-500/50',
      orange: 'shadow-orange-500/50',
      teal: 'shadow-teal-500/50',
    };
    return glows[color] || glows.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Membership Badge" 
        description="Beautiful badges with gradients and glow effects for member, senior member, researcher, innovator, mentor, lab head, department lead, CEO, co-CEO, and founder."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <Card key={badge.id} className={`hover:border-accent/50 transition-all ${getGlowClass(badge.color)} shadow-lg`}>
              <CardContent className="p-6">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${badge.gradient} mb-4 flex items-center justify-center`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-white text-center">{badge.name}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
