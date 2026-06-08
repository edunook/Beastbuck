import { useEffect, useState } from 'react';
import { Flame, MessageSquare, Network, Users, Video } from 'lucide-react';
import { CollaborationService } from '../../services/firebase/collaboration';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function CollaborationHealth() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CollaborationService.getCollaborationAnalytics()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const metrics = stats
    ? [
        { label: 'Live Sessions', value: stats.activeSessions, icon: Video },
        { label: 'Online Members', value: stats.onlineMembers, icon: Users },
        { label: 'Active War Rooms', value: stats.activeWarRooms, icon: Flame },
        { label: 'Voice Rooms Live', value: stats.activeVoiceRooms, icon: Network },
      ]
    : [];

  return (
    <PageContainer>
      <PageHeader
        title="Collaboration Health"
        description="Mission Control overview of real-time connectivity and team activity."
        action={<Network className="h-8 w-8 text-accent" />}
      />

      {loading ? (
        <LoadingState text="Loading collaboration metrics..." />
      ) : (
        <SectionWrapper>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="border-border bg-surface/60">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-text-muted">{label}</p>
                      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
                    </div>
                    <div className="rounded-xl bg-accent/20 p-3">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6 rounded-xl">
            <CardContent className="p-6">
              <p className="flex items-center gap-2 text-sm text-text-muted">
                <MessageSquare className="h-4 w-4" />
                Estimated meeting hours (platform): {stats?.meetingHoursEstimate ?? 0}
              </p>
            </CardContent>
          </Card>
        </SectionWrapper>
      )}
    </PageContainer>
  );
}
