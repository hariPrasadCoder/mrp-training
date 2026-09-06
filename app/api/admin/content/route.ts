import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/profiles";
import { deleteContentBlock, saveContentBlock } from "@/lib/db/lms";
import type { ContentKind } from "@/lib/lms-types";

const contentKinds = new Set<ContentKind>(["video", "text", "link", "checklist", "booking", "submission"]);

async function adminProfile() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  const profile = await ensureProfile(session.user);
  return profile.role === "admin" ? profile : null;
}

export async function POST(request: Request) {
  if (!await adminProfile()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const type = body?.type as ContentKind;
  const weekNumber = Number(body?.weekNumber);
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 200) : "";
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 2000) : "";
  if (!Number.isInteger(weekNumber) || weekNumber < 0 || weekNumber > 4 || !contentKinds.has(type) || !title) return NextResponse.json({ error: "Week, content type and title are required." }, { status: 400 });
  const content = typeof body?.content === "object" && body.content ? body.content : {};
  if (["video", "link", "booking"].includes(type)) {
    try {
      const url = new URL(content.url);
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
      if (type === "video" && !["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"].includes(url.hostname.toLowerCase())) throw new Error();
    } catch {
      return NextResponse.json({ error: type === "video" ? "Add a valid YouTube URL." : "Add a valid destination URL." }, { status: 400 });
    }
  }
  if (["text", "checklist", "submission"].includes(type) && (typeof content.body !== "string" || !content.body.trim())) return NextResponse.json({ error: "Add the lesson or instruction text." }, { status: 400 });
  const saved = await saveContentBlock({
    id: typeof body?.id === "string" ? body.id : undefined,
    weekNumber,
    type,
    title,
    description,
    content,
    required: body?.required !== false,
    published: body?.published === true,
  });
  return NextResponse.json({ block: saved });
}

export async function DELETE(request: Request) {
  if (!await adminProfile()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== "string") return NextResponse.json({ error: "Content ID required." }, { status: 400 });
  await deleteContentBlock(body.id);
  return NextResponse.json({ ok: true });
}
