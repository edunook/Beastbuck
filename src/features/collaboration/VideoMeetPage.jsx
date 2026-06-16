import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Video, Users, Plus, Mic, MicOff, Camera, CameraOff, MonitorUp, PhoneOff } from 'lucide-react';
import { CollaborationService } from '../../services/firebase/collaboration';
import { useAuth } from '../auth/AuthContext';
import { WebRTCManager } from '../../services/realtime/webrtc';
import { Signaling } from '../../services/realtime/signaling';

export default function VideoMeetPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const isApprovedMember = roleData?.membershipStatus === 'approved';
  
  const [meetings, setMeetings] = useState([]);
  const [rtcManager, setRtcManager] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const [participants, setParticipants] = useState({});
  const localVideoRef = useRef(null);
  
  // A map of refs for remote videos is tricky in React, we'll use state to track active streams
  const [remoteStreams, setRemoteStreams] = useState({});

  useEffect(() => {
    if (!roomId) {
      loadMeetings();
    } else {
      joinMeeting(roomId);
    }
    
    return () => {
      if (rtcManager) rtcManager.leave();
    };
  }, [roomId]);

  const loadMeetings = async () => {
    const data = await CollaborationService.getActiveMeetings();
    setMeetings(data);
  };

  const createMeeting = async () => {
    const title = prompt("Enter meeting title:");
    if (!title) return;
    
    const newRoomId = await CollaborationService.createVideoRoom({
      title,
      template: 'Quick Meeting',
      createdBy: user.uid,
      createdByName: roleData?.displayName || roleData?.username
    });
    navigate(`/meet/${newRoomId}`);
  };

  const joinMeeting = async (id) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      const manager = new WebRTCManager(id, user.uid);
      await manager.join(stream, { 
        name: roleData?.displayName || roleData?.username,
        avatar: roleData?.photoURL || ''
      });
      
      manager.onStreamAdded = (peerId, remoteStream) => {
        setRemoteStreams(prev => ({ ...prev, [peerId]: remoteStream }));
      };
      
      manager.onStreamRemoved = (peerId) => {
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      };

      setRtcManager(manager);
      
      Signaling.onParticipantsChange(id, (parts) => {
        setParticipants(parts);
      });
      
    } catch (err) {
      console.error("Failed to join video room:", err);
      alert("Could not access camera/microphone.");
    }
  };

  const leaveMeeting = () => {
    if (rtcManager) {
      rtcManager.leave();
    }
    navigate('/meet');
  };

  const toggleMute = () => {
    if (rtcManager) {
      const newMuted = !isMuted;
      rtcManager.toggleAudio(!newMuted);
      setIsMuted(newMuted);
    }
  };

  const toggleVideo = () => {
    if (rtcManager) {
      const newVideoOff = !isVideoOff;
      rtcManager.toggleVideo(!newVideoOff);
      setIsVideoOff(newVideoOff);
    }
  };
  
  const toggleScreenShare = async () => {
      if (isScreenSharing) {
          // Revert to camera
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
              if (localVideoRef.current) localVideoRef.current.srcObject = stream;
              // In a full implementation we'd replace the video track on all peer connections
              setIsScreenSharing(false);
          } catch (err) {
              console.error('Failed to restart camera after screen sharing:', err);
          }
      } else {
          // Share screen
          try {
              const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
              if (localVideoRef.current) localVideoRef.current.srcObject = stream;
              // Replace track logic
              setIsScreenSharing(true);
              
              // Handle stop sharing from browser UI
              stream.getVideoTracks()[0].onended = () => {
                  toggleScreenShare(); // revert
              };
          } catch (err) {
              console.error('Failed to start screen sharing:', err);
          }
      }
  };

  if (roomId) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-black flex flex-col relative">
        <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
           <h2 className="text-white font-bold text-lg">Meeting Room: {roomId}</h2>
           <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white/70" />
              <span className="text-white">{Object.keys(participants).length}</span>
           </div>
        </div>
        
        <div className="flex-1 p-4 flex content-center justify-center flex-wrap gap-4 pt-16 pb-24 overflow-y-auto">
            {/* Local Video */}
            <div className="relative bg-surface rounded-xl overflow-hidden aspect-video w-full max-w-xl border border-white/10 shadow-xl">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${!isScreenSharing ? 'scale-x-[-1]' : ''}`}
                />
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-2">
                   You {isMuted && <MicOff className="w-3 h-3 text-red-400"/>}
                </div>
            </div>
            
            {/* Remote Videos */}
            {Object.entries(remoteStreams).map(([peerId, stream]) => (
                <RemoteVideo key={peerId} stream={stream} name={participants[peerId]?.name || 'Unknown'} />
            ))}
        </div>

        {/* Controls */}
        <div className="h-20 bg-surface border-t border-border flex items-center justify-center gap-4 px-4 absolute bottom-0 left-0 right-0">
          <button onClick={toggleMute} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}>
             {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}>
             {isVideoOff ? <CameraOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
          </button>
          <button onClick={toggleScreenShare} className={`p-4 rounded-full transition-colors ${isScreenSharing ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white hover:bg-white/20'}`}>
             <MonitorUp className="w-6 h-6" />
          </button>
          <button onClick={leaveMeeting} className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors ml-4 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
             <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Video Meetings"
        description="Face-to-face collaboration with your team."
        action={
          isApprovedMember ? <Button onClick={createMeeting}><Plus className="w-4 h-4 mr-2" /> New Meeting</Button> : null
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map(meeting => (
          <Card key={meeting.id} className="hover:border-white/20 transition-all cursor-pointer" onClick={() => navigate(`/meet/${meeting.id}`)}>
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-white text-lg">{meeting.title}</h3>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-text-muted"><Video className="w-3 h-3 inline mr-1"/> Live</span>
              </div>
              <p className="text-sm text-text-muted mb-6 flex-1">Template: {meeting.template}</p>
              
              <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <span>Host: {meeting.createdByName}</span>
                </div>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/meet/${meeting.id}`); }}>
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {meetings.length === 0 && (
          <div className="col-span-3 text-center py-12 text-text-muted">
            No active meetings. Start one now!
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function RemoteVideo({ stream, name }) {
    const videoRef = useRef(null);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    return (
        <div className="relative bg-surface rounded-xl overflow-hidden aspect-video w-full max-w-xl border border-white/10 shadow-lg">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded text-white text-xs font-medium">
               {name}
            </div>
        </div>
    );
}
