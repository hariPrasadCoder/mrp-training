import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { completeLearnerProfile, ensureLearnerProgram } from "@/lib/db/learner";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function PUT(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const profile = await ensureProfile(session.user);
  if (profile.role !== "learner") return NextResponse.json({ error: "Learner account required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const values = {
    timezone: clean(body?.timezone, 100),
    experience: clean(body?.experience, 500),
    weeklyAvailability: clean(body?.weeklyAvailability, 500),
    successDefinition: clean(body?.successDefinition, 1000),
    productInterests: clean(body?.productInterests, 1500),
  };
  if (Object.values(values).some((value) => !value)) return NextResponse.json({ error: "Please complete every field." }, { status: 400 });
  try { new Intl.DateTimeFormat("en", { timeZone: values.timezone }).format(); } catch { return NextResponse.json({ error: "Choose a valid timezone." }, { status: 400 }); }

  await completeLearnerProfile(profile.id, values);
  await ensureLearnerProgram(profile.id);
  return NextResponse.json({ profile: { ...values, onboardingComplete: true } });
}
