import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Hand,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  MessageSquare,
} from 'lucide-react';
import { CollaborationService } from '../../services/realtime/collaboration';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function MeetingRoom({ meetingId, user, profile, onLeave }) {
  const [meeting, setMeeting] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [notes, setNotes] = useState('');
  const [chat, setChat] = useState('');
  const [insights, setInsights] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!meetingId) return;
    const unsub = CollaborationService.subscribeToMeeting(meetingId, {
      onMeeting: setMeeting,
    });
    CollaborationService.joinMeeting(meetingId, user.uid, profile);
    return () => {
      unsub();
      CollaborationService.leaveMeeting(meetingId, user.uid);
      stopMedia();
    };
  }, [meetingId, user?.uid]);

  const stopMedia = () => {
    streamRef.current?.getTracks?.().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const toggleCamera = async () => {
    const next = !cameraOn;
    if (next) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micOn });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraOn(true);
      } catch {
        setCameraOn(false);
      }
    } else {
      stopMedia();
      setCameraOn(false);
    }
  };

  const toggleMic = async () => {
    const next = !micOn;
    if (next && !streamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: cameraOn });
        streamRef.current = stream;
        if (videoRef.current && cameraOn) videoRef.current.srcObject = stream;
      } catch {
        return;
      }
    }
    streamRef.current?.getAudioTracks?.().forEach(t => { t.enabled = next; });
    setMicOn(next);
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      await CollaborationService.setScreenShare(meetingId, {
        userId: user.uid,
        mode: 'screen',
        startedAt: new Date().toISOString(),
      });
    } catch {
      // user cancelled
    }
  };

  const toggleHand = async () => {
    const next = !handRaised;
    setHandRaised(next);
    await CollaborationService.toggleHandRaise(meetingId, user.uid, next);
  };

  const saveNotes = async () => {
    if (!notes.trim()) return;
    await CollaborationService.saveMeetingNotes(meetingId, { content: notes, authorId: user.uid });
    const generated = CollaborationService.generateMeetingInsights(notes, meeting?.participants);
    setInsights(generated);
    await CollaborationService.saveMeetingAssistantSummary(meetingId, {
      summary: generated.summary,
      actionItems: generated.actionItems,
      decisions: generated.decisions,
      createdBy: user.uid,
    });
  };

  const participants = meeting?.participants || [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black lg:col-span-2">
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted">
              Camera off
            </div>
          )}
          {meeting?.screenShare && (
            <p className="absolute left-3 top-3 rounded-lg bg-purple-500/80 px-2 py-1 text-xs font-bold text-white">
              Screen sharing active
            </p>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-white">{meeting?.title || 'Meeting'}</p>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {participants.map(p => (
              <div key={p.uid} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="text-white">{p.name}</span>
                {meeting?.handRaises?.includes(p.uid) && <Hand className="h-4 w-4 text-accent" />}
              </div>
            ))}
          </div>
          <Input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Meeting chat..." />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={toggleMic}>{micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}</Button>
        <Button variant="secondary" size="sm" onClick={toggleCamera}>{cameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}</Button>
        <Button variant="secondary" size="sm" onClick={startScreenShare}><MonitorUp className="h-4 w-4" /></Button>
        <Button variant="secondary" size="sm" onClick={toggleHand}><Hand className="h-4 w-4" /></Button>
        <Button variant="secondary" size="sm"><MessageSquare className="h-4 w-4" /></Button>
        <Button size="sm" onClick={onLeave}><PhoneOff className="mr-1 h-4 w-4" /> Leave</Button>
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="mb-2 text-sm font-bold text-white">Meeting notes & AI assistant</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border bg-white/5 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
          placeholder="Notes, action items, decisions..."
        />
        <Button size="sm" className="mt-2" onClick={saveNotes}>Save & Generate Summary</Button>
        {insights && (
          <div className="mt-3 space-y-2 text-sm text-text-soft">
            <p><strong className="text-white">Summary:</strong> {insights.summary}</p>
            <p><strong className="text-white">Action items:</strong> {insights.actionItems.join('; ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
