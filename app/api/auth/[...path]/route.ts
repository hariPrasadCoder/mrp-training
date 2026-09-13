import { auth } from "@/lib/auth/server";
import { configuredRoleForEmail } from "@/lib/access";
import { NextResponse } from "next/server";

const handlers = auth.handler();

export const { GET, PUT, DELETE, PATCH } = handlers;

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (path.join("/") === "sign-up/email") {
    const body = await request.clone().json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email : "";
    if (!configuredRoleForEmail(email))
      return NextResponse.json(
        { message: "This cohort is invitation-only." },
        { status: 403 },
      );
  }

  return handlers.POST(request, context);
}
