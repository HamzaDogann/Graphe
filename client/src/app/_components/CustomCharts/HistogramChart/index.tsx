"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { HistogramChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./HistogramChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const HistogramChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = false,
  animate = true,
  binCount = 10,
  showGrid = true,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: HistogramChartProps) => {
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

  // Calculate histogram bins from raw numeric data
  const { series, categories } = useMemo(() => {
    if (!data || data.length === 0) {
      return { series: [], categories: [] };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / binCount || 1;

    // Create bins
    const bins: number[] = new Array(binCount).fill(0);
    const binLabels: string[] = [];

    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binWidth;
      const binEnd = min + (i + 1) * binWidth;
      binLabels.push(`${binStart.toFixed(0)}-${binEnd.toFixed(0)}`);
    }

    // Count values in each bin
    for (const value of data) {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        binCount - 1,
      );
      bins[binIndex]++;
    }

    return {
      series: [{ name: "Frequency", data: bins }],
      categories: binLabels,
    };
  }, [data, binCount]);

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
          horizontal: false,
          columnWidth: "95%",
          borderRadius: 2,
        },
      },
      dataLabels: {
        enabled: false,
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
        labels: {
          rotate: -45,
          rotateAlways: categories.length > 6,
          style: {
            fontSize: `${Math.max(typography.fontSize - 2, 10)}px`,
            fontFamily: typography.fontFamily,
            colors: typography.color,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: {
          text: "Value Range",
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            color: typography.color,
            fontWeight: typography.isBold ? 700 : 500,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            colors: typography.color,
          },
          formatter: (val: number) => val.toFixed(0),
        },
        title: {
          text: "Frequency",
          style: {
            fontSize: `${typography.fontSize}px`,
            fontFamily: typography.fontFamily,
            color: typography.color,
            fontWeight: typography.isBold ? 700 : 500,
          },
        },
      },
      grid: {
        show: showGrid,
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
        y: {
          formatter: (val: number) => `${val} occurrences`,
        },
      },
    }),
    [colors, showLegend, showGrid, animate, categories, typography],
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

export default HistogramChart;
