import { eq } from "drizzle-orm";
import { configuredRoleForEmail } from "@/lib/access";
import { getDb } from "./index";
import { profiles } from "./schema";

export async function ensureProfile(user: {
  id: string;
  name?: string | null;
  email: string;
}) {
  const db = getDb();
  const normalizedEmail = user.email.toLowerCase();
  const configuredRole = configuredRoleForEmail(normalizedEmail);
  if (!configuredRole)
    throw new Error("This account has not been invited to the cohort.");
  const displayName = user.name || normalizedEmail.split("@")[0];
  const [existingByEmail] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, normalizedEmail))
    .limit(1);

  if (existingByEmail) {
    if (
      existingByEmail.authUserId === user.id &&
      existingByEmail.displayName === displayName &&
      existingByEmail.email === normalizedEmail &&
      existingByEmail.role === configuredRole
    )
      return existingByEmail;
    const [updated] = await db
      .update(profiles)
      .set({
        authUserId: user.id,
        displayName,
        email: normalizedEmail,
        role: configuredRole,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, existingByEmail.id))
      .returning();
    return updated;
  }

  await db
    .insert(profiles)
    .values({
      authUserId: user.id,
      displayName,
      email: normalizedEmail,
      role: configuredRole,
    })
    .onConflictDoUpdate({
      target: profiles.authUserId,
      set: {
        displayName,
        email: normalizedEmail,
        role: configuredRole,
        updatedAt: new Date(),
      },
    });

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.authUserId, user.id))
    .limit(1);
  return profile;
}
