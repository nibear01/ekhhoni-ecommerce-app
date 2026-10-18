import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export async function getLocalUser(
  clerkUserId: string,
): Promise<typeof users.$inferSelect | undefined> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);
  return row;
}
