"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

/**
 * Cached per-request user lookup.
 * React's `cache()` deduplicates calls within the same server request,
 * so calling ensureUserExists() 5 times on one page = only 1 DB query.
 */
export const ensureUserExists = cache(async (userId) => {
  try {
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (user) return user;

    // User not in DB yet — create them
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("User not found in Clerk");

    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

    user = await db.user.upsert({
      where: { clerkUserId: userId },
      update: {},
      create: {
        clerkUserId: userId,
        name: name || null,
        imageUrl: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
      },
    });

    return user;
  } catch (error) {
    if (error.code === "P2002") {
      const byClerk = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
      if (byClerk) return byClerk;

      const target = error.meta?.target;
      if (target?.includes("email")) {
        const clerkUser = await currentUser();
        const email = clerkUser?.emailAddresses[0]?.emailAddress;
        if (email) {
          const existing = await db.user.findUnique({ where: { email } });
          if (existing) {
            return await db.user.update({
              where: { email },
              data: { clerkUserId: userId },
            });
          }
        }
      }
    }
    throw error;
  }
});

/**
 * Get the current authenticated user from DB (cached per request).
 * Use this instead of calling ensureUserExists manually everywhere.
 */
export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;
  return ensureUserExists(userId);
});
