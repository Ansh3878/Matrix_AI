"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

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

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  try {
    // Fetch or create industry insights outside of a long-running transaction
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    if (!industryInsight) {
      const insights = await generateAIInsights(data.industry);

      try {
        industryInsight = await db.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } catch (error) {
        // Handle race condition where another request created the record
        if (error.code === "P2002") {
          industryInsight = await db.industryInsight.findUnique({
            where: { industry: data.industry },
          });
        } else {
          throw error;
        }
      }
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    revalidatePath("/");
    return { updatedUser, industryInsight };
  } catch (error) {
    console.error("Error updating user and industry:", error);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await ensureUserExists(userId);

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}