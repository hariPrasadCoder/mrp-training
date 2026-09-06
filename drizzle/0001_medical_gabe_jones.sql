CREATE TABLE "program_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"saturday_booking_url" text,
	"office_hour_booking_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
