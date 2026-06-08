import { create } from 'zustand';

export const useRealtimeStore = create((set, get) => ({
  presenceMap: {},
  myPresenceState: 'online',
  activeVoiceRoomId: null,
  activeMeetingId: null,
  activeWarRoomId: null,
  liveCollaborators: [],
  sharedCursors: [],
  lowBandwidthMode: JSON.parse(localStorage.getItem('bb_low_bandwidth') || 'false'),

  setPresenceMap: (presenceMap) => set({ presenceMap }),
  updatePresenceEntry: (uid, status) =>
    set((state) => ({
      presenceMap: { ...state.presenceMap, [uid]: status },
    })),

  setMyPresenceState: (myPresenceState) => set({ myPresenceState }),

  setActiveVoiceRoomId: (activeVoiceRoomId) => set({ activeVoiceRoomId }),
  setActiveMeetingId: (activeMeetingId) => set({ activeMeetingId }),
  setActiveWarRoomId: (activeWarRoomId) => set({ activeWarRoomId }),

  setLiveCollaborators: (liveCollaborators) => set({ liveCollaborators }),
  setSharedCursors: (sharedCursors) => set({ sharedCursors }),

  toggleLowBandwidthMode: () => {
    const next = !get().lowBandwidthMode;
    localStorage.setItem('bb_low_bandwidth', JSON.stringify(next));
    set({ lowBandwidthMode: next });
  },
}));
