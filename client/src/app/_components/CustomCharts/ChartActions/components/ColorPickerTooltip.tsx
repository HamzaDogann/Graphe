import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { X } from "lucide-react";
import styles from "../ChartActions.module.scss";
import { useTooltipPosition } from "../hooks/useTooltipPosition";
import { useClickOutside } from "../hooks/useClickOutside";

interface ColorPickerTooltipProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export const ColorPickerTooltip = ({
  color,
  onChange,
  onClose,
  anchorRect,
}: ColorPickerTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const position = useTooltipPosition(anchorRect, 220, 260);

  useClickOutside(tooltipRef, onClose);

  if (!anchorRect) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={styles.colorPickerTooltip}
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button className={styles.pickerCloseBtn} onClick={onClose} title="Close">
        <X size={14} />
      </button>
      <HexColorPicker color={color} onChange={onChange} />
      <div className={styles.hexInput}>
        <input
          type="text"
          value={color}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(val) || val === "") {
              onChange(val || "#000000");
            }
          }}
          maxLength={7}
          spellCheck={false}
        />
      </div>
    </div>,
    document.body,
  );
};
