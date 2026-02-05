"use client";

import { useEffect } from "react";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import { ChartFactory } from "@/components/ChartFactory";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import styles from "./CanvasWorkspace.module.scss";

export const CanvasWorkspace = () => {
  const {
    elements,
    selectedElementId,
    setSelectedElement,
    isPanelOpen,
    togglePanel,
    updateLayouts,
    zoom,
    removeElement,
  } = useCanvasEditorStore();

  // Keyboard event handler for Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        // Prevent default backspace navigation
        e.preventDefault();
        removeElement(selectedElementId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, removeElement]);

  // Convert elements to react-grid-layout format
  const layout = elements.map((el) => ({
    i: el.id,
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
    minW: 2, // Minimum 2 columns
    minH: 2, // Minimum 2 rows
  }));

  const handleLayoutChange = (newLayout: any[]) => {
    updateLayouts(newLayout);
  };

  return (
    <div className={styles.workspaceContainer}>
      {/* Panel Toggle Button - Top Right */}
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
          <div className={styles.canvas}>
            <GridLayout
              className={styles.gridLayout}
              layout={layout}
              cols={12}
              rowHeight={60}
              width={714} // A4 width (794px) - padding (40px * 2)
              onLayoutChange={handleLayoutChange}
              draggableHandle={`.${styles.dragHandle}`}
              compactType={null} // Disable auto-compact
              preventCollision={false}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`${styles.element} ${
                    selectedElementId === element.id ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {/* Drag Handle */}
                  <div className={styles.dragHandle}>
                    <div className={styles.dragIcon}>⋮⋮</div>
                  </div>

                  {/* Element Content */}
                  <div className={styles.elementContent}>
                    {element.type === "chart" && element.chartConfig ? (
                      <ChartFactory config={element.chartConfig} />
                    ) : element.type === "chart" ? (
                      <div className={styles.chartPlaceholder}>
                        <span>Chart</span>
                        <p className={styles.chartTitle}>
                          Select this element and use AI to generate a chart
                        </p>
                      </div>
                    ) : null}

                    {element.type === "text" && (
                      <div
                        className={styles.textElement}
                        style={{
                          fontSize: element.style?.fontSize || 16,
                          fontFamily: element.style?.fontFamily || "inherit",
                          color: element.style?.color || "#000",
                        }}
                      >
                        {element.data || "Text Element"}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </GridLayout>

            {/* Empty state */}
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
