"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getGeminiClient } from "@/lib/gemini";

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

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${
    data.companyName
  }.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;

  try {
    const { model } = getGeminiClient();
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    
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
    
    throw new Error(`Failed to generate cover letter: ${error.message || "Unknown error"}`);
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}