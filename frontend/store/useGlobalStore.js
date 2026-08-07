import { create } from 'zustand';

export const useGlobalStore = create((set) => ({
  // UI State
  isMobileDrawerOpen: false,
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),
  
  isPresencePanelOpen: false,
  togglePresencePanel: () => set((state) => ({ isPresencePanelOpen: !state.isPresencePanelOpen })),
  
  isSidebarCollapsed: JSON.parse(localStorage.getItem('beastbuck_sidebar_collapsed') || 'false'),
  toggleSidebar: () => set((state) => {
    const newState = !state.isSidebarCollapsed;
    localStorage.setItem('beastbuck_sidebar_collapsed', JSON.stringify(newState));
    return { isSidebarCollapsed: newState };
  }),
  
  // App-level modal state
  activeModal: null,
  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),

  // Theme or other global app states can go here
}));
