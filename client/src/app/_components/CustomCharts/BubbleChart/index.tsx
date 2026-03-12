"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { BubbleChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./BubbleChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const BubbleChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = false,
  animate = true,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  minBubbleSize = 10,
  maxBubbleSize = 50,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: BubbleChartProps) => {
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

  // Build bubble series from data
  const series = useMemo(
    () => [
      {
        name: title,
        data: data.map((d) => ({
          x: d.x,
          y: d.y,
          z: d.z,
        })),
      },
    ],
    [data, title],
  );

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bubble",
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
      fill: {
        opacity: 0.7,
      },
      plotOptions: {
        bubble: {
          minBubbleRadius: minBubbleSize,
          maxBubbleRadius: maxBubbleSize,
        },
      },
      legend: {
        show: showLegend,
        position: "bottom",
        fontSize: `${typography.fontSize}px`,
        fontWeight: typography.isBold ? 700 : 500,
        fontFamily: typography.fontFamily,
        labels: { colors: typography.color },
      },
      dataLabels: {
        enabled: false,
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
            <div>Size: <b>${point.z.toLocaleString()}</b></div>
          </div>`;
        },
      },
    }),
    [
      colors,
      showLegend,
      showGrid,
      animate,
      xAxisLabel,
      yAxisLabel,
      data,
      minBubbleSize,
      maxBubbleSize,
      typography,
    ],
  );

  const handleColorChange = useCallback(
    (newColors: string[]) => {
      setColors(newColors);
      onStylingChange?.({ colors: newColors });
    },
    [onStylingChange],
  );

  const handleTypographyChange = useCallback(
    (newTypography: TypographySettings) => {
      setTypography(newTypography);
      onStylingChange?.({ typography: newTypography });
    },
    [onStylingChange],
  );

  const handleToggleFavorite = useCallback(async () => {
    if (!chartBodyRef.current || !onToggleFavorite) {
      onToggleFavorite?.();
      return;
    }
    try {
      const canvas = await html2canvas(chartBodyRef.current, {
        backgroundColor: "#ffffff",
        scale: 1.5,
        logging: false,
        useCORS: true,
      });
      const thumbnail = canvas.toDataURL("image/png", 0.8);
      onToggleFavorite(thumbnail);
    } catch {
      onToggleFavorite();
    }
  }, [onToggleFavorite]);

  return (
    <div ref={chartRef} className={styles.chartWrapper}>
      <div className={styles.chartContent} ref={chartBodyRef}>
        <h3
          className={styles.chartTitle}
          style={{
            fontFamily: typography.fontFamily,
            fontSize: `${typography.fontSize + 2}px`,
            color: typography.color,
            fontWeight: typography.isBold ? 700 : 600,
            fontStyle: typography.isItalic ? "italic" : "normal",
            textDecoration: typography.isUnderline ? "underline" : "none",
          }}
        >
          {title}
        </h3>
        {description && (
          <p className={styles.chartDescription}>{description}</p>
        )}
        <div className={styles.chartBody}>
          {series[0]?.data.length > 0 ? (
            <Chart
              options={options}
              series={series}
              type="bubble"
              width={width}
              height={height}
            />
          ) : (
            <div className={styles.noData}>No data available</div>
          )}
        </div>
      </div>
      <ChartActions
        currentColors={colors}
        currentTypography={typography}
        onColorChange={handleColorChange}
        onTypographyChange={handleTypographyChange}
        chartInfo={chartInfo}
        isFavorite={isFavorite}
        isSaving={isSaving}
        onToggleFavorite={handleToggleFavorite}
        showSave={!hideSaveButton}
      />
    </div>
  );
};

export default BubbleChart;
