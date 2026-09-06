"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import type { AdminWorkspaceData, LearnerWorkspaceData, LessonBlock, Role } from "@/lib/lms-types";
import type { ScheduleSettings } from "@/lib/db/program-settings";
import { LearnerApp, LearnerOnboarding } from "./learner-app";
import { AdminApp } from "./admin-app";

export function TrainingApp({ user, schedule: initialSchedule, canPersistAdminChanges, learner: initialLearner, content: initialContent, admin: initialAdmin }: {
  user: { name: string; email: string; role: Role };
  schedule: ScheduleSettings;
  canPersistAdminChanges: boolean;
  learner: LearnerWorkspaceData | null;
  content: LessonBlock[];
  admin: AdminWorkspaceData | null;
}) {
  const router = useRouter();
  const [learner, setLearner] = useState(initialLearner);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [content, setContent] = useState(initialContent);
  const [admin, setAdmin] = useState(initialAdmin);

  async function signOut() {
    await authClient.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  }

  if (user.role === "learner" && learner && !learner.onboardingComplete) {
    return <LearnerOnboarding user={user} learner={learner} onComplete={(profile) => setLearner({ ...learner, ...profile, onboardingComplete: true, completedChecklist: [...new Set([...learner.completedChecklist, "profile"])] })} onSignOut={signOut} />;
  }

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><span /><span /><span /></span><span>MYREAL<br />PRODUCT</span></div>
      <span className="learner-badge">{user.role === "learner" ? "Learner workspace" : "Coach workspace"}</span>
      <div className="top-actions"><span className="signed-in-as">{user.name}</span><button className="icon-button" aria-label="Sign out" onClick={signOut}><LogOut size={18} /></button><div className="avatar">{initials(user.name)}</div></div>
    </header>
    {user.role === "learner" && learner
      ? <LearnerApp user={user} learner={learner} setLearner={setLearner} schedule={schedule} content={content} />
      : admin && <AdminApp admin={admin} setAdmin={setAdmin} schedule={schedule} setSchedule={setSchedule} content={content} setContent={setContent} canSave={canPersistAdminChanges} />}
  </main>;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "MR";
}
