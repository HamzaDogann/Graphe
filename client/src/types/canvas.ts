// ===== CANVAS TYPES =====

// Element Types
export type CanvasElementType = "text" | "chart" | "image" | "shape" | "draw";

// Page Settings
export type Orientation = "portrait" | "landscape";
export type PageSizePreset = "a4" | "letter" | "legal" | "custom";

// Page size presets in pixels (96 DPI)
export const PAGE_SIZES: Record<PageSizePreset, { width: number; height: number }> = {
  a4: { width: 794, height: 1123 },      // 210 x 297 mm
  letter: { width: 816, height: 1056 },   // 8.5 x 11 inch
  legal: { width: 816, height: 1344 },    // 8.5 x 14 inch
  custom: { width: 800, height: 600 },    // Default custom
};

// ===== TEXT TYPES (defined early for use in BaseElementProperties) =====
export type TextType = "paragraph" | "heading1" | "heading2" | "heading3" | "heading4" | "heading5" | "heading6";
export type TextAlign = "left" | "center" | "right" | "justify";
export type FontWeight = "normal" | "bold";
export type FontStyle = "normal" | "italic";
export type TextDecoration = "none" | "underline";

// ===== COMMON ELEMENT PROPERTIES =====
export interface BaseElementProperties {
  id: string;
  type: CanvasElementType;
  // Position (in pixels)
  x: number;
  y: number;
  // Size (in pixels)
  width: number;
  height: number;
  // Stacking order
  zIndex: number;
  // Rotation (in degrees)
  rotation?: number;
  // Locked state
  locked?: boolean;
  // Generic data field (for backward compatibility)
  data?: string | Record<string, unknown>;
  // Legacy style field (for backward compatibility)
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: TextAlign;
    fontWeight?: FontWeight;
    fontStyle?: FontStyle;
    textType?: TextType;
  };
}

export interface TextConfig {
  content: string;
  textType: TextType;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  textDecoration: TextDecoration;
  color: string;
  textAlign: TextAlign;
  lineHeight?: number;
  letterSpacing?: number;
}

export interface TextElement extends BaseElementProperties {
  type: "text";
  textConfig: TextConfig;
}

// ===== CHART ELEMENT (Thumbnail Image) =====
export interface ChartConfig {
  // Base64 encoded thumbnail image
  imageBase64?: string;
  // Reference to original chart
  chartId?: string;
  chartTitle?: string;
  // Border settings
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  // Legacy fields (for backward compatibility)
  chartType?: "bar" | "pie" | "line" | "table";
  title?: string;
  filters?: Array<{
    column: string;
    operator: "eq" | "neq" | "gt" | "lt" | "contains";
    value: unknown;
  }>;
  groupBy?: string | null;
  operation?: "count" | "sum" | "avg" | null;
  metricColumn?: string | null;
}

export interface ChartElement extends BaseElementProperties {
  type: "chart";
  chartConfig: ChartConfig;
}

// ===== IMAGE ELEMENT =====
export interface ImageConfig {
  // Base64 encoded image
  imageBase64?: string;
  // Legacy src field (for backward compatibility)
  src?: string;
  alt?: string;
  // Legacy chartId (for backward compatibility - when image is from chart)
  chartId?: string;
  // Fit mode
  objectFit?: "cover" | "contain" | "fill";
  // Border settings
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  // Opacity
  opacity?: number;
}

export interface ImageElement extends BaseElementProperties {
  type: "image";
  imageConfig: ImageConfig;
}

// ===== SHAPE ELEMENT =====
export type ShapeType = "rectangle" | "circle" | "ellipse" | "triangle" | "star" | "line" | "arrow";

export interface ShapeConfig {
  shapeType: ShapeType;
  // Fill
  fill: string;
  fillOpacity?: number;
  // Stroke
  stroke: string;
  strokeWidth: number;
  strokeOpacity?: number;
  // Corner radius (for rectangle)
  cornerRadius?: number;
  // For line/arrow specific
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
}

export interface ShapeElement extends BaseElementProperties {
  type: "shape";
  shapeConfig: ShapeConfig;
}

// ===== DRAW ELEMENT (Freehand) =====
export interface DrawPath {
  // SVG path data (d attribute) - stores the drawing
  pathData: string;
  // Stroke color
  stroke: string;
  // Stroke width
  strokeWidth: number;
  // Opacity
  opacity?: number;
}

export interface DrawConfig {
  // Array of paths (each stroke is a path)
  paths: DrawPath[];
  // Tool used (for UI state, not stored in DB)
  tool?: "pen" | "eraser";
}

export interface DrawElement extends BaseElementProperties {
  type: "draw";
  drawConfig: DrawConfig;
}

// ===== UNION TYPE FOR ALL ELEMENTS =====
export type CanvasElement = 
  | TextElement 
  | ChartElement 
  | ImageElement 
  | ShapeElement 
  | DrawElement;

// ===== CANVAS PAGE SETTINGS =====
export interface CanvasPageSettings {
  width: number;        // in pixels
  height: number;       // in pixels
  orientation: Orientation;
  background: string;   // hex color
}

// ===== CANVAS (Full Document) =====
export interface Canvas {
  id: string;
  userId: string;
  title: string;
  description?: string;
  thumbnail?: string;   // base64 for preview
  
  // Page settings
  pageSettings: CanvasPageSettings;
  
  // All elements
  elements: CanvasElement[];
  
  // Statistics
  elementCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ===== API REQUEST/RESPONSE TYPES =====
export interface CreateCanvasRequest {
  title: string;
  description?: string;
}

export interface UpdateCanvasRequest {
  title?: string;
  description?: string;
  thumbnail?: string;
  pageSettings?: Partial<CanvasPageSettings>;
  elements?: CanvasElement[];
}

export interface CanvasListItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  elementCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== RECENT IMAGES (for Image Menu) =====
export interface RecentImage {
  id: string;
  imageBase64: string;
  usedAt: Date;
}
