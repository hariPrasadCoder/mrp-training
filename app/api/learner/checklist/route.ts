import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { setChecklistItem } from "@/lib/db/learner";
import { onboardingItems } from "@/lib/program-data";

const allowedItems = new Set(onboardingItems.map((item) => item.id).filter((id) => id !== "profile"));

export async function PUT(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const profile = await ensureProfile(session.user);
  if (profile.role !== "learner") return NextResponse.json({ error: "Learner account required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (typeof body?.itemId !== "string" || !allowedItems.has(body.itemId) || typeof body?.completed !== "boolean") {
    return NextResponse.json({ error: "Invalid checklist update." }, { status: 400 });
  }
  await setChecklistItem(profile.id, body.itemId, body.completed);
  return NextResponse.json({ ok: true });
}
