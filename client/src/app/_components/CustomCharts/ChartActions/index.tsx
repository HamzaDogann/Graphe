"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import {
  Camera,
  Palette,
  Type,
  Bookmark,
  Download,
  Maximize2,
  Check,
  X,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import styles from "./ChartActions.module.scss";

// Predefined color palettes
export const COLOR_PALETTES = {
  default: [
    "#5c85ff",
    "#ff6b6b",
    "#feca57",
    "#48dbfb",
    "#1dd1a1",
    "#a55eea",
    "#fd9644",
    "#26de81",
  ],
  pastel: [
    "#a8d8ea",
    "#aa96da",
    "#fcbad3",
    "#ffffd2",
    "#b5e7a0",
    "#f6d186",
    "#ffc8a2",
    "#d5aaff",
  ],
  vibrant: [
    "#ff6b6b",
    "#feca57",
    "#48dbfb",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
    "#ff9f43",
  ],
  ocean: [
    "#0077b6",
    "#00b4d8",
    "#90e0ef",
    "#caf0f8",
    "#023e8a",
    "#03045e",
    "#48cae4",
    "#ade8f4",
  ],
  forest: [
    "#2d6a4f",
    "#40916c",
    "#52b788",
    "#74c69d",
    "#95d5b2",
    "#b7e4c7",
    "#d8f3dc",
    "#1b4332",
  ],
  sunset: [
    "#ff6b35",
    "#f7c59f",
    "#efa00b",
    "#d68c45",
    "#c44536",
    "#772e25",
    "#f0a500",
    "#ff8c00",
  ],
  monochrome: [
    "#212529",
    "#495057",
    "#6c757d",
    "#adb5bd",
    "#ced4da",
    "#dee2e6",
    "#e9ecef",
    "#f8f9fa",
  ],
  corporate: [
    "#2c3e50",
    "#3498db",
    "#e74c3c",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#34495e",
    "#27ae60",
  ],
};

export type PaletteKey = keyof typeof COLOR_PALETTES;

// Typography settings interface
export interface TypographySettings {
  fontSize: number;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontSize: 14,
  color: "#323039",
  isBold: false,
  isItalic: false,
  isUnderline: false,
};

interface ChartActionsProps {
  onScreenshot?: () => void;
  onColorChange?: (colors: string[]) => void;
  onTypographyChange?: (settings: TypographySettings) => void;
  onSave?: () => void;
  onDownload?: () => void;
  onFullscreen?: () => void;
  showScreenshot?: boolean;
  showColors?: boolean;
  showFont?: boolean;
  showSave?: boolean;
  showDownload?: boolean;
  showFullscreen?: boolean;
  orientation?: "horizontal" | "vertical";
  currentColors?: string[];
  colorCount?: number;
  currentTypography?: TypographySettings;
}

export const ChartActions = ({
  onScreenshot,
  onColorChange,
  onTypographyChange,
  onSave,
  onDownload,
  onFullscreen,
  showScreenshot = true,
  showColors = true,
  showFont = true,
  showSave = true,
  showDownload = false,
  showFullscreen = false,
  orientation = "vertical",
  currentColors = COLOR_PALETTES.default,
  colorCount = 4,
  currentTypography = DEFAULT_TYPOGRAPHY,
}: ChartActionsProps) => {
  // Palette Menu State
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<PaletteKey>("default");
  const [customColors, setCustomColors] = useState<string[]>(
    currentColors.slice(0, colorCount),
  );
  const [palettePosition, setPalettePosition] = useState({ top: 0, left: 0 });
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);

  // Typography Menu State
  const [showTypographyMenu, setShowTypographyMenu] = useState(false);
  const [typography, setTypography] =
    useState<TypographySettings>(currentTypography);
  const [typographyPosition, setTypographyPosition] = useState({
    top: 0,
    left: 0,
  });
  const [showTypoColorPicker, setShowTypoColorPicker] = useState(false);

  // Portal/Mounted state
  const [isMounted, setIsMounted] = useState(false);

  // Refs
  const paletteButtonRef = useRef<HTMLButtonElement>(null);
  const paletteMenuRef = useRef<HTMLDivElement>(null);
  const typographyButtonRef = useRef<HTMLButtonElement>(null);
  const typographyMenuRef = useRef<HTMLDivElement>(null);

  // Check if mounted (for portal)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate palette menu position
  const updatePalettePosition = useCallback(() => {
    if (paletteButtonRef.current) {
      const rect = paletteButtonRef.current.getBoundingClientRect();
      const menuWidth = 320;
      const menuHeight = 450;

      let left = rect.right + 12;
      let top = rect.top;

      if (left + menuWidth > window.innerWidth) {
        left = rect.left - menuWidth - 12;
      }
      if (left < 20) {
        left = 20;
      }
      if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 20;
      }
      if (top < 20) {
        top = 20;
      }

      setPalettePosition({ top, left });
    }
  }, []);

  // Calculate typography menu position
  const updateTypographyPosition = useCallback(() => {
    if (typographyButtonRef.current) {
      const rect = typographyButtonRef.current.getBoundingClientRect();
      const menuWidth = 280;
      const menuHeight = 300;

      let left = rect.right + 12;
      let top = rect.top;

      if (left + menuWidth > window.innerWidth) {
        left = rect.left - menuWidth - 12;
      }
      if (left < 20) {
        left = 20;
      }
      if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 20;
      }
      if (top < 20) {
        top = 20;
      }

      setTypographyPosition({ top, left });
    }
  }, []);

  // Update positions when menus open
  useEffect(() => {
    if (showPaletteMenu) {
      updatePalettePosition();
      window.addEventListener("resize", updatePalettePosition);
      window.addEventListener("scroll", updatePalettePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePalettePosition);
      window.removeEventListener("scroll", updatePalettePosition, true);
    };
  }, [showPaletteMenu, updatePalettePosition]);

  useEffect(() => {
    if (showTypographyMenu) {
      updateTypographyPosition();
      window.addEventListener("resize", updateTypographyPosition);
      window.addEventListener("scroll", updateTypographyPosition, true);
    }
    return () => {
      window.removeEventListener("resize", updateTypographyPosition);
      window.removeEventListener("scroll", updateTypographyPosition, true);
    };
  }, [showTypographyMenu, updateTypographyPosition]);

  // Close palette menu when clicking outside (but not on menu content)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isMenuClick = paletteMenuRef.current?.contains(target);
      const isButtonClick = paletteButtonRef.current?.contains(target);

      // Don't close if click is inside menu or on button
      if (!isMenuClick && !isButtonClick) {
        setShowPaletteMenu(false);
        setActiveColorIndex(null);
      }
    };

    if (showPaletteMenu) {
      // Use setTimeout to avoid immediate close on the same click that opened it
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showPaletteMenu]);

  // Close typography menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isMenuClick = typographyMenuRef.current?.contains(target);
      const isButtonClick = typographyButtonRef.current?.contains(target);

      if (!isMenuClick && !isButtonClick) {
        setShowTypographyMenu(false);
        setShowTypoColorPicker(false);
      }
    };

    if (showTypographyMenu) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showTypographyMenu]);

  // Handle palette selection
  const handlePaletteSelect = (paletteKey: PaletteKey) => {
    setSelectedPalette(paletteKey);
    const newColors = COLOR_PALETTES[paletteKey].slice(0, colorCount);
    setCustomColors(newColors);
    onColorChange?.(newColors);
  };

  // Handle individual color change from react-colorful
  const handleColorChange = (color: string) => {
    if (activeColorIndex === null) return;
    const newColors = [...customColors];
    newColors[activeColorIndex] = color;
    setCustomColors(newColors);
    onColorChange?.(newColors);
  };

  // Handle typography changes
  const handleTypographyUpdate = (
    key: keyof TypographySettings,
    value: number | string | boolean,
  ) => {
    const newTypography = { ...typography, [key]: value };
    setTypography(newTypography);
    onTypographyChange?.(newTypography);
  };

  // Toggle menus
  const togglePaletteMenu = () => {
    setShowPaletteMenu((prev) => !prev);
    setShowTypographyMenu(false);
    setActiveColorIndex(null);
  };

  const toggleTypographyMenu = () => {
    setShowTypographyMenu((prev) => !prev);
    setShowPaletteMenu(false);
    setShowTypoColorPicker(false);
  };

  // Palette Menu Component
  const PaletteMenu = () => (
    <div
      ref={paletteMenuRef}
      className={styles.paletteMenu}
      style={{ top: palettePosition.top, left: palettePosition.left }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={styles.menuHeader}>
        <span>Color Palette</span>
        <button
          className={styles.closeBtn}
          onClick={() => {
            setShowPaletteMenu(false);
            setActiveColorIndex(null);
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Preset Palettes */}
      <div className={styles.sectionLabel}>Presets</div>
      <div className={styles.palettePresets}>
        {(Object.keys(COLOR_PALETTES) as PaletteKey[]).map((key) => (
          <button
            key={key}
            className={`${styles.presetBtn} ${selectedPalette === key ? styles.selected : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePaletteSelect(key);
            }}
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

      {/* Custom Colors */}
      <div className={styles.customColors}>
        <div className={styles.sectionLabel}>
          Custom Colors ({customColors.length})
        </div>
        <div className={styles.colorSwatches}>
          {customColors.map((color, index) => (
            <button
              key={index}
              className={`${styles.colorSwatch} ${activeColorIndex === index ? styles.active : ""}`}
              style={{ backgroundColor: color }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveColorIndex(activeColorIndex === index ? null : index);
              }}
              title={`Color ${index + 1}: ${color}`}
            >
              <span className={styles.colorIndex}>{index + 1}</span>
            </button>
          ))}
        </div>

        {/* Color Picker - shown when a color is selected */}
        {activeColorIndex !== null && (
          <div
            className={styles.colorPickerWrapper}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.colorPickerLabel}>
              Editing Color {activeColorIndex + 1}
            </div>
            <HexColorPicker
              color={customColors[activeColorIndex]}
              onChange={handleColorChange}
            />
            <div className={styles.colorHexValue}>
              <input
                type="text"
                value={customColors[activeColorIndex]}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    handleColorChange(val);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                maxLength={7}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Typography Menu Component
  const TypographyMenu = () => (
    <div
      ref={typographyMenuRef}
      className={styles.typographyMenu}
      style={{ top: typographyPosition.top, left: typographyPosition.left }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={styles.menuHeader}>
        <span>Typography</span>
        <button
          className={styles.closeBtn}
          onClick={() => {
            setShowTypographyMenu(false);
            setShowTypoColorPicker(false);
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Font Size */}
      <div className={styles.settingRow}>
        <label>Font Size</label>
        <div className={styles.fontSizeControl}>
          <button
            className={styles.sizeBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleTypographyUpdate(
                "fontSize",
                Math.max(8, typography.fontSize - 1),
              );
            }}
          >
            -
          </button>
          <span className={styles.sizeValue}>{typography.fontSize}px</span>
          <button
            className={styles.sizeBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleTypographyUpdate(
                "fontSize",
                Math.min(48, typography.fontSize + 1),
              );
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Font Style (Bold, Italic, Underline) */}
      <div className={styles.settingRow}>
        <label>Style</label>
        <div className={styles.styleButtons}>
          <button
            className={`${styles.styleBtn} ${typography.isBold ? styles.active : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTypographyUpdate("isBold", !typography.isBold);
            }}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            className={`${styles.styleBtn} ${typography.isItalic ? styles.active : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTypographyUpdate("isItalic", !typography.isItalic);
            }}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            className={`${styles.styleBtn} ${typography.isUnderline ? styles.active : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTypographyUpdate("isUnderline", !typography.isUnderline);
            }}
            title="Underline"
          >
            <Underline size={16} />
          </button>
        </div>
      </div>

      {/* Font Color */}
      <div className={styles.settingRow}>
        <label>Color</label>
        <button
          className={styles.colorBtn}
          onClick={(e) => {
            e.stopPropagation();
            setShowTypoColorPicker(!showTypoColorPicker);
          }}
        >
          <span
            className={styles.colorPreview}
            style={{ backgroundColor: typography.color }}
          />
          <span className={styles.colorValue}>{typography.color}</span>
        </button>
      </div>

      {/* Typography Color Picker */}
      {showTypoColorPicker && (
        <div
          className={styles.colorPickerWrapper}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <HexColorPicker
            color={typography.color}
            onChange={(color) => handleTypographyUpdate("color", color)}
          />
          <div className={styles.colorHexValue}>
            <input
              type="text"
              value={typography.color}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  handleTypographyUpdate("color", val);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              maxLength={7}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        className={`${styles.actionButtons} ${
          orientation === "horizontal" ? styles.horizontal : styles.vertical
        }`}
      >
        {showScreenshot && (
          <button
            className={styles.actionBtn}
            title="Screenshot"
            onClick={onScreenshot}
          >
            <Camera size={18} />
          </button>
        )}

        {showColors && (
          <button
            ref={paletteButtonRef}
            className={`${styles.actionBtn} ${showPaletteMenu ? styles.active : ""}`}
            title="Colors"
            onClick={togglePaletteMenu}
          >
            <Palette size={18} />
          </button>
        )}

        {showFont && (
          <button
            ref={typographyButtonRef}
            className={`${styles.actionBtn} ${showTypographyMenu ? styles.active : ""}`}
            title="Typography"
            onClick={toggleTypographyMenu}
          >
            <Type size={18} />
          </button>
        )}

        {showSave && (
          <button
            className={styles.actionBtn}
            title="Save Chart"
            onClick={onSave}
          >
            <Bookmark size={18} />
          </button>
        )}

        {showDownload && (
          <button
            className={styles.actionBtn}
            title="Download"
            onClick={onDownload}
          >
            <Download size={18} />
          </button>
        )}

        {showFullscreen && (
          <button
            className={styles.actionBtn}
            title="Fullscreen"
            onClick={onFullscreen}
          >
            <Maximize2 size={18} />
          </button>
        )}
      </div>

      {/* Palette Menu Portal */}
      {isMounted &&
        showPaletteMenu &&
        createPortal(<PaletteMenu />, document.body)}

      {/* Typography Menu Portal */}
      {isMounted &&
        showTypographyMenu &&
        createPortal(<TypographyMenu />, document.body)}
    </>
  );
};
