import type { ChartInfo } from "@/types/chart";

export type PaletteKey = "default" | "pastel" | "vibrant" | "ocean" | "forest" | "sunset" | "monochrome" | "corporate";

export interface TypographySettings {
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

export interface ChartActionsProps {
  onScreenshot?: () => void;
  onColorChange?: (colors: string[]) => void;
  onTypographyChange?: (settings: TypographySettings) => void;
  onSave?: () => void;
  onToggleFavorite?: () => void;
  onDownload?: () => void;
  onFullscreen?: () => void;
  showScreenshot?: boolean;
  showColors?: boolean;
  showFont?: boolean;
  showSave?: boolean;
  showDownload?: boolean;
  showFullscreen?: boolean;
  showInfo?: boolean;
  orientation?: "horizontal" | "vertical";
  currentColors?: string[];
  colorCount?: number;
  currentTypography?: TypographySettings;
  chartInfo?: ChartInfo;
  isFavorite?: boolean;
  isSaving?: boolean;
}

export interface ActiveColorPickerState {
  index: number;
  rect: DOMRect;
  element: HTMLElement;
}

export interface TypoColorPickerState {
  rect: DOMRect;
  element: HTMLElement;
}