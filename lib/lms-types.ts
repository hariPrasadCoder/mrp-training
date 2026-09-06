export type Role = "learner" | "admin";
export type ReleaseState = "locked" | "available" | "credited" | "completed";
export type ContentKind = "video" | "text" | "link" | "checklist" | "booking" | "submission";

export type LessonBlock = {
  id: string;
  weekNumber: number;
  type: ContentKind;
  title: string;
  description: string;
  content: { videoId?: string; url?: string; body?: string; durationMinutes?: number };
  required: boolean;
  sortOrder: number;
  published: boolean;
};

export type LearnerWorkspaceData = {
  timezone: string;
  experience: string;
  weeklyAvailability: string;
  successDefinition: string;
  productInterests: string;
  onboardingComplete: boolean;
  whatsappInviteUrl: string;
  whatsappReady: boolean;
  completedChecklist: string[];
  completedBlocks: string[];
  enrollmentId: string;
  currentWeek: number;
  releases: Array<{ weekNumber: number; status: ReleaseState; dueAt: string | null }>;
  submissions: Array<{ id: string; weekNumber: number; status: string; liveUrl: string | null; repositoryUrl: string | null; reflection: string | null; blocker: string | null; submittedAt: string | null }>;
  feedback: Array<{ submissionId: string; result: string; summary: string; createdAt: string }>;
};

export type AdminLearner = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  whatsappInviteUrl: string;
  whatsappReady: boolean;
  onboardingComplete: boolean;
  currentWeek: number;
  currentDueAt: string;
  enrollmentId: string;
  completedItems: number;
};

export type ReviewItem = {
  id: string;
  learnerName: string;
  learnerEmail: string;
  weekNumber: number;
  version: number;
  status: string;
  liveUrl: string;
  repositoryUrl: string;
  reflection: string;
  blocker: string;
  submittedAt: string | null;
};

export type AdminWorkspaceData = {
  learners: AdminLearner[];
  reviews: ReviewItem[];
};
