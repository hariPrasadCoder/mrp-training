import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import {
  getProgramContent,
  moveContentBlock,
  updateProgramWeek,
} from "@/lib/db/lms";
import { isRateLimited } from "@/lib/rate-limit";

async function requireAdmin() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  const profile = await ensureProfile(session.user);
  return profile.role === "admin" ? profile : null;
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function PUT(request: Request) {
  if (isRateLimited(request, "admin-program", 60))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!(await requireAdmin()))
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 },
    );
  const body = await request.json().catch(() => null);

  if (body?.action === "move-block") {
    if (
      typeof body?.id !== "string" ||
      !["up", "down"].includes(body?.direction)
    )
      return NextResponse.json(
        { error: "Choose a content block and direction." },
        { status: 400 },
      );
    await moveContentBlock(body.id, body.direction);
    return NextResponse.json({ blocks: await getProgramContent(true) });
  }

  if (body?.action === "update-week") {
    const weekNumber = Number(body?.weekNumber);
    const values = {
      eyebrow: clean(body?.eyebrow, 100),
      title: clean(body?.title, 200),
      outcome: clean(body?.outcome, 1000),
    };
    if (
      !Number.isInteger(weekNumber) ||
      weekNumber < 0 ||
      weekNumber > 4 ||
      Object.values(values).some((value) => !value)
    )
      return NextResponse.json(
        { error: "Complete the week label, title and outcome." },
        { status: 400 },
      );
    return NextResponse.json({
      week: await updateProgramWeek(weekNumber, values),
    });
  }

  return NextResponse.json(
    { error: "Unknown program update." },
    { status: 400 },
  );
}
