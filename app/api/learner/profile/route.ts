import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import {
  completeLearnerProfile,
  ensureLearnerProgram,
  updateLearnerCapstone,
} from "@/lib/db/learner";
import { isRateLimited } from "@/lib/rate-limit";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function PUT(request: Request) {
  if (isRateLimited(request, "learner-profile", 30))
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
  if (body?.action === "capstone") {
    const workspace = await ensureLearnerProgram(profile.id);
    if (workspace.status !== "active")
      return NextResponse.json(
        { error: "Your enrollment is not currently active." },
        { status: 403 },
      );
    const capstone = {
      capstoneTitle: clean(body?.capstoneTitle, 200),
      capstoneProblem: clean(body?.capstoneProblem, 2000),
      capstoneOutcome: clean(body?.capstoneOutcome, 2000),
    };
    if (Object.values(capstone).some((value) => !value))
      return NextResponse.json(
        { error: "Complete the title, problem and intended outcome." },
        { status: 400 },
      );
    await updateLearnerCapstone(profile.id, capstone);
    return NextResponse.json({
      capstone,
      completedChecklist: ["problem", "report"],
    });
  }
  const values = {
    timezone: clean(body?.timezone, 100),
    experience: clean(body?.experience, 500),
    weeklyAvailability: clean(body?.weeklyAvailability, 500),
    successDefinition: clean(body?.successDefinition, 1000),
    productInterests: clean(body?.productInterests, 1500),
  };
  if (Object.values(values).some((value) => !value))
    return NextResponse.json(
      { error: "Please complete every field." },
      { status: 400 },
    );
  try {
    new Intl.DateTimeFormat("en", { timeZone: values.timezone }).format();
  } catch {
    return NextResponse.json(
      { error: "Choose a valid timezone." },
      { status: 400 },
    );
  }

  await completeLearnerProfile(profile.id, values);
  await ensureLearnerProgram(profile.id);
  return NextResponse.json({
    profile: { ...values, onboardingComplete: true },
  });
}
