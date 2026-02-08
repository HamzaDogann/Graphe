/**
 * Chart Generation API Route
 * 
 * POST /api/chart/generate
 * 
 * Generates chart configuration using AI based on user prompt and dataset.
 * Keeps API keys secure on server side.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generateChartPrompt, parseAIResponse } from "@/lib/chartPromptGenerator";
import { DataSchema } from "@/types/chart";

// Model configuration - Use gemini-3-flash-preview (latest fast model)
const MODEL_NAME = "gemini-3-flash-preview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPrompt, dataSchema } = body as {
      userPrompt: string;
      dataSchema: DataSchema;
    };

    // Validate request
    if (!userPrompt || !dataSchema) {
      return NextResponse.json(
        { success: false, error: "Missing userPrompt or dataSchema" },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not configured");
      return NextResponse.json(
        { success: false, error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Initialize Gemini with new SDK
    const ai = new GoogleGenAI({ apiKey });

    // Generate prompt
    const prompt = generateChartPrompt(userPrompt, dataSchema);

    // Call Gemini
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text || "";

    // Parse response
    const parsed = parseAIResponse(text);

    // Return result
    return NextResponse.json({
      ...parsed,
      usage: response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            completionTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
          }
        : undefined,
    });
  } catch (error) {
    console.error("Chart generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate chart",
      },
      { status: 500 }
    );
  }
}
