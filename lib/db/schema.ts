import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "learner"]);
export const enrollmentStatus = pgEnum("enrollment_status", [
  "invited",
  "onboarding",
  "active",
  "paused",
  "completed",
]);
export const releaseStatus = pgEnum("release_status", [
  "locked",
  "available",
  "credited",
  "completed",
]);
export const blockType = pgEnum("block_type", [
  "video",
  "text",
  "link",
  "checklist",
  "booking",
  "submission",
]);
export const submissionStatus = pgEnum("submission_status", [
  "draft",
  "submitted",
  "changes_requested",
  "approved",
  "standout",
]);
export const bookingKind = pgEnum("booking_kind", [
  "saturday_checkpoint",
  "office_hour",
]);
export const bookingStatus = pgEnum("booking_status", [
  "pending",
  "booked",
  "rescheduled",
  "cancelled",
  "completed",
  "no_show",
]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    role: userRole("role").notNull().default("learner"),
    displayName: text("display_name").notNull(),
    email: text("email").notNull(),
    timezone: text("timezone").notNull().default("Europe/London"),
    whatsappInviteUrl: text("whatsapp_invite_url"),
    whatsappReady: boolean("whatsapp_ready").notNull().default(false),
    experience: text("experience"),
    weeklyAvailability: text("weekly_availability"),
    successDefinition: text("success_definition"),
    productInterests: text("product_interests"),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("profiles_auth_user_id_unique").on(table.authUserId),
    uniqueIndex("profiles_email_unique").on(table.email),
  ],
);

export const learnerChecklist = pgTable(
  "learner_checklist",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.itemId] })],
);

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    version: integer("version").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("program_name_version_unique").on(table.name, table.version),
  ],
);

export const programSettings = pgTable("program_settings", {
  id: text("id").primaryKey().default("default"),
  saturdayBookingUrl: text("saturday_booking_url"),
  officeHourBookingUrl: text("office_hour_booking_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const programWeeks = pgTable(
  "program_weeks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    weekNumber: integer("week_number").notNull(),
    title: text("title").notNull(),
    eyebrow: text("eyebrow").notNull(),
    outcome: text("outcome").notNull(),
    accent: text("accent").notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    uniqueIndex("program_week_number_unique").on(
      table.programId,
      table.weekNumber,
    ),
  ],
);

export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    weekId: uuid("week_id")
      .notNull()
      .references(() => programWeeks.id, { onDelete: "cascade" }),
    type: blockType("type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    content: jsonb("content")
      .$type<{
        videoId?: string;
        url?: string;
        body?: string;
        durationMinutes?: number;
      }>()
      .notNull()
      .default({}),
    required: boolean("required").notNull().default(true),
    sortOrder: integer("sort_order").notNull(),
    published: boolean("published").notNull().default(false),
  },
  (table) => [index("content_blocks_week_idx").on(table.weekId)],
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id),
    status: enrollmentStatus("status").notNull().default("onboarding"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    currentWeek: integer("current_week").notNull().default(0),
    capstoneTitle: text("capstone_title"),
    capstoneProblem: text("capstone_problem"),
    capstoneOutcome: text("capstone_outcome"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("learner_program_unique").on(table.learnerId, table.programId),
    index("enrollments_status_idx").on(table.status),
  ],
);

export const weekReleases = pgTable(
  "week_releases",
  {
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    weekId: uuid("week_id")
      .notNull()
      .references(() => programWeeks.id, { onDelete: "cascade" }),
    status: releaseStatus("status").notNull().default("locked"),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    dueAt: timestamp("due_at", { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.enrollmentId, table.weekId] })],
);

export const blockProgress = pgTable(
  "block_progress",
  {
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    blockId: uuid("block_id")
      .notNull()
      .references(() => contentBlocks.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.enrollmentId, table.blockId] })],
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    weekId: uuid("week_id")
      .notNull()
      .references(() => programWeeks.id),
    version: integer("version").notNull().default(1),
    status: submissionStatus("status").notNull().default("draft"),
    liveUrl: text("live_url"),
    repositoryUrl: text("repository_url"),
    reflection: text("reflection"),
    blocker: text("blocker"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("submissions_review_queue_idx").on(table.status, table.submittedAt),
  ],
);

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    coachId: uuid("coach_id")
      .notNull()
      .references(() => profiles.id),
    result: submissionStatus("result").notNull(),
    summary: text("summary").notNull(),
    rubric: jsonb("rubric")
      .$type<Array<{ criterion: string; score: number; note: string }>>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("feedback_submission_unique").on(table.submissionId),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    calBookingUid: text("cal_booking_uid").notNull(),
    kind: bookingKind("kind").notNull(),
    status: bookingStatus("status").notNull().default("booked"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    meetUrl: text("meet_url"),
    rescheduleUrl: text("reschedule_url"),
    cancelUrl: text("cancel_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("bookings_cal_uid_unique").on(table.calBookingUid),
    index("bookings_start_idx").on(table.startsAt),
  ],
);

export const coachNotes = pgTable("coach_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  enrollmentId: uuid("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  coachId: uuid("coach_id")
    .notNull()
    .references(() => profiles.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
