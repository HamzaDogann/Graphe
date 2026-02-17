"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { PieChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./PieChart.module.scss";

// Dynamic import for ApexCharts (SSR disabled)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Helper to compute initial colors
const computeColors = (colorScheme: string[], dataLength: number): string[] => {
  if (colorScheme.length >= dataLength) {
    return colorScheme.slice(0, dataLength);
  }
  return [...colorScheme, ...COLOR_PALETTES.default].slice(0, dataLength);
};

export const PieChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = true,
  showLabels = true,
  animate = true,
  innerRadius = 55,
  showPercentage = true,
  onDataPointClick,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: PieChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<string[]>(() =>
    computeColors(colorScheme, data.length),
  );
  const [typography, setTypography] = useState<TypographySettings>(
    initialTypography || DEFAULT_TYPOGRAPHY,
  );

  // Track previous colorScheme to avoid infinite loops
  const prevColorSchemeRef = useRef<string>(JSON.stringify(colorScheme));

  // Sync colors when colorScheme prop changes (with deep equality check)
  useEffect(() => {
    const schemeKey = JSON.stringify(colorScheme);
    if (schemeKey !== prevColorSchemeRef.current) {
      prevColorSchemeRef.current = schemeKey;
      setColors(computeColors(colorScheme, data.length));
    }
  }, [colorScheme, data.length]);

  // Extract series and labels from data
  const series = useMemo(() => data.map((d) => d.value), [data]);
  const labels = useMemo(() => data.map((d) => d.label), [data]);

  // ApexCharts options with typography support
  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        animations: {
          enabled: animate,
          dynamicAnimation: {
            enabled: true,
            speed: 500,
          },
        },
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
      labels: labels,
      legend: {
        show: showLegend,
        position: "right",
        fontSize: `${typography.fontSize}px`,
        fontWeight: typography.isBold ? 700 : 500,
        fontFamily: typography.fontFamily,
        labels: {
          colors: typography.color,
        },
        markers: {
          size: 6,
          strokeWidth: 0,
        },
        itemMargin: {
          horizontal: 8,
          vertical: 6,
        },
        formatter: (
          legendName: string,
          opts?: { seriesIndex: number; w: { globals: { series: number[] } } },
        ) => {
          if (showPercentage && opts) {
            const total = opts.w.globals.series.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const value = opts.w.globals.series[opts.seriesIndex];
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${legendName} (${percentage}%)`;
          }
          return legendName;
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: `${innerRadius}%`,
            labels: {
              show: showLabels,
              name: {
                show: true,
                fontSize: `${typography.fontSize + 2}px`,
                fontWeight: typography.isBold ? 700 : 600,
                fontFamily: typography.fontFamily,
                color: typography.color,
              },
              value: {
                show: true,
                fontSize: `${typography.fontSize + 10}px`,
                fontWeight: 700,
                fontFamily: typography.fontFamily,
                color: typography.color,
                formatter: (val: string) => Number(val).toLocaleString(),
              },
              total: {
                show: true,
                showAlways: true,
                label: "Total",
                fontSize: `${typography.fontSize}px`,
                fontWeight: typography.isBold ? 700 : 600,
                fontFamily: typography.fontFamily,
                color: typography.color,
                formatter: (w: { globals: { seriesTotals: number[] } }) => {
                  return w.globals.seriesTotals
                    .reduce((a: number, b: number) => a + b, 0)
                    .toLocaleString();
                },
              },
            },
          },
          expandOnClick: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["#fff"],
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: `${typography.fontSize}px`,
          fontFamily: typography.fontFamily,
        },
        y: {
          formatter: (val: number) => val.toLocaleString(),
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    }),
    [
      colors,
      labels,
      showLegend,
      showLabels,
      showPercentage,
      animate,
      innerRadius,
      data,
      onDataPointClick,
      typography,
    ],
  );

  // Screenshot handler using html2canvas
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

  // Typography change handler
  const handleTypographyChange = useCallback(
    (settings: TypographySettings) => {
      setTypography(settings);
      // Notify parent of styling change
      onStylingChange?.({ typography: settings });
    },
    [onStylingChange],
  );

  // Color change handler
  const handleColorChange = useCallback(
    (newColors: string[]) => {
      const extendedColors = [...newColors];
      while (extendedColors.length < data.length) {
        extendedColors.push(
          COLOR_PALETTES.default[
            extendedColors.length % COLOR_PALETTES.default.length
          ],
        );
      }
      const finalColors = extendedColors.slice(0, data.length);
      setColors(finalColors);
      // Notify parent of styling change
      onStylingChange?.({ colors: finalColors });
    },
    [data.length, onStylingChange],
  );

  // Save handler
  const handleSave = useCallback(() => {
    console.log("Save chart:", title);
  }, [title]);

  // Compute title styles based on typography
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
        {/* Title */}
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

        {/* ApexCharts Pie/Donut */}
        <div className={styles.chartBody}>
          <Chart
            options={options}
            series={series}
            type="donut"
            height={height}
            width="100%"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <ChartActions
        onScreenshot={handleScreenshot}
        onColorChange={handleColorChange}
        onTypographyChange={handleTypographyChange}
        onSave={onToggleFavorite}
        currentColors={colors}
        colorCount={Math.min(data.length, 8)}
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
