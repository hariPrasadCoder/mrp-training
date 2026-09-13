# MyRealProduct Training

Personalised four-week AI engineering training workspace with separate learner and coach experiences.

## Included in this build

- Neon Auth email/password sign-up, sign-in, signed sessions, and protected app route
- Neon Postgres schema for roles, programs, content, enrollments, releases, progress, submissions, feedback, and coach notes
- First-login learner intake and a persistent Week 0 onboarding checklist
- Learner views for Today, released lesson content, build submissions, and coach feedback
- Admin content authoring for YouTube videos, written lessons, tasks, resources, bookings, and submission instructions
- Admin learner access controls, local-time deadlines, WhatsApp invites, scheduling settings, and real submission reviews
- Editable week framing, ordered content blocks, learner pause/resume/completion controls, private coach notes, and learner product briefs
- Simple Cal.com booking cards for Saturday checkpoints and Tuesday office hours
- Password-reset UI, mutation rate limiting, security headers, and automated tests
- Responsive editorial interface based on the supplied visual reference
- Standalone Docker build and health endpoint for Coolify

Authenticated views use Neon data throughout. Access is invitation-only: emails in `LEARNER_EMAILS` become learners and emails in `ADMIN_EMAILS` receive coach access. All other emails are denied. Unpublished content and locked weeks are never shown as fake lessons.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. During development, `/?preview=1` provides a UI-only preview without creating an auth account. This bypass is disabled automatically in production.

## Environment

Copy `.env.example` to `.env.local` and configure:

- `DATABASE_URL`: pooled Neon Postgres connection
- `NEON_AUTH_BASE_URL`: Neon Auth endpoint
- `NEON_AUTH_COOKIE_SECRET`: at least 32 random characters
- `ADMIN_EMAILS`: comma-separated email addresses that receive the admin role
- `LEARNER_EMAILS`: comma-separated invited learner email addresses

Authentication passwords are managed by Neon Auth and must never be added to
the repository or environment files. `.env.local` is excluded from Git. Rotate
the database password and cookie secret before production if either has been
shared outside the deployment platform.

## Scheduling links

Sign in with an email listed in `ADMIN_EMAILS`, open **Admin view → Scheduling**, and paste the direct Cal.com URLs for:

- **MRP Saturday Checkpoint** — 60 minutes, mandatory, one-to-one
- **MRP Office Hour** — 30 minutes, optional, one-to-one

Saving writes the links to Neon and updates the two learner booking cards. Each card opens Cal.com in a new tab. Cal.com handles confirmation emails, reminders, rescheduling, cancellation, and the Google Meet link.

## Verification

```bash
npm run test
npm run lint
npm run build
```

The automated test suite validates the course structure, invitation allowlist, and request rate limiting.

## Database

```bash
npm run db:generate
npm run db:push
```

The initial schema migration is checked into `drizzle/` and has been applied to the configured Neon database.

## Video hosting

Use **Unlisted** YouTube videos with embedding enabled. Truly Private YouTube videos cannot be relied on inside the portal because private embeds do not work for normal application viewers. Use privacy-enhanced embed URLs (`youtube-nocookie.com`) when lesson IDs are added.

## Coolify

The Docker image is a minimal standalone Next.js server that runs as a non-root user on port `3000`. Its built-in health check calls `/api/health` and verifies that all required runtime variables are present.

Use the private, Git-ignored `coolify.env` file for the values to paste into Coolify. The complete deployment walkthrough is in [`docs/coolify-deployment.md`](docs/coolify-deployment.md).

Before opening enrollment, also complete the launch configuration in the admin
workspace: add the learner's private WhatsApp invite, add the two Cal.com event
links, publish the Week 1 material, and set the learner's Week 0 deadline.

The standalone Next.js server listens on `0.0.0.0:3000`, as required for Coolify proxy routing.

## Week 0 handoff

The learner-facing version is built into the app. A copy-and-paste message is available at [`docs/week-zero-onboarding.md`](docs/week-zero-onboarding.md).
