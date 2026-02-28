import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CanvasListItem } from "@/types/canvas";

export interface Canvas {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  elementCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

interface CanvasState {
  // All canvases list
  canvases: Canvas[];
  
  // Loading states
  isLoaded: boolean;       // Has initial fetch been done?
  isFetching: boolean;     // Currently fetching from API?
  
  // Actions
  fetchCanvases: () => Promise<void>;
  addCanvas: (canvas: Canvas) => void;
  addCanvasWithSync: (title: string, description?: string) => Promise<string | null>;
  removeCanvas: (id: string) => void;
  removeCanvasWithSync: (id: string) => Promise<void>;
  updateCanvas: (id: string, updates: Partial<Canvas>) => void;
  updateCanvasWithSync: (id: string, updates: { title?: string; description?: string }) => Promise<void>;
  clearAllCanvases: () => void;
  getCanvasById: (id: string) => Canvas | undefined;
  setCanvases: (canvases: Canvas[]) => void;
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      canvases: [],
      isLoaded: false,
      isFetching: false,
      
      // Fetch all canvases from API
      fetchCanvases: async () => {
        // Skip if already fetching
        if (get().isFetching) return;
        
        set({ isFetching: true });
        
        try {
          const response = await fetch("/api/canvases");
          if (!response.ok) throw new Error("Failed to fetch canvases");
          
          const data = await response.json();
          const canvases: Canvas[] = (data.canvases || []).map((c: CanvasListItem) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail,
            elementCount: c.elementCount,
            createdAt: new Date(c.createdAt),
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
          }));
          
          set({ canvases, isLoaded: true, isFetching: false });
        } catch (error) {
          console.error("Error fetching canvases:", error);
          set({ isFetching: false, isLoaded: true });
        }
      },
      
      // Add canvas to local store (instant)
      addCanvas: (canvas) => set((state) => ({ 
        canvases: [canvas, ...state.canvases], // New canvas at top
      })),
      
      // Add canvas with background DB sync
      addCanvasWithSync: async (title: string, description?: string) => {
        try {
          const response = await fetch("/api/canvases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
          });
          
          if (!response.ok) throw new Error("Failed to create canvas");
          
          const data = await response.json();
          const canvas = data.canvas;
          
          // Add to local store immediately
          const newCanvas: Canvas = {
            id: canvas.id,
            title: canvas.title,
            description: canvas.description,
            thumbnail: canvas.thumbnail,
            elementCount: canvas.elementCount || 0,
            createdAt: new Date(canvas.createdAt),
            updatedAt: new Date(canvas.updatedAt),
          };
          
          set((state) => ({
            canvases: [newCanvas, ...state.canvases],
          }));
          
          return canvas.id;
        } catch (error) {
          console.error("Error creating canvas:", error);
          return null;
        }
      },
      
      // Remove canvas from local store (instant)
      removeCanvas: (id) => set((state) => ({
        canvases: state.canvases.filter((c) => c.id !== id),
      })),
      
      // Remove canvas with background DB sync
      removeCanvasWithSync: async (id: string) => {
        // Remove from local store immediately (optimistic)
        set((state) => ({
          canvases: state.canvases.filter((c) => c.id !== id),
        }));
        
        // Sync to DB in background
        try {
          const response = await fetch(`/api/canvases/${id}`, {
            method: "DELETE",
          });
          
          if (!response.ok) {
            console.error("Failed to delete canvas from DB");
            // Could re-add to local store here if needed
          }
        } catch (error) {
          console.error("Error deleting canvas:", error);
        }
      },
      
      // Update canvas in local store
      updateCanvas: (id, updates) => set((state) => ({
        canvases: state.canvases.map((c) => 
          c.id === id ? { ...c, ...updates } : c
        ),
      })),
      
      // Update canvas with background DB sync
      updateCanvasWithSync: async (id: string, updates: { title?: string; description?: string }) => {
        // Update local store immediately (optimistic)
        set((state) => ({
          canvases: state.canvases.map((c) => 
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
        }));
        
        // Sync to DB in background
        try {
          const response = await fetch(`/api/canvases/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            console.error("Failed to update canvas in DB");
          }
        } catch (error) {
          console.error("Error updating canvas:", error);
        }
      },
      
      clearAllCanvases: () => set({ canvases: [], isLoaded: false }),
      
      getCanvasById: (id) => get().canvases.find((c) => c.id === id),
      
      setCanvases: (canvases) => set({ canvases, isLoaded: true }),
    }),
    { name: "CanvasStore" }
  )
);
