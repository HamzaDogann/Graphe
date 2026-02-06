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
    // Canvas dimensions (A4 at 96 DPI minus padding)
    const CANVAS_WIDTH = 794 - 80; // 794px - 40px padding on each side
    const CANVAS_HEIGHT = 1123 - 80;
    const CHART_WIDTH = 350;
    const CHART_HEIGHT = 200;

    // Calculate center position
    const centerX = (CANVAS_WIDTH - CHART_WIDTH) / 2;
    const centerY = (CANVAS_HEIGHT - CHART_HEIGHT) / 2;

    // Calculate next zIndex (highest + 1)
    const maxZIndex =
      elements.length > 0
        ? Math.max(...elements.map((el) => el.zIndex || 0))
        : 0;

    const newChart = {
      id: `chart-${Date.now()}`,
      type: "chart" as const,
      x: centerX,
      y: centerY,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      zIndex: maxZIndex + 1,
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
    // Canvas dimensions (A4 at 96 DPI minus padding)
    const CANVAS_WIDTH = 794 - 80; // 794px - 40px padding on each side
    const CANVAS_HEIGHT = 1123 - 80;
    const TEXT_WIDTH = 120;
    const TEXT_HEIGHT = 32;

    // Calculate center position
    const centerX = (CANVAS_WIDTH - TEXT_WIDTH) / 2;
    const centerY = (CANVAS_HEIGHT - TEXT_HEIGHT) / 2;

    // Calculate next zIndex (highest + 1)
    const maxZIndex =
      elements.length > 0
        ? Math.max(...elements.map((el) => el.zIndex || 0))
        : 0;

    const newText = {
      id: `text-${Date.now()}`,
      type: "text" as const,
      x: centerX,
      y: centerY,
      width: TEXT_WIDTH,
      height: TEXT_HEIGHT,
      zIndex: maxZIndex + 1,
      data: "Text",
      style: {
        fontSize: 16,
        color: "#000000",
        textType: "paragraph" as const,
        textAlign: "left" as const,
        fontWeight: "normal" as const,
        fontStyle: "normal" as const,
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
