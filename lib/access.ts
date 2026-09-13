export type ConfiguredRole = "admin" | "learner";

export function parseEmailList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function configuredRoleForEmail(
  email: string,
  adminEmails = process.env.ADMIN_EMAILS,
  learnerEmails = process.env.LEARNER_EMAILS,
): ConfiguredRole | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;
  if (parseEmailList(adminEmails).includes(normalizedEmail)) return "admin";
  if (parseEmailList(learnerEmails).includes(normalizedEmail)) return "learner";
  return null;
}
