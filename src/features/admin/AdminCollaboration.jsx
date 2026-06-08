import { useEffect, useState } from 'react';
import { Headphones, MessageSquare, Video, Users } from 'lucide-react';
import { PageHeader } from '../../components/ui/UIElements';
import { CollaborationService } from '../../services/firebase/collaboration';
import { AdminMetric, AdminPanel, AdminEmptyState, LoadingRows } from './adminUtils';

export default function AdminCollaboration() {
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [analytics, voice] = await Promise.all([
          CollaborationService.getCollaborationAnalytics(),
          CollaborationService.getVoiceRooms(),
        ]);
        setStats(analytics);
        setRooms(voice);
      } catch (err) {
        console.error('Admin collaboration failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collaboration OS"
        description="Manage voice rooms, meetings, war rooms, and collaboration analytics."
      />

      {loading ? (
        <LoadingRows count={4} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminMetric label="Online Members" value={stats?.onlineMembers ?? 0} icon={Users} />
            <AdminMetric label="Active Voice" value={stats?.activeVoiceRooms ?? 0} icon={Headphones} />
            <AdminMetric label="Meetings" value={stats?.totalMeetings ?? 0} icon={Video} />
            <AdminMetric label="Live Sessions" value={stats?.activeSessions ?? 0} icon={MessageSquare} />
          </div>

          <AdminPanel title="Voice Rooms" icon={Headphones}>
            {rooms.length === 0 ? (
              <AdminEmptyState message="No voice rooms yet." />
            ) : (
              <ul className="space-y-2">
                {rooms.map(room => (
                  <li key={room.id} className="flex justify-between rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-sm">
                    <span className="text-white">{room.name || room.title}</span>
                    <span className="text-text-muted">{room.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </>
      )}
    </div>
  );
}
