import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { isBootstrapAdmin, resolveRole } from "./roles.js";

type LocalUser = typeof users.$inferSelect;

export async function getLocalUser(clerkUserId: string): Promise<LocalUser | undefined> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);
  return row;
}

/**
 * The local user row, created from Clerk on first sight when the Clerk webhook hasn't synced it yet
 * (e.g. local development, where Clerk can't reach the webhook). Also applies ADMIN_EMAILS.
 */
export async function ensureLocalUser(clerkUserId: string): Promise<LocalUser> {
  const existing = await getLocalUser(clerkUserId);

  if (existing) {
    if (existing.role !== "admin" && isBootstrapAdmin(existing.email)) {
      const [row] = await db
        .update(users)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(users.id, existing.id))
        .returning();
      return row;
    }
    return existing;
  }

  const u = await clerkClient.users.getUser(clerkUserId);
  const email =
    u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? "";
  const displayName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || null;
  const role = resolveRole(u.publicMetadata?.role, email);

  const [row] = await db
    .insert(users)
    .values({ clerkUserId, email, displayName, role })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { email, displayName, role, updatedAt: new Date() },
    })
    .returning();
  return row;
}
