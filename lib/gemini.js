import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Get a configured Gemini AI client and model
 * @throws {Error} If GEMINI_API_KEY is not set
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please add it to your .env.local file. " +
      "Get your API key from: https://makersuite.google.com/app/apikey"
    );
  }

  if (apiKey.trim() === "") {
    throw new Error(
      "GEMINI_API_KEY is empty. Please set a valid API key in your .env.local file."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Allow model name to be configured via environment variable
  // Default to gemini-1.5-flash, but you can override with GEMINI_MODEL env var
  // Common working models to try:
  // - "gemini-1.5-flash" (original)
  // - "gemini-pro" 
  // - "gemini-1.5-pro"
  // - "gemini-1.5-flash-latest"
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  return { genAI, model };
}

