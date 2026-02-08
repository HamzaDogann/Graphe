/**
 * Supported Chart Types
 * Add new chart types here when creating new CustomChart components.
 * This array is used in:
 * - AI prompt generation (tells AI which charts are available)
 * - ChartRenderer component (switch-case rendering)
 * - Type definitions
 */

export const SUPPORTED_CHART_TYPES = [
  "pie",
  "bar",
  "line",
  "table",
] as const;

// Type derived from the array
export type ChartType = (typeof SUPPORTED_CHART_TYPES)[number];

// Chart type metadata for UI display
export const CHART_TYPE_INFO: Record<ChartType, { label: string; description: string; icon: string }> = {
  pie: {
    label: "Pie Chart",
    description: "Shows proportional distribution of categories",
    icon: "pie-chart",
  },
  bar: {
    label: "Bar Chart",
    description: "Compares values across categories",
    icon: "bar-chart",
  },
  line: {
    label: "Line Chart",
    description: "Shows trends over time or continuous data",
    icon: "trending-up",
  },
  table: {
    label: "Data Table",
    description: "Displays raw or aggregated data in tabular format",
    icon: "table",
  },
};

// Aggregation operations supported
export const AGGREGATION_OPERATIONS = [
  "count",
  "sum",
  "avg",
  "min",
  "max",
] as const;

export type AggregationOperation = (typeof AGGREGATION_OPERATIONS)[number];

// Filter operators
export const FILTER_OPERATORS = [
  "eq",     // equals
  "neq",    // not equals
  "gt",     // greater than
  "lt",     // less than
  "gte",    // greater than or equal
  "lte",    // less than or equal
  "contains",
] as const;

export type FilterOperator = (typeof FILTER_OPERATORS)[number];
