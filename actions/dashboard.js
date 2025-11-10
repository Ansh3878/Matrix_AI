"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getGeminiClient } from "@/lib/gemini";

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  try {
    const { model } = getGeminiClient();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const raw = JSON.parse(cleanedText);

    // Normalize strings to Prisma enums and coerce numbers
    const demandMap = { high: "HIGH", medium: "MEDIUM", low: "LOW" };
    const outlookMap = { positive: "POSITIVE", neutral: "NEUTRAL", negative: "NEGATIVE" };

    const coerceNumber = (n) => {
      const v = typeof n === "string" ? Number(n) : n;
      return Number.isFinite(v) ? v : null;
    };

    const normalized = {
      salaryRanges: Array.isArray(raw.salaryRanges)
        ? raw.salaryRanges.map((r) => ({
            role: String(r.role ?? ""),
            min: coerceNumber(r.min),
            max: coerceNumber(r.max),
            median: coerceNumber(r.median),
            location: String(r.location ?? ""),
          }))
        : [],
      growthRate: coerceNumber(raw.growthRate),
      demandLevel: demandMap[String(raw.demandLevel ?? "").toLowerCase()] ?? "MEDIUM",
      topSkills: Array.isArray(raw.topSkills) ? raw.topSkills.map(String) : [],
      marketOutlook: outlookMap[String(raw.marketOutlook ?? "").toLowerCase()] ?? "NEUTRAL",
      keyTrends: Array.isArray(raw.keyTrends) ? raw.keyTrends.map(String) : [],
      recommendedSkills: Array.isArray(raw.recommendedSkills)
        ? raw.recommendedSkills.map(String)
        : [],
    };

    return normalized;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    
    // Provide more helpful error messages
    if (error.message?.includes("GEMINI_API_KEY")) {
      throw new Error(
        "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file. " +
        "Get your API key from: https://makersuite.google.com/app/apikey"
      );
    }
    
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("401")) {
      throw new Error(
        "Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local file."
      );
    }
    
    if (error.message?.includes("404") || error.message?.includes("not found") || error.message?.includes("not supported")) {
      throw new Error(
        "Gemini model not found. The model name may be incorrect or not available. " +
        "Please check the model name in lib/gemini.js. Try using 'gemini-pro' instead."
      );
    }
    
    throw error;
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}