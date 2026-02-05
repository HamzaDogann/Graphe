/**
 * Data Processing Utilities for Chart Generation
 * Handles filtering, grouping, and aggregation operations
 */

export type FilterOperator = "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains";
export type AggregationOperation = "count" | "sum" | "avg" | "min" | "max";

export interface ChartFilter {
  column: string;
  operator: FilterOperator;
  value: any;
}

export interface ChartConfig {
  chartType: "bar" | "pie" | "line" | "table";
  title?: string;
  filters?: ChartFilter[];
  groupBy?: string | null;
  operation?: AggregationOperation | null;
  metricColumn?: string | null;
}

export interface ProcessedDataPoint {
  name: string;
  value: number;
}

/**
 * Apply filters to raw data
 */
export const applyFilters = (data: any[], filters: ChartFilter[]): any[] => {
  if (!filters || filters.length === 0) return data;

  return data.filter((row) => {
    return filters.every((filter) => {
      const cellValue = row[filter.column];
      const filterValue = filter.value;

      switch (filter.operator) {
        case "eq":
          return cellValue === filterValue;
        case "neq":
          return cellValue !== filterValue;
        case "gt":
          return Number(cellValue) > Number(filterValue);
        case "lt":
          return Number(cellValue) < Number(filterValue);
        case "gte":
          return Number(cellValue) >= Number(filterValue);
        case "lte":
          return Number(cellValue) <= Number(filterValue);
        case "contains":
          return String(cellValue)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
        default:
          return true;
      }
    });
  });
};

/**
 * Group data by a column and perform aggregation
 */
export const groupAndAggregate = (
  data: any[],
  groupByColumn: string | null,
  operation: AggregationOperation | null,
  metricColumn: string | null
): ProcessedDataPoint[] => {
  // If no groupBy, return empty or aggregated total
  if (!groupByColumn) {
    if (operation === "count") {
      return [{ name: "Total", value: data.length }];
    }
    return [];
  }

  const groups: Record<string, number[]> = {};

  // Group data
  data.forEach((row) => {
    const groupKey = String(row[groupByColumn] || "Unknown");
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    if (operation === "count") {
      groups[groupKey].push(1);
    } else if (metricColumn && (operation === "sum" || operation === "avg" || operation === "min" || operation === "max")) {
      const value = Number(row[metricColumn]);
      if (!isNaN(value)) {
        groups[groupKey].push(value);
      }
    }
  });

  // Perform aggregation
  const result: ProcessedDataPoint[] = Object.entries(groups).map(([name, values]) => {
    let aggregatedValue = 0;

    switch (operation) {
      case "count":
        aggregatedValue = values.length;
        break;
      case "sum":
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        break;
      case "avg":
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case "min":
        aggregatedValue = Math.min(...values);
        break;
      case "max":
        aggregatedValue = Math.max(...values);
        break;
      default:
        aggregatedValue = values.length;
    }

    return {
      name,
      value: Math.round(aggregatedValue * 100) / 100, // Round to 2 decimals
    };
  });

  // Sort by value descending
  return result.sort((a, b) => b.value - a.value);
};

/**
 * Main processing function - combines filtering and aggregation
 */
export const processChartData = (
  rawData: any[],
  config: ChartConfig
): ProcessedDataPoint[] => {
  // Step 1: Apply filters
  let processedData = applyFilters(rawData, config.filters || []);

  // Step 2: Group and aggregate
  const chartData = groupAndAggregate(
    processedData,
    config.groupBy || null,
    config.operation || "count",
    config.metricColumn || null
  );

  return chartData;
};

/**
 * Extract data schema (columns and sample row)
 */
export const extractDataSchema = (data: any[]): { columns: string[]; sample: any[] } => {
  if (!data || data.length === 0) {
    return { columns: [], sample: [] };
  }

  const columns = Object.keys(data[0]);
  const sample = [data[0]];

  return { columns, sample };
};
