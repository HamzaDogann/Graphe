"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { BoxPlotChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./BoxPlotChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const BoxPlotChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = false,
  animate = true,
  horizontal = false,
  showOutliers = true,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: BoxPlotChartProps) => {
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

  // Transform BoxPlotDataPoint[] to ApexCharts boxPlot format
  const series = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return [
      {
        type: "boxPlot" as const,
        data: data.map((d) => ({
          x: d.category,
          y: [d.min, d.q1, d.median, d.q3, d.max],
        })),
      },
    ];
  }, [data]);

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "boxPlot",
        animations: {
          enabled: animate,
          speed: 600,
          dynamicAnimation: { enabled: true, speed: 400 },
        },
        toolbar: { show: false },
        fontFamily: typography.fontFamily,
      },
      colors: colors,
      plotOptions: {
        boxPlot: {
          colors: {
            upper: colors[0] || "#5C85FF",
            lower: colors[1] || colors[0] || "#A855F7",
          },
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
      xaxis: {
        labels: {
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            colors: typography.color,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
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
      },
      grid: {
        borderColor: "#e8ebf2",
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
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
          return `<div style="padding:8px 12px;font-size:${typography.fontSize}px;font-family:${typography.fontFamily}">
            <div style="font-weight:600;margin-bottom:4px">${point.category}</div>
            <div>Max: <b>${point.max.toLocaleString()}</b></div>
            <div>Q3: <b>${point.q3.toLocaleString()}</b></div>
            <div>Median: <b>${point.median.toLocaleString()}</b></div>
            <div>Q1: <b>${point.q1.toLocaleString()}</b></div>
            <div>Min: <b>${point.min.toLocaleString()}</b></div>
          </div>`;
        },
      },
    }),
    [colors, showLegend, animate, data, typography],
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
          {series.length > 0 ? (
            <Chart
              options={options}
              series={series}
              type="boxPlot"
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

export default BoxPlotChart;
