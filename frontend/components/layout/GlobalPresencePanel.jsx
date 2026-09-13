import { useEffect, useState, useMemo } from 'react';
import { X, Search, Activity, User, Radio } from 'lucide-react';
import { usePresenceStore } from '@frontend/store/usePresenceStore';
import PresenceIndicator from '../ui/PresenceIndicator';
import { PresenceService } from '@services/realtime/presence';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { PERMISSIONS } from '@shared/permissions/permissions';

export default function GlobalPresencePanel({ isOpen, onClose }) {
  const { onlineMembers } = usePresenceStore();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('online');

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (isMounted) {
          const membersOnly = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(u => PERMISSIONS.isApprovedMember(u));
          setUsers(membersOnly);
        }
      } catch (err) {
        console.warn('Error loading members list for presence:', err);
      }
    };

    if (isOpen) {
      fetchUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Combine fetched registered users with real-time online presence objects
  const memberList = useMemo(() => {
    const userMap = new Map();

    // 1. Add all fetched users
    users.forEach(u => {
      userMap.set(u.id, {
        id: u.id,
        displayName: u.displayName || u.username || u.name || 'Member',
        avatar: u.photoURL || u.avatar || '',
        role: u.role || 'Member',
        presence: onlineMembers[u.id] || { state: 'offline' },
      });
    });

    // 2. Add online members from presence map even if not yet in users state
    Object.entries(onlineMembers).forEach(([uid, presenceData]) => {
      if (!userMap.has(uid) && presenceData?.state && presenceData.state !== 'offline') {
        userMap.set(uid, {
          id: uid,
          displayName: presenceData.displayName || presenceData.username || 'Active User',
          avatar: presenceData.avatar || '',
          role: 'Member',
          presence: presenceData,
        });
      } else if (userMap.has(uid)) {
        const existing = userMap.get(uid);
        userMap.set(uid, {
          ...existing,
          presence: {
            ...existing.presence,
            ...presenceData,
          },
        });
      }
    });

    return Array.from(userMap.values());
  }, [users, onlineMembers]);

  // Filter & sort online members
  const filteredList = useMemo(() => {
    return memberList
      .filter(m => {
        const state = m.presence?.state || 'offline';
        if (activeTab === 'online') return state !== 'offline';
        if (activeTab === 'active') return state === 'online' || state === 'coding' || state === 'building';
        return true; // 'all'
      })
      .filter(m => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const nameMatch = (m.displayName || '').toLowerCase().includes(query);
        const activityMatch = (m.presence?.activity || '').toLowerCase().includes(query);
        return nameMatch || activityMatch;
      })
      .sort((a, b) => {
        const stateA = a.presence?.state || 'offline';
        const stateB = b.presence?.state || 'offline';

        if (stateA !== 'offline' && stateB === 'offline') return -1;
        if (stateB !== 'offline' && stateA === 'offline') return 1;
        return (a.displayName || '').localeCompare(b.displayName || '');
      });
  }, [memberList, activeTab, searchQuery]);

  const activeCount = useMemo(() => {
    return memberList.filter(m => (m.presence?.state || 'offline') !== 'offline').length;
  }, [memberList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-surface/95 backdrop-blur-2xl border-l border-white/10 z-[10000] flex flex-col shadow-depth-3 animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-none flex items-center gap-1.5">
              <span>Live Presence</span>
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-black">
                {activeCount}
              </span>
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">Real-time page & activity tracker</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-white transition-colors"
          aria-label="Close Live Presence"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="p-3 border-b border-white/10 space-y-2.5 bg-background/40">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search member or activity..."
            className="w-full bg-background border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-text-muted focus:border-accent outline-none transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[11px] font-bold">
          {[
            { id: 'all', label: 'All Members' },
            { id: 'online', label: 'Active Now' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1 rounded-lg transition-all text-center ${
                activeTab === tab.id
                  ? 'bg-accent text-background font-black shadow-sm'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Member Roster */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1.5">
        {filteredList.length === 0 ? (
          <div className="text-center p-8 text-xs text-text-muted">
            <Radio className="w-8 h-8 text-text-muted/40 mx-auto mb-2 animate-pulse" />
            <p className="font-bold text-white mb-1">No active members found</p>
            <p>No member matches your query right now.</p>
          </div>
        ) : (
          filteredList.map(member => {
            const isOnline = member.presence?.state !== 'offline';
            const activityText = member.presence?.activity || (isOnline ? 'Online' : 'Offline');

            return (
              <div
                key={member.id}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                  isOnline
                    ? 'bg-white/5 border-white/10 hover:border-accent/40'
                    : 'bg-transparent border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {/* Avatar with Presence Indicator */}
                <div className="relative shrink-0 mt-0.5">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.displayName}
                      className="w-9 h-9 rounded-full border border-white/15 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-xs">
                      {(member.displayName || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <PresenceIndicator
                    state={member.presence?.state || 'offline'}
                    className="absolute -bottom-1 -right-1 ring-2 ring-surface bg-surface rounded-full"
                    dotClassName="w-2.5 h-2.5"
                  />
                </div>

                {/* Member Details & Current Page Activity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white truncate">
                      {member.displayName}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-accent tracking-wider shrink-0">
                      {member.role}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-muted truncate mt-0.5 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-accent shrink-0" />
                    <span className="truncate">{activityText}</span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
