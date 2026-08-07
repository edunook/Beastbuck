import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { User, Award, BriefcaseBusiness, Building2, Users, Star, TrendingUp, Calendar } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function UserProfileCard() {
  const { user } = useAuth();

  const profileData = {
    name: user?.displayName || 'John Doe',
    username: user?.email?.split('@')[0] || 'johndoe',
    membershipLevel: 'Senior Member',
    role: 'Software Engineer',
    department: 'Engineering',
    team: 'AI Research',
    xp: 45678,
    currentRank: '#15',
    currentLevel: 42,
    impactScore: 89,
    contributionScore: 92,
    memberSince: '2022-01-15',
  };

  return (
    <PageContainer>
      <PageHeader 
        title="User Profile Card" 
        description="Comprehensive profile card with profile picture, name, username, membership level, role, department, team, XP, current rank, current level, impact score, contribution score, and member since."
        hero={true}
      />

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-4xl">
              👤
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">{profileData.name}</h2>
              <p className="text-accent mb-4">@{profileData.username}</p>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2 text-text-muted">
                  <Award className="h-4 w-4" />
                  <span>{profileData.membershipLevel}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span>{profileData.role}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Building2 className="h-4 w-4" />
                  <span>{profileData.department}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Users className="h-4 w-4" />
                  <span>{profileData.team}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Star className="h-4 w-4" />
                  <span>Level {profileData.currentLevel}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <TrendingUp className="h-4 w-4" />
                  <span>Rank {profileData.currentRank}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <p className="text-text-muted text-sm mb-1">XP</p>
              <p className="text-2xl font-bold text-accent">{profileData.xp.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-text-muted text-sm mb-1">Impact Score</p>
              <p className="text-2xl font-bold text-accent">{profileData.impactScore}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-text-muted text-sm mb-1">Contribution Score</p>
              <p className="text-2xl font-bold text-accent">{profileData.contributionScore}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                <Calendar className="h-4 w-4" />
                <span>Member Since</span>
              </div>
              <p className="text-lg font-bold text-accent">{profileData.memberSince}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
