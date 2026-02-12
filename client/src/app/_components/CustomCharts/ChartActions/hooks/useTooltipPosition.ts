import { useState, useEffect, useCallback } from "react";

interface Position {
  top: number;
  left: number;
}

export const useTooltipPosition = (
  anchorRect: DOMRect | null,
  width: number,
  height: number
) => {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  const calculatePosition = useCallback(() => {
    if (!anchorRect) return { top: 0, left: 0 };

    let left = anchorRect.right + 8;
    let top = anchorRect.top;

    // Right overflow
    if (left + width > window.innerWidth - 20) {
      left = anchorRect.left - width - 8;
    }
    // Left overflow
    if (left < 20) left = 20;

    // Bottom overflow
    if (top + height > window.innerHeight - 20) {
      top = window.innerHeight - height - 20;
    }
    // Top overflow
    if (top < 20) top = 20;

    return { top, left };
  }, [anchorRect, width, height]);

  useEffect(() => {
    setPosition(calculatePosition());
  }, [calculatePosition]);

  return position;
};