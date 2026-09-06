import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[CivicSolve AI] Warning: GEMINI_API_KEY is not defined. Server AI features will operate with fallback mode or informative guidance.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Fallback ladder as required by Production Directives
const MODEL_LADDER = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

export async function generateContentWithFallback(
  params: Omit<GenerateContentParameters, "model"> & { preferredModel?: string }
): Promise<{ text: string; modelUsed: string }> {
  const ai = getGeminiClient();
  const modelsToTry = params.preferredModel 
    ? [params.preferredModel, ...MODEL_LADDER.filter(m => m !== params.preferredModel)]
    : MODEL_LADDER;

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        ...params,
        model,
      });

      const text = response.text || "";
      if (text.trim().length > 0) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errorMessage = String(err?.message || err);
      console.warn(`[Gemini Fallback] Model ${model} encountered issue: ${errorMessage}. Trying next model...`);
      // Catch recoverable HTTP/API status codes: 503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED, 404 NOT_FOUND, 500 INTERNAL
      const isRecoverable = 
        errorMessage.includes("503") ||
        errorMessage.includes("429") ||
        errorMessage.includes("404") ||
        errorMessage.includes("500") ||
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("NOT_FOUND");
      
      if (!isRecoverable && !errorMessage.includes("API key")) {
        // If it's a general syntax or timeout, continue to try next model in fallback ladder
      }
    }
  }

  throw new Error(`All Gemini models in fallback ladder failed. Root cause: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

export function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code fence ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
}
