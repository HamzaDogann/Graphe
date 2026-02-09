"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
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
  ChevronDown,
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

// Font families
export const FONT_FAMILIES = [
  { label: "System Default", value: "inherit" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Impact", value: "Impact, sans-serif" },
];

// Typography settings interface
export interface TypographySettings {
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontSize: 14,
  fontFamily: "inherit",
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

// Mini Color Picker Tooltip Component
interface ColorPickerTooltipProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

const ColorPickerTooltip = memo(
  ({ color, onChange, onClose, anchorRect }: ColorPickerTooltipProps) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (!anchorRect) return;

      const tooltipWidth = 220;
      const tooltipHeight = 260;

      let left = anchorRect.right + 8;
      let top = anchorRect.top;

      // Check right overflow
      if (left + tooltipWidth > window.innerWidth - 20) {
        left = anchorRect.left - tooltipWidth - 8;
      }
      // Check left overflow
      if (left < 20) {
        left = 20;
      }
      // Check bottom overflow
      if (top + tooltipHeight > window.innerHeight - 20) {
        top = window.innerHeight - tooltipHeight - 20;
      }
      // Check top overflow
      if (top < 20) {
        top = 20;
      }

      setPosition({ top, left });
    }, [anchorRect]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          tooltipRef.current &&
          !tooltipRef.current.contains(e.target as Node)
        ) {
          onClose();
        }
      };

      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [onClose]);

    if (!anchorRect) return null;

    return createPortal(
      <div
        ref={tooltipRef}
        className={styles.colorPickerTooltip}
        style={{ top: position.top, left: position.left }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className={styles.pickerCloseBtn}
          onClick={onClose}
          title="Close"
        >
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
  },
);

ColorPickerTooltip.displayName = "ColorPickerTooltip";

// Main ChartActions Component
export const ChartActions = memo(
  ({
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
    const [selectedPalette, setSelectedPalette] =
      useState<PaletteKey>("default");
    const [customColors, setCustomColors] = useState<string[]>(() =>
      currentColors.slice(0, colorCount),
    );
    const [palettePosition, setPalettePosition] = useState({ top: 0, left: 0 });

    // Color picker state (for custom colors)
    const [activeColorPicker, setActiveColorPicker] = useState<{
      index: number;
      rect: DOMRect;
    } | null>(null);

    // Typography Menu State
    const [showTypographyMenu, setShowTypographyMenu] = useState(false);
    const [typography, setTypography] =
      useState<TypographySettings>(currentTypography);
    const [typographyPosition, setTypographyPosition] = useState({
      top: 0,
      left: 0,
    });

    // Typography color picker state
    const [showTypoColorPicker, setShowTypoColorPicker] = useState<{
      rect: DOMRect;
    } | null>(null);

    // Font dropdown state
    const [showFontDropdown, setShowFontDropdown] = useState(false);

    // Portal/Mounted state
    const [isMounted, setIsMounted] = useState(false);

    // Refs
    const paletteButtonRef = useRef<HTMLButtonElement>(null);
    const paletteMenuRef = useRef<HTMLDivElement>(null);
    const typographyButtonRef = useRef<HTMLButtonElement>(null);
    const typographyMenuRef = useRef<HTMLDivElement>(null);
    const colorButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const typoColorBtnRef = useRef<HTMLButtonElement>(null);

    // Check if mounted (for portal)
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Sync customColors when currentColors prop changes
    useEffect(() => {
      setCustomColors(currentColors.slice(0, colorCount));
    }, [currentColors, colorCount]);

    // Sync typography when currentTypography prop changes
    useEffect(() => {
      setTypography(currentTypography);
    }, [currentTypography]);

    // Calculate palette menu position
    const updatePalettePosition = useCallback(() => {
      if (paletteButtonRef.current) {
        const rect = paletteButtonRef.current.getBoundingClientRect();
        const menuWidth = 300;
        const menuHeight = 380;

        let left = rect.right + 12;
        let top = rect.top;

        if (left + menuWidth > window.innerWidth - 20) {
          left = rect.left - menuWidth - 12;
        }
        if (left < 20) left = 20;
        if (top + menuHeight > window.innerHeight - 20) {
          top = window.innerHeight - menuHeight - 20;
        }
        if (top < 20) top = 20;

        setPalettePosition({ top, left });
      }
    }, []);

    // Calculate typography menu position
    const updateTypographyPosition = useCallback(() => {
      if (typographyButtonRef.current) {
        const rect = typographyButtonRef.current.getBoundingClientRect();
        const menuWidth = 280;
        const menuHeight = 320;

        let left = rect.right + 12;
        let top = rect.top;

        if (left + menuWidth > window.innerWidth - 20) {
          left = rect.left - menuWidth - 12;
        }
        if (left < 20) left = 20;
        if (top + menuHeight > window.innerHeight - 20) {
          top = window.innerHeight - menuHeight - 20;
        }
        if (top < 20) top = 20;

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

    // Click outside handler for palette menu
    useEffect(() => {
      if (!showPaletteMenu) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        // Don't close if clicking inside the menu or button
        if (
          paletteMenuRef.current?.contains(target) ||
          paletteButtonRef.current?.contains(target)
        ) {
          return;
        }
        // Don't close if color picker is open (clicking inside color picker)
        if (activeColorPicker) {
          return;
        }
        setShowPaletteMenu(false);
        setActiveColorPicker(null);
      };

      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showPaletteMenu, activeColorPicker]);

    // Click outside handler for typography menu
    useEffect(() => {
      if (!showTypographyMenu) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        // Don't close if clicking inside the menu or button
        if (
          typographyMenuRef.current?.contains(target) ||
          typographyButtonRef.current?.contains(target)
        ) {
          return;
        }
        // Don't close if typography color picker is open
        if (showTypoColorPicker) {
          return;
        }
        setShowTypographyMenu(false);
        setShowTypoColorPicker(null);
        setShowFontDropdown(false);
      };

      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showTypographyMenu, showTypoColorPicker]);

    // Handle palette selection
    const handlePaletteSelect = useCallback(
      (paletteKey: PaletteKey) => {
        setSelectedPalette(paletteKey);
        const newColors = COLOR_PALETTES[paletteKey].slice(0, colorCount);
        setCustomColors(newColors);
        onColorChange?.(newColors);
      },
      [colorCount, onColorChange],
    );

    // Handle individual color change
    const handleColorChange = useCallback(
      (index: number, color: string) => {
        setCustomColors((prev) => {
          const newColors = [...prev];
          newColors[index] = color;
          onColorChange?.(newColors);
          return newColors;
        });
      },
      [onColorChange],
    );

    // Handle typography changes
    const handleTypographyUpdate = useCallback(
      (key: keyof TypographySettings, value: number | string | boolean) => {
        setTypography((prev) => {
          const newTypography = { ...prev, [key]: value };
          onTypographyChange?.(newTypography);
          return newTypography;
        });
      },
      [onTypographyChange],
    );

    // Toggle menus
    const togglePaletteMenu = useCallback(() => {
      setShowPaletteMenu((prev) => !prev);
      setShowTypographyMenu(false);
      setActiveColorPicker(null);
    }, []);

    const toggleTypographyMenu = useCallback(() => {
      setShowTypographyMenu((prev) => !prev);
      setShowPaletteMenu(false);
      setShowTypoColorPicker(null);
      setShowFontDropdown(false);
    }, []);

    // Close palette menu (only via X button)
    const closePaletteMenu = useCallback(() => {
      setShowPaletteMenu(false);
      setActiveColorPicker(null);
    }, []);

    // Close typography menu (only via X button)
    const closeTypographyMenu = useCallback(() => {
      setShowTypographyMenu(false);
      setShowTypoColorPicker(null);
      setShowFontDropdown(false);
    }, []);

    // Open color picker for a custom color
    const openColorPicker = useCallback((index: number, rect: DOMRect) => {
      setActiveColorPicker({ index, rect });
    }, []);

    // Close color picker
    const closeColorPicker = useCallback(() => {
      setActiveColorPicker(null);
    }, []);

    // Open typography color picker
    const openTypoColorPicker = useCallback(() => {
      if (typoColorBtnRef.current) {
        setShowTypoColorPicker({
          rect: typoColorBtnRef.current.getBoundingClientRect(),
        });
      }
    }, []);

    // Close typography color picker
    const closeTypoColorPicker = useCallback(() => {
      setShowTypoColorPicker(null);
    }, []);

    // Get current font label
    const currentFontLabel = useMemo(() => {
      const font = FONT_FAMILIES.find((f) => f.value === typography.fontFamily);
      return font?.label || "System Default";
    }, [typography.fontFamily]);

    // Palette Menu Content
    const paletteMenuContent = useMemo(
      () => (
        <div
          ref={paletteMenuRef}
          className={styles.paletteMenu}
          style={{ top: palettePosition.top, left: palettePosition.left }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            // Close color picker when clicking on menu background
            if (activeColorPicker) {
              setActiveColorPicker(null);
            }
          }}
        >
          <div className={styles.menuHeader}>
            <span>Color Palette</span>
            <button className={styles.closeBtn} onClick={closePaletteMenu}>
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
                onClick={() => handlePaletteSelect(key)}
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
            <div className={styles.sectionLabel}>Custom Colors</div>
            <div className={styles.colorSwatches}>
              {customColors.map((color, index) => (
                <button
                  key={index}
                  ref={(el) => {
                    colorButtonRefs.current[index] = el;
                  }}
                  className={`${styles.colorSwatch} ${activeColorPicker?.index === index ? styles.active : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect =
                      colorButtonRefs.current[index]?.getBoundingClientRect();
                    if (rect) {
                      openColorPicker(index, rect);
                    }
                  }}
                  title={`Color ${index + 1}: ${color}`}
                >
                  <span className={styles.colorIndex}>{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      [
        palettePosition,
        selectedPalette,
        customColors,
        activeColorPicker,
        closePaletteMenu,
        handlePaletteSelect,
        openColorPicker,
      ],
    );

    // Typography Menu Content
    const typographyMenuContent = useMemo(
      () => (
        <div
          ref={typographyMenuRef}
          className={styles.typographyMenu}
          style={{
            top: typographyPosition.top,
            left: typographyPosition.left,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            // Close typography color picker when clicking on menu background
            if (showTypoColorPicker) {
              setShowTypoColorPicker(null);
            }
          }}
        >
          <div className={styles.menuHeader}>
            <span>Typography</span>
            <button className={styles.closeBtn} onClick={closeTypographyMenu}>
              <X size={16} />
            </button>
          </div>

          {/* Font Family */}
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
                        handleTypographyUpdate("fontFamily", font.value);
                        setShowFontDropdown(false);
                      }}
                    >
                      {font.label}
                      {typography.fontFamily === font.value && (
                        <Check size={14} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Font Size */}
          <div className={styles.settingRow}>
            <label>Size</label>
            <div className={styles.fontSizeControl}>
              <button
                className={styles.sizeBtn}
                onClick={() =>
                  handleTypographyUpdate(
                    "fontSize",
                    Math.max(8, typography.fontSize - 1),
                  )
                }
              >
                -
              </button>
              <span className={styles.sizeValue}>{typography.fontSize}px</span>
              <button
                className={styles.sizeBtn}
                onClick={() =>
                  handleTypographyUpdate(
                    "fontSize",
                    Math.min(48, typography.fontSize + 1),
                  )
                }
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
                onClick={() =>
                  handleTypographyUpdate("isBold", !typography.isBold)
                }
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                className={`${styles.styleBtn} ${typography.isItalic ? styles.active : ""}`}
                onClick={() =>
                  handleTypographyUpdate("isItalic", !typography.isItalic)
                }
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                className={`${styles.styleBtn} ${typography.isUnderline ? styles.active : ""}`}
                onClick={() =>
                  handleTypographyUpdate("isUnderline", !typography.isUnderline)
                }
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
              ref={typoColorBtnRef}
              className={styles.colorBtn}
              onClick={(e) => {
                e.stopPropagation();
                openTypoColorPicker();
              }}
            >
              <span
                className={styles.colorPreview}
                style={{ backgroundColor: typography.color }}
              />
              <span className={styles.colorValue}>{typography.color}</span>
            </button>
          </div>
        </div>
      ),
      [
        typographyPosition,
        typography,
        showFontDropdown,
        currentFontLabel,
        closeTypographyMenu,
        handleTypographyUpdate,
        openTypoColorPicker,
      ],
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
          createPortal(paletteMenuContent, document.body)}

        {/* Typography Menu Portal */}
        {isMounted &&
          showTypographyMenu &&
          createPortal(typographyMenuContent, document.body)}

        {/* Color Picker Tooltip for Custom Colors */}
        {isMounted && activeColorPicker && (
          <ColorPickerTooltip
            color={customColors[activeColorPicker.index]}
            onChange={(color) =>
              handleColorChange(activeColorPicker.index, color)
            }
            onClose={closeColorPicker}
            anchorRect={activeColorPicker.rect}
          />
        )}

        {/* Color Picker Tooltip for Typography Color */}
        {isMounted && showTypoColorPicker && (
          <ColorPickerTooltip
            color={typography.color}
            onChange={(color) => handleTypographyUpdate("color", color)}
            onClose={closeTypoColorPicker}
            anchorRect={showTypoColorPicker.rect}
          />
        )}
      </>
    );
  },
);

ChartActions.displayName = "ChartActions";
