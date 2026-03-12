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
  "donut",
  "area",
  "stackedbar",
  "scatter",
  "heatmap",
  "radar",
  "treemap",
  "histogram",
  "boxplot",
  "bubble",
  "funnel",
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
  donut: {
    label: "Donut Chart",
    description: "Shows proportional distribution with a hollow center",
    icon: "circle-dot",
  },
  area: {
    label: "Area Chart",
    description: "Shows trends with filled area under the curve",
    icon: "area-chart",
  },
  stackedbar: {
    label: "Stacked Bar Chart",
    description: "Compares category segments stacked in bars",
    icon: "bar-chart-horizontal",
  },
  scatter: {
    label: "Scatter Plot",
    description: "Shows correlation between two numeric variables",
    icon: "scatter-chart",
  },
  heatmap: {
    label: "Heatmap",
    description: "Shows data intensity using color gradients across a matrix",
    icon: "grid",
  },
  radar: {
    label: "Radar Chart",
    description: "Compares multiple variables on a radial axis",
    icon: "activity",
  },
  treemap: {
    label: "Treemap",
    description: "Shows hierarchical data as nested rectangles by size",
    icon: "layout-grid",
  },
  histogram: {
    label: "Histogram",
    description: "Shows frequency distribution of numeric data",
    icon: "bar-chart-2",
  },
  boxplot: {
    label: "Box Plot",
    description: "Shows statistical distribution with quartiles and outliers",
    icon: "box-select",
  },
  bubble: {
    label: "Bubble Chart",
    description: "Scatter plot with a third dimension shown as bubble size",
    icon: "circle",
  },
  funnel: {
    label: "Funnel Chart",
    description: "Shows stages in a sequential process with drop-off rates",
    icon: "filter",
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
