/**
 * AI Chart Prompt Generator
 * 
 * Generates prompts for AI (Gemini) to analyze user requests and dataset
 * to produce chart configuration.
 */

import { SUPPORTED_CHART_TYPES, AGGREGATION_OPERATIONS } from "@/constants/chartTypes";
import { DataSchema, AIChartConfig, AIChartResponse, ChartFilter } from "@/types/chart";
import { ParsedData, ColumnMetadata } from "@/types/dataset";

/**
 * Extract schema from parsed dataset for AI context
 */
export const extractDataSchema = (parsedData: ParsedData): DataSchema => {
  const columns = parsedData.headers || [];
  
  // Build column types map
  const columnTypes: Record<string, string> = {};
  if (parsedData.columns) {
    parsedData.columns.forEach((col: ColumnMetadata) => {
      columnTypes[col.name] = col.type;
    });
  }
  
  // Get sample rows (first 5)
  const sample = (parsedData.rows || []).slice(0, 5);
  
  return {
    columns,
    columnTypes,
    sample,
    rowCount: parsedData.rowCount || parsedData.rows?.length || 0,
  };
};

/**
 * Generate AI prompt for chart configuration
 */
export const generateChartPrompt = (
  userPrompt: string,
  dataSchema: DataSchema,
): string => {
  const supportedCharts = SUPPORTED_CHART_TYPES.join(", ");
  const operations = AGGREGATION_OPERATIONS.join(", ");
  
  return `You are Graphe, an expert data visualization assistant.
Your goal is to analyze the user's request and the provided dataset schema to generate a configuration JSON for creating the best chart or table visualization.

## Dataset Information
- **Total Rows**: ${dataSchema.rowCount}
- **Columns**: ${JSON.stringify(dataSchema.columns)}
- **Column Types**: ${JSON.stringify(dataSchema.columnTypes)}
- **Sample Data** (first 5 rows):
${JSON.stringify(dataSchema.sample, null, 2)}

## User Request
"${userPrompt}"

## Supported Chart Types
${supportedCharts}

## Supported Aggregation Operations
${operations}

## Task Instructions
1. **Identify Chart Type**: Choose the most suitable chart type based on the user's request and data characteristics:
   - Use "pie" for showing proportional distribution or percentages (solid pie)
   - Use "donut" for showing proportional distribution with a hollow center (modern look, same data as pie)
   - Use "bar" for comparing values across categories (single series)
   - Use "stackedbar" for comparing category segments stacked in bars (multiple series per category). You MUST provide "seriesKeys" with the numeric column names to stack.
   - Use "line" for showing trends over time or continuous data
   - Use "area" for showing trends with filled area under the curve (volume emphasis)
   - Use "scatter" for showing correlation between two numeric variables. You MUST provide "xColumn" and "yColumn" with numeric column names.
   - Use "heatmap" for showing intensity/density across two categorical dimensions. You MUST provide "rowColumn", "colColumn", and "metricColumn".
   - Use "radar" for comparing multiple variables/metrics on a radial axis. You MUST provide "radarIndicators" (array of metric column names).
   - Use "treemap" for showing hierarchical data as proportional nested rectangles. Uses groupBy for categories and metricColumn for size.
   - Use "histogram" for showing frequency distribution of a single numeric column. You MUST provide "metricColumn" (numeric) and optionally "binCount".
   - Use "boxplot" for showing statistical distribution (quartiles, median, outliers). You MUST provide "metricColumn" (numeric) and optionally "groupBy" for multiple boxes.
   - Use "bubble" for showing 3-dimensional scatter data (x, y, size). You MUST provide "xColumn", "yColumn", and "sizeColumn".
   - Use "funnel" for showing sequential process stages with drop-off rates. Uses groupBy for stages and metricColumn for values, sorted by value descending.
   - Use "table" for showing raw data or detailed records

2. **Extract Filters**: Identify any filtering conditions mentioned (e.g., "where Gender is Female", "Sales > 10000")

3. **Determine Grouping**: Find the grouping/category column for X-axis or segments (e.g., "by City", "per Category")

4. **Determine Aggregation**: Identify the aggregation operation and metric column:
   - "count" - Count of records (no metricColumn needed, use null)
   - "sum" - Sum of a numeric column
   - "avg" - Average of a numeric column
   - "min" / "max" - Minimum/Maximum of a numeric column

5. **Generate Title**: Create a clear, descriptive title for the chart

## Response Format
You MUST respond with ONLY a valid JSON object. No explanations, no markdown, no surrounding text.

{
  "chartType": "bar" | "pie" | "donut" | "line" | "area" | "stackedbar" | "scatter" | "heatmap" | "radar" | "treemap" | "histogram" | "boxplot" | "bubble" | "funnel" | "table",
  "title": "Descriptive chart title",
  "description": "Brief explanation of what the chart shows",
  "filters": [
    { "column": "ColumnName", "operator": "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains", "value": "value" }
  ],
  "groupBy": "ColumnName" | null,
  "operation": "count" | "sum" | "avg" | "min" | "max" | null,
  "metricColumn": "ColumnName" | null,
  "sortOrder": "asc" | "desc" | null,
  "xColumn": "NumericColumnName" | null,
  "yColumn": "NumericColumnName" | null,
  "sizeColumn": "NumericColumnName" | null,
  "rowColumn": "ColumnName" | null,
  "colColumn": "ColumnName" | null,
  "binCount": number | null,
  "radarIndicators": ["MetricColumn1", "MetricColumn2", ...] | null,
  "seriesKeys": ["Column1", "Column2"] | null
}

## Examples

User: "Show me sales by city"
Response: {"chartType":"bar","title":"Total Sales by City","description":"Bar chart showing total sales for each city","filters":[],"groupBy":"City","operation":"sum","metricColumn":"Sales","sortOrder":"desc","xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":null}

User: "How many customers in each region?"
Response: {"chartType":"donut","title":"Customer Distribution by Region","description":"Donut chart showing customer count per region","filters":[],"groupBy":"Region","operation":"count","metricColumn":null,"sortOrder":null,"xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":null}

User: "Show sales trend over months"
Response: {"chartType":"area","title":"Monthly Sales Trend","description":"Area chart showing sales progression over months","filters":[],"groupBy":"Month","operation":"sum","metricColumn":"Sales","sortOrder":"asc","xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":null}

User: "Correlation between age and salary"
Response: {"chartType":"scatter","title":"Age vs Salary Correlation","description":"Scatter plot showing relationship between age and salary","filters":[],"groupBy":null,"operation":null,"metricColumn":null,"sortOrder":null,"xColumn":"Age","yColumn":"Salary","sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":null}

User: "Compare revenue and expenses by quarter"
Response: {"chartType":"stackedbar","title":"Revenue vs Expenses by Quarter","description":"Stacked bar chart comparing revenue and expenses per quarter","filters":[],"groupBy":"Quarter","operation":null,"metricColumn":null,"sortOrder":null,"xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":["Revenue","Expenses"]}

User: "Show heatmap of sales by region and product category"
Response: {"chartType":"heatmap","title":"Sales Heatmap by Region and Category","description":"Heatmap showing sales intensity across regions and product categories","filters":[],"groupBy":null,"operation":"sum","metricColumn":"Sales","sortOrder":null,"xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":"Region","colColumn":"Category","binCount":null,"radarIndicators":null,"seriesKeys":null}

User: "Compare employee skills across performance, teamwork, communication and leadership"
Response: {"chartType":"radar","title":"Employee Skills Comparison","description":"Radar chart comparing multiple skill metrics","filters":[],"groupBy":"Employee","operation":"avg","metricColumn":null,"sortOrder":null,"xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":["Performance","Teamwork","Communication","Leadership"],"seriesKeys":null}

User: "Show market share breakdown by company as proportional rectangles"
Response: {"chartType":"treemap","title":"Market Share by Company","description":"Treemap showing proportional market share of each company","filters":[],"groupBy":"Company","operation":"sum","metricColumn":"MarketShare","sortOrder":null,"xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":null}

User: "Show distribution of ages"
Response: {"chartType":"histogram","title":"Age Distribution","description":"Histogram showing frequency distribution of ages","filters":[],"groupBy":null,"operation":null,"metricColumn":"Age","sortOrder":null,"xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":10,"radarIndicators":null,"seriesKeys":null}

User: "Show boxplot of salaries by department"
Response: {"chartType":"boxplot","title":"Salary Distribution by Department","description":"Box plot showing salary quartiles and outliers per department","filters":[],"groupBy":"Department","operation":null,"metricColumn":"Salary","sortOrder":null,"xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":null}

User: "Show relationship between experience, salary and performance score"
Response: {"chartType":"bubble","title":"Experience vs Salary vs Performance","description":"Bubble chart showing correlation with bubble size representing performance","filters":[],"groupBy":null,"operation":null,"metricColumn":null,"sortOrder":null,"xColumn":"Experience","yColumn":"Salary","sizeColumn":"PerformanceScore","rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":null}

User: "Show conversion funnel from visitors to purchases"
Response: {"chartType":"funnel","title":"Sales Conversion Funnel","description":"Funnel chart showing conversion rates through sales stages","filters":[],"groupBy":"Stage","operation":"sum","metricColumn":"Count","sortOrder":"desc","xColumn":null,"yColumn":null,"sizeColumn":null,"rowColumn":null,"colColumn":null,"binCount":null,"radarIndicators":null,"seriesKeys":null}

Now generate the JSON for the user's request:`;
};

/**
 * Parse AI response and extract chart config
 */
export const parseAIResponse = (responseText: string): AIChartResponse => {
  try {
    // Try to extract JSON from response
    let jsonStr = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();
    
    // Try to find JSON object in the response
    const jsonStart = jsonStr.indexOf("{");
    const jsonEnd = jsonStr.lastIndexOf("}");
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
    }
    
    // Try to fix common truncation issues
    // Count opening and closing braces
    const openBraces = (jsonStr.match(/{/g) || []).length;
    const closeBraces = (jsonStr.match(/}/g) || []).length;
    
    // If more opening braces, try to close them
    if (openBraces > closeBraces) {
      // Try to fix truncated JSON by closing it
      // First, try to find the last complete key-value pair
      const lastComma = jsonStr.lastIndexOf(",");
      const lastColon = jsonStr.lastIndexOf(":");
      
      if (lastComma > lastColon) {
        // Truncated after a comma, remove it and close
        jsonStr = jsonStr.slice(0, lastComma) + "}".repeat(openBraces - closeBraces);
      } else if (lastColon !== -1) {
        // Truncated in the middle of a value, try to close the string if needed
        const afterColon = jsonStr.slice(lastColon + 1).trim();
        if (afterColon.startsWith('"') && !afterColon.endsWith('"')) {
          // Unterminated string, close it
          jsonStr = jsonStr + '"' + "}".repeat(openBraces - closeBraces);
        } else {
          jsonStr = jsonStr + "}".repeat(openBraces - closeBraces);
        }
      } else {
        jsonStr = jsonStr + "}".repeat(openBraces - closeBraces);
      }
    }
    
    // Parse JSON
    const config = JSON.parse(jsonStr) as AIChartConfig;
    
    // Validate required fields
    if (!config.chartType || !SUPPORTED_CHART_TYPES.includes(config.chartType)) {
      return {
        success: false,
        error: `Invalid or unsupported chart type: ${config.chartType}`,
        rawResponse: responseText,
      };
    }
    
    // Ensure filters is an array
    if (!Array.isArray(config.filters)) {
      config.filters = [];
    }
    
    return {
      success: true,
      config,
      rawResponse: responseText,
    };
  } catch (error) {
    // Provide user-friendly error message for JSON parsing issues
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    let userMessage = "Failed to parse AI response";
    
    if (errorMsg.includes("Unterminated string") || errorMsg.includes("Unexpected end")) {
      userMessage = "AI response was incomplete. Please try again.";
    } else if (errorMsg.includes("Unexpected token")) {
      userMessage = "AI returned an invalid response. Please try again.";
    }
    
    return {
      success: false,
      error: userMessage,
      rawResponse: responseText,
    };
  }
};

/**
 * Apply filters to data
 */
export const applyFilters = (
  rows: Record<string, any>[],
  filters: ChartFilter[]
): Record<string, any>[] => {
  if (!filters || filters.length === 0) return rows;
  
  return rows.filter(row => {
    return filters.every(filter => {
      const value = row[filter.column];
      const filterValue = filter.value;
      
      switch (filter.operator) {
        case "eq":
          return value == filterValue;
        case "neq":
          return value != filterValue;
        case "gt":
          return Number(value) > Number(filterValue);
        case "lt":
          return Number(value) < Number(filterValue);
        case "gte":
          return Number(value) >= Number(filterValue);
        case "lte":
          return Number(value) <= Number(filterValue);
        case "contains":
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        default:
          return true;
      }
    });
  });
};

/**
 * Apply aggregation to grouped data
 */
export const aggregateData = (
  rows: Record<string, any>[],
  groupBy: string | null,
  operation: string | null,
  metricColumn: string | null,
  sortOrder: "asc" | "desc" | null = null
): { label: string; value: number; originalData?: Record<string, any> }[] => {
  if (!groupBy) {
    // No grouping, return raw data or total
    if (operation === "count") {
      return [{ label: "Total", value: rows.length }];
    }
    return rows.map(row => ({
      label: String(Object.values(row)[0] || ""),
      value: Number(row[metricColumn || ""] || 0),
      originalData: row,
    }));
  }
  
  // Group data
  const groups: Record<string, Record<string, any>[]> = {};
  rows.forEach(row => {
    const key = String(row[groupBy] ?? "Unknown");
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  
  // Apply aggregation
  let result = Object.entries(groups).map(([label, groupRows]) => {
    let value = 0;
    
    switch (operation) {
      case "count":
        value = groupRows.length;
        break;
      case "sum":
        value = groupRows.reduce((sum, r) => sum + Number(r[metricColumn!] || 0), 0);
        break;
      case "avg":
        const total = groupRows.reduce((sum, r) => sum + Number(r[metricColumn!] || 0), 0);
        value = groupRows.length > 0 ? total / groupRows.length : 0;
        break;
      case "min":
        value = Math.min(...groupRows.map(r => Number(r[metricColumn!] || 0)));
        break;
      case "max":
        value = Math.max(...groupRows.map(r => Number(r[metricColumn!] || 0)));
        break;
      default:
        value = groupRows.length;
    }
    
    return { label, value };
  });
  
  // Sort if specified
  if (sortOrder) {
    result.sort((a, b) => {
      return sortOrder === "asc" ? a.value - b.value : b.value - a.value;
    });
  }
  
  return result;
};

/**
 * Process complete chart generation from config
 */
export const processChartConfig = (
  config: AIChartConfig,
  parsedData: ParsedData
): { label: string; value: number; originalData?: Record<string, any> }[] => {
  const rows = parsedData.rows || [];
  
  // Apply filters
  const filteredRows = applyFilters(rows, config.filters);

  // Scatter: return raw rows with x/y preserved in originalData
  if (config.chartType === "scatter" && config.xColumn && config.yColumn) {
    return filteredRows.map((row) => ({
      label: String(row[config.groupBy || config.xColumn!] ?? ""),
      value: Number(row[config.yColumn!] || 0),
      originalData: row,
    }));
  }

  // Radar: group by entity and aggregate each indicator into originalData.
  // This is required so each radar axis gets its own value instead of repeating one value.
  if (
    config.chartType === "radar" &&
    config.groupBy &&
    config.radarIndicators &&
    config.radarIndicators.length > 0
  ) {
    const groups: Record<string, Record<string, any>[]> = {};
    filteredRows.forEach((row) => {
      const key = String(row[config.groupBy!] ?? "Unknown");
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    const op = config.operation || "avg";

    return Object.entries(groups).map(([label, groupRows]) => {
      const aggregatedIndicators: Record<string, number> = {};

      for (const indicator of config.radarIndicators!) {
        const values = groupRows
          .map((r) => Number(r[indicator]))
          .filter((v) => !isNaN(v));

        let aggregatedValue = 0;
        if (values.length > 0) {
          switch (op) {
            case "count":
              aggregatedValue = values.length;
              break;
            case "sum":
              aggregatedValue = values.reduce((sum, v) => sum + v, 0);
              break;
            case "avg":
              aggregatedValue =
                values.reduce((sum, v) => sum + v, 0) / values.length;
              break;
            case "min":
              aggregatedValue = Math.min(...values);
              break;
            case "max":
              aggregatedValue = Math.max(...values);
              break;
            default:
              aggregatedValue =
                values.reduce((sum, v) => sum + v, 0) / values.length;
          }
        }

        aggregatedIndicators[indicator] =
          Math.round(aggregatedValue * 100) / 100;
      }

      return {
        label,
        // Keep a representative numeric value for generic chart paths.
        value: aggregatedIndicators[config.radarIndicators![0]] ?? 0,
        originalData: aggregatedIndicators,
      };
    });
  }

  // Stacked bar: group by label column, preserve all series key values in originalData
  if (config.chartType === "stackedbar" && config.seriesKeys && config.seriesKeys.length > 0 && config.groupBy) {
    const groups: Record<string, Record<string, any>[]> = {};
    filteredRows.forEach((row) => {
      const key = String(row[config.groupBy!] ?? "Unknown");
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    return Object.entries(groups).map(([label, groupRows]) => {
      const aggregated: Record<string, any> = {};
      for (const key of config.seriesKeys!) {
        aggregated[key] = groupRows.reduce((sum, r) => sum + Number(r[key] || 0), 0);
      }
      return {
        label,
        value: aggregated[config.seriesKeys![0]] ?? 0,
        originalData: aggregated,
      };
    });
  }
  
  // Default: apply standard aggregation
  const aggregatedData = aggregateData(
    filteredRows,
    config.groupBy,
    config.operation,
    config.metricColumn,
    config.sortOrder
  );
  
  return aggregatedData;
};
