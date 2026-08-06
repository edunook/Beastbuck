import { useState, useEffect, useRef } from 'react';
import { Users, Play, Pause, Share2, Copy, Check } from 'lucide-react';
import { ref, onValue, set, onDisconnect } from 'firebase/database';
import { rtdb } from '../../services/firebase/config';
import { useAuth } from '../../features/auth/AuthContext';

export function WatchPartySync({ videoId, videoRef }) {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const roomRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    // Reference to the watch party room in Realtime Database
    roomRef.current = ref(rtdb, `watchParties/${roomId}`);

    // Listen for room state changes
    const unsubscribe = onValue(roomRef.current, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Sync video state
      if (data.isPlaying !== undefined && videoRef.current) {
        if (data.isPlaying && videoRef.current.paused) {
          videoRef.current.play();
        } else if (!data.isPlaying && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      }

      if (data.currentTime !== undefined && videoRef.current) {
        const timeDiff = Math.abs(videoRef.current.currentTime - data.currentTime);
        if (timeDiff > 0.5) {
          videoRef.current.currentTime = data.currentTime;
        }
      }

      // Update participants
      if (data.participants) {
        setParticipants(Object.values(data.participants));
      }
    });

    // Handle user disconnect
    const userRef = ref(rtdb, `watchParties/${roomId}/participants/${user?.uid}`);
    onDisconnect(userRef).remove();

    return () => {
      unsubscribe();
      if (userRef) {
        set(userRef, null);
      }
    };
  }, [roomId, user?.uid, videoRef]);

  const createRoom = () => {
    const newRoomId = `room_${Date.now()}`;
    setRoomId(newRoomId);
    setIsHost(true);

    // Initialize room state
    const roomData = {
      videoId,
      isPlaying: false,
      currentTime: 0,
      createdAt: Date.now(),
      hostId: user?.uid,
      participants: {
        [user?.uid]: {
          uid: user?.uid,
          displayName: user?.displayName || 'Host',
          joinedAt: Date.now(),
        },
      },
    };

    set(ref(rtdb, `watchParties/${newRoomId}`), roomData);
  };

  const joinRoom = (existingRoomId) => {
    setRoomId(existingRoomId);
    setIsHost(false);

    // Add user to participants
    const participantRef = ref(rtdb, `watchParties/${existingRoomId}/participants/${user?.uid}`);
    set(participantRef, {
      uid: user?.uid,
      displayName: user?.displayName || 'Viewer',
      joinedAt: Date.now(),
    });
  };

  const syncPlay = () => {
    if (!roomId || !isHost) return;
    set(ref(rtdb, `watchParties/${roomId}/isPlaying`), true);
  };

  const syncPause = () => {
    if (!roomId || !isHost) return;
    set(ref(rtdb, `watchParties/${roomId}/isPlaying`), false);
  };

  const syncSeek = (time) => {
    if (!roomId || !isHost) return;
    set(ref(rtdb, `watchParties/${roomId}/currentTime`), time);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/funflix/watch/${videoId}?room=${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveRoom = () => {
    if (!roomId) return;

    // Remove user from participants
    const userRef = ref(rtdb, `watchParties/${roomId}/participants/${user?.uid}`);
    set(userRef, null);

    // If host is leaving and there are other participants, transfer host
    if (isHost && participants.length > 1) {
      const newHost = participants.find(p => p.uid !== user?.uid);
      if (newHost) {
        set(ref(rtdb, `watchParties/${roomId}/hostId`), newHost.uid);
      }
    }

    setRoomId(null);
    setIsHost(false);
  };

  if (!roomId) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-white/[0.03]">
        <Users className="h-5 w-5 text-accent" />
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Watch Party</p>
          <p className="text-xs text-text-muted">Watch together with friends</p>
        </div>
        <button
          onClick={createRoom}
          className="flex items-center gap-2 bg-accent text-black font-bold px-4 py-2 rounded-lg hover:bg-accent/80 transition"
        >
          <Play className="h-4 w-4" />
          Create Room
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter room code"
            className="w-32 h-10 rounded-lg border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Enter room code"]');
              if (input?.value) joinRoom(input.value);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-accent text-xs font-bold hover:underline"
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-accent/40 bg-accent/10">
      <Users className="h-5 w-5 text-accent" />
      <div className="flex-1">
        <p className="text-sm font-bold text-white">Watch Party Active</p>
        <p className="text-xs text-text-muted">{participants.length} viewer{participants.length !== 1 ? 's' : ''} · {isHost ? 'You are host' : 'Following host'}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={copyRoomLink}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-white"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied!' : 'Share'}
        </button>
        {isHost && (
          <>
            <button
              onClick={syncPlay}
              className="flex items-center gap-1 bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-white/20 transition"
            >
              <Play className="h-3 w-3" />
              Sync Play
            </button>
            <button
              onClick={syncPause}
              className="flex items-center gap-1 bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-white/20 transition"
            >
              <Pause className="h-3 w-3" />
              Sync Pause
            </button>
          </>
        )}
        <button
          onClick={leaveRoom}
          className="text-xs text-status-danger hover:underline"
        >
          Leave
        </button>
      </div>
    </div>
  );
}
