"use client";

import { useEffect, useRef, useCallback } from "react";
import { PanelRightOpen } from "lucide-react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import { CanvasElement } from "./components";
import styles from "./CanvasWorkspace.module.scss";

// Canvas padding - elements cannot be placed closer than this to edges
const CANVAS_PADDING = 30;

export const CanvasWorkspace = () => {
  const {
    elements,
    selectedElementId,
    setSelectedElement,
    isPanelOpen,
    togglePanel,
    zoom,
    removeElement,
    updateElementPosition,
    updateElementSize,
    updateElement,
  } = useCanvasEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard event handler for Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        // Don't delete if user is typing in an input
        if (
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA"
        ) {
          return;
        }
        e.preventDefault();
        removeElement(selectedElementId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, removeElement]);

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

  // Click on canvas to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        setSelectedElement(null);
      }
    },
    [setSelectedElement],
  );

  // Get canvas ref for export (exposed via store or context if needed)
  const getCanvasRef = useCallback(() => canvasRef, []);

  return (
    <div className={styles.workspaceContainer}>
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

      <div className={styles.scrollableArea}>
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
            data-canvas-export="true"
          >
            {/* Render elements using memoized CanvasElement component */}
            {elements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                zoom={zoom}
                onSelect={handleSelect}
                onPositionChange={handlePositionChange}
                onSizeChange={handleSizeChange}
                onTextChange={handleTextChange}
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
    </div>
  );
};

// Export canvas ref getter for other components (like export feature)
export { CANVAS_PADDING };
