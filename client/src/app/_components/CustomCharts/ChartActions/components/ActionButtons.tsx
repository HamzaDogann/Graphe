import React, { RefObject } from "react";
import {
  Camera,
  Palette,
  Type,
  Bookmark,
  Download,
  Maximize2,
  Info,
  Loader2,
} from "lucide-react";
import styles from "../ChartActions.module.scss";

interface ActionButtonsProps {
  onScreenshot?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onFullscreen?: () => void;
  togglePaletteMenu: () => void;
  toggleTypographyMenu: () => void;
  toggleInfoTooltip: () => void;

  showScreenshot?: boolean;
  showColors?: boolean;
  showFont?: boolean;
  showSave?: boolean;
  showDownload?: boolean;
  showFullscreen?: boolean;
  showInfo?: boolean;

  isPaletteOpen: boolean;
  isTypographyOpen: boolean;
  isInfoOpen: boolean;

  orientation: "horizontal" | "vertical";

  isFavorite?: boolean;
  isSaving?: boolean;

  refs: {
    paletteBtn: RefObject<HTMLButtonElement>;
    typographyBtn: RefObject<HTMLButtonElement>;
    infoBtn: RefObject<HTMLButtonElement>;
  };
}

export const ActionButtons = ({
  onScreenshot,
  onSave,
  onDownload,
  onFullscreen,
  togglePaletteMenu,
  toggleTypographyMenu,
  toggleInfoTooltip,
  showScreenshot = true,
  showColors = true,
  showFont = true,
  showSave = true,
  showDownload = false,
  showFullscreen = false,
  showInfo = false,
  isPaletteOpen,
  isTypographyOpen,
  isInfoOpen,
  orientation,
  isFavorite = false,
  isSaving = false,
  refs,
}: ActionButtonsProps) => {
  return (
    <div
      className={`${styles.actionButtons} ${orientation === "horizontal" ? styles.horizontal : styles.vertical}`}
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
          ref={refs.paletteBtn}
          className={`${styles.actionBtn} ${isPaletteOpen ? styles.active : ""}`}
          title="Colors"
          onClick={togglePaletteMenu}
        >
          <Palette size={18} />
        </button>
      )}

      {showFont && (
        <button
          ref={refs.typographyBtn}
          className={`${styles.actionBtn} ${isTypographyOpen ? styles.active : ""}`}
          title="Typography"
          onClick={toggleTypographyMenu}
        >
          <Type size={18} />
        </button>
      )}

      {showSave && (
        <button
          className={`${styles.actionBtn} ${isFavorite ? styles.favorited : ""}`}
          title={isFavorite ? "Saved" : "Save Chart"}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 size={18} className={styles.spinner} />
          ) : (
            <Bookmark size={18} fill={isFavorite ? "currentColor" : "none"} />
          )}
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

      {showInfo && (
        <button
          ref={refs.infoBtn}
          className={`${styles.actionBtn} ${isInfoOpen ? styles.active : ""}`}
          title="Chart Info"
          onClick={toggleInfoTooltip}
        >
          <Info size={18} />
        </button>
      )}
    </div>
  );
};
