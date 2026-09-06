CREATE TYPE "public"."block_type" AS ENUM('video', 'text', 'link', 'checklist', 'booking', 'submission');--> statement-breakpoint
CREATE TYPE "public"."booking_kind" AS ENUM('saturday_checkpoint', 'office_hour');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'booked', 'rescheduled', 'cancelled', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('invited', 'onboarding', 'active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."release_status" AS ENUM('locked', 'available', 'credited', 'completed');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('draft', 'submitted', 'changes_requested', 'approved', 'standout');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'learner');--> statement-breakpoint
CREATE TABLE "block_progress" (
	"enrollment_id" uuid NOT NULL,
	"block_id" uuid NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "block_progress_enrollment_id_block_id_pk" PRIMARY KEY("enrollment_id","block_id")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"cal_booking_uid" text NOT NULL,
	"kind" "booking_kind" NOT NULL,
	"status" "booking_status" DEFAULT 'booked' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"meet_url" text,
	"reschedule_url" text,
	"cancel_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"coach_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_id" uuid NOT NULL,
	"type" "block_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"sort_order" integer NOT NULL,
	"published" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'onboarding' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"current_week" integer DEFAULT 0 NOT NULL,
	"capstone_title" text,
	"capstone_problem" text,
	"capstone_outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"coach_id" uuid NOT NULL,
	"result" "submission_status" NOT NULL,
	"summary" text NOT NULL,
	"rubric" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"role" "user_role" DEFAULT 'learner' NOT NULL,
	"display_name" text NOT NULL,
	"email" text NOT NULL,
	"timezone" text DEFAULT 'Europe/London' NOT NULL,
	"whatsapp_invite_url" text,
	"whatsapp_ready" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_weeks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"title" text NOT NULL,
	"eyebrow" text NOT NULL,
	"outcome" text NOT NULL,
	"accent" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"week_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "submission_status" DEFAULT 'draft' NOT NULL,
	"live_url" text,
	"repository_url" text,
	"reflection" text,
	"blocker" text,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "week_releases" (
	"enrollment_id" uuid NOT NULL,
	"week_id" uuid NOT NULL,
	"status" "release_status" DEFAULT 'locked' NOT NULL,
	"released_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	CONSTRAINT "week_releases_enrollment_id_week_id_pk" PRIMARY KEY("enrollment_id","week_id")
);
--> statement-breakpoint
ALTER TABLE "block_progress" ADD CONSTRAINT "block_progress_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_progress" ADD CONSTRAINT "block_progress_block_id_content_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."content_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_notes" ADD CONSTRAINT "coach_notes_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_notes" ADD CONSTRAINT "coach_notes_coach_id_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_week_id_program_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."program_weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_learner_id_profiles_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_coach_id_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_weeks" ADD CONSTRAINT "program_weeks_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_week_id_program_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."program_weeks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "week_releases" ADD CONSTRAINT "week_releases_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "week_releases" ADD CONSTRAINT "week_releases_week_id_program_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."program_weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_cal_uid_unique" ON "bookings" USING btree ("cal_booking_uid");--> statement-breakpoint
CREATE INDEX "bookings_start_idx" ON "bookings" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "content_blocks_week_idx" ON "content_blocks" USING btree ("week_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_program_unique" ON "enrollments" USING btree ("learner_id","program_id");--> statement-breakpoint
CREATE INDEX "enrollments_status_idx" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_auth_user_id_unique" ON "profiles" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_email_unique" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "program_week_number_unique" ON "program_weeks" USING btree ("program_id","week_number");--> statement-breakpoint
CREATE UNIQUE INDEX "program_name_version_unique" ON "programs" USING btree ("name","version");--> statement-breakpoint
CREATE INDEX "submissions_review_queue_idx" ON "submissions" USING btree ("status","submitted_at");