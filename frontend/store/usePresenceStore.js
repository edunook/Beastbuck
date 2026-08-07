import { create } from 'zustand';

export const usePresenceStore = create((set) => ({
  onlineMembers: {},
  myStatus: 'offline',
  myActivity: null,

  setMyStatus: (status) => set({ myStatus: status }),
  setMyActivity: (activity) => set({ myActivity: activity }),
  updateMemberPresence: (uid, presence) => set((state) => ({
    onlineMembers: {
      ...state.onlineMembers,
      [uid]: presence,
    },
  })),
  setOnlineMembers: (members) => set({ onlineMembers: members }),
}));
