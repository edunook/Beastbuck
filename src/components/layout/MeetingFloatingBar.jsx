import { Phone, Video, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// In a full implementation, this would read from a global Zustand store (e.g. useCollaborationStore)
// to know if the user is in an active Voice or Video room while on a different route.
export default function MeetingFloatingBar({ activeRoomId, type = 'video' }) {
  const navigate = useNavigate();

  if (!activeRoomId) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-surface border border-accent shadow-[0_0_20px_rgba(0,240,255,0.3)] rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success"></span>
        </span>
        {type === 'video' ? (
          <Video className="w-5 h-5 text-white" />
        ) : (
          <Phone className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white">Call in progress</span>
        <span className="text-xs text-text-muted">{activeRoomId}</span>
      </div>
      <button 
        onClick={() => navigate(type === 'video' ? `/meet/${activeRoomId}` : '/voice')}
        className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
        title="Return to call"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}
