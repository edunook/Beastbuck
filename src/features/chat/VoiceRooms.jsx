import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Mic, MicOff, Video, VideoOff, MonitorUp, Hand, Phone, PhoneOff, Users, Lock } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function VoiceRooms() {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);

  const participants = [
    { id: 1, name: 'Dr. Sarah Chen', avatar: '👩‍🔬', isSpeaking: true, isMuted: false },
    { id: 2, name: 'Alex Johnson', avatar: '👨‍💼', isSpeaking: false, isMuted: true },
    { id: 3, name: 'Emma Williams', avatar: '👩‍💻', isSpeaking: false, isMuted: false },
    { id: 4, name: 'James Brown', avatar: '👨‍🚀', isSpeaking: false, isMuted: false },
    { id: 5, name: 'Lisa Anderson', avatar: '👩‍🏫', isSpeaking: false, isMuted: true },
  ];

  const rooms = [
    { id: 1, name: 'AI Research Discussion', participants: 12, isLocked: false },
    { id: 2, name: 'Startup Pitch Room', participants: 8, isLocked: true },
    { id: 3, name: 'Project Collaboration', participants: 15, isLocked: false },
    { id: 4, name: 'Study Group', participants: 6, isLocked: false },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Voice Rooms" 
        description="Temporary voice rooms for real-time audio collaboration."
        hero={true}
      />

      {!isInRoom ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {room.isLocked && <Lock className="h-4 w-4 text-amber-400" />}
                  <h3 className="font-bold text-white">{room.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-text-muted mb-4">
                  <Users className="h-4 w-4" />
                  <span>{room.participants} Participants</span>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Join Room
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-bold text-white text-xl mb-2">AI Research Discussion</h3>
              <div className="flex items-center gap-4 text-text-muted">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>12 Participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Private Room</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`p-4 rounded-xl border transition-all ${
                    participant.isSpeaking
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{participant.avatar}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{participant.name}</h4>
                      {participant.isMuted && (
                        <div className="flex items-center gap-1 text-text-muted text-xs">
                          <MicOff className="h-3 w-3" />
                          <span>Muted</span>
                        </div>
                      )}
                    </div>
                  </div>
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
                variant={isVideoOn ? 'secondary' : 'secondary'}
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
              <Button
                size="lg"
                variant={isHandRaised ? 'secondary' : 'secondary'}
                onClick={() => setIsHandRaised(!isHandRaised)}
              >
                <Hand className="h-5 w-5" />
              </Button>
              <div className="w-px h-12 bg-border" />
              <Button
                size="lg"
                variant="destructive"
                onClick={() => setIsInRoom(false)}
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
