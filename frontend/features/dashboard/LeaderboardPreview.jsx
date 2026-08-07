import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Trophy, Award, Building2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function LeaderboardPreview() {
  const { user } = useAuth();

  const topMembers = [
    { id: 1, name: 'Dr. Sarah Chen', avatar: '👩‍🔬', xp: 89012, rank: 1, department: 'AI Research' },
    { id: 2, name: 'Alex Johnson', avatar: '👨‍💼', xp: 78543, rank: 2, department: 'Engineering' },
    { id: 3, name: 'Emma Williams', avatar: '👩‍💻', xp: 67234, rank: 3, department: 'Design' },
    { id: 4, name: 'James Brown', avatar: '👨‍🚀', xp: 56123, rank: 4, department: 'Research' },
    { id: 5, name: 'Lisa Anderson', avatar: '👩‍🏫', xp: 45678, rank: 5, department: 'Education' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Leaderboard Preview" 
        description="Top 5 members display with avatar, name, XP, rank, and department with view full leaderboard button."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {topMembers.map((member, index) => (
              <div key={member.id} className={`flex items-center gap-4 p-4 rounded-xl ${index === 0 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-white/5'}`}>
                <div className="text-2xl font-bold text-accent w-8">#{member.rank}</div>
                <div className="text-3xl">{member.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{member.name}</h3>
                  <p className="text-text-muted text-sm">{member.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-accent">{member.xp.toLocaleString()}</p>
                  <p className="text-text-muted text-xs">XP</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
            View Full Leaderboard
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
