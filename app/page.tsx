import { TrainingApp } from "@/components/training-app";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/db/profiles";
import { getScheduleSettings } from "@/lib/db/program-settings";
import { getCompletedChecklist, getLearnerWorkspace } from "@/lib/db/learner";
import { getAdminWorkspace, getCompletedBlocks, getProgramContent } from "@/lib/db/lms";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const params = await searchParams;
  const schedule = await getScheduleSettings();
  if (process.env.NODE_ENV === "development" && params.preview === "1") {
    return <TrainingApp user={{ name: "Hari Prasad", email: "preview@myrealproduct.com", role: "admin" }} schedule={schedule} canPersistAdminChanges={false} learner={null} content={await getProgramContent(true)} admin={await getAdminWorkspace()} />;
  }
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");
  const profile = await ensureProfile(session.user);
  const learnerWorkspace = profile.role === "learner" ? await getLearnerWorkspace(profile.id) : null;
  const learner = profile.role === "learner" && learnerWorkspace ? {
    timezone: profile.timezone,
    experience: profile.experience ?? "",
    weeklyAvailability: profile.weeklyAvailability ?? "",
    successDefinition: profile.successDefinition ?? "",
    productInterests: profile.productInterests ?? "",
    onboardingComplete: Boolean(profile.onboardingCompletedAt),
    whatsappInviteUrl: profile.whatsappInviteUrl ?? "",
    whatsappReady: profile.whatsappReady,
    completedChecklist: await getCompletedChecklist(profile.id),
    completedBlocks: await getCompletedBlocks(learnerWorkspace.enrollmentId),
    enrollmentId: learnerWorkspace.enrollmentId,
    currentWeek: learnerWorkspace.currentWeek,
    releases: learnerWorkspace.releases,
    submissions: learnerWorkspace.submissions,
    feedback: learnerWorkspace.feedback,
  } : null;
  return <TrainingApp user={{ name: profile.displayName, email: profile.email, role: profile.role }} schedule={schedule} canPersistAdminChanges={profile.role === "admin"} learner={learner} content={await getProgramContent(profile.role === "admin")} admin={profile.role === "admin" ? await getAdminWorkspace() : null} />;
}
