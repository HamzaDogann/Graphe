"use client";

import { memo } from "react";
import styles from "./SelectionRectangle.module.scss";

interface SelectionRectangleProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isVisible: boolean;
}

// Must match the CSS padding on .canvas
const CANVAS_CSS_PADDING = 40;

export const SelectionRectangle = memo(
  ({ startX, startY, endX, endY, isVisible }: SelectionRectangleProps) => {
    if (!isVisible) return null;

    // Calculate rectangle bounds (handle dragging in any direction)
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    // Offset by canvas CSS padding to align with element coordinate system
    return (
      <div
        className={styles.selectionRectangle}
        style={{
          left: left + CANVAS_CSS_PADDING,
          top: top + CANVAS_CSS_PADDING,
          width,
          height,
        }}
      />
    );
  },
);

SelectionRectangle.displayName = "SelectionRectangle";
