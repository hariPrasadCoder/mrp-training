CREATE TABLE "learner_checklist" (
	"profile_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learner_checklist_profile_id_item_id_pk" PRIMARY KEY("profile_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "experience" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "weekly_availability" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "success_definition" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "product_interests" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "onboarding_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "learner_checklist" ADD CONSTRAINT "learner_checklist_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;