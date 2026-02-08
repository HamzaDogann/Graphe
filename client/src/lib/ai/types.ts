/**
 * AI Provider Types - Model-agnostic interfaces
 * 
 * These types allow swapping AI providers (Gemini, OpenAI, Claude, etc.)
 * without changing the rest of the application.
 */

import { AIChartConfig, DataSchema } from "@/types/chart";

// Configuration for AI provider
export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// Request to generate chart configuration
export interface ChartGenerationRequest {
  userPrompt: string;
  dataSchema: DataSchema;
}

// Response from AI provider
export interface ChartGenerationResponse {
  success: boolean;
  config?: AIChartConfig;
  error?: string;
  rawResponse?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

// Abstract AI Provider interface
export interface AIProvider {
  name: string;
  generateChartConfig: (request: ChartGenerationRequest) => Promise<ChartGenerationResponse>;
}

// Provider factory type
export type AIProviderFactory = (config: AIProviderConfig) => AIProvider;
