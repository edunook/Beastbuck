import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Phone, Users, Plus, Mic, MicOff } from 'lucide-react';
import { CollaborationService } from '../../services/firebase/collaboration';
import { useAuth } from '../auth/AuthContext';
import { WebRTCManager } from '../../services/realtime/webrtc';
import { Signaling } from '../../services/realtime/signaling';

export default function VoiceRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [rtcManager, setRtcManager] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const { user, roleData } = useAuth();
  const isApprovedMember = roleData?.membershipStatus === 'approved';
  
  const [participants, setParticipants] = useState({});

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    const data = await CollaborationService.getVoiceRooms();
    setRooms(data);
  };

  const createRoom = async () => {
    const name = prompt("Enter room name:");
    if (!name) return;
    
    await CollaborationService.createVoiceRoom({
      name,
      type: 'TEMPORARY',
      createdBy: user.uid,
      createdByName: roleData?.displayName || roleData?.username
    });
    loadRooms();
  };

  const joinRoom = async (roomId) => {
    if (activeRoom) {
      rtcManager?.leave();
      setActiveRoom(null);
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getAudioTracks().forEach(t => t.enabled = !isMuted);
      
      const manager = new WebRTCManager(roomId, user.uid);
      await manager.join(stream, { 
        name: roleData?.displayName || roleData?.username,
        avatar: roleData?.photoURL || ''
      });
      
      manager.onStreamAdded = (peerId, remoteStream) => {
        // Create audio element for incoming stream
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch(e => console.error("Audio play failed:", e));
      };

      setRtcManager(manager);
      setActiveRoom(roomId);
      
      // Listen for participants
      Signaling.onParticipantsChange(roomId, (parts) => {
        setParticipants(parts);
      });
      
    } catch (err) {
      console.error("Failed to join voice room:", err);
      alert("Could not access microphone.");
    }
  };

  const leaveRoom = () => {
    if (rtcManager) {
      rtcManager.leave();
      setRtcManager(null);
    }
    setActiveRoom(null);
    setParticipants({});
  };

  const toggleMute = () => {
    if (rtcManager) {
      const newMuted = !isMuted;
      rtcManager.toggleAudio(!newMuted);
      setIsMuted(newMuted);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Voice Rooms"
        description="Jump into real-time audio channels with your team."
        action={
          isApprovedMember ? <Button onClick={createRoom}><Plus className="w-4 h-4 mr-2" /> New Room</Button> : null
        }
      />
      
      {activeRoom && (
        <Card className="mb-6 border-accent/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Connected to {rooms.find(r => r.id === activeRoom)?.name}</h3>
                <p className="text-text-muted text-sm">{Object.keys(participants).length} participants</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant={isMuted ? 'secondary' : 'primary'} 
                onClick={toggleMute}
                className={isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50' : ''}
              >
                {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isMuted ? 'Muted' : 'Unmuted'}
              </Button>
              <Button variant="danger" onClick={leaveRoom}>Leave Room</Button>
            </div>
          </CardContent>
          <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
             {Object.entries(participants).map(([uid, p]) => (
                <div key={uid} className="flex flex-col items-center gap-1 min-w-[60px]">
                   <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden relative">
                      {p.avatar ? <img src={p.avatar} alt={p.name} /> : <UserIcon name={p.name} />}
                      {uid === user.uid && !isMuted && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-surface animate-ping"></span>}
                   </div>
                   <span className="text-[10px] text-text-muted truncate w-full text-center">{p.name?.split(' ')[0]}</span>
                </div>
             ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <Card key={room.id} className="hover:border-white/20 transition-all cursor-pointer" onClick={() => !activeRoom && joinRoom(room.id)}>
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-white text-lg">{room.name}</h3>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-text-muted">{room.type}</span>
              </div>
              <p className="text-sm text-text-muted mb-6 flex-1">{room.description || 'No description provided.'}</p>
              
              <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <Users className="w-4 h-4" />
                  <span>{room.participantCount || 0} online</span>
                </div>
                <Button 
                  size="sm" 
                  variant={activeRoom === room.id ? "primary" : "secondary"}
                  onClick={(e) => { e.stopPropagation(); joinRoom(room.id); }}
                  disabled={activeRoom === room.id}
                >
                  {activeRoom === room.id ? 'Joined' : 'Join'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {rooms.length === 0 && (
          <div className="col-span-3 text-center py-12 text-text-muted">
            No voice rooms available. Create one to start collaborating!
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function UserIcon({ name }) {
    return <div className="text-white text-sm font-bold">{(name||'?').charAt(0).toUpperCase()}</div>;
}
