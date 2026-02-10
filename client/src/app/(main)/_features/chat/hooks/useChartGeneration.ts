/**
 * useChartGeneration Hook
 * 
 * Handles AI-powered chart generation from user prompts.
 * Abstracts the API call and data processing.
 */

import { useState, useCallback } from "react";
import { useDatasetStore } from "@/store/useDatasetStore";
import { extractDataSchema, processChartConfig } from "@/lib/chartPromptGenerator";
import { AIChartConfig, ChartDataPoint, ChartRenderData } from "@/types/chart";
import { ChartType } from "@/constants/chartTypes";

// API response type
interface GenerateResponse {
  success: boolean;
  config?: AIChartConfig;
  error?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

// Generation result type
interface GenerateResult {
  data: ChartRenderData | null;
  error: string | null;
}

// Hook return type
interface UseChartGenerationReturn {
  generateChart: (userPrompt: string) => Promise<GenerateResult>;
  isGenerating: boolean;
  error: string | null;
  lastConfig: AIChartConfig | null;
  clearError: () => void;
}

export const useChartGeneration = (): UseChartGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<AIChartConfig | null>(null);

  const { parsedData } = useDatasetStore();

  const generateChart = useCallback(
    async (userPrompt: string): Promise<GenerateResult> => {
      // Validate
      if (!userPrompt.trim()) {
        const err = "Please enter a prompt";
        setError(err);
        return { data: null, error: err };
      }

      if (!parsedData || !parsedData.rows || parsedData.rows.length === 0) {
        const err = "No dataset loaded. Please upload a dataset first.";
        setError(err);
        return { data: null, error: err };
      }

      setIsGenerating(true);
      setError(null);

      try {
        // Extract schema from dataset
        const dataSchema = extractDataSchema(parsedData);

        // Call API
        const response = await fetch("/api/chart/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userPrompt,
            dataSchema,
          }),
        });

        const result: GenerateResponse = await response.json();

        if (!result.success || !result.config) {
          // Parse error for better user message
          let errorMessage = result.error || "Failed to generate chart configuration";
          
          // Check for known API errors
          if (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE") || errorMessage.includes("high demand")) {
            errorMessage = "AI service is temporarily busy. Please try again in a few seconds.";
          } else if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
            errorMessage = "Rate limit reached. Please wait a moment and try again.";
          } else if (errorMessage.includes("500") || errorMessage.includes("INTERNAL")) {
            errorMessage = "AI service encountered an error. Please try again.";
          }
          
          throw new Error(errorMessage);
        }

        const config = result.config;
        setLastConfig(config);

        // Process data based on config
        const processedData = processChartConfig(config, parsedData);

        // Convert to ChartDataPoint format
        const chartData: ChartDataPoint[] = processedData.map((item) => ({
          label: item.label,
          value: item.value,
          originalData: item.originalData,
        }));

        // Build render data
        const renderData: ChartRenderData = {
          type: config.chartType as ChartType,
          config,
          processedData: chartData,
          originalData: parsedData.rows || [],
        };

        return { data: renderData, error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Chart generation error:", err);
        return { data: null, error: errorMessage };
      } finally {
        setIsGenerating(false);
      }
    },
    [parsedData]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateChart,
    isGenerating,
    error,
    lastConfig,
    clearError,
  };
};
