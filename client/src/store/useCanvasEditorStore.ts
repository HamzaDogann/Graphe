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
  
  // Selected element(s)
  selectedElementId: string | null;
  selectedElementIds: string[];
  
  // Clipboard
  clipboard: CanvasElement | null;
  clipboardMultiple: CanvasElement[];
  
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
  removeElements: (ids: string[]) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number, height: number) => void;
  setSelectedElement: (id: string | null) => void;
  setSelectedElements: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectElementsInRect: (rect: { x: number; y: number; width: number; height: number }) => void;
  togglePanel: () => void;
  clearElements: () => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  // Clipboard actions
  copyElement: () => void;
  copyElements: () => void;
  pasteElement: () => void;
  duplicateElement: () => void;
  duplicateElements: () => void;
  // Selection actions
  selectAll: () => void;
  nudgeElement: (direction: 'up' | 'down' | 'left' | 'right', amount?: number) => void;
  nudgeElements: (direction: 'up' | 'down' | 'left' | 'right', amount?: number) => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  // Zoom actions
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  // Canvas size actions
  setPageSize: (preset: PageSizePreset) => void;
  setOrientation: (orientation: Orientation) => void;
  setSizeUnit: (unit: SizeUnit) => void;
  setCustomSize: (width: number, height: number) => void;
  setBackground: (color: string) => void;
  
  // Chart sync action
  updateChartThumbnails: (chartId: string, newThumbnail: string) => void;
  
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
      selectedElementIds: [],
      clipboard: null,
      clipboardMultiple: [],
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
          const newElement = {
            ...element,
            x: centerX,
            y: centerY,
            zIndex: maxZIndex,
          } as CanvasElement;
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
          selectedElementIds: state.selectedElementIds.filter((elId) => elId !== id),
          isDirty: true,
        })),
      
      removeElements: (ids) =>
        set((state) => ({
          elements: state.elements.filter((el) => !ids.includes(el.id)),
          selectedElementId: ids.includes(state.selectedElementId || '') ? null : state.selectedElementId,
          selectedElementIds: [],
          isDirty: true,
        })),
      
      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
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
      
      setSelectedElement: (id) => set({ 
        selectedElementId: id,
        selectedElementIds: id ? [id] : [],
      }),
      
      setSelectedElements: (ids) => set({
        selectedElementIds: ids,
        selectedElementId: ids.length === 1 ? ids[0] : ids.length > 0 ? ids[0] : null,
      }),
      
      addToSelection: (id) => set((state) => {
        if (state.selectedElementIds.includes(id)) return {};
        const newIds = [...state.selectedElementIds, id];
        return {
          selectedElementIds: newIds,
          selectedElementId: newIds.length === 1 ? newIds[0] : state.selectedElementId,
        };
      }),
      
      toggleSelection: (id) => set((state) => {
        const isSelected = state.selectedElementIds.includes(id);
        const newIds = isSelected
          ? state.selectedElementIds.filter((elId) => elId !== id)
          : [...state.selectedElementIds, id];
        return {
          selectedElementIds: newIds,
          selectedElementId: newIds.length === 1 ? newIds[0] : newIds.length > 0 ? newIds[0] : null,
        };
      }),
      
      clearSelection: () => set({
        selectedElementId: null,
        selectedElementIds: [],
      }),
      
      selectElementsInRect: (rect) => {
        const state = get();
        const selectedIds = state.elements
          .filter((el) => {
            // Check if element intersects with selection rectangle
            const elRight = el.x + el.width;
            const elBottom = el.y + el.height;
            const rectRight = rect.x + rect.width;
            const rectBottom = rect.y + rect.height;
            
            return !(
              el.x > rectRight ||
              elRight < rect.x ||
              el.y > rectBottom ||
              elBottom < rect.y
            );
          })
          .map((el) => el.id);
        
        set({
          selectedElementIds: selectedIds,
          selectedElementId: selectedIds.length === 1 ? selectedIds[0] : selectedIds.length > 0 ? selectedIds[0] : null,
        });
      },
      
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      
      clearElements: () => set({ elements: [], selectedElementId: null, selectedElementIds: [], isDirty: true }),
      
      setDragging: (isDragging) => set({ isDragging }),
      setResizing: (isResizing) => set({ isResizing }),
      
      // Clipboard actions
      copyElement: () => {
        const state = get();
        if (!state.selectedElementId) return;
        const element = state.elements.find(el => el.id === state.selectedElementId);
        if (element) {
          set({ 
            clipboard: JSON.parse(JSON.stringify(element)) as CanvasElement,
            clipboardMultiple: [], // Clear multi clipboard when copying single
          });
        }
      },
      
      pasteElement: () => {
        const state = get();
        
        // If multiple elements are in clipboard, paste all of them
        if (state.clipboardMultiple.length > 0) {
          let maxZIndex = state.elements.length > 0 
            ? Math.max(...state.elements.map(el => el.zIndex)) 
            : 0;
          const newElements: CanvasElement[] = [];
          const newIds: string[] = [];
          
          state.clipboardMultiple.forEach((el, index) => {
            maxZIndex += 1;
            const newElement = {
              ...JSON.parse(JSON.stringify(el)),
              id: `${el.type}-${Date.now()}-${index}`,
              x: el.x + 20,
              y: el.y + 20,
              zIndex: maxZIndex,
            } as CanvasElement;
            newElements.push(newElement);
            newIds.push(newElement.id);
          });
          
          set({
            elements: [...state.elements, ...newElements],
            selectedElementIds: newIds,
            selectedElementId: newIds.length === 1 ? newIds[0] : newIds[0],
            isDirty: true,
          });
          return;
        }
        
        // Single element paste
        if (!state.clipboard) return;
        const maxZIndex = state.elements.length > 0 
          ? Math.max(...state.elements.map(el => el.zIndex)) + 1 
          : 1;
        const newElement = {
          ...JSON.parse(JSON.stringify(state.clipboard)),
          id: `${state.clipboard.type}-${Date.now()}`,
          x: state.clipboard.x + 20,
          y: state.clipboard.y + 20,
          zIndex: maxZIndex,
        } as CanvasElement;
        set({
          elements: [...state.elements, newElement],
          selectedElementId: newElement.id,
          selectedElementIds: [newElement.id],
          isDirty: true,
        });
      },
      
      duplicateElement: () => {
        const state = get();
        if (!state.selectedElementId) return;
        const element = state.elements.find(el => el.id === state.selectedElementId);
        if (!element) return;
        const maxZIndex = Math.max(...state.elements.map(el => el.zIndex)) + 1;
        const newElement = {
          ...JSON.parse(JSON.stringify(element)),
          id: `${element.type}-${Date.now()}`,
          x: element.x + 20,
          y: element.y + 20,
          zIndex: maxZIndex,
        } as CanvasElement;
        set({
          elements: [...state.elements, newElement],
          selectedElementId: newElement.id,
          isDirty: true,
        });
      },
      
      copyElements: () => {
        const state = get();
        if (state.selectedElementIds.length === 0) return;
        const selectedElements = state.elements.filter(el => state.selectedElementIds.includes(el.id));
        if (selectedElements.length > 0) {
          set({ 
            clipboardMultiple: JSON.parse(JSON.stringify(selectedElements)) as CanvasElement[],
            clipboard: null, // Clear single clipboard when copying multiple
          });
        }
      },
      
      duplicateElements: () => {
        const state = get();
        if (state.selectedElementIds.length === 0) return;
        const selectedElements = state.elements.filter(el => state.selectedElementIds.includes(el.id));
        if (selectedElements.length === 0) return;
        
        let maxZIndex = Math.max(...state.elements.map(el => el.zIndex));
        const newElements: CanvasElement[] = [];
        const newIds: string[] = [];
        
        selectedElements.forEach((element, index) => {
          maxZIndex += 1;
          const newElement = {
            ...JSON.parse(JSON.stringify(element)),
            id: `${element.type}-${Date.now()}-${index}`,
            x: element.x + 20,
            y: element.y + 20,
            zIndex: maxZIndex,
          } as CanvasElement;
          newElements.push(newElement);
          newIds.push(newElement.id);
        });
        
        set({
          elements: [...state.elements, ...newElements],
          selectedElementIds: newIds,
          selectedElementId: newIds.length === 1 ? newIds[0] : newIds[0],
          isDirty: true,
        });
      },
      
      // Selection actions
      selectAll: () => {
        const state = get();
        if (state.elements.length > 0) {
          const allIds = state.elements.map(el => el.id);
          set({ 
            selectedElementIds: allIds,
            selectedElementId: allIds.length === 1 ? allIds[0] : allIds[0],
          });
        }
      },
      
      nudgeElement: (direction, amount = 1) => {
        const state = get();
        if (!state.selectedElementId) return;
        const element = state.elements.find(el => el.id === state.selectedElementId);
        if (!element) return;
        
        let newX = element.x;
        let newY = element.y;
        
        switch (direction) {
          case 'up': newY -= amount; break;
          case 'down': newY += amount; break;
          case 'left': newX -= amount; break;
          case 'right': newX += amount; break;
        }
        
        // Keep within canvas bounds
        newX = Math.max(0, Math.min(newX, state.canvasWidth - element.width));
        newY = Math.max(0, Math.min(newY, state.canvasHeight - element.height));
        
        set({
          elements: state.elements.map(el =>
            el.id === state.selectedElementId ? { ...el, x: newX, y: newY } : el
          ),
          isDirty: true,
        });
      },
      
      nudgeElements: (direction, amount = 1) => {
        const state = get();
        if (state.selectedElementIds.length === 0) return;
        
        set({
          elements: state.elements.map(el => {
            if (!state.selectedElementIds.includes(el.id)) return el;
            
            let newX = el.x;
            let newY = el.y;
            
            switch (direction) {
              case 'up': newY -= amount; break;
              case 'down': newY += amount; break;
              case 'left': newX -= amount; break;
              case 'right': newX += amount; break;
            }
            
            // Keep within canvas bounds
            newX = Math.max(0, Math.min(newX, state.canvasWidth - el.width));
            newY = Math.max(0, Math.min(newY, state.canvasHeight - el.height));
            
            return { ...el, x: newX, y: newY };
          }),
          isDirty: true,
        });
      },
      
      bringToFront: () => {
        const state = get();
        if (!state.selectedElementId) return;
        const maxZIndex = Math.max(...state.elements.map(el => el.zIndex)) + 1;
        set({
          elements: state.elements.map(el =>
            el.id === state.selectedElementId ? { ...el, zIndex: maxZIndex } : el
          ),
          isDirty: true,
        });
      },
      
      sendToBack: () => {
        const state = get();
        if (!state.selectedElementId) return;
        const minZIndex = Math.min(...state.elements.map(el => el.zIndex)) - 1;
        set({
          elements: state.elements.map(el =>
            el.id === state.selectedElementId ? { ...el, zIndex: Math.max(0, minZIndex) } : el
          ),
          isDirty: true,
        });
      },
      
      bringForward: () => {
        const state = get();
        if (!state.selectedElementId) return;
        const currentElement = state.elements.find(el => el.id === state.selectedElementId);
        if (!currentElement) return;
        
        // Find the next higher zIndex
        const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
        const currentIndex = sortedElements.findIndex(el => el.id === state.selectedElementId);
        
        if (currentIndex < sortedElements.length - 1) {
          const nextElement = sortedElements[currentIndex + 1];
          // Swap zIndex values
          set({
            elements: state.elements.map(el => {
              if (el.id === state.selectedElementId) return { ...el, zIndex: nextElement.zIndex };
              if (el.id === nextElement.id) return { ...el, zIndex: currentElement.zIndex };
              return el;
            }),
            isDirty: true,
          });
        }
      },
      
      sendBackward: () => {
        const state = get();
        if (!state.selectedElementId) return;
        const currentElement = state.elements.find(el => el.id === state.selectedElementId);
        if (!currentElement) return;
        
        // Find the next lower zIndex
        const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
        const currentIndex = sortedElements.findIndex(el => el.id === state.selectedElementId);
        
        if (currentIndex > 0) {
          const prevElement = sortedElements[currentIndex - 1];
          // Swap zIndex values
          set({
            elements: state.elements.map(el => {
              if (el.id === state.selectedElementId) return { ...el, zIndex: prevElement.zIndex };
              if (el.id === prevElement.id) return { ...el, zIndex: currentElement.zIndex };
              return el;
            }),
            isDirty: true,
          });
        }
      },
      
      // Zoom actions
      setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 25), 400) }),
      zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 10, 400) })),
      zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 10, 25) })),
      resetZoom: () => set({ zoom: 100 }),
      
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
      
      // Chart sync action - updates all chart elements with matching chartId
      updateChartThumbnails: (chartId: string, newThumbnail: string) => {
        set((state) => {
          let hasUpdates = false;
          const updatedElements = state.elements.map((el) => {
            // Update chart elements
            if (el.type === "chart" && el.chartConfig?.chartId === chartId) {
              hasUpdates = true;
              return {
                ...el,
                chartConfig: {
                  ...el.chartConfig,
                  imageBase64: newThumbnail,
                },
              };
            }
            // Backward compatibility: update image elements with chartId
            if (el.type === "image" && el.imageConfig?.chartId === chartId) {
              hasUpdates = true;
              return {
                ...el,
                imageConfig: {
                  ...el.imageConfig,
                  src: newThumbnail,
                },
              };
            }
            return el;
          });
          
          if (hasUpdates) {
            return { elements: updatedElements, isDirty: true };
          }
          return {};
        });
      },
      
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
          clipboard: null,
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
