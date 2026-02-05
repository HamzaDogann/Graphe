import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Layout } from "react-grid-layout";

export type CanvasElement = {
  id: string;
  type: "chart" | "text";
  // Grid Layout coordinates (x, y, w, h)
  x: number; // Column position (0-11)
  y: number; // Row position
  w: number; // Width in columns
  h: number; // Height in rows
  // Content data
  data?: any; // Chart configuration or text content
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
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
  
  // Actions
  addElement: (element: CanvasElement) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElementLayout: (id: string, layout: { x: number; y: number; w: number; h: number }) => void;
  setSelectedElement: (id: string | null) => void;
  togglePanel: () => void;
  clearElements: () => void;
  // Batch update layouts (for react-grid-layout onChange)
  updateLayouts: (layouts: Layout[]) => void;
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
      
      updateElementLayout: (id, layout) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, x: layout.x, y: layout.y, w: layout.w, h: layout.h } : el
          ),
        })),
      
      setSelectedElement: (id) => set({ selectedElementId: id }),
      
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      
      clearElements: () => set({ elements: [], selectedElementId: null }),
      
      updateLayouts: (layouts) =>
        set((state) => ({
          elements: state.elements.map((el) => {
            const layoutItem = layouts.find((l) => (l as any).i === el.id);
            if (layoutItem) {
              return {
                ...el,
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              };
            }
            return el;
          }),
        })),
      
      // Zoom actions
      setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 50), 200) }),
      zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 10, 200) })),
      zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 10, 50) })),
    }),
    { name: "CanvasEditorStore" }
  )
);
