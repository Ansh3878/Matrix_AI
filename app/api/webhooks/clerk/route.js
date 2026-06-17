import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the RAW body text — svix needs the exact original bytes to verify the signature
  // Do NOT use req.json() here as re-stringifying changes whitespace and breaks verification
  const body = await req.text();

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const eventType = evt.type;
  const data = evt.data;

  console.log(`Clerk webhook received: ${eventType}`);

  try {
    // ── user.created ──────────────────────────────────────────────────────────
    if (eventType === "user.created") {
      const email = data.email_addresses?.[0]?.email_address;
      const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();

      if (!email) {
        console.error("No email in user.created event");
        return new Response("No email provided", { status: 400 });
      }

      // Upsert: handles the case where a DB row already exists with this email
      // (e.g. old Clerk user was deleted but DB row wasn't cleaned up)
      await db.user.upsert({
        where: { email },
        update: {
          clerkUserId: data.id,
          name: name || null,
          imageUrl: data.image_url || null,
        },
        create: {
          clerkUserId: data.id,
          email,
          name: name || null,
          imageUrl: data.image_url || null,
        },
      });

      console.log(`User created/linked in DB: ${email}`);
    }

    // ── user.updated ──────────────────────────────────────────────────────────
    if (eventType === "user.updated") {
      const email = data.email_addresses?.[0]?.email_address;
      const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();

      await db.user.update({
        where: { clerkUserId: data.id },
        data: {
          email: email || undefined,
          name: name || undefined,
          imageUrl: data.image_url || undefined,
        },
      });

      console.log(`User updated in DB: ${data.id}`);
    }

    // ── user.deleted ──────────────────────────────────────────────────────────
    if (eventType === "user.deleted") {
      const clerkUserId = data.id;

      // Find the user first so we have their DB id for cascade deletes
      const user = await db.user.findUnique({
        where: { clerkUserId },
      });

      if (user) {
        // Delete all related data in order (respecting FK constraints)
        await db.assessment.deleteMany({ where: { userId: user.id } });
        await db.coverLetter.deleteMany({ where: { userId: user.id } });

        // Resume has a unique constraint so deleteMany still works
        await db.resume.deleteMany({ where: { userId: user.id } });

        // Finally delete the user
        await db.user.delete({ where: { clerkUserId } });

        console.log(`User and all data deleted from DB: ${clerkUserId}`);
      } else {
        console.log(`User not found in DB for deletion: ${clerkUserId}`);
      }
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error);
    return new Response("Internal server error", { status: 500 });
  }
}
