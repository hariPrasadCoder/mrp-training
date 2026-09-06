# MyRealProduct Training

Personalised four-week AI engineering training workspace with separate learner and coach experiences.

## Included in this build

- Neon Auth email/password sign-up, sign-in, signed sessions, and protected app route
- Neon Postgres schema for roles, programs, content, enrollments, releases, progress, submissions, feedback, bookings, and coach notes
- First-login learner intake and a persistent Week 0 onboarding checklist
- Learner views for Today, released lesson content, build submissions, and coach feedback
- Admin content authoring for YouTube videos, written lessons, tasks, resources, bookings, and submission instructions
- Admin learner access controls, local-time deadlines, WhatsApp invites, scheduling settings, and real submission reviews
- Responsive editorial interface based on the supplied visual reference
- Standalone Docker build and health endpoint for Coolify

Authenticated views use Neon data throughout. New non-admin accounts become learners automatically; only emails in `ADMIN_EMAILS` receive coach access. Unpublished content and locked weeks are never shown as fake lessons.

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
- `NEON_AUTH_JWKS_URL`: Neon Auth JWKS endpoint
- `NEON_AUTH_COOKIE_SECRET`: at least 32 random characters
- `ADMIN_EMAILS`: comma-separated email addresses that receive the admin role
- `CALCOM_WEBHOOK_SECRET`: used when booking synchronization is enabled

The supplied credentials are stored only in `.env.local`, which is excluded from Git. Rotate the database password before production because it was shared through chat.

## Scheduling links

Sign in with an email listed in `ADMIN_EMAILS`, open **Admin view → Scheduling**, and paste the direct Cal.com URLs for:

- **MRP Saturday Checkpoint** — 60 minutes, mandatory, one-to-one
- **MRP Office Hour** — 30 minutes, optional, one-to-one

Saving writes the links to Neon and updates the learner booking buttons. Keep both event types hidden in Cal.com; direct links still work. Configure Google Meet as the event location inside Cal.com.

## Database

```bash
npm run db:generate
npm run db:push
```

The initial schema migration is checked into `drizzle/` and has been applied to the configured Neon database.

## Video hosting

Use **Unlisted** YouTube videos with embedding enabled. Truly Private YouTube videos cannot be relied on inside the portal because private embeds do not work for normal application viewers. Use privacy-enhanced embed URLs (`youtube-nocookie.com`) when lesson IDs are added.

## Coolify

1. Create an Application from this Git repository.
2. Select **Dockerfile** as the build pack.
3. Expose port `3000`.
4. Add the production environment variables from `.env.example` in Coolify; never commit `.env.local`.
5. Set the health check path to `/api/health`.
6. Attach the production domain and deploy.

The standalone Next.js server listens on `0.0.0.0:3000`, as required for Coolify proxy routing.

## Week 0 handoff

The learner-facing version is built into the app. A copy-and-paste message is available at [`docs/week-zero-onboarding.md`](docs/week-zero-onboarding.md).
