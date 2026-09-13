import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { getLearnerWorkspace, setChecklistItem } from "@/lib/db/learner";
import { onboardingItems } from "@/lib/program-data";
import { isRateLimited } from "@/lib/rate-limit";

const allowedItems = new Set(
  onboardingItems
    .map((item) => item.id)
    .filter((id) => id !== "profile" && id !== "report"),
);

export async function PUT(request: Request) {
  if (isRateLimited(request, "learner-checklist", 120))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const { data: session } = await auth.getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const profile = await ensureProfile(session.user);
  if (profile.role !== "learner")
    return NextResponse.json(
      { error: "Learner account required." },
      { status: 403 },
    );

  const body = await request.json().catch(() => null);
  if (
    typeof body?.itemId !== "string" ||
    !allowedItems.has(body.itemId) ||
    typeof body?.completed !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Invalid checklist update." },
      { status: 400 },
    );
  }
  const workspace = await getLearnerWorkspace(profile.id);
  if (["paused", "completed"].includes(workspace.status))
    return NextResponse.json(
      { error: "Your enrollment is not currently active." },
      { status: 403 },
    );
  if (
    body.itemId === "whatsapp" &&
    body.completed &&
    (!profile.whatsappReady || !profile.whatsappInviteUrl)
  )
    return NextResponse.json(
      { error: "Your WhatsApp invite is not ready yet." },
      { status: 400 },
    );
  await setChecklistItem(profile.id, body.itemId, body.completed);
  return NextResponse.json({ ok: true });
}
