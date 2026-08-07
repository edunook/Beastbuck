import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Video, VideoOff, Mic, MicOff, MonitorUp, Phone, PhoneOff, Users, MessageSquare, Layout, Settings } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function VideoMeetings() {
  const { user } = useAuth();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isInMeeting, setIsInMeeting] = useState(false);

  const participants = [
    { id: 1, name: 'Dr. Sarah Chen', avatar: '👩‍🔬' },
    { id: 2, name: 'Alex Johnson', avatar: '👨‍💼' },
    { id: 3, name: 'Emma Williams', avatar: '👩‍💻' },
    { id: 4, name: 'James Brown', avatar: '👨‍🚀' },
  ];

  const meetings = [
    { id: 1, title: 'AI Research Review', time: '2:00 PM', participants: 8, status: 'upcoming' },
    { id: 2, title: 'Startup Pitch', time: '3:30 PM', participants: 5, status: 'live' },
    { id: 3, title: 'Project Sync', time: '5:00 PM', participants: 12, status: 'upcoming' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'upcoming': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Video Meetings" 
        description="Integrated BeastBuck Meetings with camera, microphone, and screen sharing."
        hero={true}
      />

      {!isInMeeting ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 rounded-xl bg-white/5 border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{meeting.title}</h3>
                          <div className="flex items-center gap-4 text-text-muted text-sm">
                            <span>{meeting.time}</span>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{meeting.participants}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Start New Meeting</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                onClick={() => setIsInMeeting(true)}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Video className="h-5 w-5 mr-2" />
                Start Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {participants.map((participant) => (
                <div key={participant.id} className="aspect-video rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-6xl">
                  {participant.avatar}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-white/5 border border-border">
              <Button
                size="lg"
                variant={isMuted ? 'destructive' : 'secondary'}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                size="lg"
                variant={isVideoOn ? 'secondary' : 'destructive'}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button
                size="lg"
                variant={isScreenSharing ? 'secondary' : 'secondary'}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                <MonitorUp className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary">
                <Users className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary">
                <Layout className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="w-px h-12 bg-border" />
              <Button
                size="lg"
                variant="destructive"
                onClick={() => setIsInMeeting(false)}
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                Leave
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
