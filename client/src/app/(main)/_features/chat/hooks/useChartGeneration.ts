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

// Hook return type
interface UseChartGenerationReturn {
  generateChart: (userPrompt: string) => Promise<ChartRenderData | null>;
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
    async (userPrompt: string): Promise<ChartRenderData | null> => {
      // Validate
      if (!userPrompt.trim()) {
        setError("Please enter a prompt");
        return null;
      }

      if (!parsedData || !parsedData.rows || parsedData.rows.length === 0) {
        setError("No dataset loaded. Please upload a dataset first.");
        return null;
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
          throw new Error(result.error || "Failed to generate chart configuration");
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

        return renderData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Chart generation error:", err);
        return null;
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
