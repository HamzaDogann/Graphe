"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { FunnelChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./FunnelChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const FunnelChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = true,
  animate = true,
  showValues = true,
  showPercentage = true,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: FunnelChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartBodyRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<string[]>(
    colorScheme.slice(0, Math.max(data.length, 1)) || COLOR_PALETTES.default,
  );
  const [typography, setTypography] = useState<TypographySettings>(
    initialTypography || DEFAULT_TYPOGRAPHY,
  );

  const prevColorSchemeRef = useRef<string>(JSON.stringify(colorScheme));

  useEffect(() => {
    const schemeKey = JSON.stringify(colorScheme);
    if (schemeKey !== prevColorSchemeRef.current) {
      prevColorSchemeRef.current = schemeKey;
      setColors(colorScheme.slice(0, Math.max(data.length, 1)));
    }
  }, [colorScheme, data.length]);

  // Calculate percentages for funnel
  const dataWithPercentage = useMemo(() => {
    if (!data || data.length === 0) return [];
    const maxValue = Math.max(...data.map((d) => d.value));
    return data.map((d) => ({
      ...d,
      percentage: maxValue > 0 ? (d.value / maxValue) * 100 : 0,
    }));
  }, [data]);

  // Build funnel series - ApexCharts uses bar chart horizontally for funnel effect
  const series = useMemo(() => {
    if (!dataWithPercentage || dataWithPercentage.length === 0) {
      return [];
    }
    return [
      {
        name: "Value",
        data: dataWithPercentage.map((d) => d.value),
      },
    ];
  }, [dataWithPercentage]);

  const categories = useMemo(
    () => dataWithPercentage.map((d) => d.label),
    [dataWithPercentage],
  );

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
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
        bar: {
          horizontal: true,
          distributed: true,
          barHeight: "80%",
          isFunnel: true,
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: showValues,
        formatter: (val: number, opts: any) => {
          const idx = opts.dataPointIndex;
          const point = dataWithPercentage[idx];
          if (!point) return val.toLocaleString();
          if (showPercentage && idx > 0) {
            return `${val.toLocaleString()} (${point.percentage.toFixed(1)}%)`;
          }
          return val.toLocaleString();
        },
        style: {
          fontSize: `${typography.fontSize}px`,
          fontFamily: typography.fontFamily,
          fontWeight: typography.isBold ? 700 : 500,
          colors: ["#fff"],
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          opacity: 0.3,
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
        categories,
        labels: { show: false },
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
        },
      },
      grid: {
        show: false,
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
          const point = dataWithPercentage[dataPointIndex];
          if (!point) return "";
          return `<div style="padding:8px 12px;font-size:${typography.fontSize}px;font-family:${typography.fontFamily}">
            <div style="font-weight:600;margin-bottom:4px">${point.label}</div>
            <div>Value: <b>${point.value.toLocaleString()}</b></div>
            ${showPercentage ? `<div>Rate: <b>${point.percentage.toFixed(1)}%</b></div>` : ""}
          </div>`;
        },
      },
    }),
    [
      colors,
      showLegend,
      showValues,
      showPercentage,
      animate,
      categories,
      dataWithPercentage,
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
          {series.length > 0 ? (
            <Chart
              options={options}
              series={series}
              type="bar"
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

export default FunnelChart;
