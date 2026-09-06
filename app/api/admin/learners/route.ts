import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { updateLearner } from "@/lib/db/lms";

export async function PUT(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const admin = await ensureProfile(session.user);
  if (admin.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (typeof body?.profileId !== "string") return NextResponse.json({ error: "Learner required." }, { status: 400 });
  const currentWeek = body.currentWeek === undefined ? undefined : Number(body.currentWeek);
  if (currentWeek !== undefined && (!Number.isInteger(currentWeek) || currentWeek < 0 || currentWeek > 4)) return NextResponse.json({ error: "Week must be between 0 and 4." }, { status: 400 });
  let whatsappInviteUrl = body.whatsappInviteUrl;
  if (typeof whatsappInviteUrl === "string" && whatsappInviteUrl.trim()) {
    try { const url = new URL(whatsappInviteUrl.trim()); if (url.protocol !== "https:") throw new Error(); whatsappInviteUrl = url.toString(); } catch { return NextResponse.json({ error: "Use a complete HTTPS WhatsApp invite URL." }, { status: 400 }); }
  }
  const dueWeek = body.dueWeek === undefined ? undefined : Number(body.dueWeek);
  const dueAt = body.dueAt === undefined ? undefined : body.dueAt ? new Date(body.dueAt) : null;
  if (dueWeek !== undefined && (!Number.isInteger(dueWeek) || dueWeek < 0 || dueWeek > 4 || (dueAt instanceof Date && Number.isNaN(dueAt.getTime())))) return NextResponse.json({ error: "Add a valid deadline." }, { status: 400 });
  await updateLearner(body.profileId, { currentWeek, whatsappInviteUrl: typeof whatsappInviteUrl === "string" ? whatsappInviteUrl.trim() : undefined, whatsappReady: typeof body.whatsappReady === "boolean" ? body.whatsappReady : undefined, dueWeek, dueAt });
  return NextResponse.json({ ok: true });
}
