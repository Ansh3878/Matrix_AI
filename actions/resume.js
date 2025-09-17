"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper function to ensure user exists in database
async function ensureUserExists(userId) {
  try {
    // First try to find the user
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (user) {
      return user;
    }

    // If user doesn't exist, get Clerk user data and create/upsert
    const { currentUser } = await import("@clerk/nextjs/server");
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      throw new Error("User not found in Clerk");
    }

    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    
    // Use upsert to handle race conditions
    user = await db.user.upsert({
      where: { clerkUserId: userId },
      update: {}, // No updates needed if user already exists
      create: {
        clerkUserId: userId,
        name: name || null,
        imageUrl: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
      },
    });

    return user;
  } catch (error) {
    // If it's a unique constraint error, try to find the user again
    if (error.code === 'P2002' && error.meta?.target?.includes('clerkUserId')) {
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
      if (user) {
        return user;
      }
    }
    throw error;
  }
}

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);
  
  // Get user with industry insight for AI improvement
  const userWithInsight = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${userWithInsight.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}