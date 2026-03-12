"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { ScatterChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./ScatterChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const ScatterChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = false,
  showLabels = true,
  animate = true,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  dotSize = 8,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: ScatterChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartBodyRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<string[]>(() => [
    colorScheme[0] || COLOR_PALETTES.default[0],
  ]);
  const [typography, setTypography] = useState<TypographySettings>(
    initialTypography || DEFAULT_TYPOGRAPHY,
  );

  const prevColorSchemeRef = useRef<string>(JSON.stringify(colorScheme));

  useEffect(() => {
    const schemeKey = JSON.stringify(colorScheme);
    if (schemeKey !== prevColorSchemeRef.current) {
      prevColorSchemeRef.current = schemeKey;
      setColors([colorScheme[0] || COLOR_PALETTES.default[0]]);
    }
  }, [colorScheme]);

  // Build scatter series from data
  const series = useMemo(
    () => [
      {
        name: title,
        data: data.map((d) => ({ x: d.x, y: d.y })),
      },
    ],
    [data, title],
  );

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "scatter",
        animations: {
          enabled: animate,
          speed: 600,
          dynamicAnimation: { enabled: true, speed: 400 },
        },
        toolbar: { show: false },
        zoom: { enabled: true, type: "xy" },
        fontFamily: typography.fontFamily,
      },
      colors: colors,
      markers: {
        size: dotSize,
        strokeWidth: 2,
        strokeColors: "#fff",
        hover: { size: dotSize + 3, sizeOffset: 3 },
      },
      legend: {
        show: showLegend,
        position: "bottom",
        fontSize: `${typography.fontSize}px`,
        fontWeight: typography.isBold ? 700 : 500,
        fontFamily: typography.fontFamily,
        labels: { colors: typography.color },
      },
      xaxis: {
        title: {
          text: xAxisLabel,
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            color: typography.color,
            fontWeight: typography.isBold ? 700 : 500,
          },
        },
        labels: {
          show: showLabels,
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            colors: typography.color,
          },
          formatter: (val: string) => {
            const num = Number(val);
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
            return val;
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tickAmount: 8,
      },
      yaxis: {
        title: {
          text: yAxisLabel,
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            color: typography.color,
            fontWeight: typography.isBold ? 700 : 500,
          },
        },
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
            return val.toFixed(0);
          },
        },
        tickAmount: 6,
      },
      grid: {
        show: showGrid,
        borderColor: "#e8ebf2",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: `${typography.fontSize}px`,
          fontFamily: typography.fontFamily,
        },
        custom: ({
          seriesIndex,
          dataPointIndex,
          w,
        }: {
          seriesIndex: number;
          dataPointIndex: number;
          w: any;
        }) => {
          const point = data[dataPointIndex];
          if (!point) return "";
          const label = point.label
            ? `<div style="font-weight:600;margin-bottom:4px">${point.label}</div>`
            : "";
          return `<div style="padding:8px 12px;font-size:${typography.fontSize}px;font-family:${typography.fontFamily}">
            ${label}
            <div>${xAxisLabel || "X"}: <b>${point.x.toLocaleString()}</b></div>
            <div>${yAxisLabel || "Y"}: <b>${point.y.toLocaleString()}</b></div>
          </div>`;
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            markers: { size: Math.max(dotSize - 2, 4) },
          },
        },
      ],
    }),
    [
      colors,
      showLegend,
      showLabels,
      showGrid,
      animate,
      dotSize,
      xAxisLabel,
      yAxisLabel,
      data,
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
      const finalColors = [newColors[0] || COLOR_PALETTES.default[0]];
      setColors(finalColors);
      onStylingChange?.({ colors: finalColors });
    },
    [onStylingChange],
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
            type="scatter"
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
        colorCount={1}
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
