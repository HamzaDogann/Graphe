/**
 * Mock AI Service for Chart Configuration Generation
 * This simulates AI-powered chart config generation without backend
 */

import type { ChartConfig } from "./dataProcessor";

interface MockAIRequest {
  userPrompt: string;
  dataSchema: {
    columns: string[];
    sample: any[];
  };
  supportedCharts: string[];
}

/**
 * Simple keyword-based chart type detection
 */
const detectChartType = (prompt: string, supportedCharts: string[]): string => {
  const lowerPrompt = prompt.toLowerCase();

  // Pie chart keywords
  if (
    lowerPrompt.includes("distribution") ||
    lowerPrompt.includes("breakdown") ||
    lowerPrompt.includes("percentage") ||
    lowerPrompt.includes("proportion") ||
    lowerPrompt.includes("pie")
  ) {
    return "pie";
  }

  // Line chart keywords
  if (
    lowerPrompt.includes("trend") ||
    lowerPrompt.includes("over time") ||
    lowerPrompt.includes("timeline") ||
    lowerPrompt.includes("progression") ||
    lowerPrompt.includes("line")
  ) {
    return "line";
  }

  // Table keywords
  if (
    lowerPrompt.includes("table") ||
    lowerPrompt.includes("list") ||
    lowerPrompt.includes("show all") ||
    lowerPrompt.includes("raw data")
  ) {
    return "table";
  }

  // Default to bar chart
  return "bar";
};

/**
 * Extract groupBy column from prompt
 */
const detectGroupBy = (prompt: string, columns: string[]): string | null => {
  const lowerPrompt = prompt.toLowerCase();

  // Check if any column name is mentioned
  for (const column of columns) {
    if (lowerPrompt.includes(column.toLowerCase())) {
      return column;
    }
  }

  // Common grouping keywords
  if (lowerPrompt.includes("by city")) return "City";
  if (lowerPrompt.includes("by category")) return "Category";
  if (lowerPrompt.includes("by region")) return "Region";
  if (lowerPrompt.includes("by country")) return "Country";
  if (lowerPrompt.includes("by product")) return "Product";
  if (lowerPrompt.includes("by department")) return "Department";

  // Default to first categorical column
  return columns[0] || null;
};

/**
 * Extract aggregation operation
 */
const detectOperation = (prompt: string): "count" | "sum" | "avg" => {
  const lowerPrompt = prompt.toLowerCase();

  if (
    lowerPrompt.includes("total") ||
    lowerPrompt.includes("sum") ||
    lowerPrompt.includes("combined")
  ) {
    return "sum";
  }

  if (
    lowerPrompt.includes("average") ||
    lowerPrompt.includes("avg") ||
    lowerPrompt.includes("mean")
  ) {
    return "avg";
  }

  // Default to count
  return "count";
};

/**
 * Detect metric column (numeric column for aggregation)
 */
const detectMetricColumn = (
  prompt: string,
  columns: string[],
  sample: any[]
): string | null => {
  const lowerPrompt = prompt.toLowerCase();

  // Check if specific column mentioned
  for (const column of columns) {
    if (lowerPrompt.includes(column.toLowerCase())) {
      // Check if it's numeric
      const sampleValue = sample[0]?.[column];
      if (typeof sampleValue === "number") {
        return column;
      }
    }
  }

  // Find first numeric column
  if (sample.length > 0) {
    for (const column of columns) {
      const value = sample[0][column];
      if (typeof value === "number") {
        return column;
      }
    }
  }

  return null;
};

/**
 * Generate chart title from prompt
 */
const generateTitle = (
  prompt: string,
  groupBy: string | null,
  operation: string
): string => {
  // Try to extract meaningful title from prompt
  const cleaned = prompt.trim();

  // If prompt is clear enough, capitalize it
  if (cleaned.length < 100) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Generate generic title
  if (groupBy) {
    return `${operation.charAt(0).toUpperCase() + operation.slice(1)} by ${groupBy}`;
  }

  return "Chart";
};

/**
 * Mock AI Service - Simulates Gemini API
 */
export const generateChartConfig = async (
  request: MockAIRequest
): Promise<ChartConfig> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { userPrompt, dataSchema, supportedCharts } = request;
  const { columns, sample } = dataSchema;

  // Detect chart configuration from prompt
  const chartType = detectChartType(userPrompt, supportedCharts) as any;
  const groupBy = detectGroupBy(userPrompt, columns);
  const operation = detectOperation(userPrompt);
  const metricColumn = detectMetricColumn(userPrompt, columns, sample);
  const title = generateTitle(userPrompt, groupBy, operation);

  const config: ChartConfig = {
    chartType,
    title,
    filters: [], // For now, no filters - can be extended
    groupBy,
    operation,
    metricColumn,
  };

  console.log("🤖 Mock AI Generated Config:", config);

  return config;
};
