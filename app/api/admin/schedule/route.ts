import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { saveScheduleSettings } from "@/lib/db/program-settings";

function parseCalUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || (hostname !== "cal.com" && !hostname.endsWith(".cal.com"))) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function PUT(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const profile = await ensureProfile(session.user);
  if (profile.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const saturdayBookingUrl = parseCalUrl(body?.saturdayBookingUrl);
  const officeHourBookingUrl = parseCalUrl(body?.officeHourBookingUrl);

  if (saturdayBookingUrl === null || officeHourBookingUrl === null) {
    return NextResponse.json({ error: "Use complete https://cal.com booking links." }, { status: 400 });
  }

  const settings = await saveScheduleSettings({ saturdayBookingUrl, officeHourBookingUrl });
  return NextResponse.json({ settings });
}
