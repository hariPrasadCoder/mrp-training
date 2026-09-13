export const dynamic = "force-dynamic";

const requiredEnvironment = [
  "DATABASE_URL",
  "NEON_AUTH_BASE_URL",
  "NEON_AUTH_COOKIE_SECRET",
  "ADMIN_EMAILS",
  "LEARNER_EMAILS",
] as const;

export function GET() {
  const missing = requiredEnvironment.filter(
    (name) => !process.env[name]?.trim(),
  );

  return Response.json(
    {
      status: missing.length ? "configuration_error" : "ok",
      service: "mrp-training",
      ...(missing.length ? { missing } : {}),
    },
    { status: missing.length ? 503 : 200 },
  );
}
