import { ChartType } from "@/constants/chartTypes";
import { ChartDataPoint, DEFAULT_CHART_COLORS } from "@/types/chart";
import type {
  ScatterDataPoint,
  HeatmapDataPoint,
  RadarDataPoint,
  BoxPlotDataPoint,
  BubbleDataPoint,
} from "@/types/chart";
import { PieChart } from "../PieChart";
import { BarChart } from "../BarChart";
import { LineChart } from "../LineChart";
import { TableChart } from "../TableChart";
import { DonutChart } from "../DonutChart";
import { AreaChart } from "../AreaChart";
import { StackedBarChart } from "../StackedBarChart";
import { ScatterChart } from "../ScatterChart";
import { HeatmapChart } from "../HeatmapChart";
import { RadarChart } from "../RadarChart";
import { TreemapChart } from "../TreemapChart";
import { HistogramChart } from "../HistogramChart";
import { BoxPlotChart } from "../BoxPlotChart";
import { BubbleChart } from "../BubbleChart";
import { FunnelChart } from "../FunnelChart";
import styles from "./ChartRenderer.module.scss";
import type { ReactElement } from "react";
import type {
  RenderChartByTypeFn,
  RenderChartByTypeOptions,
  RenderChartElementArgs,
} from "./types";
import {
  getTableHeaders,
  getTableRows,
  toScatterData,
  toHeatmapData,
  toRadarData,
  toHistogramValues,
  toBoxPlotData,
  toBubbleData,
} from "./utils";

export const renderChartElement = ({
  renderData,
  effectiveColorScheme,
  showLegend,
  animate,
  onDataPointClick,
  onStylingChange,
  localTypography,
  chartInfo,
  isFavorite,
  isSaving,
  onToggleFavorite,
  hideSaveButton,
}: RenderChartElementArgs): ReactElement => {
  const { type, config, processedData } = renderData;

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
          onStylingChange={onStylingChange}
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
          onStylingChange={onStylingChange}
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
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );

    case "table": {
      const headers = getTableHeaders(config, processedData);
      const rows = getTableRows(config, processedData);

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
    }

    case "donut":
      return (
        <DonutChart
          data={processedData}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          showPercentage={true}
          onDataPointClick={onDataPointClick}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );

    case "area":
      return (
        <AreaChart
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
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );

    case "stackedbar":
      return (
        <StackedBarChart
          data={processedData}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          orientation="vertical"
          showValues={false}
          seriesKeys={config.seriesKeys}
          onDataPointClick={onDataPointClick}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );

    case "scatter": {
      const scatterData = toScatterData(processedData, config);
      return (
        <ScatterChart
          data={scatterData}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          showGrid={true}
          xAxisLabel={config.xColumn || undefined}
          yAxisLabel={config.yColumn || undefined}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );
    }

    case "heatmap": {
      const heatmapData = toHeatmapData(processedData, config);
      return (
        <HeatmapChart
          data={heatmapData}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          showGrid={true}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );
    }

    case "radar": {
      const radarDataTransformed = toRadarData(processedData, config);
      return (
        <RadarChart
          data={radarDataTransformed}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          showGrid={true}
          indicators={config.radarIndicators}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );
    }

    case "treemap":
      return (
        <TreemapChart
          data={processedData}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          showValues={true}
          distributed={true}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );

    case "histogram": {
      const histogramValues = toHistogramValues(processedData);
      return (
        <HistogramChart
          data={histogramValues}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          binCount={config.binCount || 10}
          showGrid={true}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );
    }

    case "boxplot": {
      const boxPlotData = toBoxPlotData(processedData);
      return (
        <BoxPlotChart
          data={boxPlotData}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          horizontal={false}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );
    }

    case "bubble": {
      const bubbleData = toBubbleData(processedData, config);
      return (
        <BubbleChart
          data={bubbleData}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          showGrid={true}
          xAxisLabel={config.xColumn || undefined}
          yAxisLabel={config.yColumn || undefined}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );
    }

    case "funnel":
      return (
        <FunnelChart
          data={processedData}
          title={config.title}
          description={config.description}
          colorScheme={effectiveColorScheme}
          showLegend={showLegend}
          animate={animate}
          showValues={true}
          showPercentage={true}
          onStylingChange={onStylingChange}
          initialTypography={localTypography}
          chartInfo={chartInfo}
          isFavorite={isFavorite}
          isSaving={isSaving}
          onToggleFavorite={onToggleFavorite}
          hideSaveButton={hideSaveButton}
        />
      );

    default:
      return (
        <div className={styles.unsupportedChart}>
          <p>Unsupported chart type: {type}</p>
        </div>
      );
  }
};

export const renderChartByType: RenderChartByTypeFn = (
  type,
  data,
  title,
  options,
) => {
  const {
    description,
    colorScheme = DEFAULT_CHART_COLORS,
    animate = true,
    showLegend = true,
  }: RenderChartByTypeOptions = options || {};

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
    case "table": {
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
    }
    case "donut":
      return (
        <DonutChart
          data={data}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    case "area":
      return (
        <AreaChart
          data={data}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    case "stackedbar":
      return (
        <StackedBarChart
          data={data}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    case "scatter": {
      const scatterDataSimple: ScatterDataPoint[] = data.map((d) => ({
        x: d.value,
        y: d.value,
        label: d.label,
      }));
      return (
        <ScatterChart
          data={scatterDataSimple}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    }
    case "heatmap": {
      const heatmapDataSimple: HeatmapDataPoint[] = data.map((d, i) => ({
        row: d.label,
        col: `Col ${i + 1}`,
        value: d.value,
      }));
      return (
        <HeatmapChart
          data={heatmapDataSimple}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    }
    case "radar": {
      const radarDataSimple: RadarDataPoint[] = data.map((d) => ({
        name: d.label,
        indicators: d.originalData || {},
      }));
      return (
        <RadarChart
          data={radarDataSimple}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    }
    case "treemap":
      return (
        <TreemapChart
          data={data}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    case "histogram": {
      const histValues: number[] = data.map((d) => d.value);
      return (
        <HistogramChart
          data={histValues}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    }
    case "boxplot": {
      const boxData: BoxPlotDataPoint[] = data.map((d) => ({
        category: d.label,
        min: d.value * 0.5,
        q1: d.value * 0.75,
        median: d.value,
        q3: d.value * 1.25,
        max: d.value * 1.5,
      }));
      return (
        <BoxPlotChart
          data={boxData}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    }
    case "bubble": {
      const bubbleDataSimple: BubbleDataPoint[] = data.map((d) => ({
        x: d.value,
        y: d.value,
        z: Math.abs(d.value),
        label: d.label,
      }));
      return (
        <BubbleChart
          data={bubbleDataSimple}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    }
    case "funnel":
      return (
        <FunnelChart
          data={data}
          title={title}
          description={description}
          colorScheme={colorScheme}
          animate={animate}
          showLegend={showLegend}
        />
      );
    default:
      return null;
  }
};
