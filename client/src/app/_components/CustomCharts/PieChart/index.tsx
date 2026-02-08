"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { toPng } from "html-to-image";
import {
  ChartActions,
  COLOR_PALETTES,
  TypographySettings,
} from "../ChartActions";
import { PieChartProps, DEFAULT_CHART_COLORS } from "@/types/chart";
import styles from "./PieChart.module.scss";

// Dynamic import for ApexCharts (SSR disabled)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const PieChart = ({
  data,
  title = "Chart",
  description,
  width = "100%",
  height = 350,
  colorScheme = DEFAULT_CHART_COLORS,
  showLegend = true,
  showLabels = true,
  animate = true,
  innerRadius = 55,
  showPercentage = true,
  onDataPointClick,
}: PieChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<string[]>(
    colorScheme.length >= data.length
      ? colorScheme.slice(0, data.length)
      : [...colorScheme, ...COLOR_PALETTES.default].slice(0, data.length),
  );
  const [typography, setTypography] = useState<TypographySettings>({
    fontSize: 14,
    color: "#323039",
    isBold: false,
    isItalic: false,
    isUnderline: false,
  });

  // Extract series and labels from data
  const series = useMemo(() => data.map((d) => d.value), [data]);
  const labels = useMemo(() => data.map((d) => d.label), [data]);

  // ApexCharts options
  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        animations: {
          enabled: animate,
          dynamicAnimation: {
            enabled: true,
            speed: 500,
          },
        },
        events: {
          dataPointSelection: (_event, _chartContext, config) => {
            if (onDataPointClick && config.dataPointIndex !== undefined) {
              onDataPointClick(data[config.dataPointIndex]);
            }
          },
        },
        fontFamily: "inherit",
      },
      colors: colors,
      labels: labels,
      legend: {
        show: showLegend,
        position: "right",
        fontSize: "13px",
        fontWeight: 500,
        markers: {
          size: 6,
          strokeWidth: 0,
        },
        itemMargin: {
          horizontal: 8,
          vertical: 6,
        },
        formatter: (
          legendName: string,
          opts?: { seriesIndex: number; w: { globals: { series: number[] } } },
        ) => {
          if (showPercentage && opts) {
            const total = opts.w.globals.series.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const value = opts.w.globals.series[opts.seriesIndex];
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${legendName} (${percentage}%)`;
          }
          return legendName;
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: `${innerRadius}%`,
            labels: {
              show: showLabels,
              name: {
                show: true,
                fontSize: "16px",
                fontWeight: 600,
                color: "#323039",
              },
              value: {
                show: true,
                fontSize: "24px",
                fontWeight: 700,
                color: "#323039",
                formatter: (val: string) => Number(val).toLocaleString(),
              },
              total: {
                show: true,
                showAlways: true,
                label: "Total",
                fontSize: "14px",
                fontWeight: 600,
                color: "#6b7280",
                formatter: (w: { globals: { seriesTotals: number[] } }) => {
                  return w.globals.seriesTotals
                    .reduce((a: number, b: number) => a + b, 0)
                    .toLocaleString();
                },
              },
            },
          },
          expandOnClick: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["#fff"],
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => val.toLocaleString(),
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    }),
    [
      colors,
      labels,
      showLegend,
      showLabels,
      showPercentage,
      animate,
      innerRadius,
      data,
      onDataPointClick,
    ],
  );

  // Screenshot handler with SVG filter
  const handleScreenshot = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => {
          // Filter out any elements that might cause issues
          const exclusionClasses = [
            "apexcharts-tooltip",
            "apexcharts-xaxistooltip",
          ];
          return !exclusionClasses.some((cls) => node.classList?.contains(cls));
        },
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "_")}_chart.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to capture chart:", error);
    }
  }, [title]);

  // Typography change handler
  const handleTypographyChange = useCallback((settings: TypographySettings) => {
    setTypography(settings);
  }, []);

  // Color change handler
  const handleColorChange = useCallback(
    (newColors: string[]) => {
      // Ensure we have enough colors
      const extendedColors = [...newColors];
      while (extendedColors.length < data.length) {
        extendedColors.push(
          COLOR_PALETTES.default[
            extendedColors.length % COLOR_PALETTES.default.length
          ],
        );
      }
      setColors(extendedColors.slice(0, data.length));
    },
    [data.length],
  );

  // Save handler
  const handleSave = useCallback(() => {
    console.log("Save chart:", title);
    // TODO: Implement save to user's bookmarks
  }, [title]);

  // Compute title styles based on typography
  const titleStyle = useMemo(
    () => ({
      fontSize: `${typography.fontSize + 4}px`,
      color: typography.color,
      fontWeight: typography.isBold ? 700 : 600,
      fontStyle: typography.isItalic ? "italic" : "normal",
      textDecoration: typography.isUnderline ? "underline" : "none",
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
          <p
            className={styles.chartDescription}
            style={{
              color: typography.color,
              fontStyle: typography.isItalic ? "italic" : "normal",
            }}
          >
            {description}
          </p>
        )}

        {/* ApexCharts Pie/Donut */}
        <div className={styles.chartBody}>
          <Chart
            options={options}
            series={series}
            type="donut"
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
