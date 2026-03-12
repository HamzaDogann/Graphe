"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { StackedBarChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./StackedBarChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const computeColors = (colorScheme: string[], count: number): string[] => {
  if (colorScheme.length >= count) return colorScheme.slice(0, count);
  return [...colorScheme, ...COLOR_PALETTES.default].slice(0, count);
};

export const StackedBarChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = true,
  showLabels = true,
  animate = true,
  orientation = "vertical",
  showValues = false,
  seriesKeys,
  onDataPointClick,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: StackedBarChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartBodyRef = useRef<HTMLDivElement>(null);
  const [typography, setTypography] = useState<TypographySettings>(
    initialTypography || DEFAULT_TYPOGRAPHY,
  );

  // Build multi-series data from originalData or fallback to single series
  const { series, categories, resolvedSeriesKeys } = useMemo(() => {
    // Try to extract series from originalData
    if (
      data.length > 0 &&
      data[0].originalData &&
      seriesKeys &&
      seriesKeys.length > 0
    ) {
      const cats = data.map((d) => d.label);
      const ser = seriesKeys.map((key) => ({
        name: key,
        data: data.map((d) => {
          const val = d.originalData?.[key];
          return typeof val === "number" ? val : Number(val) || 0;
        }),
      }));
      return { series: ser, categories: cats, resolvedSeriesKeys: seriesKeys };
    }

    // Fallback: try to auto-detect numeric keys from originalData
    if (data.length > 0 && data[0].originalData) {
      const firstRow = data[0].originalData;
      const numericKeys = Object.keys(firstRow).filter(
        (key) => typeof firstRow[key] === "number" && key !== "value",
      );
      if (numericKeys.length > 1) {
        const cats = data.map((d) => d.label);
        const ser = numericKeys.map((key) => ({
          name: key,
          data: data.map((d) => {
            const val = d.originalData?.[key];
            return typeof val === "number" ? val : 0;
          }),
        }));
        return {
          series: ser,
          categories: cats,
          resolvedSeriesKeys: numericKeys,
        };
      }
    }

    // Ultimate fallback: single series (acts like a normal bar)
    return {
      series: [{ name: title, data: data.map((d) => d.value) }],
      categories: data.map((d) => d.label),
      resolvedSeriesKeys: [title],
    };
  }, [data, seriesKeys, title]);

  const seriesCount = resolvedSeriesKeys.length;
  const [colors, setColors] = useState<string[]>(() =>
    computeColors(colorScheme, seriesCount),
  );

  const prevColorSchemeRef = useRef<string>(JSON.stringify(colorScheme));

  useEffect(() => {
    const schemeKey = JSON.stringify(colorScheme);
    if (schemeKey !== prevColorSchemeRef.current) {
      prevColorSchemeRef.current = schemeKey;
      setColors(computeColors(colorScheme, seriesCount));
    }
  }, [colorScheme, seriesCount]);

  const isHorizontal = orientation === "horizontal";

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        stacked: true,
        animations: {
          enabled: animate,
          speed: 600,
          animateGradually: { enabled: true, delay: 100 },
          dynamicAnimation: { enabled: true, speed: 400 },
        },
        toolbar: { show: false },
        events: {
          dataPointSelection: (_event, _chartContext, config) => {
            if (onDataPointClick && config.dataPointIndex !== undefined) {
              onDataPointClick(data[config.dataPointIndex]);
            }
          },
        },
        fontFamily: typography.fontFamily,
      },
      colors: colors,
      plotOptions: {
        bar: {
          horizontal: isHorizontal,
          borderRadius: 4,
          borderRadiusApplication: "end",
          borderRadiusWhenStacked: "last",
          columnWidth: "55%",
          barHeight: "55%",
        },
      },
      dataLabels: {
        enabled: showValues,
        formatter: (val: number) => {
          if (val === 0) return "";
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
          return val.toLocaleString();
        },
        style: {
          fontSize: `${typography.fontSize - 1}px`,
          fontWeight: 600,
          fontFamily: typography.fontFamily,
          colors: ["#fff"],
        },
      },
      legend: {
        show: showLegend,
        position: "bottom",
        fontSize: `${typography.fontSize}px`,
        fontWeight: typography.isBold ? 700 : 500,
        fontFamily: typography.fontFamily,
        labels: { colors: typography.color },
        markers: { size: 6, strokeWidth: 0 },
      },
      xaxis: {
        categories: categories,
        labels: {
          show: showLabels,
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            colors: typography.color,
          },
          rotate: isHorizontal ? 0 : -45,
          rotateAlways: !isHorizontal && categories.length > 6,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          show: showLabels,
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            colors: typography.color,
          },
          formatter: (val: number) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
            return val.toString();
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#e8ebf2",
        strokeDashArray: 4,
        xaxis: { lines: { show: isHorizontal } },
        yaxis: { lines: { show: !isHorizontal } },
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        style: {
          fontSize: `${typography.fontSize}px`,
          fontFamily: typography.fontFamily,
        },
        y: { formatter: (val: number) => val.toLocaleString() },
      },
      states: {
        hover: { filter: { type: "darken", value: 0.9 } },
        active: { filter: { type: "darken", value: 0.85 } },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            plotOptions: { bar: { columnWidth: "80%" } },
            xaxis: { labels: { rotate: -60 } },
          },
        },
      ],
    }),
    [
      colors,
      categories,
      showLegend,
      showLabels,
      showValues,
      animate,
      isHorizontal,
      data,
      onDataPointClick,
      typography,
    ],
  );

  const handleScreenshot = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "_")}_chart.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to capture chart:", error);
    }
  }, [title]);

  const handleTypographyChange = useCallback(
    (settings: TypographySettings) => {
      setTypography(settings);
      onStylingChange?.({ typography: settings });
    },
    [onStylingChange],
  );

  const handleColorChange = useCallback(
    (newColors: string[]) => {
      const extendedColors = [...newColors];
      while (extendedColors.length < seriesCount) {
        extendedColors.push(
          COLOR_PALETTES.default[
            extendedColors.length % COLOR_PALETTES.default.length
          ],
        );
      }
      const finalColors = extendedColors.slice(0, seriesCount);
      setColors(finalColors);
      onStylingChange?.({ colors: finalColors });
    },
    [seriesCount, onStylingChange],
  );

  const handleSave = useCallback(async () => {
    if (!onToggleFavorite) return;
    if (!isFavorite && chartBodyRef.current) {
      try {
        const chartCanvas = chartBodyRef.current.querySelector(
          ".apexcharts-canvas",
        ) as HTMLElement;
        const targetElement = chartCanvas || chartBodyRef.current;
        const canvas = await html2canvas(targetElement, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        const thumbnail = canvas.toDataURL("image/png", 0.8);
        onToggleFavorite(thumbnail);
      } catch (error) {
        console.error("Failed to capture thumbnail:", error);
        onToggleFavorite();
      }
    } else {
      onToggleFavorite();
    }
  }, [isFavorite, onToggleFavorite]);

  const titleStyle = useMemo(
    () => ({
      fontSize: `${typography.fontSize + 4}px`,
      fontFamily: typography.fontFamily,
      color: typography.color,
      fontWeight: typography.isBold ? 700 : 600,
      fontStyle: typography.isItalic
        ? ("italic" as const)
        : ("normal" as const),
      textDecoration: typography.isUnderline ? "underline" : "none",
    }),
    [typography],
  );

  const descriptionStyle = useMemo(
    () => ({
      fontSize: `${typography.fontSize}px`,
      fontFamily: typography.fontFamily,
      color: typography.color,
      fontStyle: typography.isItalic
        ? ("italic" as const)
        : ("normal" as const),
    }),
    [typography],
  );

  return (
    <div className={styles.chartWrapper} style={{ width }}>
      <div className={styles.chartContent} ref={chartRef}>
        {title && (
          <h3 className={styles.chartTitle} style={titleStyle}>
            {title}
          </h3>
        )}
        {description && (
          <p className={styles.chartDescription} style={descriptionStyle}>
            {description}
          </p>
        )}
        <div className={styles.chartBody} ref={chartBodyRef}>
          <Chart
            options={options}
            series={series}
            type="bar"
            height={height}
            width="100%"
          />
        </div>
      </div>
      <ChartActions
        onScreenshot={handleScreenshot}
        onColorChange={handleColorChange}
        onTypographyChange={handleTypographyChange}
        onSave={handleSave}
        currentColors={colors}
        colorCount={Math.min(seriesCount, 8)}
        currentTypography={typography}
        orientation="vertical"
        showInfo={!!chartInfo}
        chartInfo={chartInfo}
        isFavorite={isFavorite}
        isSaving={isSaving}
        showSave={!hideSaveButton}
      />
    </div>
  );
};
