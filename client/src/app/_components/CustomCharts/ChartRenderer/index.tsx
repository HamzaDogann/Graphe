"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { ChartType } from "@/constants/chartTypes";
import {
  ChartRenderData,
  ChartDataPoint,
  DEFAULT_CHART_COLORS,
  ChartStylingUpdate,
} from "@/types/chart";
import type { ChartStyling, StoredChartData } from "@/types/chat";
import { useChatStore } from "@/store/useChatStore";
import { PieChart } from "../PieChart";
import { BarChart } from "../BarChart";
import { LineChart } from "../LineChart";
import { TableChart } from "../TableChart";
import type { ChartInfo } from "@/types/chart";
import styles from "./ChartRenderer.module.scss";

// Debounce delay for saving styling (2 seconds)
const DEBOUNCE_DELAY = 2000;

interface ChartRendererProps {
  renderData: ChartRenderData;
  messageId?: string; // For saving styling updates
  storedStyling?: ChartStyling; // Styling from database
  storedChartData?: StoredChartData; // Full stored chart data for info tooltip
  animate?: boolean;
  showLegend?: boolean;
  colorScheme?: string[];
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
}

export const ChartRenderer = ({
  renderData,
  messageId,
  storedStyling,
  storedChartData,
  animate = true,
  showLegend = true,
  colorScheme,
  onDataPointClick,
}: ChartRendererProps) => {
  const { type, config, processedData } = renderData;
  const updateMessageStyling = useChatStore(
    (state) => state.updateMessageStyling,
  );

  // Local styling state - immediately reflects user changes
  const [localColors, setLocalColors] = useState<string[]>(
    storedStyling?.colors || colorScheme || DEFAULT_CHART_COLORS,
  );
  const [localTypography, setLocalTypography] = useState<
    ChartStyling["typography"] | undefined
  >(storedStyling?.typography);

  // Track pending changes for debounced save
  const pendingChangesRef = useRef<Partial<ChartStyling>>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // NOT: storedStyling ile sync YAPILMIYOR
  // Initial değerler useState'te set ediliyor
  // Sonraki değişiklikler sadece local state'ı güncelliyor
  // DB'ye kaydet ama DB'den geri gelen değerle state güncelleme
  // Bu sayede client-DB race condition önlenir

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        // Save any pending changes before unmount
        if (messageId && Object.keys(pendingChangesRef.current).length > 0) {
          updateMessageStyling(messageId, pendingChangesRef.current);
        }
      }
    };
  }, [messageId, updateMessageStyling]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (messageId && Object.keys(pendingChangesRef.current).length > 0) {
        updateMessageStyling(messageId, pendingChangesRef.current);
        pendingChangesRef.current = {};
      }
    }, DEBOUNCE_DELAY);
  }, [messageId, updateMessageStyling]);

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

      // Schedule debounced save to DB
      debouncedSave();
    },
    [debouncedSave],
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
  ]);

  return <div className={styles.chartRenderer}>{chartElement}</div>;
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
