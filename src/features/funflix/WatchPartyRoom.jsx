import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Play, Pause, SkipForward, SkipBack, Volume2, Maximize, MessageSquare, Share2, Copy, Check } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { getDatabase, ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue, update as rtdbUpdate } from 'firebase/database';

export default function WatchPartyRoom() {
  const { roomId } = useParams();
  const { user, roleData } = useAuth();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const videoRef = useRef(null);
  const currentTimeRef = useRef(currentTime);
  const isPlayingRef = useRef(isPlaying);
  const playbackSpeedRef = useRef(playbackSpeed);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (!roomId || !user) return;

    const db = getDatabase();
    const roomRef = rtdbRef(db, `watchParties/${roomId}`);
    const participantsRef = rtdbRef(db, `watchParties/${roomId}/participants`);
    const chatRef = rtdbRef(db, `watchParties/${roomId}/chat`);

    // Listen to room state
    const roomUnsub = rtdbOnValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
        setIsHost(data.hostId === user.uid);
        
        // Sync video state from host
        if (data.hostId !== user.uid && videoRef.current) {
          if (data.isPlaying !== undefined && data.isPlaying !== isPlayingRef.current) {
            if (data.isPlaying) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
            setIsPlaying(data.isPlaying);
          }
          if (data.currentTime !== undefined && Math.abs(data.currentTime - currentTimeRef.current) > 0.5) {
            videoRef.current.currentTime = data.currentTime;
            setCurrentTime(data.currentTime);
          }
          if (data.playbackSpeed !== undefined && data.playbackSpeed !== playbackSpeedRef.current) {
            videoRef.current.playbackRate = data.playbackSpeed;
            setPlaybackSpeed(data.playbackSpeed);
          }
        }
      }
    });

    // Listen to participants
    const participantsUnsub = rtdbOnValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParticipants(Object.entries(data).map(([uid, data]) => ({ uid, ...data })));
      }
    });

    // Listen to chat
    const chatUnsub = rtdbOnValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setChatMessages(Object.entries(data).map(([id, msg]) => ({ id, ...msg })));
      }
    });

    // Join room
    rtdbUpdate(roomRef, {
      [`participants/${user.uid}`]: {
        uid: user.uid,
        name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
        joinedAt: Date.now(),
      }
    });

    return () => {
      roomUnsub();
      participantsUnsub();
      chatUnsub();
      
      // Leave room
      rtdbUpdate(roomRef, {
        [`participants/${user.uid}`]: null
      });
    };
  }, [roomId, user, roleData]);

  const syncVideoState = (updates) => {
    if (!isHost) return;
    
    const db = getDatabase();
    rtdbUpdate(rtdbRef(db, `watchParties/${roomId}`), updates);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      syncVideoState({ isPlaying: false, currentTime: videoRef.current.currentTime });
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      syncVideoState({ isPlaying: true, currentTime: videoRef.current.currentTime });
    }
  };

  const handleSeek = (time) => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    syncVideoState({ currentTime: time });
  };

  const handleVolumeChange = (newVolume) => {
    if (!videoRef.current) return;
    
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    syncVideoState({ playbackSpeed: speed });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && isHost) {
      setCurrentTime(videoRef.current.currentTime);
      syncVideoState({ currentTime: videoRef.current.currentTime });
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const db = getDatabase();
    const newMessageRef = rtdbRef(db, `watchParties/${roomId}/chat/${Date.now()}`);
    
    rtdbSet(newMessageRef, {
      uid: user.uid,
      name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
      text: chatInput,
      timestamp: Date.now(),
    });

    setChatInput('');
  };

  const copyRoomLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-text-muted">Loading watch party...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={room.name || 'Watch Party'}
        description={`Watching ${room.videoTitle || 'video'} with ${participants.length} participant${participants.length !== 1 ? 's' : ''}`}
        action={
          <Button onClick={copyRoomLink} variant="secondary">
            {copied ? <><Check className="mr-2 h-4 w-4" />Copied</> : <><Copy className="mr-2 h-4 w-4" />Share Link</>}
          </Button>
        }
      />

      <div className={`grid gap-6 ${isTheaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-4'}`}>
        {/* Video Player */}
        <div className={isTheaterMode ? 'lg:col-span-1' : 'lg:col-span-3'}>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-black">
                {room.videoUrl && (
                  <video
                    ref={videoRef}
                    src={room.videoUrl}
                    className="w-full"
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={() => setVideoDuration(videoRef.current?.duration || 100)}
                  />
                )}

                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <input
                      type="range"
                      min="0"
                       max={videoDuration}
                       value={currentTime}
                       onChange={(e) => handleSeek(parseFloat(e.target.value))}
                       className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                     />
                     <div className="flex justify-between text-xs text-white/70 mt-1">
                       <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                       <span>{Math.floor(videoDuration / 60)}:{Math.floor(videoDuration % 60).toString().padStart(2, '0')}</span>
                     </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="ghost" onClick={handlePlayPause} disabled={!isHost}>
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleSeek(currentTime - 10)} disabled={!isHost}>
                        <SkipBack className="h-5 w-5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleSeek(currentTime + 10)} disabled={!isHost}>
                        <SkipForward className="h-5 w-5" />
                      </Button>
                      
                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={handleMuteToggle}>
                          <Volume2 className="h-5 w-5" />
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                           value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                      </div>

                      {/* Playback Speed */}
                      <select
                        value={playbackSpeed}
                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                        className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20"
                        disabled={!isHost}
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="ghost" onClick={() => setIsTheaterMode(!isTheaterMode)}>
                        <Maximize className="h-5 w-5" />
                      </Button>
                      <span className="text-xs text-white/50">{isHost ? 'Host' : 'Viewer'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-accent" />
                <span className="font-bold text-white">Participants ({participants.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {participants.map(p => (
                  <div key={p.uid} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">{p.name?.charAt(0) || 'U'}</span>
                    </div>
                    <span className="text-sm text-white">{p.name}</span>
                    {p.uid === room.hostId && <span className="text-xs text-accent">Host</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        {!isTheaterMode && (
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  <span className="font-bold text-white">Watch Party Chat</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 custom-scrollbar">
                  {chatMessages.length === 0 ? (
                    <p className="text-center text-text-muted text-sm">No messages yet</p>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent">{msg.name}</span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-white">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  />
                  <Button size="sm" type="submit" disabled={!chatInput.trim()}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
