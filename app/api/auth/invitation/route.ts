import { NextResponse } from "next/server";
import { configuredRoleForEmail } from "@/lib/access";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isRateLimited(request, "invitation-check", 20))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.slice(0, 320) : "";

  if (!email)
    return NextResponse.json({ error: "Enter your invited email address." }, { status: 400 });

  return NextResponse.json({ invited: configuredRoleForEmail(email) !== null });
}
