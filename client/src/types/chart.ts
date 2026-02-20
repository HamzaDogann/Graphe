/**
 * Chart Configuration Types
 * Types for AI-generated chart configurations and chart components
 */

import { 
  ChartType, 
  AggregationOperation, 
  FilterOperator 
} from "@/constants/chartTypes";

// Filter configuration from AI
export interface ChartFilter {
  column: string;
  operator: FilterOperator;
  value: string | number | boolean;
}

// AI-generated chart configuration
export interface AIChartConfig {
  chartType: ChartType;
  title: string;
  description?: string;
  filters: ChartFilter[];
  groupBy: string | null;
  operation: AggregationOperation | null;
  metricColumn: string | null;
  // Optional styling from AI
  colorScheme?: string;
  sortOrder?: "asc" | "desc" | null;
}

// Processed data point for charts
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
  originalData?: Record<string, any>;
}

// Styling change callback type
export interface ChartStylingUpdate {
  colors?: string[];
  typography?: {
    fontSize: number;
    fontFamily: string;
    color: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
  };
}

// Chart info for displaying metadata in info tooltip
export interface ChartInfo {
  datasetName: string;
  datasetExtension: string;
  title: string;
  description?: string;
  createdAt?: string;
}

// Common props for all chart components
export interface BaseChartProps {
  data: ChartDataPoint[];
  title?: string;
  description?: string;
  width?: number | string;
  height?: number | string;
  colorScheme?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  animate?: boolean;
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  onStylingChange?: (styling: ChartStylingUpdate) => void;
  initialTypography?: {
    fontSize: number;
    fontFamily: string;
    color: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
  };
  chartInfo?: ChartInfo;
  isFavorite?: boolean;
  isSaving?: boolean;
  onToggleFavorite?: (thumbnail?: string) => void;
  hideSaveButton?: boolean; // Hide save button in chart actions
}

// Pie Chart specific props
export interface PieChartProps extends BaseChartProps {
  innerRadius?: number; // For donut chart effect
  showPercentage?: boolean;
}

// Bar Chart specific props
export interface BarChartProps extends BaseChartProps {
  orientation?: "vertical" | "horizontal";
  showValues?: boolean;
  barGap?: number;
}

// Line Chart specific props
export interface LineChartProps extends BaseChartProps {
  showDots?: boolean;
  showGrid?: boolean;
  curved?: boolean;
  fillArea?: boolean;
}

// Table Chart specific props
export interface TableChartProps {
  headers: string[];
  rows: Record<string, any>[];
  title?: string;
  description?: string;
  sortable?: boolean;
  pageSize?: number;
  showRowNumbers?: boolean;
  isFavorite?: boolean;
  isSaving?: boolean;
  onToggleFavorite?: (thumbnail?: string) => void;
  chartInfo?: ChartInfo;
}

// Default color palette for charts
export const DEFAULT_CHART_COLORS = [
  "#5C85FF", // Primary blue
  "#A855F7", // Purple
  "#22C55E", // Green
  "#F59E0B", // Orange/Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#8B5CF6", // Violet
  "#14B8A6", // Teal
  "#F97316", // Deep orange
];

// Schema info sent to AI
export interface DataSchema {
  columns: string[];
  columnTypes: Record<string, string>;
  sample: Record<string, any>[];
  rowCount: number;
}

// Response wrapper from AI
export interface AIChartResponse {
  success: boolean;
  config?: AIChartConfig;
  error?: string;
  rawResponse?: string;
}

// Chart render result
export interface ChartRenderData {
  type: ChartType;
  config: AIChartConfig;
  processedData: ChartDataPoint[];
  originalData: Record<string, any>[];
}
