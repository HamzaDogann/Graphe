import { create } from "zustand";

interface LoaderState {
  isLoading: boolean;
  startTime: number;
  show: () => void;
  hide: () => void;
}

const MIN_DURATION = 800; 

export const useLoaderStore = create<LoaderState>((set, get) => ({
  isLoading: false,
  startTime: 0,

  show: () => {
    if (get().isLoading) return;
    
    set({ 
      isLoading: true, 
      startTime: Date.now() 
    });
  },

  hide: () => {
    const { startTime } = get();
    const now = Date.now();
    const elapsed = now - startTime;

    if (elapsed < MIN_DURATION) {
      const remaining = MIN_DURATION - elapsed;
      setTimeout(() => {
        set({ isLoading: false });
      }, remaining);
    } else {
      set({ isLoading: false });
    }
  },
}));