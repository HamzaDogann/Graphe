import React, { useRef, useState, useMemo, RefObject } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, ChevronDown, Check, Bold, Italic, Underline } from "lucide-react";
import styles from "../ChartActions.module.scss";
import { useTooltipPosition } from "../hooks/useTooltipPosition";
import { useClickOutside } from "../hooks/useClickOutside";
import { FONT_FAMILIES } from "../constants";
import { TypographySettings } from "../types";
import { tooltipPopover } from "@/lib/animations";

interface TypographyMenuProps {
  onClose: () => void;
  anchorRect: DOMRect | null;
  typography: TypographySettings;
  onUpdate: (key: keyof TypographySettings, value: any) => void;
  onColorClick: (rect: DOMRect, element: HTMLElement) => void;
  isColorPickerOpen: boolean;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onCloseColorPicker?: () => void;
}

export const TypographyMenu = ({
  onClose,
  anchorRect,
  typography,
  onUpdate,
  onColorClick,
  isColorPickerOpen,
  buttonRef,
  onCloseColorPicker,
}: TypographyMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const position = useTooltipPosition(anchorRect, 280, 320);
  const [showFontDropdown, setShowFontDropdown] = useState(false);

  // Ignore clicks on the toggle button to prevent double-fire
  useClickOutside(
    menuRef,
    () => {
      if (!isColorPickerOpen) {
        onClose();
        setShowFontDropdown(false);
      }
    },
    buttonRef ? [buttonRef] : [],
  );

  // Handle click on menu content to close color picker (but not on color swatch)
  const handleMenuClick = () => {
    if (isColorPickerOpen && onCloseColorPicker) {
      onCloseColorPicker();
    }
  };

  const currentFontLabel = useMemo(() => {
    return (
      FONT_FAMILIES.find((f) => f.value === typography.fontFamily)?.label ||
      "System Default"
    );
  }, [typography.fontFamily]);

  if (!anchorRect) return null;

  return createPortal(
    <motion.div
      ref={menuRef}
      className={styles.typographyMenu}
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleMenuClick}
      variants={tooltipPopover}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.menuHeader}>
        <span>Typography</span>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className={styles.settingRow}>
        <label>Font</label>
        <div className={styles.fontDropdownWrapper}>
          <button
            className={styles.fontDropdownBtn}
            onClick={() => setShowFontDropdown(!showFontDropdown)}
          >
            <span style={{ fontFamily: typography.fontFamily }}>
              {currentFontLabel}
            </span>
            <ChevronDown size={14} />
          </button>
          {showFontDropdown && (
            <div className={styles.fontDropdown}>
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  className={`${styles.fontOption} ${typography.fontFamily === font.value ? styles.selected : ""}`}
                  style={{ fontFamily: font.value }}
                  onClick={() => {
                    onUpdate("fontFamily", font.value);
                    setShowFontDropdown(false);
                  }}
                >
                  {font.label}
                  {typography.fontFamily === font.value && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.settingRow}>
        <label>Size</label>
        <div className={styles.fontSizeControl}>
          <button
            className={styles.sizeBtn}
            onClick={() =>
              onUpdate("fontSize", Math.max(8, typography.fontSize - 1))
            }
          >
            -
          </button>
          <span className={styles.sizeValue}>{typography.fontSize}px</span>
          <button
            className={styles.sizeBtn}
            onClick={() =>
              onUpdate("fontSize", Math.min(48, typography.fontSize + 1))
            }
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.settingRow}>
        <label>Style</label>
        <div className={styles.styleButtons}>
          <button
            className={`${styles.styleBtn} ${typography.isBold ? styles.active : ""}`}
            onClick={() => onUpdate("isBold", !typography.isBold)}
          >
            <Bold size={16} />
          </button>
          <button
            className={`${styles.styleBtn} ${typography.isItalic ? styles.active : ""}`}
            onClick={() => onUpdate("isItalic", !typography.isItalic)}
          >
            <Italic size={16} />
          </button>
          <button
            className={`${styles.styleBtn} ${typography.isUnderline ? styles.active : ""}`}
            onClick={() => onUpdate("isUnderline", !typography.isUnderline)}
          >
            <Underline size={16} />
          </button>
        </div>
      </div>

      <div className={styles.settingRow}>
        <label>Color</label>
        <button
          className={styles.colorBtn}
          onClick={(e) => {
            e.stopPropagation();
            onColorClick(
              e.currentTarget.getBoundingClientRect(),
              e.currentTarget,
            );
          }}
        >
          <span
            className={styles.colorPreview}
            style={{ backgroundColor: typography.color }}
          />
          <span className={styles.colorValue}>{typography.color}</span>
        </button>
      </div>
    </motion.div>,
    document.body,
  );
};
