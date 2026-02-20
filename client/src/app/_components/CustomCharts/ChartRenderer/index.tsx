"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { ChartType } from "@/constants/chartTypes";
import {
  ChartRenderData,
  ChartDataPoint,
  DEFAULT_CHART_COLORS,
  ChartStylingUpdate,
} from "@/types/chart";
import type { ChartStyling, StoredChartData } from "@/types/chat";
import { useChatStore } from "@/store/useChatStore";
import { useChartsStore } from "@/store/useChartsStore";
import { PieChart } from "../PieChart";
import { BarChart } from "../BarChart";
import { LineChart } from "../LineChart";
import { TableChart } from "../TableChart";
import type { ChartInfo } from "@/types/chart";
import styles from "./ChartRenderer.module.scss";

// Debounce delay for saving styling (2 seconds)
const DEBOUNCE_DELAY = 2000;
// Debounce delay for thumbnail capture (after styling settles)
const THUMBNAIL_DEBOUNCE_DELAY = 3000;

interface ChartRendererProps {
  renderData: ChartRenderData;
  messageId?: string; // For saving styling updates
  chartId?: string; // For chart favorite operations
  storedStyling?: ChartStyling; // Styling from database
  storedChartData?: StoredChartData; // Full stored chart data for info tooltip
  animate?: boolean;
  showLegend?: boolean;
  colorScheme?: string[];
  isFavorite?: boolean;
  isSaving?: boolean;
  onToggleFavorite?: (thumbnail?: string) => void;
  onStylingChange?: (styling: Partial<ChartStyling>) => void; // External callback for styling updates
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  hideSaveButton?: boolean; // Hide save button in chart actions (for charts detail page)
}

export const ChartRenderer = ({
  renderData,
  messageId,
  chartId,
  storedStyling,
  storedChartData,
  animate = true,
  showLegend = true,
  colorScheme,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  onStylingChange: externalOnStylingChange,
  onDataPointClick,
  hideSaveButton = false,
}: ChartRendererProps) => {
  const { type, config, processedData } = renderData;
  const updateMessageStyling = useChatStore(
    (state) => state.updateMessageStyling,
  );
  const updateChartStyling = useChartsStore(
    (state) => state.updateChartStyling,
  );
  const updateChartInCache = useChartsStore(
    (state) => state.updateChartInCache,
  );

  // Ref for the chart container (for thumbnail capture)
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to cached chart styling for reactive updates
  // When charts page updates styling, this will trigger re-render with latest values
  const cachedChartStyling = useChartsStore((state) =>
    chartId ? state.chartsDetailCache[chartId]?.styling : undefined,
  );

  // Determine effective initial styling (cached > stored > colorScheme > default)
  const effectiveInitialColors =
    cachedChartStyling?.colors ||
    storedStyling?.colors ||
    colorScheme ||
    DEFAULT_CHART_COLORS;
  const effectiveInitialTypography =
    cachedChartStyling?.typography || storedStyling?.typography;

  // Local styling state - immediately reflects user changes
  const [localColors, setLocalColors] = useState<string[]>(
    effectiveInitialColors,
  );
  const [localTypography, setLocalTypography] = useState<
    ChartStyling["typography"] | undefined
  >(effectiveInitialTypography);

  // Track previous cached styling to detect external changes
  const prevCachedStylingRef = useRef<string>(
    JSON.stringify(cachedChartStyling),
  );

  // Sync local state when cachedChartStyling changes from external source (charts page)
  useEffect(() => {
    const currentCachedKey = JSON.stringify(cachedChartStyling);
    if (
      cachedChartStyling &&
      currentCachedKey !== prevCachedStylingRef.current
    ) {
      prevCachedStylingRef.current = currentCachedKey;
      if (cachedChartStyling.colors) {
        setLocalColors(cachedChartStyling.colors);
      }
      if (cachedChartStyling.typography) {
        setLocalTypography(cachedChartStyling.typography);
      }
    }
  }, [cachedChartStyling]);

  // Track pending changes for debounced save
  const pendingChangesRef = useRef<Partial<ChartStyling>>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        // Save any pending changes before unmount
        if (messageId && Object.keys(pendingChangesRef.current).length > 0) {
          updateMessageStyling(messageId, pendingChangesRef.current);
        }
        // Also sync to charts store if we have chartId
        if (chartId && Object.keys(pendingChangesRef.current).length > 0) {
          updateChartStyling(chartId, pendingChangesRef.current);
        }
      }
    };
  }, [messageId, chartId, updateMessageStyling, updateChartStyling]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (Object.keys(pendingChangesRef.current).length > 0) {
        // Save to message if we have messageId
        if (messageId) {
          updateMessageStyling(messageId, pendingChangesRef.current);
        }
        // Also update charts store if we have chartId (keeps cache in sync)
        if (chartId) {
          updateChartStyling(chartId, pendingChangesRef.current);
        }
        pendingChangesRef.current = {};
      }
    }, DEBOUNCE_DELAY);
  }, [messageId, chartId, updateMessageStyling, updateChartStyling]);

  // Debounced thumbnail capture (after styling changes settle)
  const debouncedThumbnailCapture = useCallback(() => {
    // Only capture if chart is favorited and we have chartId
    if (!isFavorite || !chartId || !chartContainerRef.current) return;

    if (thumbnailDebounceRef.current) {
      clearTimeout(thumbnailDebounceRef.current);
    }

    thumbnailDebounceRef.current = setTimeout(async () => {
      try {
        const chartCanvas = chartContainerRef.current?.querySelector(
          ".apexcharts-canvas",
        ) as HTMLElement;
        const targetElement = chartCanvas || chartContainerRef.current;
        if (!targetElement) return;

        const canvas = await html2canvas(targetElement, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        const thumbnail = canvas.toDataURL("image/png", 0.8);

        // Update local cache immediately
        updateChartInCache(chartId, { thumbnail });

        // Fire-and-forget API call
        fetch(`/api/charts/${chartId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thumbnail }),
        }).catch((err) => console.error("Failed to update thumbnail:", err));
      } catch (error) {
        console.error(
          "Failed to capture thumbnail after styling change:",
          error,
        );
      }
    }, THUMBNAIL_DEBOUNCE_DELAY);
  }, [isFavorite, chartId, updateChartInCache]);

  // Cleanup thumbnail debounce on unmount
  useEffect(() => {
    return () => {
      if (thumbnailDebounceRef.current) {
        clearTimeout(thumbnailDebounceRef.current);
      }
    };
  }, []);

  // Handle styling changes from charts
  const handleStylingChange = useCallback(
    (styling: ChartStylingUpdate) => {
      // Update local state immediately (instant UI feedback)
      if (styling.colors) {
        setLocalColors(styling.colors);
        pendingChangesRef.current.colors = styling.colors;
      }
      if (styling.typography) {
        setLocalTypography(styling.typography);
        pendingChangesRef.current.typography = styling.typography;
      }

      // Call external callback if provided (for syncing with external stores)
      if (externalOnStylingChange) {
        externalOnStylingChange(pendingChangesRef.current);
      }

      // Schedule debounced save to DB
      debouncedSave();

      // Schedule debounced thumbnail capture (if favorited)
      debouncedThumbnailCapture();
    },
    [debouncedSave, externalOnStylingChange, debouncedThumbnailCapture],
  );

  // Effective color scheme for rendering
  const effectiveColorScheme = useMemo(() => {
    return localColors.length > 0 ? localColors : DEFAULT_CHART_COLORS;
  }, [localColors]);

  // Build chart info for info tooltip
  const chartInfo: ChartInfo | undefined = useMemo(() => {
    if (!storedChartData) return undefined;
    return {
      title: storedChartData.title,
      description: storedChartData.description,
      createdAt: storedChartData.createdAt,
      datasetName: storedChartData.datasetInfo?.name || "",
      datasetExtension: storedChartData.datasetInfo?.extension || "",
    };
  }, [storedChartData]);

  // Build chart props based on type
  const chartElement = useMemo(() => {
    switch (type) {
      case "pie":
        return (
          <PieChart
            data={processedData}
            title={config.title}
            description={config.description}
            colorScheme={effectiveColorScheme}
            showLegend={showLegend}
            animate={animate}
            showPercentage={true}
            onDataPointClick={onDataPointClick}
            onStylingChange={handleStylingChange}
            initialTypography={localTypography}
            chartInfo={chartInfo}
            isFavorite={isFavorite}
            isSaving={isSaving}
            onToggleFavorite={onToggleFavorite}
            hideSaveButton={hideSaveButton}
          />
        );

      case "bar":
        return (
          <BarChart
            data={processedData}
            title={config.title}
            description={config.description}
            colorScheme={effectiveColorScheme}
            showLegend={showLegend}
            animate={animate}
            orientation="vertical"
            showValues={true}
            onDataPointClick={onDataPointClick}
            onStylingChange={handleStylingChange}
            initialTypography={localTypography}
            chartInfo={chartInfo}
            isFavorite={isFavorite}
            isSaving={isSaving}
            onToggleFavorite={onToggleFavorite}
            hideSaveButton={hideSaveButton}
          />
        );

      case "line":
        return (
          <LineChart
            data={processedData}
            title={config.title}
            description={config.description}
            colorScheme={effectiveColorScheme}
            showLegend={showLegend}
            animate={animate}
            showDots={true}
            showGrid={true}
            curved={true}
            onDataPointClick={onDataPointClick}
            onStylingChange={handleStylingChange}
            initialTypography={localTypography}
            chartInfo={chartInfo}
            isFavorite={isFavorite}
            isSaving={isSaving}
            onToggleFavorite={onToggleFavorite}
            hideSaveButton={hideSaveButton}
          />
        );

      case "table":
        // For table, we need headers and rows
        const headers = config.groupBy
          ? ([config.groupBy, config.metricColumn || "Value"].filter(
              Boolean,
            ) as string[])
          : processedData.length > 0
            ? Object.keys(processedData[0].originalData || {})
            : [];

        const rows = processedData.map(
          (d) =>
            d.originalData || {
              [config.groupBy || "Label"]: d.label,
              [config.metricColumn || "Value"]: d.value,
            },
        );

        return (
          <TableChart
            headers={headers}
            rows={rows}
            title={config.title}
            description={config.description}
            sortable={true}
            pageSize={10}
            chartInfo={chartInfo}
            isFavorite={isFavorite}
            isSaving={isSaving}
            onToggleFavorite={onToggleFavorite}
          />
        );

      default:
        return (
          <div className={styles.unsupportedChart}>
            <p>Unsupported chart type: {type}</p>
          </div>
        );
    }
  }, [
    type,
    config,
    processedData,
    effectiveColorScheme,
    showLegend,
    animate,
    onDataPointClick,
    handleStylingChange,
    localTypography,
    chartInfo,
    isFavorite,
    isSaving,
    onToggleFavorite,
  ]);

  return (
    <div ref={chartContainerRef} className={styles.chartRenderer}>
      {chartElement}
    </div>
  );
};

// Helper function to render a chart by type (for simpler use cases)
export const renderChartByType = (
  type: ChartType,
  data: ChartDataPoint[],
  title?: string,
  options?: {
    description?: string;
    colorScheme?: string[];
    animate?: boolean;
    showLegend?: boolean;
  },
) => {
  const {
    description,
    colorScheme = DEFAULT_CHART_COLORS,
    animate = true,
    showLegend = true,
  } = options || {};

  switch (type) {
    case "pie":
      return (
        <PieChart
          data={data}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    case "bar":
      return (
        <BarChart
          data={data}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    case "line":
      return (
        <LineChart
          data={data}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    case "table":
      const headers =
        data.length > 0 && data[0].originalData
          ? Object.keys(data[0].originalData)
          : ["Label", "Value"];
      const rows = data.map(
        (d) => d.originalData || { Label: d.label, Value: d.value },
      );
      return (
        <TableChart
          headers={headers}
          rows={rows}
          title={title}
          description={description}
        />
      );
    default:
      return null;
  }
};
