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
  chartType: string;
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

// ===== SPECIALIZED CHART DATA PROCESSORS =====

/**
 * Process data for heatmap chart
 * Returns array of {row, col, value}
 */
export interface HeatmapDataPoint {
  row: string;
  col: string;
  value: number;
}

export const processHeatmapData = (
  rawData: any[],
  rowColumn: string,
  colColumn: string,
  metricColumn: string | null,
  operation: AggregationOperation = "sum",
  filters?: ChartFilter[]
): HeatmapDataPoint[] => {
  let data = applyFilters(rawData, filters || []);
  
  // Group by row + col combination
  const groups: Record<string, number[]> = {};
  
  data.forEach((row) => {
    const rowKey = String(row[rowColumn] || "Unknown");
    const colKey = String(row[colColumn] || "Unknown");
    const groupKey = `${rowKey}|||${colKey}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    if (operation === "count") {
      groups[groupKey].push(1);
    } else if (metricColumn) {
      const value = Number(row[metricColumn]);
      if (!isNaN(value)) {
        groups[groupKey].push(value);
      }
    }
  });
  
  // Aggregate
  return Object.entries(groups).map(([key, values]) => {
    const [rowKey, colKey] = key.split("|||");
    let aggregatedValue = 0;
    
    switch (operation) {
      case "count":
        aggregatedValue = values.length;
        break;
      case "sum":
        aggregatedValue = values.reduce((s, v) => s + v, 0);
        break;
      case "avg":
        aggregatedValue = values.reduce((s, v) => s + v, 0) / values.length;
        break;
      case "min":
        aggregatedValue = Math.min(...values);
        break;
      case "max":
        aggregatedValue = Math.max(...values);
        break;
    }
    
    return {
      row: rowKey,
      col: colKey,
      value: Math.round(aggregatedValue * 100) / 100
    };
  });
};

/**
 * Process data for radar chart
 * Returns array of {name, indicators: {indicator: value}}
 */
export interface RadarDataPoint {
  name: string;
  indicators: Record<string, number>;
}

export const processRadarData = (
  rawData: any[],
  groupByColumn: string,
  radarIndicators: string[],
  operation: AggregationOperation = "avg",
  filters?: ChartFilter[]
): RadarDataPoint[] => {
  let data = applyFilters(rawData, filters || []);
  
  // Group by category
  const groups: Record<string, any[]> = {};
  
  data.forEach((row) => {
    const groupKey = String(row[groupByColumn] || "Unknown");
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(row);
  });
  
  // Aggregate each indicator per group
  return Object.entries(groups).map(([name, rows]) => {
    const indicators: Record<string, number> = {};
    
    radarIndicators.forEach((indicator) => {
      const values = rows
        .map((r) => Number(r[indicator]))
        .filter((v) => !isNaN(v));
      
      let aggregatedValue = 0;
      if (values.length > 0) {
        switch (operation) {
          case "count":
            aggregatedValue = values.length;
            break;
          case "sum":
            aggregatedValue = values.reduce((s, v) => s + v, 0);
            break;
          case "avg":
            aggregatedValue = values.reduce((s, v) => s + v, 0) / values.length;
            break;
          case "min":
            aggregatedValue = Math.min(...values);
            break;
          case "max":
            aggregatedValue = Math.max(...values);
            break;
        }
      }
      indicators[indicator] = Math.round(aggregatedValue * 100) / 100;
    });
    
    return { name, indicators };
  });
};

/**
 * Process data for histogram chart
 * Returns raw numeric values to be binned by the component
 */
export const processHistogramData = (
  rawData: any[],
  metricColumn: string,
  filters?: ChartFilter[]
): number[] => {
  let data = applyFilters(rawData, filters || []);
  
  return data
    .map((row) => Number(row[metricColumn]))
    .filter((v) => !isNaN(v));
};

/**
 * Process data for boxplot chart
 * Returns array of {name, min, q1, median, q3, max}
 */
export interface BoxPlotDataPoint {
  name: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

const calculateQuartiles = (values: number[]): { min: number; q1: number; median: number; q3: number; max: number } => {
  if (values.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  const getPercentile = (arr: number[], p: number): number => {
    const index = (p / 100) * (arr.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return arr[lower] * (1 - weight) + arr[upper] * weight;
  };
  
  return {
    min: sorted[0],
    q1: getPercentile(sorted, 25),
    median: getPercentile(sorted, 50),
    q3: getPercentile(sorted, 75),
    max: sorted[n - 1]
  };
};

export const processBoxPlotData = (
  rawData: any[],
  metricColumn: string,
  groupByColumn?: string | null,
  filters?: ChartFilter[]
): BoxPlotDataPoint[] => {
  let data = applyFilters(rawData, filters || []);
  
  if (!groupByColumn) {
    // Single boxplot for all data
    const values = data
      .map((row) => Number(row[metricColumn]))
      .filter((v) => !isNaN(v));
    
    const quartiles = calculateQuartiles(values);
    return [{ name: metricColumn, ...quartiles }];
  }
  
  // Multiple boxplots, one per group
  const groups: Record<string, number[]> = {};
  
  data.forEach((row) => {
    const groupKey = String(row[groupByColumn] || "Unknown");
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    const value = Number(row[metricColumn]);
    if (!isNaN(value)) {
      groups[groupKey].push(value);
    }
  });
  
  return Object.entries(groups).map(([name, values]) => {
    const quartiles = calculateQuartiles(values);
    return { name, ...quartiles };
  });
};

/**
 * Process data for bubble chart
 * Returns array of {x, y, z, name?}
 */
export interface BubbleDataPoint {
  x: number;
  y: number;
  z: number;
  name?: string;
}

export const processBubbleData = (
  rawData: any[],
  xColumn: string,
  yColumn: string,
  sizeColumn: string,
  nameColumn?: string,
  filters?: ChartFilter[]
): BubbleDataPoint[] => {
  let data = applyFilters(rawData, filters || []);
  
  return data
    .map((row) => {
      const x = Number(row[xColumn]);
      const y = Number(row[yColumn]);
      const z = Number(row[sizeColumn]);
      
      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        return null;
      }
      
      const point: BubbleDataPoint = { x, y, z };
      if (nameColumn) {
        point.name = String(row[nameColumn] || "");
      }
      return point;
    })
    .filter((p): p is BubbleDataPoint => p !== null);
};

/**
 * Process data for funnel chart
 * Same as regular groupAndAggregate but sorted descending
 */
export const processFunnelData = (
  rawData: any[],
  groupByColumn: string,
  metricColumn: string | null,
  operation: AggregationOperation = "sum",
  filters?: ChartFilter[]
): ProcessedDataPoint[] => {
  let data = applyFilters(rawData, filters || []);
  
  const chartData = groupAndAggregate(
    data,
    groupByColumn,
    operation,
    metricColumn
  );
  
  // Sort by value descending (largest at top of funnel)
  return chartData.sort((a, b) => b.value - a.value);
};
