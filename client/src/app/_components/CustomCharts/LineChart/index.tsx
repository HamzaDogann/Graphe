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
import { LineChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./LineChart.module.scss";

// Dynamic import for ApexCharts (SSR disabled)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const LineChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = true,
  showLabels = true,
  animate = true,
  showDots = true,
  showGrid = true,
  curved = true,
  fillArea = false,
  onDataPointClick,
  onStylingChange,
  initialTypography,
}: LineChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<string[]>(() => [
    colorScheme[0] || COLOR_PALETTES.default[0],
  ]);
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
      setColors([colorScheme[0] || COLOR_PALETTES.default[0]]);
    }
  }, [colorScheme]);

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

  // ApexCharts options
  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: fillArea ? "area" : "line",
        animations: {
          enabled: animate,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        events: {
          dataPointSelection: (_event, _chartContext, config) => {
            if (onDataPointClick && config.dataPointIndex !== undefined) {
              onDataPointClick(data[config.dataPointIndex]);
            }
          },
        },
        fontFamily: typography.fontFamily,
        dropShadow: {
          enabled: true,
          color: colors[0],
          top: 12,
          left: 0,
          blur: 10,
          opacity: 0.15,
        },
      },
      colors: colors,
      stroke: {
        curve: curved ? "smooth" : "straight",
        width: 3,
        lineCap: "round",
      },
      fill: {
        type: fillArea ? "gradient" : "solid",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      markers: {
        size: showDots ? 6 : 0,
        colors: ["#fff"],
        strokeColors: colors,
        strokeWidth: 3,
        hover: {
          size: 8,
          sizeOffset: 3,
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
          rotate: -45,
          rotateAlways: categories.length > 8,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
          stroke: {
            color: colors[0],
            width: 1,
            dashArray: 3,
          },
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
            return val.toFixed(0);
          },
        },
      },
      grid: {
        show: showGrid,
        borderColor: "#e8ebf2",
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
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
        marker: {
          show: true,
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            markers: {
              size: showDots ? 4 : 0,
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
      showDots,
      showGrid,
      animate,
      curved,
      fillArea,
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
      const finalColors = [newColors[0] || COLOR_PALETTES.default[0]];
      setColors(finalColors);
      // Notify parent of styling change
      onStylingChange?.({ colors: finalColors });
    },
    [onStylingChange],
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

        {/* ApexCharts Line/Area */}
        <div className={styles.chartBody}>
          <Chart
            options={options}
            series={series}
            type={fillArea ? "area" : "line"}
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
        colorCount={1}
        currentTypography={typography}
        orientation="vertical"
      />
    </div>
  );
};
