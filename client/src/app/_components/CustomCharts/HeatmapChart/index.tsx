"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { HeatmapChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./HeatmapChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const HeatmapChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = true,
  animate = true,
  showGrid = true,
  minColor = "#e0f2fe",
  maxColor = "#0369a1",
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: HeatmapChartProps) => {
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

  // Transform HeatmapDataPoint[] to ApexCharts heatmap format
  const { series, categories } = useMemo(() => {
    if (!data || data.length === 0) {
      return { series: [], categories: [] };
    }

    // Get unique rows and cols
    const uniqueRows = [...new Set(data.map((d) => d.row))];
    const uniqueCols = [...new Set(data.map((d) => d.col))];

    // Build series: each row is a series
    const seriesData = uniqueRows.map((row) => ({
      name: row,
      data: uniqueCols.map((col) => {
        const point = data.find((d) => d.row === row && d.col === col);
        return point ? point.value : 0;
      }),
    }));

    return { series: seriesData, categories: uniqueCols };
  }, [data]);

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "heatmap",
        animations: {
          enabled: animate,
          speed: 600,
          dynamicAnimation: { enabled: true, speed: 400 },
        },
        toolbar: { show: false },
        fontFamily: typography.fontFamily,
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: `${Math.max(typography.fontSize - 2, 10)}px`,
          fontFamily: typography.fontFamily,
          colors: ["#fff"],
        },
      },
      colors: [colors[0] || maxColor],
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          colorScale: {
            ranges: [
              {
                from: -Infinity,
                to: 0,
                color: minColor,
                name: "Low",
              },
              {
                from: 0,
                to: Infinity,
                color: colors[0] || maxColor,
                name: "High",
              },
            ],
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
        categories,
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
        },
      },
      grid: {
        show: showGrid,
        borderColor: "#e8ebf2",
        strokeDashArray: 4,
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: `${typography.fontSize}px`,
          fontFamily: typography.fontFamily,
        },
      },
    }),
    [
      colors,
      showLegend,
      showGrid,
      animate,
      categories,
      minColor,
      maxColor,
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
              type="heatmap"
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

export default HeatmapChart;
