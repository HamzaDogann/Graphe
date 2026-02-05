"use client";

import {
  CustomBarChart,
  CustomPieChart,
  CustomLineChart,
  TableView,
} from "@/components/Charts";
import {
  processChartData,
  type ChartConfig,
  type ProcessedDataPoint,
} from "@/lib/dataProcessor";
import { useDatasetStore } from "@/store/useDatasetStore";
import styles from "./ChartFactory.module.scss";

interface ChartFactoryProps {
  config: ChartConfig;
}

export const ChartFactory = ({ config }: ChartFactoryProps) => {
  const { parsedData } = useDatasetStore();

  // Get raw data from store
  const rawData = parsedData?.rows || [];

  if (!rawData || rawData.length === 0) {
    return (
      <div className={styles.errorState}>
        <p>No data available. Please upload a dataset first.</p>
      </div>
    );
  }

  // Process data based on config
  let chartData: ProcessedDataPoint[] = [];
  let headers: string[] = [];

  if (config.chartType === "table") {
    // For table, use all columns and rows
    headers = parsedData?.headers || Object.keys(rawData[0] || {});
  } else {
    // For charts, process and aggregate data
    chartData = processChartData(rawData, config);

    if (chartData.length === 0) {
      return (
        <div className={styles.errorState}>
          <p>No data matches the filter criteria.</p>
        </div>
      );
    }
  }

  // Render appropriate chart component
  switch (config.chartType) {
    case "bar":
      return <CustomBarChart data={chartData} title={config.title} />;
    case "pie":
      return <CustomPieChart data={chartData} title={config.title} />;
    case "line":
      return <CustomLineChart data={chartData} title={config.title} />;
    case "table":
      return (
        <TableView headers={headers} rows={rawData} title={config.title} />
      );
    default:
      return (
        <div className={styles.errorState}>
          <p>Unsupported chart type: {config.chartType}</p>
        </div>
      );
  }
};
