"use client";

import { useMemo } from "react";
import { DEFAULT_CHART_COLORS, type ChartDataPoint } from "@/types/chart";
import type { ChartType } from "@/constants/chartTypes";
import styles from "./ChartRenderer.module.scss";
import { useChartRendererStyling } from "./hooks/useChartRendererStyling";
import { renderChartElement, renderChartByType as renderChartByTypeInternal } from "./renderers";
import { buildChartInfo } from "./utils";
import type { ChartRendererProps, RenderChartByTypeOptions } from "./types";

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
  onStylingChange,
  onDataPointClick,
  hideSaveButton = false,
}: ChartRendererProps) => {
  const { localColors, localTypography, handleStylingChange, chartContainerRef } =
    useChartRendererStyling({
      messageId,
      chartId,
      storedStyling,
      colorScheme,
      onStylingChange,
    });

  const effectiveColorScheme = useMemo(
    () => (localColors.length > 0 ? localColors : DEFAULT_CHART_COLORS),
    [localColors],
  );

  const chartInfo = useMemo(() => buildChartInfo(storedChartData), [storedChartData]);

  const chartElement = useMemo(
    () =>
      renderChartElement({
        renderData,
        effectiveColorScheme,
        showLegend,
        animate,
        onDataPointClick,
        onStylingChange: handleStylingChange,
        localTypography,
        chartInfo,
        isFavorite,
        isSaving,
        onToggleFavorite,
        hideSaveButton,
      }),
    [
      renderData,
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
      hideSaveButton,
    ],
  );

  return (
    <div ref={chartContainerRef} className={styles.chartRenderer}>
      {chartElement}
    </div>
  );
};

export const renderChartByType = (
  type: ChartType,
  data: ChartDataPoint[],
  title?: string,
  options?: RenderChartByTypeOptions,
) => {
  return renderChartByTypeInternal(type, data, title, options);
};
