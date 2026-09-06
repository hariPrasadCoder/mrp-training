import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { submitWeekWork } from "@/lib/db/learner";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function webUrl(value: unknown) {
  const cleaned = text(value, 1000);
  if (!cleaned) return "";
  try {
    const url = new URL(cleaned);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch { return ""; }
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const profile = await ensureProfile(session.user);
  if (profile.role !== "learner") return NextResponse.json({ error: "Learner account required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const weekNumber = Number(body?.weekNumber);
  const values = {
    liveUrl: webUrl(body?.liveUrl),
    repositoryUrl: webUrl(body?.repositoryUrl),
    reflection: text(body?.reflection, 5000),
    blocker: text(body?.blocker, 3000),
  };
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 4 || !values.liveUrl || !values.repositoryUrl || !values.reflection) {
    return NextResponse.json({ error: "Add valid live and repository URLs plus your reflection." }, { status: 400 });
  }
  try {
    const submission = await submitWeekWork(profile.id, weekNumber, values);
    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not submit work." }, { status: 400 });
  }
}
