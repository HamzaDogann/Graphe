/**
 * Chat & Message Types
 *
 * These types define the structure for the chat system.
 * Messages can be either user prompts or assistant responses (text or chart).
 */

// ===== CHART DATA TYPES =====

/**
 * Processed chart data point - this is what gets saved to database
 * NOT the raw dataset, just the aggregated/rendered values
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  count?: number; // How many rows contributed to this value
  percentage?: number; // For pie charts
}

/**
 * Chart styling configuration
 */
export interface ChartStyling {
  colors: string[];
  typography: {
    fontSize: number;
    fontFamily: string;
    color: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
  };
}

/**
 * Chart configuration from AI
 */
export interface ChartConfig {
  chartType: "pie" | "bar" | "line" | "table";
  title: string;
  groupBy?: string;
  operation?: "sum" | "count" | "avg" | "min" | "max";
  metricColumn?: string;
  filters?: Array<{
    column: string;
    operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains";
    value: unknown;
  }>;
}

/**
 * Complete chart data stored in Message.chartData
 */
export interface StoredChartData {
  type: "pie" | "bar" | "line" | "table";
  title: string;
  data: ChartDataPoint[]; // Processed/aggregated data only
  config: ChartConfig; // How the chart was configured
  styling: ChartStyling; // Visual customization
  tableData?: {
    // For table charts
    headers: string[];
    rows: Record<string, unknown>[];
  };
}

// ===== MESSAGE TYPES =====

export type MessageRole = "user" | "assistant";

/**
 * Base message interface
 */
export interface BaseMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * User message (prompt)
 */
export interface UserMessage extends BaseMessage {
  role: "user";
  content: string;
  chartData?: never;
}

/**
 * Assistant message - can be text or chart
 */
export interface AssistantMessage extends BaseMessage {
  role: "assistant";
  content?: string; // Text response
  chartData?: StoredChartData; // Chart response
}

export type Message = UserMessage | AssistantMessage;

// ===== CHAT TYPES =====

export interface Chat {
  id: string; // Format: c-{nanoid}
  userId: string;
  title: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  messages?: Message[];
}

// ===== API REQUEST/RESPONSE TYPES =====

/**
 * Create a new chat
 */
export interface CreateChatRequest {
  title?: string;
}

export interface CreateChatResponse {
  chat: Chat;
}

/**
 * Get user's chats
 */
export interface GetChatsResponse {
  chats: Chat[];
}

/**
 * Get single chat with messages
 */
export interface GetChatResponse {
  chat: Chat & { messages: Message[] };
}

/**
 * Add message to chat
 */
export interface CreateMessageRequest {
  role: MessageRole;
  content?: string;
  chartData?: StoredChartData;
}

export interface CreateMessageResponse {
  message: Message;
}

/**
 * Update message (for styling changes)
 */
export interface UpdateMessageRequest {
  content?: string;
  chartData?: Partial<StoredChartData>;
}

export interface UpdateMessageResponse {
  message: Message;
}

/**
 * Delete chat
 */
export interface DeleteChatResponse {
  success: boolean;
}

// ===== UTILITY TYPES =====

/**
 * Default styling for new charts
 */
export const DEFAULT_CHART_STYLING: ChartStyling = {
  colors: [
    "#5c85ff",
    "#ff6b6b",
    "#feca57",
    "#48dbfb",
    "#1dd1a1",
    "#a55eea",
    "#fd9644",
    "#26de81",
  ],
  typography: {
    fontSize: 14,
    fontFamily: "inherit",
    color: "#323039",
    isBold: false,
    isItalic: false,
    isUnderline: false,
  },
};

/**
 * Check if a message has chart data
 */
export const isChartMessage = (message: Message): message is AssistantMessage & { chartData: StoredChartData } => {
  return message.role === "assistant" && !!message.chartData;
};

/**
 * Check if a message is text-only
 */
export const isTextMessage = (message: Message): boolean => {
  return !!message.content && !("chartData" in message && message.chartData);
};

// ===== CONVERSION UTILITIES =====

import type { ChartRenderData, AIChartConfig, ChartDataPoint as RenderChartDataPoint } from "./chart";
import type { ChartType } from "@/constants/chartTypes";

/**
 * Convert StoredChartData (from DB) to ChartRenderData (for rendering)
 * This recreates the render format from stored data
 */
export const storedToRenderData = (stored: StoredChartData): ChartRenderData => {
  const aiConfig: AIChartConfig = {
    chartType: stored.type as ChartType,
    title: stored.title,
    description: stored.config?.title || stored.title,
    filters: stored.config?.filters?.map(f => ({
      column: f.column,
      operator: f.operator,
      value: f.value as string | number | boolean,
    })) || [],
    groupBy: stored.config?.groupBy || null,
    operation: stored.config?.operation || null,
    metricColumn: stored.config?.metricColumn || null,
  };

  const processedData: RenderChartDataPoint[] = stored.data.map((point, index) => ({
    label: point.label,
    value: point.value,
    percentage: point.percentage,
    color: stored.styling?.colors?.[index % (stored.styling.colors?.length || 1)],
  }));

  return {
    type: stored.type as ChartType,
    config: aiConfig,
    processedData,
    originalData: [], // Not stored in DB - empty array
  };
};
