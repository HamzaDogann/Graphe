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
   - Use "pie" for showing proportional distribution or percentages
   - Use "bar" for comparing values across categories
   - Use "line" for showing trends over time or continuous data
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
  "chartType": "bar" | "pie" | "line" | "table",
  "title": "Descriptive chart title",
  "description": "Brief explanation of what the chart shows",
  "filters": [
    { "column": "ColumnName", "operator": "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains", "value": "value" }
  ],
  "groupBy": "ColumnName" | null,
  "operation": "count" | "sum" | "avg" | "min" | "max" | null,
  "metricColumn": "ColumnName" | null,
  "sortOrder": "asc" | "desc" | null
}

## Examples

User: "Show me sales by city"
Response: {"chartType":"bar","title":"Total Sales by City","description":"Bar chart showing total sales for each city","filters":[],"groupBy":"City","operation":"sum","metricColumn":"Sales","sortOrder":"desc"}

User: "How many customers in each region?"
Response: {"chartType":"pie","title":"Customer Distribution by Region","description":"Pie chart showing customer count per region","filters":[],"groupBy":"Region","operation":"count","metricColumn":null,"sortOrder":null}

User: "Show sales trend over months"
Response: {"chartType":"line","title":"Monthly Sales Trend","description":"Line chart showing sales progression over months","filters":[],"groupBy":"Month","operation":"sum","metricColumn":"Sales","sortOrder":"asc"}

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
  
  // Apply aggregation
  const aggregatedData = aggregateData(
    filteredRows,
    config.groupBy,
    config.operation,
    config.metricColumn,
    config.sortOrder
  );
  
  return aggregatedData;
};
