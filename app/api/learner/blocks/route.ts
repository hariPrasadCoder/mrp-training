import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { getLearnerWorkspace } from "@/lib/db/learner";
import { getProgramContent, setBlockComplete } from "@/lib/db/lms";

export async function PUT(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const profile = await ensureProfile(session.user);
  if (profile.role !== "learner") return NextResponse.json({ error: "Learner account required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (typeof body?.blockId !== "string" || typeof body?.completed !== "boolean") return NextResponse.json({ error: "Invalid progress update." }, { status: 400 });
  const workspace = await getLearnerWorkspace(profile.id);
  const block = (await getProgramContent()).find((item) => item.id === body.blockId);
  const release = block && workspace.releases.find((item) => item.weekNumber === block.weekNumber);
  if (!block || !release || release.status === "locked") return NextResponse.json({ error: "This lesson is not available." }, { status: 403 });
  await setBlockComplete(workspace.enrollmentId, body.blockId, body.completed);
  return NextResponse.json({ ok: true });
}
