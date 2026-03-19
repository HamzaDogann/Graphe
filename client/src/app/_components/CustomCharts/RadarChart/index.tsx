"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { RadarChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./RadarChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const RadarChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = true,
  animate = true,
  indicators,
  showGrid = true,
  fillOpacity = 0.25,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: RadarChartProps) => {
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

  // Build radar series from data
  const { series, categories } = useMemo(() => {
    if (!data || data.length === 0) {
      return { series: [], categories: [] };
    }

    // Use configured indicators when available to keep axis order stable.
    let cats: string[] = [];
    if (indicators && indicators.length > 0) {
      cats = indicators;
    } else {
      const allIndicators = new Set<string>();
      data.forEach((d) => {
        Object.keys(d.indicators).forEach((key) => allIndicators.add(key));
      });
      cats = Array.from(allIndicators).sort();
    }

    // Build series for each person/category
    const radarSeries = data.map((d) => ({
      name: d.name,
      data: cats.map((cat) => d.indicators[cat] ?? 0),
    }));

    return {
      series: radarSeries,
      categories: cats,
    };
  }, [data, indicators]);

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "radar",
        animations: {
          enabled: animate,
          speed: 600,
          dynamicAnimation: { enabled: true, speed: 400 },
        },
        toolbar: { show: false },
        fontFamily: typography.fontFamily,
      },
      colors: colors,
      fill: {
        opacity: fillOpacity,
      },
      stroke: {
        width: 2,
      },
      markers: {
        size: 4,
        strokeWidth: 2,
        strokeColors: "#fff",
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
            colors: Array(categories.length).fill(typography.color),
          },
        },
      },
      yaxis: {
        show: showGrid,
        labels: {
          style: {
            fontSize: `${Math.max(typography.fontSize - 2, 10)}px`,
            fontFamily: typography.fontFamily,
            colors: [typography.color],
          },
          formatter: (val: number) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
            return val.toFixed(0);
          },
        },
      },
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: showGrid ? "#e8ebf2" : "transparent",
            fill: {
              colors: showGrid ? ["#f9fafb", "#ffffff"] : ["transparent"],
            },
          },
        },
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
    }),
    [
      colors,
      showLegend,
      showGrid,
      animate,
      categories,
      fillOpacity,
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
              type="radar"
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

export default RadarChart;
