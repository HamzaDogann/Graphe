"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { PanelRightOpen, Keyboard } from "lucide-react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import { useKeyboardShortcuts } from "@/hooks";
import { CanvasElement } from "./components";
import { KeyboardShortcutsModal } from "../KeyboardShortcutsModal";
import { ElementContextMenu } from "../ElementContextMenu";
import { SelectionRectangle } from "../SelectionRectangle";
import styles from "./CanvasWorkspace.module.scss";

const CANVAS_PADDING = 30;

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
}

interface SelectionState {
  isSelecting: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const CanvasWorkspace = () => {
  const {
    elements,
    selectedElementId,
    selectedElementIds,
    setSelectedElement,
    setSelectedElements,
    clearSelection,
    selectElementsInRect,
    isPanelOpen,
    togglePanel,
    zoom,
    updateElementPosition,
    updateElementSize,
    updateElement,
    canvasWidth,
    canvasHeight,
  } = useCanvasEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
  });
  const [selection, setSelection] = useState<SelectionState>({
    isSelecting: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  // Initialize keyboard shortcuts with the workspace container ref
  const { shortcuts } = useKeyboardShortcuts(
    () => setShowShortcuts(true),
    workspaceRef as React.RefObject<HTMLElement>,
  );

  // Selection rectangle handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start selection if clicking on canvas background (not on an element)
      if (e.target !== canvasRef.current) return;
      if (e.button !== 0) return; // Only left click

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate position relative to canvas content area
      // Account for zoom and canvas padding (40px CSS padding)
      const canvasPaddingCSS = 40;
      const x = (e.clientX - rect.left) / (zoom / 100) - canvasPaddingCSS;
      const y = (e.clientY - rect.top) / (zoom / 100) - canvasPaddingCSS;

      setSelection({
        isSelecting: true,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });

      // Clear selection when starting new selection
      clearSelection();
    },
    [zoom, clearSelection],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!selection.isSelecting) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Account for zoom and canvas padding (40px CSS padding)
      const canvasPaddingCSS = 40;
      const x = (e.clientX - rect.left) / (zoom / 100) - canvasPaddingCSS;
      const y = (e.clientY - rect.top) / (zoom / 100) - canvasPaddingCSS;

      setSelection((prev) => ({
        ...prev,
        endX: x,
        endY: y,
      }));
    },
    [selection.isSelecting, zoom],
  );

  const handleMouseUp = useCallback(() => {
    if (!selection.isSelecting) return;

    // Calculate selection rectangle
    const left = Math.min(selection.startX, selection.endX);
    const top = Math.min(selection.startY, selection.endY);
    const width = Math.abs(selection.endX - selection.startX);
    const height = Math.abs(selection.endY - selection.startY);

    // Only select if dragged a meaningful distance
    if (width > 5 && height > 5) {
      selectElementsInRect({ x: left, y: top, width, height });
    }

    setSelection((prev) => ({
      ...prev,
      isSelecting: false,
    }));
  }, [selection, selectElementsInRect]);

  // Global mouse up listener for selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (selection.isSelecting) {
        handleMouseUp();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [selection.isSelecting, handleMouseUp]);

  // Memoized callbacks for CanvasElement
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedElement(id);
    },
    [setSelectedElement],
  );

  const handlePositionChange = useCallback(
    (id: string, x: number, y: number) => {
      updateElementPosition(id, x, y);
    },
    [updateElementPosition],
  );

  const handleSizeChange = useCallback(
    (id: string, width: number, height: number) => {
      updateElementSize(id, width, height);
    },
    [updateElementSize],
  );

  // Handle text content change from inline editing
  const handleTextChange = useCallback(
    (id: string, text: string) => {
      updateElement(id, { data: text });
    },
    [updateElement],
  );

  // Handle rotation change
  const handleRotationChange = useCallback(
    (id: string, rotation: number) => {
      updateElement(id, { rotation });
    },
    [updateElement],
  );

  // Click on canvas to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        setSelectedElement(null);
        clearSelection();
      }
    },
    [setSelectedElement, clearSelection],
  );

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
    });
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Get canvas ref for export (exposed via store or context if needed)
  const getCanvasRef = useCallback(() => canvasRef, []);

  return (
    <div ref={workspaceRef} className={styles.workspaceContainer}>
      {/* Shortcuts button */}
      <button
        className={styles.shortcutsButton}
        onClick={() => setShowShortcuts(true)}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (Ctrl + /)"
      >
        <Keyboard size={18} />
      </button>

      {!isPanelOpen && (
        <button
          className={styles.panelToggleButton}
          onClick={togglePanel}
          aria-label="Open panel"
          title="Open properties panel"
        >
          <PanelRightOpen size={20} />
        </button>
      )}

      <div className={styles.scrollableArea} onContextMenu={handleContextMenu}>
        <div
          className={styles.canvasWrapper}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <div
            ref={canvasRef}
            className={styles.canvas}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            data-canvas-export="true"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
            }}
          >
            {/* Selection rectangle for multi-select */}
            <SelectionRectangle
              startX={selection.startX}
              startY={selection.startY}
              endX={selection.endX}
              endY={selection.endY}
              isVisible={selection.isSelecting}
            />

            {/* Render elements using memoized CanvasElement component */}
            {elements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={
                  selectedElementId === element.id ||
                  selectedElementIds.includes(element.id)
                }
                zoom={zoom}
                onSelect={handleSelect}
                onPositionChange={handlePositionChange}
                onSizeChange={handleSizeChange}
                onTextChange={handleTextChange}
                onRotationChange={handleRotationChange}
                canvasPadding={CANVAS_PADDING}
              />
            ))}

            {elements.length === 0 && (
              <div className={styles.emptyState}>
                <p>
                  Click the Chart or Text icons in the toolbar to add elements
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={shortcuts}
      />

      {/* Element Context Menu */}
      <ElementContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
      />
    </div>
  );
};

// Export canvas ref getter for other components (like export feature)
export { CANVAS_PADDING };
