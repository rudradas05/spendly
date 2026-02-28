import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });
    if (loggedInUser) return loggedInUser;

    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    const name = `${firstName} ${lastName}`.trim() || "User";
    const email = user.emailAddresses[0]?.emailAddress ?? "";

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });
    return newUser;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[checkUser]", message);
    return null;
  }
};