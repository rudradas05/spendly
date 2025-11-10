import { inngest } from "./client";
import { db } from "../prisma";

// 1️⃣ Define your event types manually (no InngestEvent needed)
type ClerkUserUpdatedEvent = {
  name: "clerk/user.updated";
  data: {
    id: string;
    email_addresses: {
      email_address: string;
      verification?: { status?: string };
    }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
};

type ClerkUserDeletedEvent = {
  name: "clerk/user.deleted";
  data: {
    id: string;
  };
};

// 2️⃣ Handle Clerk user updates
export const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "clerk/user.updated" },
  async ({ event }: { event: ClerkUserUpdatedEvent }) => {
    const { data } = event;

    const email = data.email_addresses?.[0]?.email_address || "";
    const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
    const imageUrl = data.image_url || "";

    await db.user.upsert({
      where: { clerkUserId: data.id },
      update: { email, name, imageUrl },
      create: { clerkUserId: data.id, email, name, imageUrl },
    });

    console.log(`✅ Synced Clerk user update for ${data.id}`);
  }
);

// 3️⃣ Handle Clerk user deletions
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "clerk/user.deleted" },
  async ({ event }: { event: ClerkUserDeletedEvent }) => {
    const { data } = event;

    try {
      await db.user.delete({
        where: { clerkUserId: data.id },
      });
      console.log(`🗑️ Deleted user for Clerk ID: ${data.id}`);
    } catch (error: any) {
      if (error.code === "P2025") {
        console.warn(`⚠️ User already deleted for Clerk ID: ${data.id}`);
      } else {
        console.error("❌ Error deleting user:", error.message);
      }
    }
  }
);
