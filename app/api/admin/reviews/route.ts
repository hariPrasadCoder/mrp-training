import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { reviewSubmission } from "@/lib/db/lms";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isRateLimited(request, "admin-reviews", 30))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const { data: session } = await auth.getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const admin = await ensureProfile(session.user);
  if (admin.role !== "admin")
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 },
    );
  const body = await request.json().catch(() => null);
  const result = body?.result;
  const summary =
    typeof body?.summary === "string" ? body.summary.trim().slice(0, 5000) : "";
  if (
    typeof body?.submissionId !== "string" ||
    !["changes_requested", "approved", "standout"].includes(result) ||
    !summary
  )
    return NextResponse.json(
      { error: "Choose a result and add feedback." },
      { status: 400 },
    );
  const reviewed = await reviewSubmission(body.submissionId, admin.id, {
    result,
    summary,
  });
  if (!reviewed)
    return NextResponse.json(
      { error: "This submission has already been reviewed." },
      { status: 409 },
    );
  return NextResponse.json({ ok: true });
}
