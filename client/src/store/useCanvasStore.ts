import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Canvas {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

interface CanvasState {
  // Active canvas (currently being viewed/edited)
  activeCanvas: Canvas | null;
  
  // All canvases list
  canvases: Canvas[];
  
  // Actions
  setActiveCanvas: (canvas: Canvas) => void;
  clearActiveCanvas: () => void;
  addCanvas: (canvas: Canvas) => void;
  removeCanvas: (id: string) => void;
  getCanvasById: (id: string) => Canvas | undefined;
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      activeCanvas: null,
      canvases: [],
      
      setActiveCanvas: (canvas) => set({ activeCanvas: canvas }),
      clearActiveCanvas: () => set({ activeCanvas: null }),
      
      addCanvas: (canvas) => set((state) => ({ 
        canvases: [...state.canvases, canvas],
        activeCanvas: canvas 
      })),
      
      removeCanvas: (id) => set((state) => ({
        canvases: state.canvases.filter((c) => c.id !== id),
        activeCanvas: state.activeCanvas?.id === id ? null : state.activeCanvas
      })),
      
      getCanvasById: (id) => get().canvases.find((c) => c.id === id),
    }),
    { name: "CanvasStore" }
  )
);
