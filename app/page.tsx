import { TrainingApp } from "@/components/training-app";
import { configuredRoleForEmail } from "@/lib/access";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/db/profiles";
import { getScheduleSettings } from "@/lib/db/program-settings";
import { getCompletedChecklist, getLearnerWorkspace } from "@/lib/db/learner";
import {
  getAdminWorkspace,
  getCompletedBlocks,
  getProgramContent,
  getProgramWeeks,
} from "@/lib/db/lms";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  if (process.env.NODE_ENV === "development" && params.preview === "learner") {
    const [schedule, programWeeks, content] = await Promise.all([
      getScheduleSettings(),
      getProgramWeeks(),
      getProgramContent(),
    ]);
    return (
      <TrainingApp
        user={{
          name: "Preview Learner",
          email: "learner-preview@myrealproduct.com",
          role: "learner",
        }}
        schedule={schedule}
        canPersistAdminChanges={false}
        learner={{
          timezone: "Europe/London",
          experience: "Ready to learn",
          weeklyAvailability: "Evenings",
          successDefinition: "Ship a working AI product",
          productInterests: "AI tools",
          onboardingComplete: true,
          whatsappInviteUrl: "",
          whatsappReady: false,
          completedChecklist: ["profile"],
          completedBlocks: [],
          enrollmentId: "preview",
          status: "active",
          currentWeek: 0,
          capstoneTitle: "",
          capstoneProblem: "",
          capstoneOutcome: "",
          releases: programWeeks.map((week) => ({
            weekNumber: week.weekNumber,
            status: week.weekNumber === 0 ? "available" : "locked",
            dueAt: null,
          })),
          submissions: [],
          feedback: [],
        }}
        content={content}
        admin={null}
        programWeeks={programWeeks}
      />
    );
  }
  if (process.env.NODE_ENV === "development" && params.preview === "1") {
    const [schedule, programWeeks, content, admin] = await Promise.all([
      getScheduleSettings(),
      getProgramWeeks(),
      getProgramContent(true),
      getAdminWorkspace(),
    ]);
    return (
      <TrainingApp
        user={{
          name: "Hari Prasad",
          email: "preview@myrealproduct.com",
          role: "admin",
        }}
        schedule={schedule}
        canPersistAdminChanges={false}
        learner={null}
        content={content}
        admin={admin}
        programWeeks={programWeeks}
      />
    );
  }
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");
  if (!configuredRoleForEmail(session.user.email))
    redirect("/auth/sign-in?access=denied");
  const profile = await ensureProfile(session.user);
  const [schedule, programWeeks, content, learnerWorkspace, admin] =
    await Promise.all([
      getScheduleSettings(),
      getProgramWeeks(),
      getProgramContent(profile.role === "admin"),
      profile.role === "learner" ? getLearnerWorkspace(profile.id) : null,
      profile.role === "admin" ? getAdminWorkspace() : null,
    ]);
  const [completedChecklist, completedBlocks] = learnerWorkspace
    ? await Promise.all([
        getCompletedChecklist(profile.id),
        getCompletedBlocks(learnerWorkspace.enrollmentId),
      ])
    : [[], []];
  const learner =
    profile.role === "learner" && learnerWorkspace
      ? {
          timezone: profile.timezone,
          experience: profile.experience ?? "",
          weeklyAvailability: profile.weeklyAvailability ?? "",
          successDefinition: profile.successDefinition ?? "",
          productInterests: profile.productInterests ?? "",
          onboardingComplete: Boolean(profile.onboardingCompletedAt),
          whatsappInviteUrl: profile.whatsappInviteUrl ?? "",
          whatsappReady: profile.whatsappReady,
          completedChecklist,
          completedBlocks,
          enrollmentId: learnerWorkspace.enrollmentId,
          status: learnerWorkspace.status,
          currentWeek: learnerWorkspace.currentWeek,
          capstoneTitle: learnerWorkspace.capstoneTitle,
          capstoneProblem: learnerWorkspace.capstoneProblem,
          capstoneOutcome: learnerWorkspace.capstoneOutcome,
          releases: learnerWorkspace.releases,
          submissions: learnerWorkspace.submissions,
          feedback: learnerWorkspace.feedback,
        }
      : null;
  return (
    <TrainingApp
      user={{
        name: profile.displayName,
        email: profile.email,
        role: profile.role,
      }}
      schedule={schedule}
      canPersistAdminChanges={profile.role === "admin"}
      learner={learner}
      content={content}
      admin={admin}
      programWeeks={programWeeks}
    />
  );
}
