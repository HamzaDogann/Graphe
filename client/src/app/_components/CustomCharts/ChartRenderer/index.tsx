"use client";

import { useMemo } from "react";
import { ChartType } from "@/constants/chartTypes";
import {
  ChartRenderData,
  ChartDataPoint,
  DEFAULT_CHART_COLORS,
} from "@/types/chart";
import type { ChartStyling } from "@/types/chat";
import { PieChart } from "../PieChart";
import { BarChart } from "../BarChart";
import { LineChart } from "../LineChart";
import { TableChart } from "../TableChart";
import styles from "./ChartRenderer.module.scss";

interface ChartRendererProps {
  renderData: ChartRenderData;
  messageId?: string; // For saving styling updates
  storedStyling?: ChartStyling; // Styling from database
  animate?: boolean;
  showLegend?: boolean;
  colorScheme?: string[];
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
}

export const ChartRenderer = ({
  renderData,
  messageId,
  storedStyling,
  animate = true,
  showLegend = true,
  colorScheme,
  onDataPointClick,
}: ChartRendererProps) => {
  const { type, config, processedData, originalData } = renderData;

  // Use stored styling colors if available, otherwise use prop or default
  const effectiveColorScheme = useMemo(() => {
    if (storedStyling?.colors?.length) {
      return storedStyling.colors;
    }
    return colorScheme || DEFAULT_CHART_COLORS;
  }, [storedStyling?.colors, colorScheme]);

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
