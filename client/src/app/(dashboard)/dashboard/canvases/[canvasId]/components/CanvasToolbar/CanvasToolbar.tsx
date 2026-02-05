"use client";

import {
  MousePointer,
  ZoomIn,
  ZoomOut,
  Hand,
  BarChart3,
  Type,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import styles from "./CanvasToolbar.module.scss";

type Tool = "cursor" | "hand";

export const CanvasToolbar = () => {
  const [activeTool, setActiveTool] = useState<Tool>("cursor");
  const {
    addElement,
    elements,
    zoom,
    zoomIn,
    zoomOut,
    selectedElementId,
    removeElement,
  } = useCanvasEditorStore();

  const handleAddChart = () => {
    const newChart = {
      id: `chart-${Date.now()}`,
      type: "chart" as const,
      x: 0,
      y: elements.length * 4, // Stack vertically
      w: 6,
      h: 4,
      chartConfig: {
        chartType: "bar" as const,
        title: "New Chart",
        groupBy: null,
        operation: "count" as const,
        metricColumn: null,
      },
    };
    addElement(newChart);
  };

  const handleAddText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: "text" as const,
      x: 6,
      y: elements.length * 4,
      w: 6,
      h: 2,
      data: "New Text Element",
      style: {
        fontSize: 16,
        color: "#000000",
      },
    };
    addElement(newText);
  };

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbar}>
        {/* Tool Selection */}
        <div className={styles.toolGroup}>
          <button
            className={`${styles.toolButton} ${
              activeTool === "cursor" ? styles.active : ""
            }`}
            onClick={() => setActiveTool("cursor")}
            aria-label="Cursor tool"
            title="Select (V)"
          >
            <MousePointer size={18} />
          </button>
          <button
            className={`${styles.toolButton} ${
              activeTool === "hand" ? styles.active : ""
            }`}
            onClick={() => setActiveTool("hand")}
            aria-label="Hand tool"
            title="Hand tool (H)"
          >
            <Hand size={18} />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Add Elements */}
        <div className={styles.toolGroup}>
          <button
            className={styles.toolButton}
            onClick={handleAddChart}
            aria-label="Add chart"
            title="Add Chart (C)"
          >
            <BarChart3 size={18} />
          </button>
          <button
            className={styles.toolButton}
            onClick={handleAddText}
            aria-label="Add text"
            title="Add Text (T)"
          >
            <Type size={18} />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Delete Element */}
        <div className={styles.toolGroup}>
          <button
            className={`${styles.toolButton} ${styles.deleteButton}`}
            onClick={() =>
              selectedElementId && removeElement(selectedElementId)
            }
            aria-label="Delete element"
            title="Delete Element (Delete)"
            disabled={!selectedElementId}
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Zoom Controls */}
        <div className={styles.zoomGroup}>
          <button
            className={styles.toolButton}
            onClick={zoomOut}
            aria-label="Zoom out"
            title="Zoom out"
            disabled={zoom <= 50}
          >
            <ZoomOut size={18} />
          </button>

          <div className={styles.zoomDisplay}>{zoom}%</div>

          <button
            className={styles.toolButton}
            onClick={zoomIn}
            aria-label="Zoom in"
            title="Zoom in"
            disabled={zoom >= 200}
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
