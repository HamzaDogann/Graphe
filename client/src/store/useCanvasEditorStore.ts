import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CanvasElement } from "@/types/canvas";

export type TextType = "paragraph" | "heading1" | "heading2" | "heading3";
export type TextAlign = "left" | "center" | "right";
export type SizeUnit = "px" | "inch" | "mm" | "cm";
export type PageSizePreset = "a4" | "letter" | "legal" | "custom";
export type Orientation = "portrait" | "landscape";

// Page size presets in pixels (96 DPI)
export const PAGE_SIZES: Record<PageSizePreset, { width: number; height: number }> = {
  a4: { width: 794, height: 1123 },      // 210 x 297 mm
  letter: { width: 816, height: 1056 },   // 8.5 x 11 inch
  legal: { width: 816, height: 1344 },    // 8.5 x 14 inch
  custom: { width: 800, height: 600 },    // Default custom
};

// Re-export CanvasElement from types for compatibility
export type { CanvasElement } from "@/types/canvas";

interface CanvasEditorState {
  // Canvas identity and sync state
  canvasId: string | null;
  title: string;
  description: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSavedAt: Date | null;
  
  // Canvas elements
  elements: CanvasElement[];
  
  // Selected element
  selectedElementId: string | null;
  
  // Properties panel state
  isPanelOpen: boolean;
  
  // Zoom state
  zoom: number;
  
  // Dragging state
  isDragging: boolean;
  isResizing: boolean;
  
  // Canvas size state
  canvasWidth: number;
  canvasHeight: number;
  pageSizePreset: PageSizePreset;
  orientation: Orientation;
  sizeUnit: SizeUnit;
  customWidth: number;
  customHeight: number;
  background: string;
  
  // Element actions
  addElement: (element: CanvasElement) => void;
  addElementCentered: (element: Omit<CanvasElement, 'x' | 'y' | 'zIndex'>) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number, height: number) => void;
  setSelectedElement: (id: string | null) => void;
  togglePanel: () => void;
  clearElements: () => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  // Zoom actions
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  // Canvas size actions
  setPageSize: (preset: PageSizePreset) => void;
  setOrientation: (orientation: Orientation) => void;
  setSizeUnit: (unit: SizeUnit) => void;
  setCustomSize: (width: number, height: number) => void;
  setBackground: (color: string) => void;
  
  // DB sync actions
  loadCanvas: (canvasId: string) => Promise<void>;
  saveCanvas: () => Promise<void>;
  createCanvas: (title: string, description?: string) => Promise<string | null>;
  resetCanvas: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string | null) => void;
  markDirty: () => void;
}

export const useCanvasEditorStore = create<CanvasEditorState>()(
  devtools(
    (set, get) => ({
      // Canvas identity and sync state
      canvasId: null,
      title: "Untitled Canvas",
      description: null,
      isDirty: false,
      isSaving: false,
      isLoading: false,
      lastSavedAt: null,
      
      elements: [],
      selectedElementId: null,
      isPanelOpen: true,
      zoom: 100,
      isDragging: false,
      isResizing: false,
      // Canvas size state
      canvasWidth: PAGE_SIZES.a4.width,
      canvasHeight: PAGE_SIZES.a4.height,
      pageSizePreset: "a4" as PageSizePreset,
      orientation: "portrait" as Orientation,
      sizeUnit: "px" as SizeUnit,
      customWidth: 800,
      customHeight: 600,
      background: "#ffffff",
      
      addElement: (element) =>
        set((state) => ({
          elements: [...state.elements, element],
          selectedElementId: element.id,
          isDirty: true,
        })),
      
      addElementCentered: (element) =>
        set((state) => {
          const maxZIndex = state.elements.length > 0 
            ? Math.max(...state.elements.map(el => el.zIndex)) + 1 
            : 1;
          const centerX = (state.canvasWidth - element.width) / 2;
          const centerY = (state.canvasHeight - element.height) / 2;
          const newElement: CanvasElement = {
            ...element,
            x: centerX,
            y: centerY,
            zIndex: maxZIndex,
          };
          return {
            elements: [...state.elements, newElement],
            selectedElementId: newElement.id,
            isDirty: true,
          };
        }),
      
      removeElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          isDirty: true,
        })),
      
      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
          isDirty: true,
        })),
      
      updateElementPosition: (id, x, y) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, x, y } : el
          ),
          isDirty: true,
        })),
      
      updateElementSize: (id, width, height) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, width, height } : el
          ),
          isDirty: true,
        })),
      
      setSelectedElement: (id) => set({ selectedElementId: id }),
      
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      
      clearElements: () => set({ elements: [], selectedElementId: null, isDirty: true }),
      
      setDragging: (isDragging) => set({ isDragging }),
      setResizing: (isResizing) => set({ isResizing }),
      
      // Zoom actions
      setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 50), 200) }),
      zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 10, 200) })),
      zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 10, 50) })),
      
      // Canvas size actions
      setPageSize: (preset) => {
        const size = PAGE_SIZES[preset];
        set((state) => {
          const isPortrait = state.orientation === "portrait";
          return {
            pageSizePreset: preset,
            canvasWidth: isPortrait ? size.width : size.height,
            canvasHeight: isPortrait ? size.height : size.width,
            isDirty: true,
          };
        });
      },
      
      setOrientation: (orientation) =>
        set((state) => {
          const size = PAGE_SIZES[state.pageSizePreset];
          const isPortrait = orientation === "portrait";
          const newWidth = isPortrait ? size.width : size.height;
          // Auto-adjust zoom when switching to landscape so canvas fits on screen
          const autoZoom = isPortrait ? 100 : Math.min(80, state.zoom);
          return {
            orientation,
            canvasWidth: newWidth,
            canvasHeight: isPortrait ? size.height : size.width,
            zoom: autoZoom,
            isDirty: true,
          };
        }),
      
      setSizeUnit: (unit) => set({ sizeUnit: unit }),
      
      setCustomSize: (width, height) =>
        set({
          pageSizePreset: "custom",
          customWidth: width,
          customHeight: height,
          canvasWidth: width,
          canvasHeight: height,
          isDirty: true,
        }),
      
      setBackground: (color) => set({ background: color, isDirty: true }),
      
      // DB sync actions
      setTitle: (title) => set({ title, isDirty: true }),
      setDescription: (description) => set({ description, isDirty: true }),
      markDirty: () => set({ isDirty: true }),
      
      loadCanvas: async (canvasId: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`/api/canvases/${canvasId}`);
          if (!response.ok) {
            throw new Error("Failed to load canvas");
          }
          const data = await response.json();
          const canvas = data.canvas;
          
          // Determine page preset based on dimensions
          let preset: PageSizePreset = "custom";
          const isPortrait = canvas.pageSettings.orientation === "portrait";
          const width = canvas.pageSettings.width;
          const height = canvas.pageSettings.height;
          
          for (const [key, size] of Object.entries(PAGE_SIZES)) {
            if (key === "custom") continue;
            const presetWidth = isPortrait ? size.width : size.height;
            const presetHeight = isPortrait ? size.height : size.width;
            if (width === presetWidth && height === presetHeight) {
              preset = key as PageSizePreset;
              break;
            }
          }
          
          set({
            canvasId: canvas.id,
            title: canvas.title,
            description: canvas.description,
            elements: canvas.elements || [],
            canvasWidth: canvas.pageSettings.width,
            canvasHeight: canvas.pageSettings.height,
            orientation: canvas.pageSettings.orientation as Orientation,
            background: canvas.pageSettings.background,
            pageSizePreset: preset,
            isDirty: false,
            isLoading: false,
            lastSavedAt: new Date(canvas.updatedAt),
          });
        } catch (error) {
          console.error("Error loading canvas:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      saveCanvas: async () => {
        const state = get();
        if (!state.canvasId || state.isSaving) return;
        
        set({ isSaving: true });
        try {
          const response = await fetch(`/api/canvases/${state.canvasId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: state.title,
              description: state.description,
              pageSettings: {
                width: state.canvasWidth,
                height: state.canvasHeight,
                orientation: state.orientation,
                background: state.background,
              },
              elements: state.elements,
            }),
          });
          
          if (!response.ok) {
            throw new Error("Failed to save canvas");
          }
          
          set({
            isDirty: false,
            isSaving: false,
            lastSavedAt: new Date(),
          });
        } catch (error) {
          console.error("Error saving canvas:", error);
          set({ isSaving: false });
          throw error;
        }
      },
      
      createCanvas: async (title: string, description?: string) => {
        try {
          const response = await fetch("/api/canvases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
          });
          
          if (!response.ok) {
            throw new Error("Failed to create canvas");
          }
          
          const data = await response.json();
          const canvas = data.canvas;
          
          set({
            canvasId: canvas.id,
            title: canvas.title,
            description: canvas.description,
            elements: [],
            canvasWidth: canvas.pageSettings.width,
            canvasHeight: canvas.pageSettings.height,
            orientation: canvas.pageSettings.orientation as Orientation,
            background: canvas.pageSettings.background,
            pageSizePreset: "a4",
            isDirty: false,
            lastSavedAt: new Date(canvas.createdAt),
          });
          
          return canvas.id;
        } catch (error) {
          console.error("Error creating canvas:", error);
          return null;
        }
      },
      
      resetCanvas: () =>
        set({
          canvasId: null,
          title: "Untitled Canvas",
          description: null,
          elements: [],
          selectedElementId: null,
          canvasWidth: PAGE_SIZES.a4.width,
          canvasHeight: PAGE_SIZES.a4.height,
          pageSizePreset: "a4",
          orientation: "portrait",
          background: "#ffffff",
          isDirty: false,
          isSaving: false,
          isLoading: false,
          lastSavedAt: null,
          zoom: 100,
        }),
    }),
    { name: "CanvasEditorStore" }
  )
);
