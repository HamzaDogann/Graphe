"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import {
  ChartActions,
  COLOR_PALETTES,
  TypographySettings,
  DEFAULT_TYPOGRAPHY,
} from "../ChartActions";
import { BarChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./BarChart.module.scss";

// Dynamic import for ApexCharts (SSR disabled)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Helper to compute initial colors
const computeColors = (colorScheme: string[], dataLength: number): string[] => {
  if (colorScheme.length >= dataLength) {
    return colorScheme.slice(0, dataLength);
  }
  return [...colorScheme, ...COLOR_PALETTES.default].slice(0, dataLength);
};

export const BarChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = false,
  showLabels = true,
  animate = true,
  orientation = "vertical",
  showValues = true,
  onDataPointClick,
  onStylingChange,
  initialTypography,
}: BarChartProps) => {
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

  // Extract series and categories
  const series = useMemo(
    () => [
      {
        name: title,
        data: data.map((d) => d.value),
      },
    ],
    [data, title],
  );

  const categories = useMemo(() => data.map((d) => d.label), [data]);

  const isHorizontal = orientation === "horizontal";

  // ApexCharts options
  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        animations: {
          enabled: animate,
          speed: 600,
          animateGradually: {
            enabled: true,
            delay: 100,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 400,
          },
        },
        toolbar: {
          show: false,
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
      plotOptions: {
        bar: {
          horizontal: isHorizontal,
          borderRadius: 6,
          borderRadiusApplication: "end",
          columnWidth: "60%",
          barHeight: "60%",
          distributed: true,
          dataLabels: {
            position: isHorizontal ? "center" : "top",
          },
        },
      },
      dataLabels: {
        enabled: showValues,
        formatter: (val: number) => {
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
          return val.toLocaleString();
        },
        offsetY: isHorizontal ? 0 : -20,
        style: {
          fontSize: `${typography.fontSize}px`,
          fontWeight: typography.isBold ? 700 : 600,
          fontFamily: typography.fontFamily,
          colors: isHorizontal ? ["#fff"] : [typography.color],
        },
      },
      legend: {
        show: showLegend,
        position: "bottom",
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
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
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
        xaxis: {
          lines: {
            show: isHorizontal,
          },
        },
        yaxis: {
          lines: {
            show: !isHorizontal,
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
      states: {
        hover: {
          filter: {
            type: "darken",
            value: 0.9,
          },
        },
        active: {
          filter: {
            type: "darken",
            value: 0.85,
          },
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "80%",
              },
            },
            xaxis: {
              labels: {
                rotate: -60,
              },
            },
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

        {/* ApexCharts Bar */}
        <div className={styles.chartBody}>
          <Chart
            options={options}
            series={series}
            type="bar"
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
        onSave={handleSave}
        currentColors={colors}
        colorCount={Math.min(data.length, 8)}
        currentTypography={typography}
        orientation="vertical"
      />
    </div>
  );
};
