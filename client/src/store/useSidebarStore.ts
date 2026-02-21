import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
