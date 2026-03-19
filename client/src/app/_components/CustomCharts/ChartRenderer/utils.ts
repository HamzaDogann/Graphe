import type {
  ChartDataPoint,
  ChartInfo,
  ScatterDataPoint,
  HeatmapDataPoint,
  RadarDataPoint,
  BoxPlotDataPoint,
  BubbleDataPoint,
} from "@/types/chart";
import type { StoredChartData } from "@/types/chat";
import type { AIChartConfig } from "@/types/chart";

export const buildChartInfo = (
  storedChartData?: StoredChartData,
): ChartInfo | undefined => {
  if (!storedChartData) return undefined;

  return {
    title: storedChartData.title,
    description: storedChartData.description,
    createdAt: storedChartData.createdAt,
    datasetName: storedChartData.datasetInfo?.name || "",
    datasetExtension: storedChartData.datasetInfo?.extension || "",
  };
};

export const getTableHeaders = (
  config: AIChartConfig,
  processedData: ChartDataPoint[],
): string[] => {
  if (config.groupBy) {
    return [config.groupBy, config.metricColumn || "Value"].filter(Boolean) as string[];
  }

  if (processedData.length > 0) {
    return Object.keys(processedData[0].originalData || {});
  }

  return [];
};

export const getTableRows = (
  config: AIChartConfig,
  processedData: ChartDataPoint[],
): Record<string, any>[] => {
  return processedData.map(
    (d) =>
      d.originalData || {
        [config.groupBy || "Label"]: d.label,
        [config.metricColumn || "Value"]: d.value,
      },
  );
};

export const toScatterData = (
  processedData: ChartDataPoint[],
  config: AIChartConfig,
): ScatterDataPoint[] => {
  return processedData.map((d) => ({
    x: d.originalData?.[config.xColumn || ""] ?? d.value,
    y: d.originalData?.[config.yColumn || ""] ?? d.value,
    label: d.label,
    originalData: d.originalData,
  }));
};

export const toHeatmapData = (
  processedData: ChartDataPoint[],
  config: AIChartConfig,
): HeatmapDataPoint[] => {
  return processedData.map((d) => ({
    row: d.originalData?.[config.rowColumn || config.groupBy || ""] ?? d.label,
    col: d.originalData?.[config.colColumn || config.metricColumn || ""] ?? "",
    value: d.value,
  }));
};

export const toRadarData = (
  processedData: ChartDataPoint[],
  config: AIChartConfig,
): RadarDataPoint[] => {
  return processedData.map((d) => ({
    name: d.label,
    indicators: (config.radarIndicators || []).reduce((acc, indicator) => {
      const normalizedIndicator = indicator.trim().toLowerCase();
      const matchedKey = Object.keys(d.originalData || {}).find(
        (k) => k.trim().toLowerCase() === normalizedIndicator,
      );
      const val =
        (matchedKey ? d.originalData?.[matchedKey] : undefined) ??
        d.originalData?.[indicator] ??
        d.value ??
        0;

      acc[indicator] =
        typeof val === "number" ? val : parseFloat(String(val)) || 0;
      return acc;
    }, {} as Record<string, number>),
  }));
};

export const toHistogramValues = (processedData: ChartDataPoint[]): number[] => {
  return processedData.map((d) => d.value);
};

export const toBoxPlotData = (processedData: ChartDataPoint[]): BoxPlotDataPoint[] => {
  return processedData.map((d) => ({
    category: d.label,
    min: d.originalData?.min ?? d.value * 0.5,
    q1: d.originalData?.q1 ?? d.value * 0.75,
    median: d.originalData?.median ?? d.value,
    q3: d.originalData?.q3 ?? d.value * 1.25,
    max: d.originalData?.max ?? d.value * 1.5,
    outliers: d.originalData?.outliers,
  }));
};

export const toBubbleData = (
  processedData: ChartDataPoint[],
  config: AIChartConfig,
): BubbleDataPoint[] => {
  return processedData.map((d) => ({
    x: d.originalData?.[config.xColumn || ""] ?? d.value,
    y: d.originalData?.[config.yColumn || ""] ?? d.value,
    z: d.originalData?.[config.sizeColumn || ""] ?? Math.abs(d.value),
    label: d.label,
    originalData: d.originalData,
  }));
};
