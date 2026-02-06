"use client";

import React, { useRef, useCallback, memo, useState, useEffect } from "react";
import Moveable from "react-moveable";
import { ChartFactory } from "@/components/ChartFactory";
import { CanvasElement as CanvasElementType } from "@/store/useCanvasEditorStore";
import styles from "../CanvasWorkspace.module.scss";

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  zoom: number;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onTextChange: (id: string, text: string) => void;
  canvasPadding: number;
}

// Get font size based on text type
const getTextTypeStyles = (textType?: string) => {
  switch (textType) {
    case "heading1":
      return { fontSize: 32, fontWeight: "bold" as const };
    case "heading2":
      return { fontSize: 24, fontWeight: "bold" as const };
    case "heading3":
      return { fontSize: 20, fontWeight: "bold" as const };
    default:
      return { fontSize: 16, fontWeight: "normal" as const };
  }
};

/**
 * Individual canvas element with React.memo for performance optimization.
 * Uses react-moveable for GPU-accelerated drag and resize.
 * Implements transient updates - only updates store on drag/resize end.
 * Supports inline text editing on double-click.
 */
const CanvasElementComponent: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  zoom,
  onSelect,
  onPositionChange,
  onSizeChange,
  onTextChange,
  canvasPadding,
}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(element.data || "Text");

  // Sync editText with element data when it changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditText(element.data || "Text");
    }
  }, [element.data, isEditing]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditing]);

  // Handle click to select
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isEditing) {
        onSelect(element.id);
      }
    },
    [element.id, onSelect, isEditing],
  );

  // Handle double click to edit text
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (element.type === "text") {
        setIsEditing(true);
      }
    },
    [element.type],
  );

  // Handle text input blur - save text
  const handleTextBlur = useCallback(() => {
    setIsEditing(false);
    if (editText !== element.data) {
      onTextChange(element.id, editText);
    }
  }, [editText, element.data, element.id, onTextChange]);

  // Handle keyboard events in text input
  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditText(element.data || "Text");
        setIsEditing(false);
      }
      // Prevent delete shortcut from deleting element while editing
      if (e.key === "Delete" || e.key === "Backspace") {
        e.stopPropagation();
      }
    },
    [element.data],
  );

  // Get computed styles for text
  const textTypeStyles = getTextTypeStyles(element.style?.textType);
  const computedFontSize = element.style?.fontSize || textTypeStyles.fontSize;
  const computedFontWeight =
    element.style?.fontWeight || textTypeStyles.fontWeight;

  return (
    <>
      <div
        ref={targetRef}
        data-element-id={element.id}
        className={`${styles.element} ${isSelected ? styles.selected : ""} ${
          element.type === "text" ? styles.textContainer : ""
        }`}
        style={{
          // GPU-accelerated positioning using transform
          transform: `translate3d(${element.x}px, ${element.y}px, 0)`,
          width: element.width,
          height: element.height,
          // Using transform instead of left/top for GPU acceleration
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: element.zIndex || 1,
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
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
            <>
              {isEditing ? (
                <textarea
                  ref={textInputRef}
                  className={styles.textInput}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={handleTextBlur}
                  onKeyDown={handleTextKeyDown}
                  style={{
                    fontSize: computedFontSize,
                    fontFamily: element.style?.fontFamily || "inherit",
                    color: element.style?.color || "#000",
                    fontWeight: computedFontWeight,
                    fontStyle: element.style?.fontStyle || "normal",
                    textAlign: element.style?.textAlign || "left",
                  }}
                />
              ) : (
                <div
                  className={styles.textElement}
                  style={{
                    fontSize: computedFontSize,
                    fontFamily: element.style?.fontFamily || "inherit",
                    color: element.style?.color || "#000",
                    fontWeight: computedFontWeight,
                    fontStyle: element.style?.fontStyle || "normal",
                    textAlign: element.style?.textAlign || "left",
                    justifyContent:
                      element.style?.textAlign === "center"
                        ? "center"
                        : element.style?.textAlign === "right"
                          ? "flex-end"
                          : "flex-start",
                  }}
                >
                  {element.data || "Text"}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Moveable component - only render when selected and not editing */}
      {isSelected && targetRef.current && !isEditing && (
        <Moveable
          ref={moveableRef}
          target={targetRef.current}
          // Drag configuration
          draggable={true}
          throttleDrag={0}
          // Resize configuration
          resizable={true}
          throttleResize={0}
          keepRatio={false}
          renderDirections={["nw", "ne", "sw", "se"]}
          // Edge configuration for better visual feedback
          edge={false}
          // Zoom compensation
          zoom={1}
          // Origin display
          origin={false}
          // Padding to prevent elements from going outside canvas
          padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
          // Snap configuration
          snappable={false}
          // Drag events - transient updates
          onDrag={({ target, transform }) => {
            // Apply transform directly to DOM for smooth animation
            target.style.transform = transform;
          }}
          onDragEnd={({ target }) => {
            // Parse final position from transform and update store
            const transform = target.style.transform;
            const match = transform.match(
              /translate3d\(([^,]+)px,\s*([^,]+)px/,
            );
            if (match) {
              const x = Math.max(canvasPadding, parseFloat(match[1]));
              const y = Math.max(canvasPadding, parseFloat(match[2]));
              onPositionChange(element.id, x, y);
            }
          }}
          // Resize events - transient updates
          onResize={({ target, width, height, drag }) => {
            // Apply size directly to DOM
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            target.style.transform = drag.transform;
          }}
          onResizeEnd={({ target }) => {
            // Parse final size and position, then update store
            const width = parseFloat(target.style.width);
            const height = parseFloat(target.style.height);
            const transform = target.style.transform;
            const match = transform.match(
              /translate3d\(([^,]+)px,\s*([^,]+)px/,
            );

            if (match) {
              const x = Math.max(canvasPadding, parseFloat(match[1]));
              const y = Math.max(canvasPadding, parseFloat(match[2]));
              onPositionChange(element.id, x, y);
            }
            onSizeChange(element.id, Math.max(20, width), Math.max(20, height));
          }}
          // Styling for handles
          className={styles.moveable}
        />
      )}
    </>
  );
};

// Memoized version - only re-renders when props change
export const CanvasElement = memo(CanvasElementComponent, (prev, next) => {
  return (
    prev.element.id === next.element.id &&
    prev.element.x === next.element.x &&
    prev.element.y === next.element.y &&
    prev.element.width === next.element.width &&
    prev.element.height === next.element.height &&
    prev.element.type === next.element.type &&
    prev.element.data === next.element.data &&
    prev.element.zIndex === next.element.zIndex &&
    prev.element.style?.fontSize === next.element.style?.fontSize &&
    prev.element.style?.fontFamily === next.element.style?.fontFamily &&
    prev.element.style?.color === next.element.style?.color &&
    prev.element.style?.textAlign === next.element.style?.textAlign &&
    prev.element.style?.fontWeight === next.element.style?.fontWeight &&
    prev.element.style?.fontStyle === next.element.style?.fontStyle &&
    prev.element.style?.textType === next.element.style?.textType &&
    prev.element.chartConfig === next.element.chartConfig &&
    prev.isSelected === next.isSelected &&
    prev.zoom === next.zoom
  );
});

CanvasElement.displayName = "CanvasElement";
