import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { profiles } from "./schema";

export async function ensureProfile(user: { id: string; name?: string | null; email: string }) {
  const db = getDb();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const configuredRole = adminEmails.includes(user.email.toLowerCase()) ? "admin" : "learner";
  const normalizedEmail = user.email.toLowerCase();
  const [existingByEmail] = await db.select().from(profiles).where(eq(profiles.email, normalizedEmail)).limit(1);

  if (existingByEmail) {
    await db.update(profiles).set({
      authUserId: user.id,
      displayName: user.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      role: configuredRole,
      updatedAt: new Date(),
    }).where(eq(profiles.id, existingByEmail.id));
    const [updated] = await db.select().from(profiles).where(eq(profiles.id, existingByEmail.id)).limit(1);
    return updated;
  }

  await db.insert(profiles).values({
    authUserId: user.id,
    displayName: user.name || user.email.split("@")[0],
    email: normalizedEmail,
    role: configuredRole,
  }).onConflictDoUpdate({
    target: profiles.authUserId,
    set: {
      displayName: user.name || user.email.split("@")[0],
      email: normalizedEmail,
      role: configuredRole,
      updatedAt: new Date(),
    },
  });

  const [profile] = await db.select().from(profiles).where(eq(profiles.authUserId, user.id)).limit(1);
  return profile;
}
