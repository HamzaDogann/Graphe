"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Maximize,
  Minimize,
  ChevronLeft,
  Lock,
  Unlock,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  useCanvasEditorStore,
  PAGE_SIZES,
  PageSizePreset,
  SizeUnit,
} from "@/store/useCanvasEditorStore";
import styles from "./PropertyContents.module.scss";

// Page preset info with pixel dimensions (from PAGE_SIZES)
const PAGE_PRESETS: {
  key: PageSizePreset;
  label: string;
  pxWidth: number;
  pxHeight: number;
}[] = [
  {
    key: "a4",
    label: "A4",
    pxWidth: PAGE_SIZES.a4.width,
    pxHeight: PAGE_SIZES.a4.height,
  },
  {
    key: "letter",
    label: "Letter",
    pxWidth: PAGE_SIZES.letter.width,
    pxHeight: PAGE_SIZES.letter.height,
  },
  {
    key: "legal",
    label: "Legal",
    pxWidth: PAGE_SIZES.legal.width,
    pxHeight: PAGE_SIZES.legal.height,
  },
];

// Unit labels
const UNIT_OPTIONS: { value: SizeUnit; label: string }[] = [
  { value: "px", label: "px" },
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "inch", label: "in" },
];

// Convert px to other units (at 96 DPI)
const convertFromPx = (px: number, unit: SizeUnit): number => {
  switch (unit) {
    case "mm":
      return Math.round(px / 3.7795275591);
    case "cm":
      return Math.round((px / 37.795275591) * 10) / 10;
    case "inch":
      return Math.round((px / 96) * 100) / 100;
    default:
      return px;
  }
};

// Convert to px from other units (at 96 DPI)
const convertToPx = (value: number, unit: SizeUnit): number => {
  switch (unit) {
    case "mm":
      return Math.round(value * 3.7795275591);
    case "cm":
      return Math.round(value * 37.795275591);
    case "inch":
      return Math.round(value * 96);
    default:
      return value;
  }
};

export const PageContent = () => {
  const {
    pageSizePreset,
    orientation,
    sizeUnit,
    customWidth,
    customHeight,
    canvasWidth,
    canvasHeight,
    setPageSize,
    setOrientation,
    setSizeUnit,
    setCustomSize,
  } = useCanvasEditorStore();

  const [showCustomMenu, setShowCustomMenu] = useState(false);
  const [lockAspectRatio, setLockAspectRatio] = useState(false);
  const [localWidth, setLocalWidth] = useState(
    convertFromPx(customWidth, sizeUnit),
  );
  const [localHeight, setLocalHeight] = useState(
    convertFromPx(customHeight, sizeUnit),
  );
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [customUnitMenuOpen, setCustomUnitMenuOpen] = useState(false);

  const unitMenuRef = useRef<HTMLDivElement>(null);
  const customUnitMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        unitMenuRef.current &&
        !unitMenuRef.current.contains(event.target as Node)
      ) {
        setUnitMenuOpen(false);
      }
      if (
        customUnitMenuRef.current &&
        !customUnitMenuRef.current.contains(event.target as Node)
      ) {
        setCustomUnitMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (preset: PageSizePreset) => {
    setPageSize(preset);
  };

  const handleCustomClick = () => {
    setShowCustomMenu(true);
    setLocalWidth(convertFromPx(canvasWidth, sizeUnit));
    setLocalHeight(convertFromPx(canvasHeight, sizeUnit));
  };

  const handleBackClick = () => {
    setShowCustomMenu(false);
  };

  const handleUnitChange = (newUnit: SizeUnit) => {
    // Convert current values to new unit
    setLocalWidth(convertFromPx(convertToPx(localWidth, sizeUnit), newUnit));
    setLocalHeight(convertFromPx(convertToPx(localHeight, sizeUnit), newUnit));
    setSizeUnit(newUnit);
    setCustomUnitMenuOpen(false);
  };

  const handleMainUnitChange = (newUnit: SizeUnit) => {
    setSizeUnit(newUnit);
    setUnitMenuOpen(false);
  };

  const handleWidthChange = (value: number) => {
    setLocalWidth(value);
    if (lockAspectRatio && localHeight > 0) {
      const ratio = localWidth / localHeight;
      setLocalHeight(Math.round((value / ratio) * 10) / 10);
    }
  };

  const handleHeightChange = (value: number) => {
    setLocalHeight(value);
    if (lockAspectRatio && localWidth > 0) {
      const ratio = localWidth / localHeight;
      setLocalWidth(Math.round(value * ratio * 10) / 10);
    }
  };

  const applyCustomSize = () => {
    const pxWidth = convertToPx(localWidth, sizeUnit);
    const pxHeight = convertToPx(localHeight, sizeUnit);
    setCustomSize(pxWidth, pxHeight);
    setShowCustomMenu(false);
  };

  // Format dimension text based on current sizeUnit
  const formatDimension = (pxWidth: number, pxHeight: number) => {
    const w = orientation === "portrait" ? pxWidth : pxHeight;
    const h = orientation === "portrait" ? pxHeight : pxWidth;
    const wConverted = convertFromPx(w, sizeUnit);
    const hConverted = convertFromPx(h, sizeUnit);
    const unitLabel =
      UNIT_OPTIONS.find((u) => u.value === sizeUnit)?.label || sizeUnit;
    return `${wConverted} × ${hConverted} ${unitLabel}`;
  };

  // Get mini preview aspect ratio
  const getPreviewStyle = (pxWidth: number, pxHeight: number) => {
    const w = orientation === "portrait" ? pxWidth : pxHeight;
    const h = orientation === "portrait" ? pxHeight : pxWidth;
    const maxSize = 24;
    const ratio = w / h;
    if (ratio > 1) {
      return { width: maxSize, height: maxSize / ratio };
    }
    return { width: maxSize * ratio, height: maxSize };
  };

  // Custom submenu
  if (showCustomMenu) {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.customMenuHeader}>
          <button className={styles.backButton} onClick={handleBackClick}>
            <ChevronLeft size={18} />
          </button>
          <span className={styles.customTitle}>Custom Size</span>

          {/* Custom Unit Dropdown */}
          <div className={styles.unitDropdownWrapper} ref={customUnitMenuRef}>
            <button
              className={styles.unitDropdownButton}
              onClick={() => setCustomUnitMenuOpen(!customUnitMenuOpen)}
            >
              <span>
                {UNIT_OPTIONS.find((u) => u.value === sizeUnit)?.label || "px"}
              </span>
              <ChevronDown size={14} />
            </button>
            {customUnitMenuOpen && (
              <div className={styles.unitDropdownMenu}>
                {UNIT_OPTIONS.map((unit) => (
                  <button
                    key={unit.value}
                    className={`${styles.unitOption} ${sizeUnit === unit.value ? styles.active : ""}`}
                    onClick={() => handleUnitChange(unit.value)}
                  >
                    <span>{unit.label}</span>
                    {sizeUnit === unit.value && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.customInputs}>
          <div className={styles.inputGroup}>
            <label>Width</label>
            <input
              type="number"
              value={localWidth}
              onChange={(e) =>
                handleWidthChange(parseFloat(e.target.value) || 0)
              }
              className={styles.sizeInput}
            />
          </div>

          <button
            className={`${styles.lockButton} ${lockAspectRatio ? styles.locked : ""}`}
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            title={
              lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"
            }
          >
            {lockAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
          </button>

          <div className={styles.inputGroup}>
            <label>Height</label>
            <input
              type="number"
              value={localHeight}
              onChange={(e) =>
                handleHeightChange(parseFloat(e.target.value) || 0)
              }
              className={styles.sizeInput}
            />
          </div>
        </div>

        <button className={styles.applyButton} onClick={applyCustomSize}>
          Apply Size
        </button>
      </div>
    );
  }

  return (
    <div className={styles.contentWrapper}>
      {/* Page Size Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeaderWithDropdown}>
          <div className={styles.sectionHeaderLeft}>
            <FileText size={16} />
            <span>Page Size</span>
          </div>

          {/* Main Unit Dropdown */}
          <div className={styles.unitDropdownWrapper} ref={unitMenuRef}>
            <button
              className={styles.unitDropdownButtonSmall}
              onClick={() => setUnitMenuOpen(!unitMenuOpen)}
            >
              <span>
                {UNIT_OPTIONS.find((u) => u.value === sizeUnit)?.label || "px"}
              </span>
              <ChevronDown size={12} />
            </button>
            {unitMenuOpen && (
              <div className={styles.unitDropdownMenu}>
                {UNIT_OPTIONS.map((unit) => (
                  <button
                    key={unit.value}
                    className={`${styles.unitOption} ${sizeUnit === unit.value ? styles.active : ""}`}
                    onClick={() => handleMainUnitChange(unit.value)}
                  >
                    <span>{unit.label}</span>
                    {sizeUnit === unit.value && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.sizeOptions}>
          {PAGE_PRESETS.map((preset) => (
            <button
              key={preset.key}
              className={`${styles.sizeOption} ${pageSizePreset === preset.key ? styles.active : ""}`}
              onClick={() => handlePresetClick(preset.key)}
            >
              <div className={styles.sizeOptionLeft}>
                <div
                  className={styles.miniPreview}
                  style={getPreviewStyle(preset.pxWidth, preset.pxHeight)}
                />
                <span className={styles.sizeLabel}>{preset.label}</span>
              </div>
              <span className={styles.sizeDimension}>
                {formatDimension(preset.pxWidth, preset.pxHeight)}
              </span>
            </button>
          ))}
          <button
            className={`${styles.sizeOption} ${pageSizePreset === "custom" ? styles.active : ""}`}
            onClick={handleCustomClick}
          >
            <div className={styles.sizeOptionLeft}>
              <div
                className={styles.miniPreview}
                style={{ width: 18, height: 18 }}
              />
              <span className={styles.sizeLabel}>Custom</span>
            </div>
            <span className={styles.sizeDimension}>
              {pageSizePreset === "custom"
                ? `${convertFromPx(canvasWidth, sizeUnit)} × ${convertFromPx(canvasHeight, sizeUnit)} ${sizeUnit}`
                : "Set your own"}
            </span>
          </button>
        </div>
      </div>

      {/* Orientation Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Orientation</span>
        </div>
        <div className={styles.orientationButtons}>
          <button
            className={`${styles.orientationBtn} ${orientation === "portrait" ? styles.active : ""}`}
            onClick={() => setOrientation("portrait")}
          >
            <Maximize size={18} />
            <span>Portrait</span>
          </button>
          <button
            className={`${styles.orientationBtn} ${orientation === "landscape" ? styles.active : ""}`}
            onClick={() => setOrientation("landscape")}
          >
            <Minimize size={18} />
            <span>Landscape</span>
          </button>
        </div>
      </div>

      {/* Background Color Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Background</span>
        </div>
        <div className={styles.colorPicker}>
          <input
            type="color"
            defaultValue="#ffffff"
            className={styles.colorInput}
          />
          <span className={styles.colorValue}>#FFFFFF</span>
        </div>
      </div>
    </div>
  );
};
