"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { ChartActions } from "../ChartActions";
import { COLOR_PALETTES } from "../ChartActions/constants";
import { TypographySettings } from "../ChartActions/types";
import { DEFAULT_TYPOGRAPHY } from "../ChartActions/constants";
import { TreemapChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./TreemapChart.module.scss";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const TreemapChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = false,
  animate = true,
  showValues = true,
  distributed = true,
  onStylingChange,
  initialTypography,
  chartInfo,
  isFavorite = false,
  isSaving = false,
  onToggleFavorite,
  hideSaveButton = false,
}: TreemapChartProps) => {
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

  // Build treemap series from data
  const series = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return [
      {
        data: data.map((d, i) => ({
          x: d.label,
          y: d.value,
          fillColor: distributed ? colors[i % colors.length] : undefined,
        })),
      },
    ];
  }, [data, colors, distributed]);

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "treemap",
        animations: {
          enabled: animate,
          speed: 600,
          dynamicAnimation: { enabled: true, speed: 400 },
        },
        toolbar: { show: false },
        fontFamily: typography.fontFamily,
      },
      colors: distributed ? colors : [colors[0]],
      legend: {
        show: showLegend,
        position: "bottom",
        fontSize: `${typography.fontSize}px`,
        fontWeight: typography.isBold ? 700 : 500,
        fontFamily: typography.fontFamily,
        labels: { colors: typography.color },
      },
      dataLabels: {
        enabled: showValues,
        style: {
          fontSize: `${typography.fontSize}px`,
          fontFamily: typography.fontFamily,
          fontWeight: typography.isBold ? 700 : 500,
        },
        formatter: (text: string, opts: any) => {
          const val = opts.value;
          if (val >= 1000000)
            return [`${text}`, `${(val / 1000000).toFixed(1)}M`];
          if (val >= 1000) return [`${text}`, `${(val / 1000).toFixed(1)}K`];
          return [`${text}`, val.toLocaleString()];
        },
        offsetY: -4,
      },
      plotOptions: {
        treemap: {
          distributed,
          enableShades: !distributed,
          shadeIntensity: 0.5,
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
    [colors, showLegend, showValues, animate, distributed, typography],
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
              type="treemap"
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

export default TreemapChart;
