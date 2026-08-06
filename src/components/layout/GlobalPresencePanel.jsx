import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { usePresenceStore } from '../../store/usePresenceStore';
import PresenceIndicator from '../ui/PresenceIndicator';
import { PresenceService } from '../../services/realtime/presence';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

export default function GlobalPresencePanel({ isOpen, onClose }) {
  const { onlineMembers } = usePresenceStore();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && users.length > 0) {
      const uids = users.map(u => u.id);
      const unsub = PresenceService.subscribeToPresenceMap(uids, {
        onMap: (map) => {
          usePresenceStore.getState().setOnlineMembers(map);
        }
      });
      return () => unsub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, users.length]);

  if (!isOpen) return null;

  const onlineList = users
    .map(u => ({ ...u, presence: onlineMembers[u.id] || { state: 'offline' } }))
    .filter(u => u.presence.state !== 'offline')
    .filter(u => !searchQuery || (u.displayName || u.username).toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.presence.state === 'online' && b.presence.state !== 'online') return -1;
      if (b.presence.state === 'online' && a.presence.state !== 'online') return 1;
      return (a.displayName || a.username || '').localeCompare(b.displayName || b.username || '');
    });

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-surface/95 backdrop-blur-xl border-l border-border z-50 flex flex-col shadow-2xl">
      <div className="p-4 border-b border-border/50 flex justify-between items-center bg-white/[0.02]">
        <h2 className="font-bold text-white flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success"></span>
          </div>
          Live Presence
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search members..." 
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-accent outline-none transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
        {onlineList.length === 0 ? (
          <div className="text-center p-4 text-sm text-text-muted">No one is online right now.</div>
        ) : (
          onlineList.map(user => (
            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer group">
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border border-border/50 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-bold">
                    {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <PresenceIndicator 
                  state={user.presence.state} 
                  className="absolute -bottom-1 -right-1 ring-2 ring-surface bg-surface rounded-full" 
                  dotClassName="w-3 h-3"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.displayName || user.username}</div>
                <div className="text-xs text-text-muted truncate">
                  {user.presence.activity || PresenceService.getPresenceLabel(user.presence.state)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
