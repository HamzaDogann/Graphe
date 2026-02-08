/**
 * AI Provider Factory
 * 
 * Centralized AI provider management.
 * Easy to switch between providers (Gemini, OpenAI, etc.)
 */

export * from "./types";
export { createGeminiProvider } from "./gemini";

import { AIProvider, AIProviderConfig } from "./types";
import { createGeminiProvider } from "./gemini";

// Supported provider types
export type ProviderType = "gemini" | "openai" | "anthropic";

// Get environment-based API key
const getApiKey = (provider: ProviderType): string => {
  switch (provider) {
    case "gemini":
      return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    case "openai":
      return process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
    case "anthropic":
      return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "";
    default:
      return "";
  }
};

// Default provider configuration
const DEFAULT_PROVIDER: ProviderType = "gemini";

// Provider instance cache
let cachedProvider: AIProvider | null = null;
let cachedProviderType: ProviderType | null = null;

/**
 * Create AI provider based on type
 */
export const createAIProvider = (
  type: ProviderType = DEFAULT_PROVIDER,
  config?: Partial<AIProviderConfig>
): AIProvider => {
  const apiKey = config?.apiKey || getApiKey(type);
  
  if (!apiKey) {
    throw new Error(`API key not found for provider: ${type}. Please set the appropriate environment variable.`);
  }
  
  const fullConfig: AIProviderConfig = {
    apiKey,
    ...config,
  };
  
  switch (type) {
    case "gemini":
      return createGeminiProvider(fullConfig);
    
    case "openai":
      // TODO: Implement OpenAI provider
      throw new Error("OpenAI provider not implemented yet");
    
    case "anthropic":
      // TODO: Implement Anthropic provider
      throw new Error("Anthropic provider not implemented yet");
    
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
};

/**
 * Get or create the default AI provider (singleton pattern)
 */
export const getAIProvider = (type: ProviderType = DEFAULT_PROVIDER): AIProvider => {
  if (cachedProvider && cachedProviderType === type) {
    return cachedProvider;
  }
  
  cachedProvider = createAIProvider(type);
  cachedProviderType = type;
  
  return cachedProvider;
};

/**
 * Clear cached provider (useful for testing or switching providers)
 */
export const clearProviderCache = (): void => {
  cachedProvider = null;
  cachedProviderType = null;
};
