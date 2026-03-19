import type { ChartDataPoint, ChartRenderData, ChartInfo, ChartStylingUpdate } from "@/types/chart";
import type { ChartType } from "@/constants/chartTypes";
import type { ChartStyling, StoredChartData } from "@/types/chat";
import type { ReactElement } from "react";

export interface ChartRendererProps {
  renderData: ChartRenderData;
  messageId?: string;
  chartId?: string;
  storedStyling?: ChartStyling;
  storedChartData?: StoredChartData;
  animate?: boolean;
  showLegend?: boolean;
  colorScheme?: string[];
  isFavorite?: boolean;
  isSaving?: boolean;
  onToggleFavorite?: (thumbnail?: string) => void;
  onStylingChange?: (styling: Partial<ChartStyling>) => void;
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  hideSaveButton?: boolean;
}

export interface RenderChartByTypeOptions {
  description?: string;
  colorScheme?: string[];
  animate?: boolean;
  showLegend?: boolean;
}

export interface RenderChartElementArgs {
  renderData: ChartRenderData;
  effectiveColorScheme: string[];
  showLegend: boolean;
  animate: boolean;
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  onStylingChange: (styling: ChartStylingUpdate) => void;
  localTypography?: ChartStyling["typography"];
  chartInfo?: ChartInfo;
  isFavorite: boolean;
  isSaving: boolean;
  onToggleFavorite?: (thumbnail?: string) => void;
  hideSaveButton: boolean;
}

export type RenderChartByTypeFn = (
  type: ChartType,
  data: ChartDataPoint[],
  title?: string,
  options?: RenderChartByTypeOptions,
) => ReactElement | null;
