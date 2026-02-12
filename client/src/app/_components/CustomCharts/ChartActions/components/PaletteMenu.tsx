import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import styles from "../ChartActions.module.scss";
import { useTooltipPosition } from "../hooks/useTooltipPosition";
import { useClickOutside } from "../hooks/useClickOutside";
import { COLOR_PALETTES } from "../constants";
import { PaletteKey } from "../types";

interface PaletteMenuProps {
  onClose: () => void;
  anchorRect: DOMRect | null;
  selectedPalette: PaletteKey;
  onPaletteSelect: (key: PaletteKey) => void;
  customColors: string[];
  onCustomColorClick: (
    index: number,
    rect: DOMRect,
    element: HTMLElement,
  ) => void;
  activeColorIndex: number | null;
}

export const PaletteMenu = ({
  onClose,
  anchorRect,
  selectedPalette,
  onPaletteSelect,
  customColors,
  onCustomColorClick,
  activeColorIndex,
}: PaletteMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const position = useTooltipPosition(anchorRect, 300, 380);

  // Close only if not clicking inside or color picker isn't active
  useClickOutside(menuRef, () => {
    if (activeColorIndex === null) {
      onClose();
    }
  });

  if (!anchorRect) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={styles.paletteMenu}
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={styles.menuHeader}>
        <span>Color Palette</span>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className={styles.sectionLabel}>Presets</div>
      <div className={styles.palettePresets}>
        {(Object.keys(COLOR_PALETTES) as PaletteKey[]).map((key) => (
          <button
            key={key}
            className={`${styles.presetBtn} ${selectedPalette === key ? styles.selected : ""}`}
            onClick={() => onPaletteSelect(key)}
            title={key.charAt(0).toUpperCase() + key.slice(1)}
          >
            <div className={styles.presetColors}>
              {COLOR_PALETTES[key].slice(0, 4).map((color, i) => (
                <span
                  key={i}
                  className={styles.presetColor}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {selectedPalette === key && (
              <Check size={12} className={styles.checkIcon} />
            )}
          </button>
        ))}
      </div>

      <div className={styles.customColors}>
        <div className={styles.sectionLabel}>Custom Colors</div>
        <div className={styles.colorSwatches}>
          {customColors.map((color, index) => (
            <button
              key={index}
              className={`${styles.colorSwatch} ${activeColorIndex === index ? styles.active : ""}`}
              style={{ backgroundColor: color }}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                onCustomColorClick(index, rect, e.currentTarget);
              }}
            >
              <span className={styles.colorIndex}>{index + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};
