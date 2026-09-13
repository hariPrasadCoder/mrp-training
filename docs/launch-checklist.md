# MyRealProduct launch checklist

This is the remaining work before inviting the first learner. Work from top to bottom. Do not put passwords or secrets in this file or in Git.

## 1. Secure the accounts

- [ ] Rotate the admin and learner passwords used during testing.
- [ ] Rotate the Neon database password and `NEON_AUTH_COOKIE_SECRET` if either was shared outside the deployment platform.
- [ ] Store all production secrets only in Coolify's environment settings.

## 2. Configure invitation-only access

- [ ] In Coolify, set `ADMIN_EMAILS` to the coach email address.
- [ ] In Coolify, set `LEARNER_EMAILS` to a comma-separated list of invited learner emails.
- [ ] Redeploy after changing either email list.
- [ ] Test that an invited learner can create an account.
- [ ] Test that an email not on either list sees the invitation-only message and cannot enter the workspace.

To invite another learner later, add their exact email address to `LEARNER_EMAILS` and redeploy. Removing an address prevents that account from entering the application, even if it already exists in Neon Auth.

## 3. Prepare the private WhatsApp group

- [ ] Create the private cohort WhatsApp group.
- [ ] Generate its invitation link.
- [ ] Sign in as the coach and open **Admin view → Learners**.
- [ ] Add the invitation link to the learner's record.
- [ ] Open the learner workspace and verify the link works.

## 4. Configure the live calls in Cal.com

- [x] Create the **MRP Saturday Checkpoint** event.
- [x] Create the **MRP Office Hour** event.
- [ ] Confirm both events are hidden; confirm the Saturday event is 60 minutes and mandatory, and the office-hour event is 30 minutes and optional.
- [ ] Set Google Meet as the location for both events.
- [x] Save both direct Cal.com links in **Admin view → Scheduling**.
- [ ] Open both booking cards from the learner workspace and complete one test booking.
- [ ] Confirm Cal.com emails the calendar invitation and Google Meet link.

## 5. Configure production authentication

- [ ] Add `https://app.myrealproduct.com` to Neon Auth's trusted origins.
- [ ] Confirm password-reset links return to `https://app.myrealproduct.com/auth/sign-in`.
- [ ] Test sign-in, sign-out, and password reset on `https://app.myrealproduct.com`.

## 6. Prepare Week 1

- [ ] Record only the planned Week 1 videos: Claude Code, FastAPI + LangChain, and Supabase + GitHub + Vercel.
- [ ] Upload each video as **Unlisted** on YouTube and allow embedding.
- [ ] Add the video IDs, essential links, build brief, and submission instructions in the admin content editor.
- [ ] Check every lesson in learner preview.
- [ ] Keep Week 1 locked until Week 0 is complete and the material is ready.
- [ ] Unlock Week 1 manually for the learner at the agreed time.

Repeat the record → upload → check → unlock process for later weeks. Future weeks should remain locked until you deliberately release them.

## 7. Add production monitoring

- [ ] Choose an error-monitoring service such as Sentry.
- [ ] Configure it for server and browser errors without recording passwords, form answers, or other private learner data.
- [ ] Trigger a safe test error and confirm the alert reaches you.

## 8. Verify the production build

- [x] Run `npm run test`.
- [x] Run `npm run test:data-flow` against the intended database and confirm temporary records are cleaned up.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [ ] Let Coolify perform the first Docker image build; a separate local Docker run is not required.
- [ ] Point the DNS record for `app.myrealproduct.com` to the Coolify server.
- [ ] Attach `app.myrealproduct.com` to the application in Coolify and enable HTTPS.
- [ ] Deploy through Coolify and confirm it detects the Dockerfile health check for `/api/health`.
- [ ] Confirm `https://app.myrealproduct.com/api/health` returns HTTP 200.
- [ ] Test the complete coach and learner journey on `https://app.myrealproduct.com`.

## 9. Track dependency maintenance

- [ ] Record the current moderate `npm audit` findings caused by transitive Neon Auth/Drizzle tooling dependencies.
- [ ] Check for compatible upstream updates before each cohort.
- [ ] Do not force a breaking dependency upgrade immediately before launch; apply updates in a test environment first.

## Final go/no-go check

- [ ] Only invited emails can enter.
- [ ] Week 0 works from sign-up through report submission.
- [ ] The coach can see the learner's report and progress.
- [ ] WhatsApp and both booking links work.
- [ ] Week 1 is complete but locked until release.
- [ ] Production errors are observable.
- [ ] Passwords and secrets have been rotated.
