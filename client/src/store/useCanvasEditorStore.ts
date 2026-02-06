import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type TextType = "paragraph" | "heading1" | "heading2" | "heading3";
export type TextAlign = "left" | "center" | "right";

export type CanvasElement = {
  id: string;
  type: "chart" | "text";
  // Pixel-based coordinates for free positioning
  x: number; // X position in pixels
  y: number; // Y position in pixels
  width: number; // Width in pixels (auto for text)
  height: number; // Height in pixels (auto for text)
  zIndex: number; // Stacking order
  // Content data
  data?: any; // Chart configuration or text content
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: TextAlign;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    textType?: TextType;
  };
  // Chart specific config (if type is "chart")
  chartConfig?: {
    chartType: "bar" | "pie" | "line" | "table";
    title?: string;
    filters?: Array<{
      column: string;
      operator: "eq" | "neq" | "gt" | "lt" | "contains";
      value: any;
    }>;
    groupBy?: string | null;
    operation?: "count" | "sum" | "avg" | null;
    metricColumn?: string | null;
  };
};

interface CanvasEditorState {
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
  
  // Actions
  addElement: (element: CanvasElement) => void;
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
}

export const useCanvasEditorStore = create<CanvasEditorState>()(
  devtools(
    (set) => ({
      elements: [],
      selectedElementId: null,
      isPanelOpen: true,
      zoom: 100,
      isDragging: false,
      isResizing: false,
      
      addElement: (element) =>
        set((state) => ({
          elements: [...state.elements, element],
          selectedElementId: element.id,
        })),
      
      removeElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        })),
      
      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        })),
      
      updateElementPosition: (id, x, y) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, x, y } : el
          ),
        })),
      
      updateElementSize: (id, width, height) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, width, height } : el
          ),
        })),
      
      setSelectedElement: (id) => set({ selectedElementId: id }),
      
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      
      clearElements: () => set({ elements: [], selectedElementId: null }),
      
      setDragging: (isDragging) => set({ isDragging }),
      setResizing: (isResizing) => set({ isResizing }),
      
      // Zoom actions
      setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 50), 200) }),
      zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 10, 200) })),
      zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 10, 50) })),
    }),
    { name: "CanvasEditorStore" }
  )
);
