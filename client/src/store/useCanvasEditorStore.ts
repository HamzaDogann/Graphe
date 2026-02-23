import { create } from "zustand";
import { devtools } from "zustand/middleware";

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

export type CanvasElement = {
  id: string;
  type: "chart" | "text" | "image";
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
  // Image specific config (if type is "image")
  imageConfig?: {
    src: string;
    alt?: string;
    chartId?: string; // Reference to original chart if from charts list
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
  
  // Canvas size state
  canvasWidth: number;
  canvasHeight: number;
  pageSizePreset: PageSizePreset;
  orientation: Orientation;
  sizeUnit: SizeUnit;
  customWidth: number;
  customHeight: number;
  
  // Actions
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
}

export const useCanvasEditorStore = create<CanvasEditorState>()(
  devtools(
    (set, get) => ({
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
      
      addElement: (element) =>
        set((state) => ({
          elements: [...state.elements, element],
          selectedElementId: element.id,
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
          };
        }),
      
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
      
      // Canvas size actions
      setPageSize: (preset) => {
        const size = PAGE_SIZES[preset];
        set((state) => {
          const isPortrait = state.orientation === "portrait";
          return {
            pageSizePreset: preset,
            canvasWidth: isPortrait ? size.width : size.height,
            canvasHeight: isPortrait ? size.height : size.width,
          };
        });
      },
      
      setOrientation: (orientation) =>
        set((state) => {
          const size = PAGE_SIZES[state.pageSizePreset];
          const isPortrait = orientation === "portrait";
          return {
            orientation,
            canvasWidth: isPortrait ? size.width : size.height,
            canvasHeight: isPortrait ? size.height : size.width,
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
        }),
    }),
    { name: "CanvasEditorStore" }
  )
);
