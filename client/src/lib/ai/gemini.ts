/**
 * Gemini AI Provider
 * 
 * Implementation of AIProvider interface for Google Gemini.
 * Uses gemini-3-flash-preview for fast, low-quota operations.
 */

import { GoogleGenAI } from "@google/genai";
import { AIProvider, AIProviderConfig, ChartGenerationRequest, ChartGenerationResponse } from "./types";
import { generateChartPrompt, parseAIResponse } from "@/lib/chartPromptGenerator";

// Default model - fast and low quota usage
const DEFAULT_MODEL = "gemini-2.0-flash";

/**
 * Create Gemini AI Provider
 */
export const createGeminiProvider = (config: AIProviderConfig): AIProvider => {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const modelName = config.model || DEFAULT_MODEL;

  return {
    name: "Gemini",
    
    generateChartConfig: async (request: ChartGenerationRequest): Promise<ChartGenerationResponse> => {
      try {
        // Generate the prompt
        const prompt = generateChartPrompt(request.userPrompt, request.dataSchema);
        
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: config.temperature ?? 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: config.maxTokens ?? 1024,
          },
        });

        const text = response.text || "";
        
        // Parse the response
        const parsed = parseAIResponse(text);
        
        // Get usage metadata if available
        const usageMetadata = response.usageMetadata;
        
        return {
          ...parsed,
          usage: usageMetadata ? {
            promptTokens: usageMetadata.promptTokenCount,
            completionTokens: usageMetadata.candidatesTokenCount,
            totalTokens: usageMetadata.totalTokenCount,
          } : undefined,
        };
      } catch (error) {
        console.error("Gemini API error:", error);
        
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate chart configuration",
        };
      }
    },
  };
};
