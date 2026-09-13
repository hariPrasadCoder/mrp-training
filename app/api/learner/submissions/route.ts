import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { submitWeekWork } from "@/lib/db/learner";
import { isRateLimited } from "@/lib/rate-limit";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function webUrl(value: unknown, githubOnly = false) {
  const cleaned = text(value, 1000);
  if (!cleaned) return "";
  try {
    const url = new URL(cleaned);
    if (url.protocol !== "https:") return "";
    if (
      githubOnly &&
      !["github.com", "www.github.com"].includes(url.hostname.toLowerCase())
    )
      return "";
    return url.toString();
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  if (isRateLimited(request, "learner-submissions", 20))
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
  const weekNumber = Number(body?.weekNumber);
  const values = {
    liveUrl: webUrl(body?.liveUrl),
    repositoryUrl: webUrl(body?.repositoryUrl, true),
    reflection: text(body?.reflection, 5000),
    blocker: text(body?.blocker, 3000),
  };
  if (
    !Number.isInteger(weekNumber) ||
    weekNumber < 1 ||
    weekNumber > 4 ||
    !values.liveUrl ||
    !values.repositoryUrl ||
    !values.reflection
  ) {
    return NextResponse.json(
      {
        error:
          "Add an HTTPS live-app URL, a valid GitHub repository URL and your reflection.",
      },
      { status: 400 },
    );
  }
  try {
    const submission = await submitWeekWork(profile.id, weekNumber, values);
    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not submit work.",
      },
      { status: 400 },
    );
  }
}
